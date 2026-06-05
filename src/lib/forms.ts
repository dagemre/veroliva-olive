/* Form gönderimlerinin iletildiği adres ve yardımcı.
   FormSubmit (formsubmit.co): hesap/API anahtarı gerektirmez; İLK gönderimde
   hello@verolivaolive.com'a bir aktivasyon e-postası gelir, içindeki onay
   linkine BİR KEZ tıklamak gerekir. Sonrası otomatik çalışır.
   TODO: Supabase kurulunca kayıtları ayrıca veritabanına da yaz. */

export const FORMS_EMAIL = "hello@verolivaolive.com";

const ENDPOINT = `https://formsubmit.co/ajax/${FORMS_EMAIL}`;

/** Form verisini e-postaya iletir; başarısızsa hata fırlatır. */
export async function submitForm(
  data: Record<string, string>
): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...data,
      _template: "table", // e-postada düzenli tablo görünümü
      _captcha: "false",
    }),
  });
  const json = (await res.json().catch(() => null)) as
    | { success?: string | boolean }
    | null;
  if (!res.ok || !json || String(json.success) !== "true") {
    throw new Error("form-submit-failed");
  }
}

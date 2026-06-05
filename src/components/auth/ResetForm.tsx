"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import AuthInput from "@/components/auth/AuthInput";

/* Yeni şifre belirleme — e-postadaki sıfırlama linkinden gelinir.
   Supabase, URL'deki recovery token ile oturumu otomatik açar. */
export default function ResetForm() {
  const t = useTranslations("auth.reset");
  const tc = useTranslations("auth.common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowser();
    if (!supabase) return setError(tc("errorGeneric"));

    const data = new FormData(e.currentTarget);
    const password = String(data.get("password"));
    const confirm = String(data.get("confirm"));

    if (password.length < 8) return setError(t("errorShort"));
    if (password !== confirm) return setError(t("errorMatch"));

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      // Link süresi dolmuş / oturum yoksa
      setError(t("errorExpired"));
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/hesap"), 2500);
  }

  if (done) {
    return (
      <div>
        <h1 className="font-display text-4xl text-ink">{t("successTitle")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {t("successText")}
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-4xl text-ink">{t("title")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t("text")}</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
        <AuthInput
          id="password"
          name="password"
          type="password"
          icon="lock"
          label={t("password")}
          placeholder={t("passwordPlaceholder")}
          autoComplete="new-password"
          required
        />
        <AuthInput
          id="confirm"
          name="confirm"
          type="password"
          icon="lock"
          label={t("confirm")}
          placeholder={t("confirmPlaceholder")}
          autoComplete="new-password"
          required
        />

        {error && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-olive py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-olive-deep disabled:opacity-60"
        >
          {loading ? tc("loading") : t("submit")}
        </button>
      </form>

      <p className="mt-7 text-center text-[13px] text-ink-soft">
        <Link href="/giris" className="text-olive underline underline-offset-2 hover:text-gold">
          {t("backToLogin")}
        </Link>
      </p>
    </>
  );
}

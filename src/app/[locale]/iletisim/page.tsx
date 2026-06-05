import type { Metadata } from "next";
import { preload } from "react-dom";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, localBusinessSchema } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";
import ContactForm from "@/components/contact/ContactForm";
import FeatureStrip from "@/components/home/FeatureStrip";

// TODO (Emre'ye doğrulat): telefon +90 266 412 34 56 ve e-posta tasarımdan
// alınan PLACEHOLDER değerler. Gerçekleri gelince burada + schema.ts'te güncelle.
const CONTACT_EMAIL = "info@verolivaolive.com";
const CONTACT_PHONE = "+90 266 412 34 56";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Pelitk%C3%B6y%2C+Burhaniye%2C+Bal%C4%B1kesir";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return buildPageMetadata({
    locale: locale as "tr" | "en",
    path: "/iletisim",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

/* Hero — hakkimizda'daki açık (krem) varyant: hero4 sağda, soldan krem
   degradeyle erir. Header şeffaf → -mt-20. */
function ContactHero() {
  const t = useTranslations("contactPage.hero");

  // LCP: hero arka plan görselini erkenden indir.
  preload("/images/hero4.webp", { as: "image", fetchPriority: "high" });

  return (
    <section
      className="relative -mt-20 flex min-h-[440px] items-center bg-cream bg-cover bg-center lg:min-h-[500px]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(244,239,224,0.95) 0%, rgba(244,239,224,0.55) 110px, rgba(244,239,224,0) 300px), linear-gradient(to right, rgba(244,239,224,1) 0%, rgba(244,239,224,0.96) 30%, rgba(244,239,224,0.55) 48%, rgba(244,239,224,0) 68%), url('/images/hero4.webp')`,
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-36 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-olive-deep sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-soft sm:text-base">
            {t("text")}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── İletişim bilgileri kartı ikonları — ince çizgi SVG'ler ── */
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <path d="M5 4h4l1.5 4.5-2.2 1.6a13 13 0 0 0 5.6 5.6l1.6-2.2L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.6 19.9 4.1 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4Z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V5.1c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  );
}

// Footer'dakiyle aynı PLACEHOLDER sosyal linkler — gerçek hesaplar gelince güncelle.
const SOCIALS = [
  { name: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { name: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { name: "YouTube", href: "https://youtube.com", Icon: YouTubeIcon },
] as const;

/* Bilgi satırı: parşömen daire içinde ikon + bold etiket + metin */
function InfoRow({
  Icon,
  label,
  children,
}: {
  Icon: () => React.ReactElement;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-parchment text-ink">
        <Icon />
      </span>
      <div className="pt-0.5">
        <dt className="text-sm font-bold text-ink">{label}</dt>
        <dd className="mt-1 text-sm leading-relaxed text-ink-soft">
          {children}
        </dd>
      </div>
    </div>
  );
}

/* Form kartı + iletişim bilgileri kartı */
function ContactSection() {
  const t = useTranslations("contactPage");

  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_400px] lg:gap-10 lg:px-8 lg:py-16">
        {/* Bize Mesaj Gönderin */}
        <section
          aria-labelledby="contact-form-title"
          className="border border-line bg-cream-light p-6 sm:p-8"
        >
          <h2
            id="contact-form-title"
            className="text-[12px] font-bold uppercase tracking-[0.16em] text-gold"
          >
            {t("form.title")}
          </h2>
          <ContactForm />
        </section>

        {/* İletişim Bilgilerimiz */}
        <section
          aria-labelledby="contact-info-title"
          className="border border-line bg-cream-light p-6 sm:p-8"
        >
          <h2
            id="contact-info-title"
            className="text-[12px] font-bold uppercase tracking-[0.16em] text-gold"
          >
            {t("info.title")}
          </h2>
          <dl className="mt-7 space-y-7">
            <InfoRow Icon={PinIcon} label={t("info.addressLabel")}>
              {t("info.address")}
            </InfoRow>
            <InfoRow Icon={PhoneIcon} label={t("info.phoneLabel")}>
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                className="transition-colors hover:text-gold"
              >
                {CONTACT_PHONE}
              </a>
            </InfoRow>
            <InfoRow Icon={MailIcon} label={t("info.emailLabel")}>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="transition-colors hover:text-gold"
              >
                {CONTACT_EMAIL}
              </a>
            </InfoRow>
            <InfoRow Icon={ClockIcon} label={t("info.hoursLabel")}>
              {t("info.hours1")}
              <br />
              {t("info.hours2")}
            </InfoRow>
            <InfoRow Icon={InstagramIcon} label={t("info.socialLabel")}>
              <span className="mt-1 flex items-center gap-5 text-ink">
                {SOCIALS.map(({ name, href, Icon }) => (
                  <a
                    key={name}
                    href={href}
                    aria-label={name}
                    className="transition-colors hover:text-gold"
                  >
                    <Icon />
                  </a>
                ))}
              </span>
            </InfoRow>
          </dl>
        </section>
      </div>
    </section>
  );
}

/* Gerçek Google Haritası (gömülü iframe, API anahtarı gerektirmez).
   Tema ile uyum için hafif doygunluk/sepya filtresi uygulanıyor. */
const MAP_EMBED_URL =
  "https://maps.google.com/maps?q=Pelitk%C3%B6y%2C+Burhaniye%2C+Bal%C4%B1kesir&z=12&hl=tr&output=embed";

/* Bizi Ziyaret Edin — sol metin paneli + sağda gerçek harita */
function VisitSection() {
  const t = useTranslations("contactPage.visit");

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid overflow-hidden border border-line bg-cream-light lg:grid-cols-[380px_1fr]">
          {/* Sol — tanıtım */}
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-gold">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl leading-snug text-ink">
              {t("title")}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              {t("text")}
            </p>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2.5 border border-gold-light px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light/40"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
                <path d="M14 5h5v5M19 5l-8 8M19 14v5H5V5h5" />
              </svg>
              {t("cta")}
            </a>
          </div>
          {/* Sağ — gerçek harita */}
          <div className="relative min-h-[300px] lg:min-h-[420px]">
            <iframe
              src={MAP_EMBED_URL}
              title={t("mapTitle")}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 [filter:grayscale(0.35)_sepia(0.18)_saturate(0.9)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactContent() {
  return (
    <>
      <ContactHero />
      <ContactSection />
      <VisitSection />
      <FeatureStrip />
    </>
  );
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contactPage" });

  return (
    <>
      <JsonLd data={localBusinessSchema(locale as "tr" | "en")} />
      <JsonLd
        data={breadcrumbSchema(locale as "tr" | "en", [
          { name: "Veroliva", path: "/" },
          { name: t("title"), path: "/iletisim" },
        ])}
      />
      <ContactContent />
    </>
  );
}

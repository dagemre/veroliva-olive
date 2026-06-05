import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

/* Hero — rehber'deki açık (krem) varyant: görsel sağda (hero4: zeytin kasesi
   + yağ şişesi), soldan krem degradeyle erir. Header şeffaf → -mt-20. */
function AboutHero() {
  const t = useTranslations("aboutPage.hero");

  return (
    <section
      className="relative -mt-20 flex min-h-[480px] items-center bg-cream bg-cover bg-center lg:min-h-[560px]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(244,239,224,0.95) 0%, rgba(244,239,224,0.55) 110px, rgba(244,239,224,0) 300px), linear-gradient(to right, rgba(244,239,224,1) 0%, rgba(244,239,224,0.96) 30%, rgba(244,239,224,0.55) 48%, rgba(244,239,224,0) 68%), url('/images/hero4.jpg')`,
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
            {t("p1")}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft sm:text-base">
            {t("p2")}
          </p>
          <a
            href="#hikayemiz"
            className="mt-8 inline-flex items-center gap-2 border border-gold-light bg-gold-light/80 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light"
          >
            {t("cta")} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* 5'li özellik bandı — ikon + bold uppercase başlık + kısa metin,
   kolonlar arası ince dikey çizgi (sm+). */
const features = [
  { key: "f1", icon: "/icons/rehber-icon-1.png" },
  { key: "f2", icon: "/icons/rehber-icon-2.png" },
  { key: "f3", icon: "/icons/rehber-icon-3.png" },
  { key: "f4", icon: "/icons/rehber-icon-4.png" },
  { key: "f5", icon: "/icons/rehber-icon-9.png" },
] as const;

function FeatureBand() {
  const t = useTranslations("aboutPage.features");

  return (
    <section className="border-y border-line bg-cream-light">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-line lg:px-8 lg:py-14 [&>*:last-child]:col-span-2 md:[&>*:last-child]:col-span-1">
        {features.map(({ key, icon }) => (
          <div
            key={key}
            className="flex flex-col items-center px-4 text-center"
          >
            <img src={icon} alt="" className="h-16 w-auto" loading="lazy" />
            <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
              {t(`${key}Title`)}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              {t(`${key}Text`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* İstatistik bandı ikonları — basit çizgi SVG'ler (krem renk) */
function TreeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-9 w-9" aria-hidden="true">
      <circle cx="12" cy="9" r="5.5" />
      <path d="M12 14.5V21M9 21h6M9.5 11l2.5 2 2.5-2" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-9 w-9" aria-hidden="true">
      <circle cx="9" cy="8.5" r="3" />
      <circle cx="16.5" cy="9.5" r="2.3" />
      <path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5M14.8 14.6c2-.3 4.2 1 4.7 4.4" />
    </svg>
  );
}
function SealIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-9 w-9" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5c-2 1.5-3 3.2-3 4.8a3 3 0 0 0 6 0c0-1.6-1-3.3-3-4.8Z" />
    </svg>
  );
}

const stats = [
  { key: "s1", Icon: TreeIcon },
  { key: "s2", Icon: PeopleIcon },
  { key: "s3", Icon: SealIcon },
] as const;

const timeline = ["t1", "t2", "t3", "t4"] as const;

/* Hikayemiz — solda zaman çizelgesi, sağda hero5 + koyu yeşil istatistik bandı */
function StorySection() {
  const t = useTranslations("aboutPage.story");

  return (
    <section id="hikayemiz" className="scroll-mt-24 bg-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[380px_1fr] lg:gap-16 lg:px-8 lg:py-20">
        {/* Sol kolon */}
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl leading-snug text-ink lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">
            {t("text")}
          </p>

          {/* Zaman çizelgesi */}
          <ol className="relative mt-9 space-y-7 border-l border-line pl-6">
            {timeline.map((key) => (
              <li key={key} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[30px] top-1 box-content h-2 w-2 rounded-full border-2 border-gold bg-cream"
                />
                <h3 className="text-sm font-bold text-ink">
                  {t(`${key}Year`)}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                  {t(`${key}Text`)}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Sağ kolon — fotoğraf + istatistik bandı */}
        <div className="lg:self-center">
          <img
            src="/images/hero5.jpg"
            alt={t("title")}
            className="h-72 w-full object-cover sm:h-96 lg:h-[420px]"
            loading="lazy"
          />
          <div className="grid grid-cols-1 gap-6 bg-olive px-6 py-7 text-cream sm:grid-cols-3 sm:gap-4">
            {stats.map(({ key, Icon }) => (
              <div key={key} className="flex items-center justify-center gap-4">
                <span className="text-gold-light">
                  <Icon />
                </span>
                <div>
                  <p className="font-display text-2xl">{t(`${key}Value`)}</p>
                  <p className="mt-0.5 text-[12px] text-cream/80">
                    {t(`${key}Label`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Doğallıkla Üretiyoruz — 5 adımlı üretim süreci, aralarında ok.
   NOT: Adım fotoğrafları GEÇİCİ (eldeki görsellerden kırpıldı) —
   gerçek süreç fotoğrafları gelince public/images/surec/ altında değiştir. */
const steps = [
  { key: "p1", image: "/images/surec/adim-1-hasat.jpg" },
  { key: "p2", image: "/images/surec/adim-2-secim.jpg" },
  { key: "p3", image: "/images/surec/adim-3-soguk-sikim.jpg" },
  { key: "p4", image: "/images/surec/adim-4-dinlendirme.jpg" },
  { key: "p5", image: "/images/surec/adim-5-siseleme.jpg" },
] as const;

function ProcessSection() {
  const t = useTranslations("aboutPage.process");

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <h2 className="flex items-center justify-center gap-3 text-center text-[13px] font-bold uppercase tracking-[0.18em] text-gold">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          {t("title")}
        </h2>

        <div className="mt-10 grid items-start gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] lg:gap-x-0">
          {steps.map(({ key, image }, i) => (
            <div key={key} className="contents">
              <div className="flex flex-col items-center text-center lg:px-1">
                <img
                  src={image}
                  alt={t(`${key}Title`)}
                  className="aspect-[3/2] w-full max-w-[260px] object-cover"
                  loading="lazy"
                />
                <h3 className="mt-5 text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
                  {t(`${key}Title`)}
                </h3>
                <p className="mt-2 max-w-[220px] text-[13px] leading-relaxed text-ink-soft">
                  {t(`${key}Text`)}
                </p>
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden items-start justify-center px-3 pt-14 text-xl text-gold lg:flex"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutContent() {
  return (
    <>
      <AboutHero />
      <FeatureBand />
      <StorySection />
      <ProcessSection />
    </>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutContent />;
}

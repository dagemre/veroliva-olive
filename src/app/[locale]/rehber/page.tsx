import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guidePage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

/* Hero — PageHero'nun açık (krem) varyantı: görsel sağda, soldan krem
   degradeyle erir; koyu metin + dolu altın CTA. Header şeffaf → -mt-20. */
function GuideHero() {
  const t = useTranslations("guidePage.hero");

  return (
    <section
      className="relative -mt-20 flex min-h-[460px] items-center bg-cream bg-cover bg-center lg:min-h-[540px]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(244,239,224,0.95) 0%, rgba(244,239,224,0.55) 110px, rgba(244,239,224,0) 300px), linear-gradient(to right, rgba(244,239,224,1) 0%, rgba(244,239,224,0.96) 30%, rgba(244,239,224,0.55) 48%, rgba(244,239,224,0) 68%), url('/images/hero3.jpg')`,
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-36 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl leading-tight text-olive-deep sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft sm:text-base">
            {t("text")}
          </p>
          <a
            href="#hakkinda"
            className="mt-8 inline-flex items-center gap-2 border border-gold-light bg-gold-light/80 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light"
          >
            {t("cta")} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* Zeytinyağı Hakkında — sol tanıtım kolonu + 4 ikonlu özellik kolonu */
const aboutFeatures = [
  { key: "f1", icon: "/icons/rehber-icon-1.png" },
  { key: "f2", icon: "/icons/rehber-icon-2.png" },
  { key: "f3", icon: "/icons/rehber-icon-3.png" },
  { key: "f4", icon: "/icons/rehber-icon-4.png" },
] as const;

function AboutSection() {
  const t = useTranslations("guidePage.about");

  return (
    <section id="hakkinda" className="scroll-mt-24 bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[280px_1fr] lg:gap-12 lg:px-8 lg:py-20">
        {/* Sol tanıtım kolonu */}
        <div>
          <h2 className="font-display text-3xl text-ink lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">
            {t("text")}
          </p>
          <Link
            href="/hakkimizda"
            className="mt-7 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink underline-offset-4 transition-colors hover:text-gold"
          >
            {t("more")} <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* 4 özellik kolonu — aralarında ince dikey çizgiler */}
        <div className="grid grid-cols-2 gap-y-10 divide-line sm:grid-cols-4 sm:divide-x">
          {aboutFeatures.map(({ key, icon }) => (
            <div
              key={key}
              className="flex flex-col items-center px-4 text-center"
            >
              <img
                src={icon}
                alt=""
                className="h-20 w-auto"
                loading="lazy"
              />
              <h3 className="mt-5 text-sm font-bold text-ink">
                {t(`${key}Title`)}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {t(`${key}Text`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Zeytinyağı Çeşitleri — 3 fotoğraflı kart
   NOT: Kart fotoğrafları GEÇİCİ (blog görsellerinden) — gerçekleri bekleniyor. */
const varieties = [
  { key: "v1", image: "/images/blog/erken-hasat-zeytinyaginin-sirlari.jpg" },
  {
    key: "v2",
    image: "/images/blog/geleneksel-zeytinyagli-tarifler-enginar-dolmasi.jpg",
  },
  { key: "v3", image: "/images/blog/lezzeti-taze-tutmak-icin-saklama-ipuclari.jpg" },
] as const;

function VarietiesSection() {
  const t = useTranslations("guidePage.varieties");

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <h2 className="font-display text-3xl text-ink lg:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {t("text")}
        </p>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {varieties.map(({ key, image }) => (
            <article
              key={key}
              className="border border-line bg-cream-light"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image}
                  alt={t(`${key}Title`)}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="text-[15px] font-bold text-ink">
                  {t(`${key}Title`)}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  {t(`${key}Text`)}
                </p>
                <Link
                  href="/koleksiyon"
                  className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink underline-offset-4 transition-colors hover:text-gold"
                >
                  {t("cta")} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Kullanım Önerileri — ikon solda, başlık + metin sağda, 4 kolon */
const tips = [
  { key: "t1", icon: "/icons/rehber-icon-5.png" },
  { key: "t2", icon: "/icons/rehber-icon-6.png" },
  { key: "t3", icon: "/icons/rehber-icon-7.png" },
  { key: "t4", icon: "/icons/rehber-icon-8.png" },
] as const;

function UsageTipsSection() {
  const t = useTranslations("guidePage.tips");

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <h2 className="font-display text-3xl text-ink lg:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {t("text")}
        </p>

        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {tips.map(({ key, icon }) => (
            <div key={key} className="flex items-start gap-4">
              <img
                src={icon}
                alt=""
                className="h-16 w-auto shrink-0"
                loading="lazy"
              />
              <div>
                <h3 className="text-sm font-bold text-ink">
                  {t(`${key}Title`)}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  {t(`${key}Text`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuideContent() {
  return (
    <>
      <GuideHero />
      <AboutSection />
      <VarietiesSection />
      <UsageTipsSection />
    </>
  );
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <GuideContent />;
}

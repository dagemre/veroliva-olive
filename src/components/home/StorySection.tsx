import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STATS = [
  {
    key: "years",
    value: "39+",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    key: "trees",
    value: "12.000+",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22v-7" />
        <path d="M12 15c-4 0-7-3-7-7 2-1 5-1 7 1 2-2 5-2 7-1 0 4-3 7-7 7Z" />
      </svg>
    ),
  },
  {
    key: "natural",
    value: "%100",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3c-4 3-7 4-7 9a7 7 0 0 0 14 0c0-5-3-6-7-9Z" />
      </svg>
    ),
  },
] as const;

export default function StorySection() {
  const t = useTranslations("story");

  return (
    <section className="relative overflow-hidden bg-olive text-cream">
      {/* Tam genişlik arka plan fotoğrafı */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/story.jpg')" }}
        aria-hidden="true"
      />
      {/* Mobil: tüm alana koyu örtü — masaüstü: soldan sağa eriyen yeşil panel */}
      <div className="absolute inset-0 bg-olive/85 lg:hidden" aria-hidden="true" />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(to right, #3d4a22 0%, #3d4a22 34%, rgba(61,74,34,0.6) 48%, rgba(61,74,34,0) 62%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Sol metin paneli */}
        <div className="max-w-md py-16 lg:py-24">
          <h2 className="font-display text-3xl leading-snug lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/80">
            {t("text")}
          </p>

          <div className="mt-8 flex flex-wrap gap-8">
            {STATS.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="text-gold-light">{s.icon}</span>
                <div>
                  <div className="text-lg font-semibold leading-none">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.1em] text-cream/70">
                    {t(`stats.${s.key}`)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/hakkimizda"
            className="mt-9 inline-flex items-center gap-3 border border-cream/40 px-6 py-3 text-[13px] font-medium tracking-wide text-cream transition-colors hover:border-gold-light hover:text-gold-light"
          >
            {t("cta")} <span aria-hidden="true">→</span>
          </Link>
        </div>

      </div>

      {/* Oynat düğmesi — fotoğraf alanının ortasında (masaüstü) */}
      <button
        type="button"
        aria-label={t("play")}
        className="absolute left-[68%] top-1/2 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold-light/60 bg-olive-deep/70 text-cream shadow-lg backdrop-blur-sm transition-transform hover:scale-105 lg:flex"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
        </svg>
      </button>
    </section>
  );
}

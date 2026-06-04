import { useTranslations } from "next-intl";

const FEATURES = [
  {
    key: "coldPress",
    icon: (
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="24" cy="30" rx="16" ry="8" />
        <ellipse cx="24" cy="24" rx="16" ry="8" />
        <line x1="24" y1="8" x2="24" y2="16" />
        <circle cx="24" cy="20" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "earlyHarvest",
    icon: (
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 34c6-2 10-6 12-12" />
        <ellipse cx="30" cy="16" rx="5" ry="9" transform="rotate(30 30 16)" />
        <circle cx="16" cy="36" r="5" />
      </svg>
    ),
  },
  {
    key: "natural",
    icon: (
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M24 6c-8 6-14 9-14 18a14 14 0 0 0 28 0c0-9-6-12-14-18Z" />
        <path d="M24 18v16" />
        <path d="M24 26c2-2 5-3 7-3" />
      </svg>
    ),
  },
  {
    key: "local",
    icon: (
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 10c8-3 16-3 22 0 4 2 6 6 6 10-6 4-12 8-14 16-3-2-8-4-11-8-4-5-5-13-3-18Z" />
        <circle cx="22" cy="20" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
] as const;

export default function FeatureStrip() {
  const t = useTranslations("features");

  return (
    <section className="border-b border-line bg-cream-light">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-line px-4 py-2 sm:grid-cols-2 sm:divide-y-0 sm:px-6 lg:grid-cols-4 lg:divide-x lg:px-8">
        {FEATURES.map((f) => (
          <div key={f.key} className="flex items-start gap-4 px-2 py-6 lg:px-7">
            <span className="mt-0.5 shrink-0 text-gold">{f.icon}</span>
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink">
                {t(`${f.key}.title`)}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {t(`${f.key}.text`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

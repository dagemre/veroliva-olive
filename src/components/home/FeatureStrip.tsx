import { useTranslations } from "next-intl";

// İkonlar: public/icons/ — Emre'nin gönderdiği illüstrasyonlar
const FEATURES = [
  { key: "coldPress", icon: "/icons/soguk-sikim.svg" },
  { key: "earlyHarvest", icon: "/icons/erken-hasat.svg" },
  { key: "natural", icon: "/icons/dogal.svg" },
  { key: "local", icon: "/icons/yerli.svg" },
] as const;

export default function FeatureStrip() {
  const t = useTranslations("features");

  return (
    <section className="border-b border-line bg-cream-light">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-line px-4 py-2 sm:grid-cols-2 sm:divide-y-0 sm:px-6 lg:grid-cols-4 lg:divide-x lg:px-8">
        {FEATURES.map((f) => (
          <div key={f.key} className="flex items-start gap-4 px-2 py-6 lg:px-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.icon}
              alt=""
              aria-hidden="true"
              className="h-16 w-16 shrink-0 self-center object-contain"
            />
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

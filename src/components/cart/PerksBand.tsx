"use client";

// Sepet/ödeme/onay sayfalarının altındaki 4'lü güven şeridi (tasarımdan).
import { useTranslations } from "next-intl";

const PERKS = [
  {
    key: "shipping",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1.5 6h12v11h-12zM13.5 9h4.5l3 3.5V17h-7.5" />
        <circle cx="5.5" cy="18.5" r="1.8" />
        <circle cx="17.5" cy="18.5" r="1.8" />
      </svg>
    ),
  },
  {
    key: "natural",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="10" cy="15" r="4.5" />
        <circle cx="15.5" cy="13" r="3" />
        <path d="M12 9.5C12 5.5 14.5 3 18.5 2.5c.5 3.5-1.5 6.5-5 7.5" />
      </svg>
    ),
  },
  {
    key: "secure",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2.5 4.5 5.5v6c0 4.7 3.2 8 7.5 10 4.3-2 7.5-5.3 7.5-10v-6L12 2.5Z" />
        <path d="M8.8 12l2.2 2.2 4.2-4.4" />
      </svg>
    ),
  },
  {
    key: "return",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.5 8.5 12 4l8.5 4.5v8L12 21l-8.5-4.5z" />
        <path d="M3.5 8.5 12 13l8.5-4.5M12 13v8" />
      </svg>
    ),
  },
] as const;

// Tasarımdaki etiket eşleşmeleri: kargo / doğal / güvenli ödeme / kolay iade
const LABELS: Record<string, { title: string; sub: string }> = {
  shipping: { title: "band.shippingTitle", sub: "band.shippingSub" },
  natural: { title: "band.naturalTitle", sub: "band.naturalSub" },
  secure: { title: "perkSecure", sub: "perkSecureSub" },
  return: { title: "band.returnTitle", sub: "band.returnSub" },
};

export default function PerksBand() {
  const t = useTranslations("cart");

  return (
    <div className="border border-line bg-cream-light">
      <div className="grid grid-cols-2 divide-line max-sm:gap-y-px lg:grid-cols-4 lg:divide-x">
        {PERKS.map((perk) => (
          <div key={perk.key} className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <span className="text-ink">{perk.icon}</span>
            <span className="mt-1 text-[13px] font-semibold text-ink">
              {t(LABELS[perk.key].title)}
            </span>
            <span className="text-xs text-ink-soft">{t(LABELS[perk.key].sub)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

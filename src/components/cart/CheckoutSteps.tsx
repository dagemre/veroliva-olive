"use client";

// Sepet → Teslimat → Ödeme → Onay adım göstergesi (tasarımdaki üst şerit).
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STEPS = ["cart", "shipping", "payment", "confirm"] as const;

/**
 * current: 1-4 (1 = Sepet). current'tan küçük adımlar tamamlanmış (✓) görünür.
 * Sepet adımı tamamlandıysa /sepet'e link verir.
 */
export default function CheckoutSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const t = useTranslations("checkout.steps");

  return (
    <nav aria-label={t("payment")} className="mx-auto max-w-5xl px-4 sm:px-6">
      <ol className="flex items-center">
        {STEPS.map((key, i) => {
          const stepNo = i + 1;
          const done = stepNo < current;
          const active = stepNo === current;
          const circle = done ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#4a7a3a] text-[#4a7a3a]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12.5 9.5 18 20 6.5" />
              </svg>
            </span>
          ) : (
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold ${
                active
                  ? "bg-olive text-cream"
                  : "border border-line text-ink-soft"
              }`}
            >
              {stepNo}
            </span>
          );

          const label = (
            <span
              className={`hidden text-[13px] font-semibold sm:block ${
                active ? "text-ink" : done ? "text-ink" : "text-ink-soft"
              }`}
            >
              {t(key)}
            </span>
          );

          return (
            <li key={key} className={`flex items-center ${i > 0 ? "flex-1" : ""}`}>
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`mx-3 h-px flex-1 ${done || active ? "bg-ink-soft/40" : "bg-line"}`}
                />
              )}
              {done && key === "cart" ? (
                <Link href="/sepet" className="flex items-center gap-2.5 hover:opacity-80">
                  {circle}
                  {label}
                </Link>
              ) : (
                <span
                  className="flex items-center gap-2.5"
                  aria-current={active ? "step" : undefined}
                >
                  {circle}
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Adet seçici + Sepete Ekle + favori düğmesi.
 * NOT: Sepet altyapısı henüz yok — düğme şimdilik işlevsiz (görsel hazırlık).
 * Sepet yapılınca onAdd yerine gerçek sepet aksiyonu bağlanacak.
 */
export default function PurchasePanel({ productName }: { productName: string }) {
  const t = useTranslations("productPage");
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);

  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {t("qty")}
      </span>
      <div className="mt-2 flex items-stretch gap-3">
        {/* Adet */}
        <div className="flex items-center border border-line bg-cream-light">
          <button
            type="button"
            aria-label="−"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-12 w-11 items-center justify-center text-lg text-ink-soft transition-colors hover:text-ink"
          >
            −
          </button>
          <span aria-live="polite" className="w-8 text-center text-sm font-semibold text-ink">
            {qty}
          </span>
          <button
            type="button"
            aria-label="+"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="flex h-12 w-11 items-center justify-center text-lg text-ink-soft transition-colors hover:text-ink"
          >
            +
          </button>
        </div>

        {/* Sepete ekle */}
        <button
          type="button"
          aria-label={`${productName} — ${t("addToCart")}`}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2.5 bg-olive px-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {t("addToCart")}
        </button>

        {/* Favori */}
        <button
          type="button"
          aria-label={t("wishlist")}
          aria-pressed={liked}
          onClick={() => setLiked((v) => !v)}
          className={`flex h-12 w-12 shrink-0 items-center justify-center border transition-colors ${
            liked ? "border-gold text-gold" : "border-line text-ink-soft hover:border-gold hover:text-gold"
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

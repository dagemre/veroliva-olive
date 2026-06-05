"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type PanelProduct = {
  id?: string;
  slug: string;
  name: string;
  size: string;
  price: number;
  badge: { tr: string; en: string };
};

/**
 * Adet seçici + Sepete Ekle + favori düğmesi.
 * Sepet: CartProvider (localStorage). Favori: Supabase favorites (oturum gerekir).
 */
export default function PurchasePanel({ product }: { product: PanelProduct }) {
  const t = useTranslations("productPage");
  const router = useRouter();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  // Mevcut favori durumu (oturum + ürün id varsa)
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !product.id) return;
    let cancelled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || cancelled) return;
      const { data: fav } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", data.user.id)
        .eq("product_id", product.id!)
        .maybeSingle();
      if (!cancelled && fav) setLiked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  function handleAdd() {
    add(
      {
        slug: product.slug,
        name: product.name,
        size: product.size,
        price: product.price,
        badge: product.badge,
      },
      qty,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 3500);
  }

  async function handleLike() {
    const supabase = getSupabaseBrowser();
    if (!supabase || !product.id) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push("/giris");
      return;
    }
    if (liked) {
      setLiked(false);
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", data.user.id)
        .eq("product_id", product.id);
    } else {
      setLiked(true);
      await supabase
        .from("favorites")
        .insert({ user_id: data.user.id, product_id: product.id });
    }
  }

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
          onClick={handleAdd}
          aria-label={`${product.name} — ${t("addToCart")}`}
          className={`flex h-12 min-w-0 flex-1 items-center justify-center gap-2.5 px-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors ${
            added ? "bg-olive-deep" : "bg-olive hover:bg-olive-deep"
          }`}
        >
          {added ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12.5 9.5 18 20 6.5" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          )}
          {added ? t("addedToCart") : t("addToCart")}
        </button>

        {/* Favori */}
        <button
          type="button"
          aria-label={t("wishlist")}
          aria-pressed={liked}
          onClick={handleLike}
          className={`flex h-12 w-12 shrink-0 items-center justify-center border transition-colors ${
            liked ? "border-gold text-gold" : "border-line text-ink-soft hover:border-gold hover:text-gold"
          }`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
      </div>

      {/* Eklendi geri bildirimi */}
      <div aria-live="polite" className="min-h-6">
        {added && (
          <Link
            href="/sepet"
            className="mt-2 inline-block text-[12px] font-semibold uppercase tracking-[0.12em] text-gold underline-offset-4 hover:underline"
          >
            {t("goToCart")} →
          </Link>
        )}
      </div>
    </div>
  );
}

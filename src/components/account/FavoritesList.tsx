"use client";

// Favorilerim — favori ürünler (favorites ⋈ products).
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAccount } from "@/components/account/AccountShell";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/products";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type FavRow = {
  product_id: string;
  products: {
    id: string;
    slug: string;
    name: string;
    badge_tr: string;
    badge_en: string;
    size: string;
    price: number;
    medal: string | null;
  } | null;
};

export default function FavoritesList() {
  const t = useTranslations("accountPage.favorites");
  const { user } = useAccount();
  const [favorites, setFavorites] = useState<FavRow[] | null>(null);

  async function load() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase
      .from("favorites")
      .select("product_id, products(id, slug, name, badge_tr, badge_en, size, price, medal)")
      .order("created_at", { ascending: false });
    setFavorites((data ?? []) as unknown as FavRow[]);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function handleRemove(productId: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setFavorites((prev) => prev?.filter((f) => f.product_id !== productId) ?? null);
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>

      {favorites === null ? (
        <p className="py-12 text-center text-sm text-ink-soft">…</p>
      ) : favorites.length === 0 ? (
        <div className="mt-6 border border-line bg-cream-light px-5 py-14 text-center">
          <p className="text-sm text-ink-soft">{t("empty")}</p>
          <Link
            href="/koleksiyon"
            className="mt-5 inline-block bg-olive px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
          >
            {t("browse")} →
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-5">
          {favorites.map((f) => {
            if (!f.products) return null;
            const product: Product = {
              id: f.products.id,
              slug: f.products.slug,
              name: f.products.name,
              badge: { tr: f.products.badge_tr, en: f.products.badge_en },
              size: f.products.size,
              price: Number(f.products.price),
              medal:
                f.products.medal === "gold" || f.products.medal === "silver"
                  ? f.products.medal
                  : undefined,
            };
            return (
              <div key={f.product_id} className="relative">
                <ProductCard product={product} />
                <button
                  type="button"
                  onClick={() => handleRemove(f.product_id)}
                  aria-label={`${product.name} — ${t("remove")}`}
                  title={t("remove")}
                  className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-cream text-ink-soft transition-colors hover:border-gold hover:text-gold"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

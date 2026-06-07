"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/components/cart/CartProvider";

// SEO: açıklayıcı alt text (TR/EN) — görsel araması için anahtar kelimeli.
function productAlt(product: Product, locale: "tr" | "en"): string {
  return locale === "tr"
    ? `${product.name} ${product.size} natürel sızma zeytinyağı şişesi`
    : `${product.name} ${product.size} Turkish extra virgin olive oil bottle`;
}

export default function ProductCard({
  product,
  className = "w-64 shrink-0 snap-start sm:w-72",
}: {
  product: Product;
  className?: string;
}) {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("collection");
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const productHref = {
    pathname: "/urun/[slug]",
    params: { slug: product.slug },
  } as const;

  function handleAdd() {
    add({
      slug: product.slug,
      name: product.name,
      size: product.size,
      price: product.price,
      badge: product.badge,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article
      className={`group flex flex-col border border-line bg-cream-light ${className}`}
    >
      {/* Görsel alanı */}
      <Link
        href={productHref}
        className="relative block aspect-[4/5] overflow-hidden bg-parchment bg-cover bg-center"
        style={{ backgroundImage: "url('/images/urun-fon.webp')" }}
      >
        <Image
          src={`/images/products/${product.slug}.webp`}
          alt={productAlt(product, locale)}
          width={877}
          height={900}
          sizes="(min-width: 640px) 288px, 256px"
          loading="lazy"
          className="h-full w-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {product.medal && (
          <span
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border ${
              product.medal === "gold"
                ? "border-gold bg-gold/15 text-gold"
                : "border-ink-soft/40 bg-ink-soft/10 text-ink-soft"
            }`}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 9.5 8.5 2.5 9l5.2 4.6L6 21l6-3.6L18 21l-1.7-7.4L21.5 9l-7-.5L12 2Z" />
            </svg>
          </span>
        )}
      </Link>

      {/* Bilgi alanı */}
      <div className="flex flex-1 flex-col p-4">
        <span className="self-start border border-line px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-ink-soft">
          {product.badge[locale]}
        </span>
        <Link href={productHref} className="mt-2.5 hover:text-gold">
          <h3 className="text-[15px] font-semibold leading-snug text-ink">
            {product.name}
          </h3>
        </Link>
        <span className="mt-0.5 text-xs text-ink-soft">{product.size}</span>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[15px] font-semibold text-ink">
            {formatPrice(product.price)}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`${product.name} — ${t("addToCart")}`}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-cream transition-colors ${
              added ? "bg-gold" : "bg-olive hover:bg-olive-deep"
            }`}
          >
            {added ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5 9.5 18 20 6.5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

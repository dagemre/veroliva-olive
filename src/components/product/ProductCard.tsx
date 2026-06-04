import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice, type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("collection");

  return (
    <article className="group flex w-64 shrink-0 snap-start flex-col border border-line bg-cream-light sm:w-72">
      {/* Görsel alanı */}
      <Link
        href={`/urun/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-parchment"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/products/${product.slug}.png`}
          alt={product.name}
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
        <Link href={`/urun/${product.slug}`} className="mt-2.5 hover:text-gold">
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
            aria-label={`${product.name} — ${t("addToCart")}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-cream transition-colors hover:bg-olive-deep"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

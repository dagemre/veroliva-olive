import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { preload } from "react-dom";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getProducts, getProductBySlug, formatPrice, type Product } from "@/lib/products";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import ProductCard from "@/components/product/ProductCard";

export const revalidate = 300;

// Tüm ürün sayfaları build sırasında statik üretilir.
export async function generateStaticParams() {
  const products = await getProducts();
  return products.flatMap((p) => [
    { locale: "tr", slug: p.slug },
    { locale: "en", slug: p.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const locale_ = locale as "tr" | "en";
  const title =
    locale_ === "tr"
      ? `${product.name} ${product.size} | Veroliva Zeytinyağı`
      : `${product.name} ${product.size} | Veroliva Olive Oil`;
  const desc =
    locale_ === "tr"
      ? (product.description?.tr?.slice(0, 160) ||
          `${product.name} — ${product.size} soğuk sıkım natürel sızma zeytinyağı, Pelitköy Burhaniye.`)
      : (product.description?.en?.slice(0, 160) ||
          `${product.name} — ${product.size} cold pressed extra virgin olive oil from Pelitköy, Türkiye.`);

  return buildPageMetadata({
    locale: locale_,
    path: "/urun/[slug]",
    title,
    description: desc,
    ogImage: `/images/products/${slug}.webp`,
  });
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ product }: { product: Product }) {
  const t = useTranslations("productPage");
  const locale = useLocale() as "tr" | "en";

  return (
    <nav
      aria-label="breadcrumb"
      className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8"
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
        <li>
          <Link href="/" className="hover:text-gold transition-colors">
            {t("breadcrumbHome")}
          </Link>
        </li>
        <li aria-hidden="true" className="select-none">
          /
        </li>
        <li>
          <Link href="/koleksiyon" className="hover:text-gold transition-colors">
            {t("breadcrumbCollection")}
          </Link>
        </li>
        <li aria-hidden="true" className="select-none">
          /
        </li>
        <li className="font-medium text-ink" aria-current="page">
          {product.name}
        </li>
      </ol>
    </nav>
  );
}

// ─── Medal badge ──────────────────────────────────────────────────────────────
function MedalBadge({ medal }: { medal: "gold" | "silver" }) {
  const isGold = medal === "gold";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${
        isGold
          ? "border-gold bg-gold/10 text-gold"
          : "border-ink-soft/40 bg-ink-soft/10 text-ink-soft"
      }`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2 9.5 8.5 2.5 9l5.2 4.6L6 21l6-3.6L18 21l-1.7-7.4L21.5 9l-7-.5L12 2Z" />
      </svg>
      {isGold ? "Gold" : "Silver"}
    </span>
  );
}

// ─── Main product section ─────────────────────────────────────────────────────
function ProductDetail({ product, relatedProducts }: { product: Product; relatedProducts: Product[] }) {
  const t = useTranslations("productPage");
  const locale = useLocale() as "tr" | "en";
  const description = locale === "tr" ? product.description?.tr : product.description?.en;

  const imageUrl = `/images/products/${product.slug}.webp`;
  preload(imageUrl, { as: "image", fetchPriority: "high" });

  // Teneke ambalaj tespiti
  const isTin = product.slug.includes("teneke");

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb product={product} />

      {/* Ana içerik */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">

          {/* ── Sol: Ürün görseli ── */}
          <div className="relative">
            <div
              className="relative aspect-square overflow-hidden rounded-sm bg-parchment bg-cover bg-center"
              style={{ backgroundImage: "url('/images/urun-fon.webp')" }}
            >
              <Image
                src={imageUrl}
                alt={
                  locale === "tr"
                    ? `${product.name} ${product.size} natürel sızma zeytinyağı şişesi`
                    : `${product.name} ${product.size} Turkish extra virgin olive oil bottle`
                }
                width={877}
                height={900}
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full w-full object-contain p-10 sm:p-14"
              />

              {/* Medal rozeti — sol üst */}
              {product.medal && (
                <div className="absolute left-4 top-4">
                  <MedalBadge medal={product.medal} />
                </div>
              )}
            </div>

            {/* Güven rozeti şeridi */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border border-line bg-cream-light px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {locale === "tr" ? "%100 Doğal" : "100% Natural"}
              </span>
              <span aria-hidden="true" className="text-line">|</span>
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {locale === "tr" ? "Soğuk Sıkım" : "Cold Pressed"}
              </span>
              <span aria-hidden="true" className="text-line">|</span>
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {locale === "tr" ? "Pelitköy, Burhaniye" : "Pelitköy, Türkiye"}
              </span>
            </div>
          </div>

          {/* ── Sağ: Ürün bilgisi ── */}
          <div className="flex flex-col">

            {/* Kategori etiketi */}
            <span className="self-start border border-line px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-ink-soft">
              {product.badge[locale]}
            </span>

            {/* İsim */}
            <h1 className="mt-4 font-display text-3xl leading-snug text-ink sm:text-4xl lg:text-[2.5rem]">
              {product.name}
            </h1>

            {/* Hacim */}
            <p className="mt-1.5 text-sm text-ink-soft">{product.size}</p>

            {/* Ayraç */}
            <div className="my-5 h-px w-16 bg-gold" />

            {/* Fiyat */}
            <p className="text-3xl font-bold text-ink">{formatPrice(product.price)}</p>

            {/* Açıklama */}
            {description && (
              <p className="mt-5 text-sm leading-relaxed text-ink-soft">
                {description}
              </p>
            )}

            {/* Sepete ekle butonu */}
            <button
              type="button"
              aria-label={`${product.name} — ${t("addToCart")}`}
              className="mt-8 flex w-full items-center justify-center gap-2.5 bg-olive py-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {t("addToCart")}
            </button>

            {/* Kargo notu */}
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-soft">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 5v4h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              {t("shippingNote")}
            </p>

            {/* Ayraç */}
            <div className="my-7 h-px bg-line" />

            {/* Teknik bilgiler */}
            <div>
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                {t("specsTitle")}
              </h2>
              <dl className="space-y-3">
                <div className="flex items-baseline gap-3 text-sm">
                  <dt className="w-36 shrink-0 text-ink-soft">{t("specs.typeLabel")}</dt>
                  <dd className="font-medium text-ink">{t("specs.typeValue")}</dd>
                </div>
                <div className="flex items-baseline gap-3 text-sm">
                  <dt className="w-36 shrink-0 text-ink-soft">{t("specs.methodLabel")}</dt>
                  <dd className="font-medium text-ink">{t("specs.methodValue")}</dd>
                </div>
                <div className="flex items-baseline gap-3 text-sm">
                  <dt className="w-36 shrink-0 text-ink-soft">{t("specs.harvestLabel")}</dt>
                  <dd className="font-medium text-ink">
                    {isTin
                      ? (locale === "tr" ? "Makine Hasadı" : "Machine Harvested")
                      : t("specs.harvestValue")}
                  </dd>
                </div>
                <div className="flex items-baseline gap-3 text-sm">
                  <dt className="w-36 shrink-0 text-ink-soft">{t("specs.originLabel")}</dt>
                  <dd className="font-medium text-ink">{t("specs.originValue")}</dd>
                </div>
                <div className="flex items-baseline gap-3 text-sm">
                  <dt className="w-36 shrink-0 text-ink-soft">
                    {locale === "tr" ? "Ambalaj" : "Packaging"}
                  </dt>
                  <dd className="font-medium text-ink">
                    {isTin
                      ? (locale === "tr" ? "Teneke" : "Tin")
                      : (locale === "tr" ? "Koyu Cam Şişe" : "Dark Glass Bottle")}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Toplu sipariş bağlantısı */}
            <div className="mt-8 border border-line p-4">
              <Link
                href="/iletisim"
                className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink underline-offset-4 transition-colors hover:text-gold"
              >
                {t("contactCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diğer ürünler */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-line bg-cream-light py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">{t("otherProducts")}</h2>
              <Link
                href="/koleksiyon"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft underline-offset-4 transition-colors hover:text-gold"
              >
                {t("backToCollection")} →
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-5 lg:justify-start">
              {relatedProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ]);

  if (!product) notFound();

  const locale_ = locale as "tr" | "en";

  // Diğer ürünler — aynı ürün hariç, en fazla 3 tane
  const relatedProducts = allProducts
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  // JSON-LD için Product şeması (ürünün kendi URL'i)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: `${SITE_URL}/images/products/${product.slug}.webp`,
    description: locale_ === "tr"
      ? (product.description?.tr || `${product.name} — ${product.size} soğuk sıkım natürel sızma zeytinyağı.`)
      : (product.description?.en || `${product.name} — ${product.size} cold pressed extra virgin olive oil.`),
    brand: { "@type": "Brand", name: "Veroliva" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "TRY",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/${locale_ === "tr" ? "urun" : "en/products"}/${product.slug}`,
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };

  const nav = await getTranslations({ locale, namespace: "nav" });
  const collectionUrl = locale_ === "tr"
    ? `${SITE_URL}/koleksiyon`
    : `${SITE_URL}/en/products`;
  const productUrl = locale_ === "tr"
    ? `${SITE_URL}/urun/${slug}`
    : `${SITE_URL}/en/products/${slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Veroliva", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: nav("collection"), item: collectionUrl },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { preload } from "react-dom";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getProducts,
  getProductBySlug,
  formatPrice,
  formatUnitPrice,
  normalizeDetails,
  type Product,
  type ProductDetails,
} from "@/lib/products";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import ProductCard from "@/components/product/ProductCard";
import ProductGallery, { type GalleryImage } from "@/components/product/ProductGallery";
import PurchasePanel from "@/components/product/PurchasePanel";
import DetailIcon from "@/components/product/DetailIcon";
import Carousel from "@/components/home/Carousel";

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
    params: { slug },
    title,
    description: desc,
    ogImage: `/images/products/${slug}.webp`,
  });
}

// İdeal Kullanım: ikon anahtarı → Emre'nin çizimli görselleri (etiket görselin içinde).
// Görseli olmayan anahtarlar (cooking/oven/sauce vb.) eski çizgi ikon + yazı stiline düşer;
// tüm anahtarların görseli varsa kart 2x2 görsel grid'i olur.
const USAGE_IMAGES: Record<string, string> = {
  salad: "/icons/salatalar.webp",
  breakfast: "/icons/kahvaltilik.webp",
  meze: "/icons/soguk-mezeler.webp",
  bread: "/icons/ekmek-bandirma.webp",
};

// Açıklamanın ilk 1-2 cümlesi — fiyatın altındaki kısa tanıtım metni.
function shortDescription(text: string | undefined): string {
  if (!text) return "";
  const sentences = text.split(/(?<=\.)\s+/);
  return sentences.slice(0, 2).join(" ");
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ product }: { product: Product }) {
  const t = useTranslations("productPage");

  return (
    <nav aria-label="breadcrumb" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
        <li>
          <Link href="/" className="hover:text-gold transition-colors">
            {t("breadcrumbHome")}
          </Link>
        </li>
        <li aria-hidden="true" className="select-none">›</li>
        <li>
          <Link href="/koleksiyon" className="hover:text-gold transition-colors">
            {t("breadcrumbCollection")}
          </Link>
        </li>
        <li aria-hidden="true" className="select-none">›</li>
        <li className="font-medium text-ink" aria-current="page">
          {product.name}
        </li>
      </ol>
    </nav>
  );
}

// ─── Tat & aroma çubuğu ───────────────────────────────────────────────────────
function TasteBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="text-xs text-ink-soft">{value}/5</span>
      </div>
      <div className="mt-1.5 flex gap-1" role="img" aria-label={`${label}: ${value}/5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 ${i < value ? "bg-olive" : "bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Ana içerik ───────────────────────────────────────────────────────────────
function ProductDetail({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const t = useTranslations("productPage");
  const locale = useLocale() as "tr" | "en";
  const L = (l: { tr: string; en: string }) => l[locale];

  const details: ProductDetails = product.details ?? normalizeDetails(null);
  const description = locale === "tr" ? product.description?.tr : product.description?.en;
  const unitPrice = formatUnitPrice(product.price, product.size);

  const bottleUrl = `/images/products/${product.slug}.webp`;
  preload(bottleUrl, { as: "image", fetchPriority: "high" });

  const bottleAlt =
    locale === "tr"
      ? `${product.name} ${product.size} natürel sızma zeytinyağı şişesi`
      : `${product.name} ${product.size} Turkish extra virgin olive oil bottle`;

  const galleryImages: GalleryImage[] = [
    { src: bottleUrl, alt: bottleAlt, kind: "bottle" },
    ...details.gallery.map((src, i) => ({
      src,
      alt: `${product.name} — ${t("galleryImage")} ${i + 2}`,
      kind: "photo" as const,
    })),
  ];

  const trustItems = [
    { icon: "truck", title: t("trust.shippingTitle"), sub: t("trust.shippingSub") },
    { icon: "clock", title: t("trust.sameDayTitle"), sub: t("trust.sameDaySub") },
    { icon: "shield", title: t("trust.secureTitle"), sub: t("trust.secureSub") },
    { icon: "refresh", title: t("trust.returnTitle"), sub: t("trust.returnSub") },
  ];

  return (
    <>
      <Breadcrumb product={product} />

      {/* ── Üst bölüm: galeri + satın alma ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <ProductGallery images={galleryImages} medal={product.medal} />

          <div className="flex flex-col">
            {/* Etiket */}
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {product.badge[locale]}
            </span>

            {/* İsim */}
            <h1 className="mt-2.5 font-display text-3xl leading-snug text-ink sm:text-4xl">
              {product.name}
            </h1>

            {/* Hacim | tür */}
            <p className="mt-2 text-sm text-ink-soft">
              {product.size}
              <span aria-hidden="true" className="mx-2.5 text-line">|</span>
              {t("productType")}
            </p>

            {/* Fiyat */}
            <p className="mt-5 font-display text-3xl text-ink">{formatPrice(product.price)}</p>
            {unitPrice && <p className="mt-1 text-xs text-ink-soft">{unitPrice}</p>}

            {/* Kısa açıklama */}
            {description && (
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                {shortDescription(description)}
              </p>
            )}

            {/* Hızlı özellikler */}
            {details.highlights.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-y-4 border-y border-line py-4 lg:grid-cols-4">
                {details.highlights.map((h, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 px-1 lg:px-3 ${
                      i > 0 ? "lg:border-l lg:border-line" : "lg:pl-0"
                    }`}
                  >
                    <DetailIcon name={h.icon} size={24} className="shrink-0 text-olive" />
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold leading-tight text-ink">
                        {L(h.title)}
                      </span>
                      <span className="block text-[11px] leading-tight text-ink-soft">
                        {L(h.sub)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Adet + sepete ekle */}
            <div className="mt-6">
              <PurchasePanel
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  size: product.size,
                  price: product.price,
                  badge: product.badge,
                }}
              />
            </div>

            {/* Güven şeridi */}
            <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-line pt-5 lg:grid-cols-4">
              {trustItems.map((item) => (
                <div key={item.title} className="flex items-center gap-2.5">
                  <DetailIcon name={item.icon} size={20} className="shrink-0 text-ink-soft" />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold leading-tight text-ink">
                      {item.title}
                    </span>
                    <span className="block text-[10.5px] leading-tight text-ink-soft">
                      {item.sub}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bilgi kartları ── */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Ürün Hakkında */}
          <article className="border border-line bg-cream-light p-6 sm:p-7">
            <h2 className="font-display text-xl text-ink">{t("aboutTitle")}</h2>
            {description && (
              <p className="mt-3.5 text-[13px] leading-relaxed text-ink-soft">{description}</p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-5">
              {details.aboutSpecs.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment text-olive">
                    <DetailIcon name={s.icon} size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold leading-tight text-ink">
                      {L(s.label)}
                    </span>
                    <span className="block text-[11.5px] leading-tight text-ink-soft">
                      {L(s.value)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </article>

          {/* Tat & Aroma Profili */}
          <article className="relative overflow-hidden border border-line bg-cream-light p-6 sm:p-7">
            <h2 className="font-display text-xl text-ink">{t("tasteTitle")}</h2>
            <div className="mt-5 space-y-4">
              <TasteBar label={t("fruity")} value={details.taste.fruity} />
              <TasteBar label={t("bitter")} value={details.taste.bitter} />
              <TasteBar label={t("pungent")} value={details.taste.pungent} />
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-ink-soft">
              {L(details.taste.notes)}
            </p>
            <Image
              src="/icons/zeytindali.svg"
              alt=""
              aria-hidden="true"
              width={96}
              height={72}
              className="pointer-events-none absolute -bottom-3 -right-2 h-20 w-auto opacity-50"
            />
          </article>

          {/* İdeal Kullanım */}
          <article className="border border-line bg-cream-light p-6 sm:p-7">
            <h2 className="font-display text-xl text-ink">{t("usageTitle")}</h2>
            <p className="mt-3.5 text-[13px] leading-relaxed text-ink-soft">
              {L(details.usage.text)}
            </p>
            {details.usage.items.every((u) => USAGE_IMAGES[u.icon]) ? (
              // Çizimli görseller (etiket görselin içinde — ayrıca yazı yok)
              <div className="mt-5 grid grid-cols-2 items-end gap-x-4 gap-y-5 border-t border-line pt-5">
                {details.usage.items.map((u, i) => (
                  <figure key={i} className="flex flex-col items-center gap-1.5">
                    <Image
                      src={USAGE_IMAGES[u.icon]}
                      alt=""
                      width={300}
                      height={150}
                      sizes="132px"
                      className="h-auto w-[132px]"
                    />
                    <figcaption className="text-center text-[12px] font-medium leading-tight text-ink">
                      {L(u.label)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 border-t border-line pt-5">
                {details.usage.items.map((u, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    {USAGE_IMAGES[u.icon] ? (
                      <Image
                        src={USAGE_IMAGES[u.icon]}
                        alt=""
                        width={400}
                        height={400}
                        sizes="96px"
                        className="h-auto w-full max-w-24"
                      />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-parchment text-olive">
                        <DetailIcon name={u.icon} size={22} />
                      </span>
                    )}
                    <span className="text-[11px] font-medium leading-tight text-ink">
                      {L(u.label)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      {/* ── Besin değerleri ── */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <details open className="group border border-line bg-cream-light">
          <summary
            className="flex cursor-pointer list-none items-center justify-between px-6 py-4 sm:px-7 [&::-webkit-details-marker]:hidden"
            aria-label={t("nutritionToggle")}
          >
            <h2 className="font-display text-xl text-ink">{t("nutritionTitle")}</h2>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="text-ink-soft transition-transform group-open:rotate-180"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="border-t border-line px-6 pb-6 pt-4 sm:px-7">
            <dl className="gap-x-12 lg:columns-3">
              {details.nutrition.rows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-4 border-b border-line/70 py-2 break-inside-avoid"
                >
                  <dt className="text-[13px] text-ink-soft">{L(row.label)}</dt>
                  <dd className="text-[13px] font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-right text-[11px] text-ink-soft">
              {L(details.nutrition.footnote)}
            </p>
          </div>
        </details>
      </section>

      {/* ── Bunlar da ilginizi çekebilir ── */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">{t("relatedTitle")}</h2>
            <Link
              href="/koleksiyon"
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft underline-offset-4 transition-colors hover:text-gold"
            >
              {t("backToCollection")} →
            </Link>
          </div>
          <Carousel>
            {relatedProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </Carousel>
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

  // Diğer ürünler — aynı ürün hariç
  const relatedProducts = allProducts.filter((p) => p.slug !== slug);

  // JSON-LD: Product şeması (ürünün kendi URL'i)
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

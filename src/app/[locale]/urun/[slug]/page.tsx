import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts, getProductBySlug } from "@/lib/products";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import ProductDetailView from "@/components/product/ProductDetailView";

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
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}

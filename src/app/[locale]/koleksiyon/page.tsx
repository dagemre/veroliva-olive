import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getProducts, type Product } from "@/lib/products";
import { buildPageMetadata } from "@/lib/seo";
import { productListSchema, breadcrumbSchema } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";
import ProductCard from "@/components/product/ProductCard";
import PageHero from "@/components/layout/PageHero";
import FeatureStrip from "@/components/home/FeatureStrip";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collectionPage" });
  return buildPageMetadata({
    locale: locale as "tr" | "en",
    path: "/koleksiyon",
    title: t("metaTitle"),
    description: t("metaDescription"),
    ogImage: "/images/og/og-koleksiyon.jpg",
  });
}

function CollectionContent({ products }: { products: Product[] }) {
  return (
    <>
      <PageHero image="/images/hero2.webp" />
      <CollectionGrid products={products} />
      <FeatureStrip />
    </>
  );
}

function CollectionGrid({ products }: { products: Product[] }) {
  const t = useTranslations("collectionPage");

  return (
    <section
      className="bg-cream bg-cover bg-center"
      style={{ backgroundImage: "url('/images/urun-fon.webp')" }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:grid-cols-[240px_1fr] lg:gap-12 lg:px-8 lg:pb-20 lg:pt-10">
        {/* Sol tanıtım kolonu */}
        <div className="lg:pt-6">
          <h1 className="font-display text-3xl text-ink lg:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">
            {t("text")}
          </p>
          <Link
            href="/rehber"
            className="mt-7 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink underline-offset-4 transition-colors hover:text-gold"
          >
            {t("cta")} <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Ürün grid'i — mobilde 2'li, geniş ekranda son satır ortalanır */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-5 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              className="w-[calc(50%-0.5rem)] sm:w-64 lg:w-72"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "collectionPage" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const products = await getProducts();

  return (
    <>
      {/* Structured data: ürün listesi + breadcrumb */}
      <JsonLd data={productListSchema(locale as "tr" | "en", products)} />
      <JsonLd
        data={breadcrumbSchema(locale as "tr" | "en", [
          { name: "Veroliva", path: "/" },
          { name: nav("collection"), path: "/koleksiyon" },
        ])}
      />
      <CollectionContent products={products} />
    </>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { products } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collectionPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

function CollectionContent() {
  const t = useTranslations("collectionPage");

  return (
    <section
      className="bg-cream bg-cover bg-center"
      style={{ backgroundImage: "url('/images/urun-fon.jpg')" }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[240px_1fr] lg:gap-12 lg:px-8 lg:py-20">
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

        {/* Ürün grid'i — son satırdaki kartlar ortalanır */}
        <div className="flex flex-wrap justify-center gap-5 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
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

  return <CollectionContent />;
}

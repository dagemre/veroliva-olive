import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { products } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard";
import Carousel from "./Carousel";

export default function CollectionSection() {
  const t = useTranslations("collection");

  return (
    <section
      className="bg-cream bg-cover bg-center"
      style={{ backgroundImage: "url('/images/urun-fon.webp')" }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[260px_1fr] lg:gap-14 lg:px-8 lg:py-20">
        {/* Sol tanıtım */}
        <div className="flex flex-col justify-center">
          <h2 className="font-display text-3xl text-ink lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {t("text")}
          </p>
          <Link
            href="/koleksiyon"
            className="mt-7 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink underline-offset-4 transition-colors hover:text-gold"
          >
            {t("cta")} <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Ürün karuseli */}
        <Carousel>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}

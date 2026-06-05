import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import { getProducts } from "@/lib/products";
import Hero from "@/components/home/Hero";
import FeatureStrip from "@/components/home/FeatureStrip";
import CollectionSection from "@/components/home/CollectionSection";
import StorySection from "@/components/home/StorySection";
import GuideSection from "@/components/home/GuideSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "homePage" });
  return buildPageMetadata({
    locale: locale as "tr" | "en",
    path: "/",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = await getProducts();

  return (
    <>
      <Hero />
      <FeatureStrip />
      <CollectionSection products={products} />
      <StorySection />
      <GuideSection />
    </>
  );
}

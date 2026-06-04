import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/home/Hero";
import FeatureStrip from "@/components/home/FeatureStrip";
import CollectionSection from "@/components/home/CollectionSection";
import StorySection from "@/components/home/StorySection";
import GuideSection from "@/components/home/GuideSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <FeatureStrip />
      <CollectionSection />
      <StorySection />
      <GuideSection />
    </>
  );
}

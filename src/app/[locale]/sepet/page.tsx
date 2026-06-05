import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import CartView from "@/components/cart/CartView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return {
    ...buildPageMetadata({
      locale: locale as "tr" | "en",
      path: "/sepet",
      title: t("metaTitle"),
      description: t("metaDescription"),
    }),
    robots: { index: false, follow: true },
  };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CartView />;
}

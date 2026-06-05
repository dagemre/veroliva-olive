import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import OrderConfirmation from "@/components/cart/OrderConfirmation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}): Promise<Metadata> {
  const { locale, orderNumber } = await params;
  const t = await getTranslations({ locale, namespace: "confirmation" });
  return {
    ...buildPageMetadata({
      locale: locale as "tr" | "en",
      path: "/siparis-onayi/[orderNumber]",
      // Dinamik sayfalarda params ZORUNLU (next-intl getPathname).
      params: { orderNumber },
      title: t("metaTitle"),
      description: t("metaDescription"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}) {
  const { locale, orderNumber } = await params;
  setRequestLocale(locale);

  return <OrderConfirmation orderNumber={orderNumber} />;
}

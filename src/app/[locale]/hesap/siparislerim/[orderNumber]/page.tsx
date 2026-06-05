import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import OrderDetail from "@/components/account/OrderDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}): Promise<Metadata> {
  const { locale, orderNumber } = await params;
  const t = await getTranslations({ locale, namespace: "accountPage" });
  return {
    ...buildPageMetadata({
      locale: locale as "tr" | "en",
      path: "/hesap/siparislerim/[orderNumber]",
      // Dinamik sayfalarda params ZORUNLU (next-intl getPathname).
      params: { orderNumber },
      title: t("metaTitle"),
      description: t("metaDescription"),
    }),
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}) {
  const { locale, orderNumber } = await params;
  setRequestLocale(locale);

  return <OrderDetail orderNumber={orderNumber} />;
}

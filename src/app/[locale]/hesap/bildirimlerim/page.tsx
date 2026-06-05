import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import Notifications from "@/components/account/Notifications";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accountPage" });
  return {
    ...buildPageMetadata({
      locale: locale as "tr" | "en",
      path: "/hesap/bildirimlerim",
      title: t("metaTitle"),
      description: t("metaDescription"),
    }),
    robots: { index: false, follow: true },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Notifications />;
}

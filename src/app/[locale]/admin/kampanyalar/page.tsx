import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import AdminCampaigns from "@/components/admin/AdminCampaigns";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    ...buildPageMetadata({ locale: locale as "tr" | "en", path: "/admin/kampanyalar", title: `${t("nav.campaigns")} · Veroliva`, description: t("metaDescription") }),
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminCampaigns />;
}

import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import AdminPlaceholder from "@/components/admin/AdminPlaceholder";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    ...buildPageMetadata({ locale: locale as "tr" | "en", path: "/admin/yorumlar", title: `${t("nav.reviews")} · Veroliva`, description: t("metaDescription") }),
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminPlaceholder sectionKey="reviews" />;
}

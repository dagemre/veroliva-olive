import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import AuthShell from "@/components/auth/AuthShell";
import LoginAside from "@/components/auth/LoginAside";
import ResetForm from "@/components/auth/ResetForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.reset" });
  return {
    ...buildPageMetadata({
      locale: locale as "tr" | "en",
      path: "/sifre-yenile",
      title: t("metaTitle"),
      description: t("metaDescription"),
    }),
    robots: { index: false, follow: true },
  };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthShell aside={<LoginAside />}>
      <ResetForm />
    </AuthShell>
  );
}

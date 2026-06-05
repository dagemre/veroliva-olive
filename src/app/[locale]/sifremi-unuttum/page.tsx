import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import AuthShell from "@/components/auth/AuthShell";
import LoginAside from "@/components/auth/LoginAside";
import ForgotForm from "@/components/auth/ForgotForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.forgot" });
  return {
    ...buildPageMetadata({
      locale: locale as "tr" | "en",
      path: "/sifremi-unuttum",
      title: t("metaTitle"),
      description: t("metaDescription"),
    }),
    robots: { index: false, follow: true },
  };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthShell aside={<LoginAside />}>
      <ForgotForm />
    </AuthShell>
  );
}

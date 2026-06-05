import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import AuthShell from "@/components/auth/AuthShell";
import LoginAside from "@/components/auth/LoginAside";
import LoginForm from "@/components/auth/LoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return {
    ...buildPageMetadata({
      locale: locale as "tr" | "en",
      path: "/giris",
      title: t("metaTitle"),
      description: t("metaDescription"),
    }),
    // Hesap sayfaları arama sonuçlarında gereksiz — taransın ama indekslenmesin.
    robots: { index: false, follow: true },
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthShell aside={<LoginAside />}>
      <LoginForm />
    </AuthShell>
  );
}

import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import AuthShell from "@/components/auth/AuthShell";
import RegisterAside from "@/components/auth/RegisterAside";
import RegisterForm from "@/components/auth/RegisterForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.register" });
  return {
    ...buildPageMetadata({
      locale: locale as "tr" | "en",
      path: "/kayit",
      title: t("metaTitle"),
      description: t("metaDescription"),
    }),
    robots: { index: false, follow: true },
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthShell aside={<RegisterAside />}>
      <RegisterForm />
    </AuthShell>
  );
}

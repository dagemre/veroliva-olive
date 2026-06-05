import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import { organizationSchema } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

// Site geneli varsayılanlar — sayfa bazlı metadata (canonical, hreflang, OG)
// her sayfanın kendi generateMetadata'sından buildPageMetadata ile gelir.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "homePage" });
  return {
    metadataBase: new URL(SITE_URL),
    // Her sayfa kendi tam başlığını verir (marka eki dahil) — template yok.
    title: t("metaTitle"),
    description: t("metaDescription"),
    applicationName: "Veroliva",
    formatDetection: { telephone: false },
    robots: { index: true, follow: true },
    // Google Search Console site doğrulaması (<head>'e meta tag olarak basılır)
    verification: {
      google: "N7SGKEopaWhZ6AC9Iyk42_8XvG9NBxLnlBqQDyeAb9A",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <JsonLd data={organizationSchema(locale as "tr" | "en")} />
        <NextIntlClientProvider>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

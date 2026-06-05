import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname } from "@/i18n/routing";

// Kanonik alan adı — www Vercel'e eklenince de apex kanonik kalır.
export const SITE_URL = "https://verolivaolive.com";

export const SITE_NAME = {
  tr: "Veroliva Zeytinyağı",
  en: "Veroliva Olive Oil",
} as const;

export const OG_LOCALE = { tr: "tr_TR", en: "en_US" } as const;

type Locale = (typeof routing.locales)[number];

/** Dinamik sayfalarda ([slug] vb.) pathname parametreleri. */
type PathParams = Record<string, string>;

/** Bir sayfanın belirli bir dildeki tam URL'i (lokalize pathname ile). */
export function absoluteUrl(locale: Locale, href: AppPathname, params?: PathParams): string {
  // Dinamik şablonlarda ([slug] içeren) next-intl params ister;
  // statik sayfalarda pathname doğrudan çözülür.
  const resolved = params ? { pathname: href, params } : href;
  const path = getPathname({ locale, href: resolved as never });
  return `${SITE_URL}${path === "/" && locale === routing.defaultLocale ? "" : path}`;
}

/**
 * Sayfa metadata'sı: benzersiz title/description + canonical + hreflang
 * + Open Graph + Twitter Card. Her sayfanın generateMetadata'sında kullan.
 */
export function buildPageMetadata({
  locale,
  path,
  params,
  title,
  description,
  ogImage = "/images/og/og-default.jpg",
}: {
  locale: Locale;
  path: AppPathname;
  /** Dinamik sayfalarda zorunlu — ör. { slug: "veroliva-classic" }. */
  params?: PathParams;
  title: string;
  description: string;
  ogImage?: string;
}): Metadata {
  const canonical = absoluteUrl(locale, path, params);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = absoluteUrl(l, path, params);
  }
  // x-default: dil seçimi olmayan ziyaretçiler için varsayılan (TR) sürüm.
  languages["x-default"] = absoluteUrl(routing.defaultLocale, path, params);

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      siteName: SITE_NAME[locale],
      title,
      description,
      url: canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE[l]),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

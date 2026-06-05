// JSON-LD şema üreticileri — schema.org
import type { Product } from "@/lib/products";
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/seo";
import type { AppPathname } from "@/i18n/routing";

type Locale = "tr" | "en";

const ORG_ID = `${SITE_URL}/#organization`;

const DESCRIPTION = {
  tr: "Balıkesir Burhaniye Pelitköy'de aile üretimi soğuk sıkım natürel sızma zeytinyağı üreticisi.",
  en: "Family-run Turkish olive oil producer crafting cold pressed extra virgin olive oil in Pelitköy, Burhaniye on the Aegean coast.",
} as const;

/** Organization — tüm sayfalarda (layout) */
export function organizationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME[locale],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/Logo.svg`,
    },
    description: DESCRIPTION[locale],
    foundingDate: "1985",
    sameAs: [
      "https://instagram.com",
      "https://facebook.com",
      "https://youtube.com",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pelitköy, Burhaniye",
      addressRegion: "Balıkesir",
      addressCountry: "TR",
    },
  };
}

/** LocalBusiness — hakkımızda ve iletişim sayfalarında */
export function localBusinessSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME[locale],
    image: `${SITE_URL}/images/og/og-default.jpg`,
    url: SITE_URL,
    parentOrganization: { "@id": ORG_ID },
    description: DESCRIPTION[locale],
    email: "info@verolivaolive.com",
    priceRange: "₺₺",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pelitköy, Burhaniye",
      addressRegion: "Balıkesir",
      addressCountry: "TR",
    },
    areaServed: ["TR", "Worldwide"],
  };
}

/** Tek ürün için Product şeması */
export function productSchema(product: Product, locale: Locale) {
  return {
    "@type": "Product",
    name: product.name,
    image: `${SITE_URL}/images/products/${product.slug}.webp`,
    description:
      locale === "tr"
        ? `${product.name} — ${product.size} soğuk sıkım natürel sızma zeytinyağı.`
        : `${product.name} — ${product.size} cold pressed extra virgin olive oil from Türkiye.`,
    brand: { "@type": "Brand", name: "Veroliva" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "TRY",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(locale, "/koleksiyon"),
      seller: { "@id": ORG_ID },
    },
  };
}

/** Koleksiyon sayfası için ürün listesi (ItemList + Product) */
export function productListSchema(locale: Locale, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: productSchema(product, locale),
    })),
  };
}

/** Breadcrumb — iç sayfalarda */
export function breadcrumbSchema(
  locale: Locale,
  items: { name: string; path: AppPathname }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}

/** FAQ — SSS sayfasında */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

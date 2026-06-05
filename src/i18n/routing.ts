import { defineRouting } from "next-intl/routing";

// SEO: Her dil kendi URL'ini kullanır — TR /koleksiyon, EN /en/products.
// Yeni sayfa eklerken buraya pathname karşılığını da ekle.
export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/koleksiyon": { tr: "/koleksiyon", en: "/products" },
    "/rehber": { tr: "/rehber", en: "/olive-oil-guide" },
    "/rehber/[slug]": { tr: "/rehber/[slug]", en: "/olive-oil-guide/[slug]" },
    "/hakkimizda": { tr: "/hakkimizda", en: "/about-us" },
    "/sss": { tr: "/sss", en: "/faq" },
    "/iletisim": { tr: "/iletisim", en: "/contact" },
    "/urun/[slug]": { tr: "/urun/[slug]", en: "/products/[slug]" },
    "/sepet": { tr: "/sepet", en: "/cart" },
    "/hesap": { tr: "/hesap", en: "/account" },
    "/uretim": { tr: "/uretim", en: "/production" },
    "/kalite": { tr: "/kalite", en: "/quality" },
    "/kargo": { tr: "/kargo", en: "/shipping" },
    "/iade": { tr: "/iade", en: "/returns" },
    "/gizlilik": { tr: "/gizlilik", en: "/privacy-policy" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;

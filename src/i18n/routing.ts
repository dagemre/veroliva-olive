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
    "/odeme": { tr: "/odeme", en: "/checkout" },
    "/siparis-onayi/[orderNumber]": {
      tr: "/siparis-onayi/[orderNumber]",
      en: "/order-confirmation/[orderNumber]",
    },
    "/hesap": { tr: "/hesap", en: "/account" },
    "/hesap/siparislerim": { tr: "/hesap/siparislerim", en: "/account/orders" },
    "/hesap/siparislerim/[orderNumber]": {
      tr: "/hesap/siparislerim/[orderNumber]",
      en: "/account/orders/[orderNumber]",
    },
    "/hesap/adreslerim": { tr: "/hesap/adreslerim", en: "/account/addresses" },
    "/hesap/bilgilerim": { tr: "/hesap/bilgilerim", en: "/account/personal-info" },
    "/hesap/favorilerim": { tr: "/hesap/favorilerim", en: "/account/favourites" },
    "/hesap/kuponlarim": { tr: "/hesap/kuponlarim", en: "/account/coupons" },
    "/hesap/bildirimlerim": { tr: "/hesap/bildirimlerim", en: "/account/notifications" },
    "/hesap/sifre": { tr: "/hesap/sifre", en: "/account/password" },
    "/giris": { tr: "/giris", en: "/login" },
    "/kayit": { tr: "/kayit", en: "/register" },
    "/sifremi-unuttum": { tr: "/sifremi-unuttum", en: "/forgot-password" },
    "/sifre-yenile": { tr: "/sifre-yenile", en: "/reset-password" },
    "/uretim": { tr: "/uretim", en: "/production" },
    "/kalite": { tr: "/kalite", en: "/quality" },
    "/kargo": { tr: "/kargo", en: "/shipping" },
    "/iade": { tr: "/iade", en: "/returns" },
    "/gizlilik": { tr: "/gizlilik", en: "/privacy-policy" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;

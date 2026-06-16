import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Kişisel/işlemsel sayfalar indekslenmesin (TR + EN URL'leri)
        disallow: [
          "/sepet",
          "/odeme",
          "/siparis-onayi",
          "/hesap",
          "/admin",
          "/en/cart",
          "/en/checkout",
          "/en/order-confirmation",
          "/en/account",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

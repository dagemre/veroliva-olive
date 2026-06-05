import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Kişisel/işlemsel sayfalar indekslenmesin (TR + EN URL'leri)
        disallow: ["/sepet", "/hesap", "/en/cart", "/en/account", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

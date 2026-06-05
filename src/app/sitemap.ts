import type { MetadataRoute } from "next";
import { routing, type AppPathname } from "@/i18n/routing";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import { getProducts } from "@/lib/products";

// İndekslenmesini istediğimiz statik sayfalar. Yeni sayfa açılınca buraya ekle —
// sitemap.xml otomatik güncellenir (her dil için hreflang alternates ile).
const PAGES: { path: AppPathname; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/koleksiyon", priority: 0.9, changeFrequency: "weekly" },
  { path: "/rehber", priority: 0.7, changeFrequency: "monthly" },
  { path: "/hakkimizda", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sss", priority: 0.6, changeFrequency: "monthly" },
  { path: "/iletisim", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries = PAGES.flatMap(({ path, priority, changeFrequency }) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = absoluteUrl(locale, path);
    }
    languages["x-default"] = absoluteUrl(routing.defaultLocale, path);

    return routing.locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      lastModified,
      changeFrequency,
      priority: locale === routing.defaultLocale ? priority : priority - 0.1,
      alternates: { languages },
    }));
  });

  // Ürün detay sayfaları — her ürün için TR + EN URL
  const products = await getProducts();
  const productEntries: MetadataRoute.Sitemap = products.flatMap((p) => {
    const trUrl = `${SITE_URL}/urun/${p.slug}`;
    const enUrl = `${SITE_URL}/en/products/${p.slug}`;
    const languages = { tr: trUrl, en: enUrl, "x-default": trUrl };
    return [
      { url: trUrl, lastModified, changeFrequency: "weekly", priority: 0.85, alternates: { languages } },
      { url: enUrl, lastModified, changeFrequency: "weekly", priority: 0.75, alternates: { languages } },
    ];
  });

  return [...staticEntries, ...productEntries];
}

import type { MetadataRoute } from "next";
import { routing, type AppPathname } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

// İndekslenmesini istediğimiz sayfalar. Yeni sayfa açılınca buraya ekle —
// sitemap.xml otomatik güncellenir (her dil için hreflang alternates ile).
const PAGES: { path: AppPathname; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/koleksiyon", priority: 0.9, changeFrequency: "weekly" },
  { path: "/rehber", priority: 0.7, changeFrequency: "monthly" },
  { path: "/hakkimizda", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sss", priority: 0.6, changeFrequency: "monthly" },
  { path: "/iletisim", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PAGES.flatMap(({ path, priority, changeFrequency }) => {
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
}

// Geçici rehber/blog verisi — ileride Supabase'den gelecek.
// Görseller: public/images/blog/{slug}.webp

export type Post = {
  slug: string;
  tag: { tr: string; en: string };
  title: { tr: string; en: string };
};

export const posts: Post[] = [
  {
    slug: "erken-hasat-zeytinyaginin-sirlari",
    tag: { tr: "SAĞLIK", en: "HEALTH" },
    title: {
      tr: "Erken Hasat Zeytinyağının Sırları",
      en: "The Secrets of Early Harvest Olive Oil",
    },
  },
  {
    slug: "geleneksel-zeytinyagli-tarifler-enginar-dolmasi",
    tag: { tr: "TARİF", en: "RECIPE" },
    title: {
      tr: "Geleneksel Zeytinyağlı Tarifler: Enginar Dolması",
      en: "Traditional Olive Oil Recipes: Stuffed Artichokes",
    },
  },
  {
    slug: "lezzeti-taze-tutmak-icin-saklama-ipuclari",
    tag: { tr: "BİLGİ", en: "TIPS" },
    title: {
      tr: "Lezzeti Taze Tutmak İçin Saklama İpuçları",
      en: "Storage Tips to Keep the Flavor Fresh",
    },
  },
];

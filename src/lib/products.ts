// Geçici ürün verisi — ileride Supabase'den gelecek.
// Görseller: public/images/products/{slug}.webp (877x900, şeffaf zemin)

export type Product = {
  slug: string;
  name: string;
  badge: { tr: string; en: string };
  size: string;
  price: number; // TL
  medal?: "gold" | "silver";
};

export const products: Product[] = [
  {
    slug: "pelitkoy-erken-hasat-rezerv-petite",
    name: "Pelitköy Erken Hasat Rezerv Petite",
    badge: { tr: "PELİTKÖY ERKEN HASAT", en: "PELİTKÖY EARLY HARVEST" },
    size: "250 ml",
    price: 1350,
    medal: "gold",
  },
  {
    slug: "veroliva-reserve-gold",
    name: "Veroliva Reserve Gold",
    badge: { tr: "ERKEN HASAT", en: "EARLY HARVEST" },
    size: "500 ml",
    price: 1580,
    medal: "gold",
  },
  {
    slug: "veroliva-classic-silver",
    name: "Veroliva Classic Silver",
    badge: { tr: "KLASİK", en: "CLASSIC" },
    size: "500 ml",
    price: 1490,
    medal: "silver",
  },
  {
    slug: "veroliva-aile-boyu-teneke",
    name: "Veroliva Aile Boyu Teneke",
    badge: { tr: "AİLE BOYU", en: "FAMILY SIZE" },
    size: "5 L",
    price: 3850,
  },
  {
    slug: "veroliva-premium",
    name: "Veroliva Premium",
    badge: { tr: "PREMİUM", en: "PREMIUM" },
    size: "750 ml",
    price: 2150,
  },
  {
    slug: "veroliva-classic",
    name: "Veroliva Classic",
    badge: { tr: "KLASİK", en: "CLASSIC" },
    size: "1 L",
    price: 2350,
  },
];

export function formatPrice(price: number): string {
  return `${price.toLocaleString("tr-TR")} TL`;
}

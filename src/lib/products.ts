// Ürün verileri — Supabase'den okunur (products tablosu).
// Supabase'e erişilemezse yedek (fallback) liste kullanılır ki site asla boş kalmasın.
import { createSupabaseClient } from "@/lib/supabase";

export type Product = {
  slug: string;
  name: string;
  badge: { tr: string; en: string };
  size: string;
  price: number; // TL
  medal?: "gold" | "silver";
};

/** Supabase'den aktif ürünleri çeker (sort_order sıralı, 5 dk cache). */
export async function getProducts(): Promise<Product[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return fallbackProducts;

  const { data, error } = await supabase
    .from("products")
    .select("slug, name, badge_tr, badge_en, size, price, medal")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    console.warn("[products] Supabase okunamadı, yedek liste kullanılıyor.", error?.message);
    return fallbackProducts;
  }

  return data.map((row) => ({
    slug: row.slug,
    name: row.name,
    badge: { tr: row.badge_tr, en: row.badge_en },
    size: row.size,
    price: Number(row.price),
    medal: row.medal === "gold" || row.medal === "silver" ? row.medal : undefined,
  }));
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("tr-TR")} TL`;
}

// Yedek liste — Supabase'deki seed verisinin kopyası.
const fallbackProducts: Product[] = [
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

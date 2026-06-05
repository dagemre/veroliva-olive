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
  description?: { tr: string; en: string };
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

/** Slug'a göre tek ürün çeker; bulunamazsa null döner. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return fallbackProducts.find((p) => p.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("slug, name, badge_tr, badge_en, size, price, medal, description_tr, description_en")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.warn("[products] getProductBySlug: Supabase hatası, yedek kullanılıyor.", error?.message);
    return fallbackProducts.find((p) => p.slug === slug) ?? null;
  }

  return {
    slug: data.slug,
    name: data.name,
    badge: { tr: data.badge_tr, en: data.badge_en },
    size: data.size,
    price: Number(data.price),
    medal: data.medal === "gold" || data.medal === "silver" ? data.medal : undefined,
    description: {
      tr: (data as { description_tr?: string }).description_tr || "",
      en: (data as { description_en?: string }).description_en || "",
    },
  };
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("tr-TR")} TL`;
}

// Yedek liste — Supabase'deki seed verisinin kopyası.
// description: Supabase'deki description_tr/en'in yedek değeri. Supabase'e de gir!
const fallbackProducts: Product[] = [
  {
    slug: "pelitkoy-erken-hasat-rezerv-petite",
    name: "Pelitköy Erken Hasat Rezerv Petite",
    badge: { tr: "PELİTKÖY ERKEN HASAT", en: "PELİTKÖY EARLY HARVEST" },
    size: "250 ml",
    price: 1350,
    medal: "gold",
    description: {
      tr: "Pelitköy'ün asırlık zeytinliklerinden el ile hasat edilen en değerli ürünümüz. Yeşilin turuncuya dönüştüğü ilk günlerde toplanan zeytinler, aynı gün soğuk sıkımla işlenerek en yüksek polifenol değerine ulaşır. Taze çimen ve badem notaları, uzun ve yakıcı bir bitiş ile bu rezervin kimliğini oluşturur. Altın madalya ile ödüllendirilmiştir.",
      en: "Our most precious expression, hand-harvested from century-old Pelitköy groves at the precise moment of colour change from green to violet. Cold-pressed on the day of harvest to capture peak polyphenol levels. Vibrant aromas of fresh grass and almond lead to a long, pungent finish — a true mark of exceptional extra virgin quality. Gold medal winner.",
    },
  },
  {
    slug: "veroliva-reserve-gold",
    name: "Veroliva Reserve Gold",
    badge: { tr: "ERKEN HASAT", en: "EARLY HARVEST" },
    size: "500 ml",
    price: 1580,
    medal: "gold",
    description: {
      tr: "Erken hasat mevsiminin en iyilerinden özenle seçilen zeytinlerle üretilen premium sızmamız. Derin yemyeşil rengi ve karmaşık aromasıyla sofistike bir tercih. Taze domates yaprağı ve enginar tonları, belirgin acılık ve yakıcılıkla dengelenerek kaliteli natürel sızmanın tüm özelliklerini yansıtır.",
      en: "Crafted from a careful selection of the finest early-harvest olives of the season. A sophisticated choice with deep green colour and complex aromatics. Notes of fresh tomato leaf and artichoke are balanced by pronounced bitterness and pungency — hallmarks of premium extra virgin olive oil. Gold medal winner.",
    },
  },
  {
    slug: "veroliva-classic-silver",
    name: "Veroliva Classic Silver",
    badge: { tr: "KLASİK", en: "CLASSIC" },
    size: "500 ml",
    price: 1490,
    medal: "silver",
    description: {
      tr: "Olgunlaşma sürecini tamamlamış zeytinlerden soğuk sıkımla üretilen, her gün kullanıma uygun klasiğimiz. Dengeli ve yuvarlak yapısıyla salata, makarna ve közleme yemeklerini tamamlar. Olgun meyve ve hafif tereyağı notaları, yumuşak bir acılık ve uzun bitişle tamamlanır.",
      en: "Our everyday classic, cold-pressed from fully ripened olives for a balanced, rounded flavour profile. Versatile across salads, pasta and roasted dishes. Soft notes of ripe fruit and butter with mild bitterness and a smooth, lasting finish.",
    },
  },
  {
    slug: "veroliva-aile-boyu-teneke",
    name: "Veroliva Aile Boyu Teneke",
    badge: { tr: "AİLE BOYU", en: "FAMILY SIZE" },
    size: "5 L",
    price: 3850,
    description: {
      tr: "Zeytinyağını bol kullanan aileler için büyük boy ekonomik seçim. Teneke ambalaj, yağı ışıktan ve oksijenden koruyarak uzun süre tazeliğini muhafaza eder. Soğuk sıkım, katkısız; günlük pişirme, kavurma ve salatalar için mükemmel.",
      en: "The practical choice for households that cook generously with olive oil. Tin packaging protects from light and oxygen, preserving freshness for extended periods. Cold pressed, additive-free — ideal for everyday cooking, sautéing and dressings.",
    },
  },
  {
    slug: "veroliva-premium",
    name: "Veroliva Premium",
    badge: { tr: "PREMİUM", en: "PREMIUM" },
    size: "750 ml",
    price: 2150,
    description: {
      tr: "Pelitköy'ün seçkin bölgelerinden derlenen zeytinlerle üretilen özel sızmamız. Karmaşık aroması ve uzun bitiş süresiyle şef tercihidir. Soğuk mezelerde, fırın yemeklerinde ve premium salata soslarında damak zevkinizi tamamlar.",
      en: "A premium expression sourced from select groves across Pelitköy. Complex aromatics and a lasting finish make it a chef's favourite. Shines in cold mezze, oven dishes and premium vinaigrettes.",
    },
  },
  {
    slug: "veroliva-classic",
    name: "Veroliva Classic",
    badge: { tr: "KLASİK", en: "CLASSIC" },
    size: "1 L",
    price: 2350,
    description: {
      tr: "Geniş hacmiyle aile sofrasının vazgeçilmezi. Soğuk sıkım yöntemiyle üretilen klasiğimiz, her türlü yemekte kullanılabilecek dengeli bir aromaya sahiptir. Zeytinyağını bol kullananlar için en değerli tercih.",
      en: "Family table staple in a generous litre bottle. Cold-pressed for a balanced aroma that suits every dish from salads to stews. The best-value choice for those who cook generously with olive oil.",
    },
  },
];

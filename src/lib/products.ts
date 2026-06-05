// Ürün verileri — Supabase'den okunur (products tablosu).
// Supabase'e erişilemezse yedek (fallback) liste kullanılır ki site asla boş kalmasın.
import { createSupabaseClient } from "@/lib/supabase";

export type Product = {
  /** Supabase ürün UUID'si — favoriler için gerekli (fallback listede yok). */
  id?: string;
  slug: string;
  name: string;
  badge: { tr: string; en: string };
  size: string;
  price: number; // TL
  medal?: "gold" | "silver";
  description?: { tr: string; en: string };
  details?: ProductDetails;
};

// ── Ürün detay sayfası içerikleri ────────────────────────────────────────────
// Supabase products.details (jsonb) sütunundan gelir; eksik anahtarlar
// aşağıdaki DEFAULT_DETAILS ile tamamlanır. Admin paneli yapılınca bu yapılar
// oradan satır ekle/çıkar şeklinde düzenlenebilir olacak.
type L = { tr: string; en: string };

export type ProductDetails = {
  /** Şişe fotoğrafına EK galeri görselleri (public yolu). */
  gallery: string[];
  /** Fiyatın altındaki 4'lü hızlı özellik şeridi. */
  highlights: { icon: string; title: L; sub: L }[];
  /** "Ürün Hakkında" kartındaki mini özellikler. */
  aboutSpecs: { icon: string; label: L; value: L }[];
  /** Tat & aroma profili (0-5). */
  taste: { fruity: number; bitter: number; pungent: number; notes: L };
  /** İdeal kullanım. */
  usage: { text: L; items: { icon: string; label: L }[] };
  /** Besin değerleri tablosu (100 ml). */
  nutrition: { rows: { label: L; value: string }[]; footnote: L };
};

const DEFAULT_NUTRITION_ROWS: { label: L; value: string }[] = [
  { label: { tr: "Enerji", en: "Energy" }, value: "824 kcal / 3389 kJ" },
  { label: { tr: "Yağ", en: "Fat" }, value: "91,6 g" },
  { label: { tr: "- Doymuş Yağ", en: "- Saturated Fat" }, value: "13,1 g" },
  { label: { tr: "- Tekli Doymamış Yağ", en: "- Monounsaturated Fat" }, value: "70,4 g" },
  { label: { tr: "- Çoklu Doymamış Yağ", en: "- Polyunsaturated Fat" }, value: "8,1 g" },
  { label: { tr: "Karbonhidrat", en: "Carbohydrate" }, value: "0 g" },
  { label: { tr: "- Şekerler", en: "- Sugars" }, value: "0 g" },
  { label: { tr: "Protein", en: "Protein" }, value: "0 g" },
  { label: { tr: "Lif", en: "Fibre" }, value: "0 g" },
  { label: { tr: "Tuz", en: "Salt" }, value: "0 g" },
  { label: { tr: "Vitamin E", en: "Vitamin E" }, value: "14,3 mg (%119**)" },
];

/** Yeni eklenen bir üründe details boşsa kullanılacak standart değerler. */
export const DEFAULT_DETAILS: ProductDetails = {
  gallery: [
    "/images/galeri/galeri-zeytinlik.webp",
    "/images/galeri/galeri-zeytin.webp",
    "/images/galeri/galeri-sikim.webp",
  ],
  highlights: [
    { icon: "leaf", title: { tr: "Soğuk Sıkım", en: "Cold Pressed" }, sub: { tr: "27°C altı", en: "Below 27°C" } },
    { icon: "drop", title: { tr: "Asitlik", en: "Acidity" }, sub: { tr: "≤ %0,8", en: "≤ 0.8%" } },
    { icon: "molecule", title: { tr: "%100 Doğal", en: "100% Natural" }, sub: { tr: "Katkısız", en: "Additive-free" } },
    { icon: "pin", title: { tr: "Menşei", en: "Origin" }, sub: { tr: "Pelitköy", en: "Pelitköy" } },
  ],
  aboutSpecs: [
    { icon: "olive", label: { tr: "Zeytin Türü", en: "Olive Variety" }, value: { tr: "Ayvalık", en: "Ayvalık" } },
    { icon: "press", label: { tr: "Üretim Yöntemi", en: "Production Method" }, value: { tr: "Soğuk Sıkım", en: "Cold Pressed" } },
    { icon: "pin", label: { tr: "Menşei", en: "Origin" }, value: { tr: "Pelitköy / Burhaniye", en: "Pelitköy / Burhaniye" } },
  ],
  taste: {
    fruity: 4,
    bitter: 2,
    pungent: 2,
    notes: {
      tr: "Dengeli, yumuşak içimli natürel sızma zeytinyağı.",
      en: "Balanced, smooth extra virgin olive oil.",
    },
  },
  usage: {
    text: {
      tr: "Salatalar, günlük yemekler ve kahvaltılıklar için idealdir.",
      en: "Ideal for salads, everyday cooking and breakfasts.",
    },
    items: [
      { icon: "salad", label: { tr: "Salatalar", en: "Salads" } },
      { icon: "breakfast", label: { tr: "Kahvaltılık", en: "Breakfast" } },
      { icon: "meze", label: { tr: "Soğuk Mezeler", en: "Cold Meze" } },
      { icon: "bread", label: { tr: "Ekmek Bandırma", en: "Bread Dipping" } },
    ],
  },
  nutrition: {
    rows: [
      ...DEFAULT_NUTRITION_ROWS,
      { label: { tr: "Polifenoller", en: "Polyphenols" }, value: "200+ mg/kg" },
    ],
    footnote: {
      tr: "** Günlük referans alım değerine göre.",
      en: "** Based on the daily reference intake.",
    },
  },
};

// Supabase'deki jsonb yapısı (snake_case, _tr/_en alanlı) → ProductDetails.
/* eslint-disable @typescript-eslint/no-explicit-any */
function toL(obj: any, key: string, fallback: L = { tr: "", en: "" }): L {
  const tr = obj?.[`${key}_tr`];
  const en = obj?.[`${key}_en`];
  if (typeof tr !== "string" && typeof en !== "string") return fallback;
  return { tr: typeof tr === "string" ? tr : (en ?? ""), en: typeof en === "string" ? en : (tr ?? "") };
}

export function normalizeDetails(raw: unknown): ProductDetails {
  const d = (raw && typeof raw === "object" ? raw : {}) as any;

  const gallery = Array.isArray(d.gallery) && d.gallery.length > 0
    ? d.gallery.filter((g: unknown) => typeof g === "string")
    : DEFAULT_DETAILS.gallery;

  const highlights = Array.isArray(d.highlights) && d.highlights.length > 0
    ? d.highlights.map((h: any) => ({
        icon: typeof h?.icon === "string" ? h.icon : "olive",
        title: toL(h, "title"),
        sub: toL(h, "sub"),
      }))
    : DEFAULT_DETAILS.highlights;

  const aboutSpecs = Array.isArray(d.about_specs) && d.about_specs.length > 0
    ? d.about_specs.map((s: any) => ({
        icon: typeof s?.icon === "string" ? s.icon : "olive",
        label: toL(s, "label"),
        value: toL(s, "value"),
      }))
    : DEFAULT_DETAILS.aboutSpecs;

  const taste = d.taste && typeof d.taste === "object"
    ? {
        fruity: clamp05(d.taste.fruity, DEFAULT_DETAILS.taste.fruity),
        bitter: clamp05(d.taste.bitter, DEFAULT_DETAILS.taste.bitter),
        pungent: clamp05(d.taste.pungent, DEFAULT_DETAILS.taste.pungent),
        notes: toL(d.taste, "notes", DEFAULT_DETAILS.taste.notes),
      }
    : DEFAULT_DETAILS.taste;

  const usage = d.usage && typeof d.usage === "object"
    ? {
        text: toL(d.usage, "text", DEFAULT_DETAILS.usage.text),
        items: Array.isArray(d.usage.items) && d.usage.items.length > 0
          ? d.usage.items.map((u: any) => ({
              icon: typeof u?.icon === "string" ? u.icon : "olive",
              label: toL(u, "label"),
            }))
          : DEFAULT_DETAILS.usage.items,
      }
    : DEFAULT_DETAILS.usage;

  const nutrition = d.nutrition && typeof d.nutrition === "object" && Array.isArray(d.nutrition.rows)
    ? {
        rows: d.nutrition.rows.map((r: any) => ({
          label: toL(r, "label"),
          value: typeof r?.value === "string" ? r.value : "",
        })),
        footnote: toL(d.nutrition, "footnote", DEFAULT_DETAILS.nutrition.footnote),
      }
    : DEFAULT_DETAILS.nutrition;

  return { gallery, highlights, aboutSpecs, taste, usage, nutrition };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function clamp05(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(5, Math.max(0, Math.round(n)));
}

/** "500 ml" / "5 L" gibi hacim metnini ml'ye çevirir; anlaşılamazsa null. */
export function parseSizeToMl(size: string): number | null {
  const m = size.replace(",", ".").match(/([\d.]+)\s*(ml|l|lt)/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return m[2].toLowerCase() === "ml" ? n : n * 1000;
}

/** 100 ml başına fiyat metni — ör. "31,60 TL / 100 ml". Hesaplanamazsa null. */
export function formatUnitPrice(price: number, size: string): string | null {
  const ml = parseSizeToMl(size);
  if (!ml) return null;
  const per100 = (price / ml) * 100;
  return `${per100.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL / 100 ml`;
}

/** Supabase'den aktif ürünleri çeker (sort_order sıralı, 5 dk cache). */
export async function getProducts(): Promise<Product[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return fallbackProducts;

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, badge_tr, badge_en, size, price, medal")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    console.warn("[products] Supabase okunamadı, yedek liste kullanılıyor.", error?.message);
    return fallbackProducts;
  }

  return data.map((row) => ({
    id: row.id,
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
    .select("id, slug, name, badge_tr, badge_en, size, price, medal, description_tr, description_en, details")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.warn("[products] getProductBySlug: Supabase hatası, yedek kullanılıyor.", error?.message);
    return withDetails(fallbackProducts.find((p) => p.slug === slug) ?? null);
  }

  return {
    id: data.id,
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
    details: normalizeDetails((data as { details?: unknown }).details),
  };
}

// Fallback üründe details boş → varsayılanlar + ürüne özel yedek değerler.
// (Supabase'deki seed'in özeti; gerçek kaynak DB'dir.)
const fallbackDetailOverrides: Record<string, Partial<ProductDetails>> = {
  "pelitkoy-erken-hasat-rezerv-petite": {
    highlights: earlyHarvestHighlights(),
    taste: {
      fruity: 5, bitter: 4, pungent: 5,
      notes: {
        tr: "Yeşil domates, taze çimen, enginar ve badem çağrışımları.",
        en: "Green tomato, fresh-cut grass, artichoke and almond.",
      },
    },
  },
  "veroliva-reserve-gold": {
    highlights: earlyHarvestHighlights(),
    taste: {
      fruity: 5, bitter: 4, pungent: 4,
      notes: {
        tr: "Yeşil domates, taze çimen, enginar ve badem çağrışımları.",
        en: "Green tomato, fresh-cut grass, artichoke and almond.",
      },
    },
  },
};

function earlyHarvestHighlights(): ProductDetails["highlights"] {
  return [
    { icon: "leaf", title: { tr: "Erken Hasat", en: "Early Harvest" }, sub: { tr: "Ekim Ayı", en: "October" } },
    { icon: "press", title: { tr: "Soğuk Sıkım", en: "Cold Pressed" }, sub: { tr: "24°C'de sıkım", en: "Pressed at 24°C" } },
    { icon: "drop", title: { tr: "Asitlik", en: "Acidity" }, sub: { tr: "≤ %0,3", en: "≤ 0.3%" } },
    { icon: "molecule", title: { tr: "Polifenol", en: "Polyphenol" }, sub: { tr: "450+ mg/kg", en: "450+ mg/kg" } },
  ];
}

function withDetails(p: Product | null): Product | null {
  if (!p) return null;
  return {
    ...p,
    details: { ...DEFAULT_DETAILS, ...(fallbackDetailOverrides[p.slug] ?? {}), ...(p.details ?? {}) },
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

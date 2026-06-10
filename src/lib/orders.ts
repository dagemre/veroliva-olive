// Sipariş tarafı ortak tipler ve yardımcılar (client-safe).
import type { Json } from "@/lib/database.types";

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type ShippingAddress = {
  full_name?: string;
  phone?: string;
  address_line?: string;
  district?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  billing?: { name?: string; address?: string };
};

export type OrderItemRow = {
  id: string;
  product_name: string;
  product_size: string | null;
  unit_price: number;
  quantity: number;
  total: number;
  products: { slug: string } | null;
};

export type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: string;
  coupon_code: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  status_history: Json;
  shipping_address: Json | null;
  order_items: OrderItemRow[];
};

/** Sipariş listesi/detayı için ortak select ifadesi. */
export const ORDER_SELECT =
  "id, order_number, status, created_at, subtotal, shipping_cost, discount, total, payment_method, coupon_code, tracking_carrier, tracking_number, status_history, shipping_address, order_items(id, product_name, product_size, unit_price, quantity, total, products(slug))";

/** Durum çizelgesi adımları (sırayla). pending/paid 0. adımı doldurur. */
export const TIMELINE_STEPS = ["received", "preparing", "shipped", "delivered"] as const;

/** Durumun çizelgedeki karşılığı (0-3); iptal/iade için -1. */
export function timelineIndex(status: string): number {
  switch (status) {
    case "pending":
    case "paid":
      return 0;
    case "preparing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return -1;
  }
}

/** status_history içinden bir duruma ilk geçiş zamanı. */
export function statusAt(history: Json, statuses: string[]): string | null {
  if (!Array.isArray(history)) return null;
  for (const entry of history) {
    if (
      entry &&
      typeof entry === "object" &&
      !Array.isArray(entry) &&
      typeof entry.status === "string" &&
      statuses.includes(entry.status) &&
      typeof entry.at === "string"
    ) {
      return entry.at;
    }
  }
  return null;
}

export function parseShippingAddress(raw: Json | null): ShippingAddress {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as ShippingAddress;
  }
  return {};
}

/** Durum rozeti renk sınıfları (tasarım: teslim yeşil, kargoda turuncu). */
export function statusColorClass(status: string): string {
  switch (status) {
    case "delivered":
      return "text-[#4a7a3a]";
    case "shipped":
      return "text-[#c07b2d]";
    case "cancelled":
    case "refunded":
      return "text-[#a04545]";
    default:
      return "text-ink-soft";
  }
}

export function formatOrderDate(
  locale: "tr" | "en",
  iso: string,
  withTime = false,
): string {
  const date = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "numeric", month: "long", year: "numeric" };
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", opts).format(date);
}

// ── Kargo firması takip linkleri ─────────────────────────────────────────────
// Çoğu Türk kargo firması takip numarasını URL parametresiyle kabul eder.
// Eşleşme yoksa null döner → "Kargom Nerede?" butonu gizlenir.
// Yeni firma eklerken: anahtarı firma adının küçük harf/türkçesiz halinden bul.
const CARRIER_TRACKING: { match: string[]; url: (no: string) => string }[] = [
  {
    match: ["yurtici", "yurtiçi"],
    url: (no) => `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(no)}`,
  },
  {
    match: ["aras"],
    url: (no) => `https://kargotakip.araskargo.com.tr/?code=${encodeURIComponent(no)}`,
  },
  {
    match: ["mng"],
    url: (no) => `https://kargotakip.mngkargo.com.tr/?takipNo=${encodeURIComponent(no)}`,
  },
  {
    match: ["ptt"],
    url: (no) => `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(no)}`,
  },
  {
    match: ["surat", "sürat"],
    url: (no) => `https://www.suratkargo.com.tr/KargoTakip/?kargotakipno=${encodeURIComponent(no)}`,
  },
  {
    match: ["sendeo"],
    url: (no) => `https://www.sendeo.com.tr/gonderi-takibi?code=${encodeURIComponent(no)}`,
  },
  {
    match: ["trendyol", "tex"],
    url: (no) => `https://www.trendyolexpress.com/gonderi-sorgula/${encodeURIComponent(no)}`,
  },
  {
    match: ["hepsijet"],
    url: (no) => `https://www.hepsijet.com/gonderi-takibi?trackingNumber=${encodeURIComponent(no)}`,
  },
];

/** Kargo firması + takip no'dan firmaya ait takip sayfası URL'i; bulunamazsa null. */
export function carrierTrackingUrl(
  carrier: string | null,
  trackingNumber: string | null,
): string | null {
  if (!carrier || !trackingNumber) return null;
  const key = carrier
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ğ/g, "g");
  const found = CARRIER_TRACKING.find((c) => c.match.some((m) => key.includes(m)));
  return found ? found.url(trackingNumber.trim()) : null;
}

/** Tahmini teslimat: sipariş tarihi + 3 gün (hafta sonuna denk gelirse pazartesi). */
export function estimatedDelivery(locale: "tr" | "en", createdAt: string): string {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 3);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Pazar → Pazartesi
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Cumartesi → Pazartesi
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(d);
}

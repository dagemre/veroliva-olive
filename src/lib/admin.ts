// Admin paneli ortak yardımcıları (client-safe): formatlar, durum/ödeme etiketleri,
// KPI/grafik hesapları, menü yapılandırması. Veri çekimi component'lerde
// getSupabaseBrowser() ile yapılır (oturumdaki admin → RLS izin verir).

export type Locale = "tr" | "en";

// Admin rotaları — hepsi statik (param'sız), Link href'ine doğrudan verilebilir.
export type AdminHref =
  | "/admin"
  | "/admin/urunler"
  | "/admin/siparisler"
  | "/admin/kullanicilar"
  | "/admin/odemeler"
  | "/admin/kampanyalar"
  | "/admin/kargo"
  | "/admin/icerik"
  | "/admin/yorumlar"
  | "/admin/raporlar"
  | "/admin/ayarlar";

// ── Menü ─────────────────────────────────────────────────────────────────────
// Tasarımdaki 11 öğe. `ready: false` olanlar "yakında" placeholder sayfasıdır.
export type AdminNavItem = {
  key: string;
  href: AdminHref;
  ready: boolean;
  icon: string; // 24x24 stroke path
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: "overview", href: "/admin", ready: true, icon: "M4 13h7V4H4zM13 20h7v-9h-7zM4 20h7v-4H4zM13 9h7V4h-7z" },
  { key: "products", href: "/admin/urunler", ready: true, icon: "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5zM4 7.5 12 12m0 9V12m8-4.5L12 12" },
  { key: "orders", href: "/admin/siparisler", ready: true, icon: "M6 4h9l4 4v12H6zM15 4v4h4M9 13h7M9 17h7M9 9h2" },
  { key: "users", href: "/admin/kullanicilar", ready: true, icon: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16.5 13.5c2 .4 3.5 2 3.5 4.2" },
  { key: "payments", href: "/admin/odemeler", ready: false, icon: "M3 7h18v10H3zM3 11h18M7 15h3" },
  { key: "campaigns", href: "/admin/kampanyalar", ready: false, icon: "M4 12.5 13 3h6v6l-9.5 9.5zM15.5 7.5h.01" },
  { key: "shipping", href: "/admin/kargo", ready: false, icon: "M3 7h11v8H3zM14 10h4l3 3v2h-7zM7.5 18.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM17.5 18.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z" },
  { key: "content", href: "/admin/icerik", ready: false, icon: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" },
  { key: "reviews", href: "/admin/yorumlar", ready: false, icon: "M5 5h14v10H9l-4 4z" },
  { key: "reports", href: "/admin/raporlar", ready: false, icon: "M5 20V10M12 20V4M19 20v-7" },
  { key: "settings", href: "/admin/ayarlar", ready: false, icon: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13a7.6 7.6 0 0 0 0-2l1.6-1.2-2-3.4-1.9.8a7.6 7.6 0 0 0-1.7-1l-.3-2H9.9l-.3 2a7.6 7.6 0 0 0-1.7 1l-1.9-.8-2 3.4L5.6 11a7.6 7.6 0 0 0 0 2l-1.6 1.2 2 3.4 1.9-.8c.5.4 1.1.7 1.7 1l.3 2h4.2l.3-2c.6-.3 1.2-.6 1.7-1l1.9.8 2-3.4z" },
];

// ── Formatlar ────────────────────────────────────────────────────────────────
export function formatTRY(value: number, locale: Locale = "tr"): string {
  const nf = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    maximumFractionDigits: 2,
  });
  return `${nf.format(Math.round(value * 100) / 100)} TL`;
}

export function formatCount(value: number, locale: Locale = "tr"): string {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB").format(value);
}

export function formatShortDate(iso: string, locale: Locale = "tr"): string {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

// ── Sipariş durumu ───────────────────────────────────────────────────────────
export type OrderStatusKey =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export const ORDER_STATUS_KEYS: OrderStatusKey[] = [
  "pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

/** Sipariş "geliri sayılır" mı? (ciro/satış toplamlarında). İptal/iade hariç. */
export function isRevenueStatus(status: string): boolean {
  return ["paid", "preparing", "shipped", "delivered"].includes(status);
}

/** Durum rozeti renkleri — tasarıma uygun (teslim yeşil, kargo amber, işlem nötr). */
export function statusBadgeClasses(status: string): string {
  switch (status) {
    case "delivered":
      return "border-[#9bb38a] bg-[#eaf0e2] text-[#3f6230]";
    case "shipped":
      return "border-[#d8c08a] bg-[#f6eed6] text-[#9a6a22]";
    case "preparing":
    case "paid":
      return "border-[#cdb9d2] bg-[#f0e9f2] text-[#6b4a78]";
    case "cancelled":
    case "refunded":
      return "border-[#d7b3b3] bg-[#f4e6e6] text-[#9a3d3d]";
    default: // pending
      return "border-line bg-parchment/60 text-ink-soft";
  }
}

// ── Ödeme yöntemi ────────────────────────────────────────────────────────────
export type PaymentKey = "card" | "bank_transfer" | "cod" | "other";

export function paymentKey(method: string | null): PaymentKey {
  switch (method) {
    case "card":
      return "card";
    case "bank_transfer":
      return "bank_transfer";
    case "cod":
      return "cod";
    default:
      return "other";
  }
}

/** Ödeme özeti donut renkleri (tasarımdaki yeşil tonları + altın + krem). */
export const PAYMENT_COLORS: Record<PaymentKey, string> = {
  card: "#3d4a22",
  bank_transfer: "#6f7f45",
  cod: "#b3924c",
  other: "#d9cca0",
};

// ── KPI yüzde değişimi ───────────────────────────────────────────────────────
export type Delta = { pct: number; dir: "up" | "down" | "flat"; isNew: boolean };

/** Bu dönem vs önceki dönem yüzde değişimi. Önceki 0 ve şimdiki >0 → "yeni". */
export function computeDelta(current: number, previous: number): Delta | null {
  if (previous === 0) {
    if (current === 0) return null;
    return { pct: 100, dir: "up", isNew: true };
  }
  const pct = ((current - previous) / previous) * 100;
  return {
    pct: Math.abs(Math.round(pct)),
    dir: pct > 0.5 ? "up" : pct < -0.5 ? "down" : "flat",
    isNew: false,
  };
}

// ── Zaman aralıkları ─────────────────────────────────────────────────────────
export function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

/** Son `count` ayın {label, start, end} kovaları (eskiden yeniye). */
export function monthBuckets(
  count: number,
  locale: Locale = "tr",
): { label: string; start: Date; end: Date }[] {
  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    month: "short",
  });
  const now = new Date();
  const out: { label: string; start: Date; end: Date }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    out.push({ label: fmt.format(start), start, end });
  }
  return out;
}

/** Son `count` haftanın kovaları (eskiden yeniye); etiket = ay/gün. */
export function weekBuckets(
  count: number,
  locale: Locale = "tr",
): { label: string; start: Date; end: Date }[] {
  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "short",
  });
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const out: { label: string; start: Date; end: Date }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(base);
    start.setDate(base.getDate() - i * 7 - 6);
    const end = new Date(base);
    end.setDate(base.getDate() - i * 7 + 1);
    out.push({ label: fmt.format(start), start, end });
  }
  return out;
}

// ── Çizgi grafiği yolu (Catmull-Rom → kübik Bézier, yumuşak) ──────────────────
export function smoothLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

/** Donut dilimi için SVG arc path (cx,cy,r dış; iç delik strokeWidth ile). */
export function donutSegments(
  values: number[],
  size = 100,
  thickness = 16,
): { d: string; index: number }[] {
  const total = values.reduce((a, b) => a + b, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segs: { d: string; index: number }[] = [];
  void circ;
  for (let i = 0; i < values.length; i++) {
    const frac = total > 0 ? values[i] / total : 0;
    const a0 = offset * 2 * Math.PI - Math.PI / 2;
    const a1 = (offset + frac) * 2 * Math.PI - Math.PI / 2;
    offset += frac;
    if (frac <= 0) continue;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    segs.push({ d: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`, index: i });
  }
  return segs;
}

/** Şişe görseli: yüklenmiş imageUrl (Supabase Storage) varsa onu, yoksa slug konvansiyonunu döndürür. */
export function productImage(slug: string | null | undefined, imageUrl?: string | null): string {
  if (imageUrl) return imageUrl;
  return slug ? `/images/products/${slug}.webp` : "/images/products/veroliva-classic.webp";
}

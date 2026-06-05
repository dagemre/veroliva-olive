// Sepet tipleri ve ortak sabitler.
// DİKKAT: Kargo kuralları place_order RPC'sinde (Supabase) de tanımlı —
// burada değişirse orada da değiştir (FREE_SHIPPING_THRESHOLD / SHIPPING_FEE).

export type CartItem = {
  slug: string;
  name: string;
  size: string;
  price: number; // TL — sepete eklenme anındaki fiyat; sipariş anında DB'den doğrulanır
  badge: { tr: string; en: string };
  qty: number;
};

/** Bu tutarın üzeri ücretsiz kargo (TL). */
export const FREE_SHIPPING_THRESHOLD = 1500;

/** Eşik altı sabit kargo ücreti (TL). */
export const SHIPPING_FEE = 99.9;

export function shippingCostFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

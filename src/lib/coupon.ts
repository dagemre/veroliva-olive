// Sepette uygulanan kupon kodu sayfalar arasında sessionStorage ile taşınır.
// İndirim tutarı her sayfada validate_coupon RPC'siyle yeniden doğrulanır;
// sipariş anında place_order zaten DB'de tekrar kontrol eder.

const KEY = "veroliva_coupon_v1";

export function getStoredCoupon(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function storeCoupon(code: string) {
  try {
    window.sessionStorage.setItem(KEY, code);
  } catch {
    /* yoksay */
  }
}

export function clearStoredCoupon() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* yoksay */
  }
}

export type CouponResult =
  | { valid: true; code: string; discount: number }
  | { valid: false; reason: string; min_subtotal?: number };

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseCouponResult(raw: unknown): CouponResult {
  const d = raw as any;
  if (d && d.valid === true) {
    return { valid: true, code: String(d.code), discount: Number(d.discount) || 0 };
  }
  return {
    valid: false,
    reason: typeof d?.reason === "string" ? d.reason : "error",
    min_subtotal: typeof d?.min_subtotal === "number" ? d.min_subtotal : undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

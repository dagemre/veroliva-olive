"use client";

// Sepet durumu — localStorage'da saklanır (oturum gerekmez).
// Sipariş oluşturulurken fiyatlar Supabase place_order RPC'sinde DB'den doğrulanır.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartItem } from "@/lib/cart";

const STORAGE_KEY = "veroliva_cart_v1";

type CartContextValue = {
  items: CartItem[];
  /** localStorage'dan yüklenme tamamlandı mı (SSR uyumsuzluğunu önler). */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) =>
        i && typeof i.slug === "string" && typeof i.price === "number" &&
        typeof i.qty === "number" && i.qty > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    setItems(readStorage());
    loaded.current = true;
    setReady(true);
  }, []);

  // Değişiklikleri kaydet (ilk yükleme öncesi boş listeyi yazma!)
  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* depolama dolu/kapalıysa sessiz geç */
    }
  }, [items]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug
            ? { ...i, ...item, qty: Math.min(99, i.qty + qty) }
            : i,
        );
      }
      return [...prev, { ...item, qty: Math.min(99, Math.max(1, qty)) }];
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      qty < 1
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, qty: Math.min(99, qty) } : i)),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, i) => acc + i.qty, 0);
    const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
    return { items, ready, count, subtotal, add, setQty, remove, clear };
  }, [items, ready, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart yalnızca <CartProvider> içinde kullanılabilir.");
  }
  return ctx;
}

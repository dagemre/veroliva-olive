"use client";

// Siparişlerim — tüm sipariş listesi.
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAccount } from "@/components/account/AccountShell";
import OrderRowCard from "@/components/account/OrderRowCard";
import { ORDER_SELECT, type OrderRow } from "@/lib/orders";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function OrdersList() {
  const t = useTranslations("accountPage.orders");
  const { user } = useAccount();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as unknown as OrderRow[]));
  }, [user.id]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
      <div className="mt-6 border border-line bg-cream-light">
        {orders === null ? (
          <p className="px-5 py-12 text-center text-sm text-ink-soft">…</p>
        ) : orders.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-ink-soft">{t("empty")}</p>
            <Link
              href="/koleksiyon"
              className="mt-5 inline-block bg-olive px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
            >
              {t("shopNow")} →
            </Link>
          </div>
        ) : (
          orders.map((o) => <OrderRowCard key={o.id} order={o} />)
        )}
      </div>
    </div>
  );
}

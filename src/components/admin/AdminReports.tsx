"use client";

// Raporlar: aylık satış, en çok satan ürünler, düşük stok + CSV dışa aktarma.
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { formatCount, formatTRY, isRevenueStatus, monthBuckets, type Locale } from "@/lib/admin";

type Order = {
  order_number: string;
  status: string;
  created_at: string;
  total: number;
  email: string | null;
  payment_method: string | null;
  order_items: { product_name: string; quantity: number; total: number }[];
};
type Product = { name: string; size: string; price: number; stock_quantity: number };

const LOW_STOCK = 10;

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = "﻿" + rows.map((r) => r.map(esc).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    (async () => {
      const [oRes, pRes] = await Promise.all([
        supabase.from("orders").select("order_number, status, created_at, total, email, payment_method, order_items(product_name, quantity, total)").order("created_at", { ascending: false }).limit(1000),
        supabase.from("products").select("name, size, price, stock_quantity").order("sort_order"),
      ]);
      setOrders((oRes.data as Order[]) ?? []);
      setProducts((pRes.data as Product[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const monthly = useMemo(() => {
    const buckets = monthBuckets(12, locale);
    return buckets.map((b) => {
      const inB = orders.filter((o) => {
        const ts = new Date(o.created_at).getTime();
        return ts >= b.start.getTime() && ts < b.end.getTime();
      });
      const revenue = inB.filter((o) => isRevenueStatus(o.status)).reduce((s, o) => s + Number(o.total), 0);
      return { label: b.label, count: inB.length, revenue };
    });
  }, [orders, locale]);
  const monthlyTotal = useMemo(() => monthly.reduce((s, m) => s + m.revenue, 0), [monthly]);

  const topProducts = useMemo(() => {
    const tally = new Map<string, { qty: number; revenue: number }>();
    for (const o of orders) {
      if (!isRevenueStatus(o.status)) continue;
      for (const it of o.order_items) {
        const cur = tally.get(it.product_name) ?? { qty: 0, revenue: 0 };
        cur.qty += it.quantity;
        cur.revenue += Number(it.total);
        tally.set(it.product_name, cur);
      }
    }
    return [...tally.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [orders]);

  const lowStock = useMemo(() => products.filter((p) => p.stock_quantity <= LOW_STOCK).sort((a, b) => a.stock_quantity - b.stock_quantity), [products]);

  function exportOrders() {
    const header = ["Sipariş No", "Tarih", "Durum", "Ödeme", "E-posta", "Tutar (TL)"];
    const body = orders.map((o) => [o.order_number, new Date(o.created_at).toLocaleDateString("tr-TR"), t(`status.${o.status}`), o.payment_method ?? "", o.email ?? "", Number(o.total)]);
    downloadCsv("veroliva-siparisler.csv", [header, ...body]);
  }
  function exportProducts() {
    const header = ["Ürün", "Hacim", "Fiyat (TL)", "Stok"];
    const body = products.map((p) => [p.name, p.size, Number(p.price), p.stock_quantity]);
    downloadCsv("veroliva-stok.csv", [header, ...body]);
  }

  const maxRev = Math.max(...monthly.map((m) => m.revenue), 1);

  return (
    <>
      <AdminPageHeader title={t("nav.reports")} subtitle={t("reports.subtitle")} showControls={false} />

      <div className="mb-5 flex flex-wrap gap-3">
        <button type="button" onClick={exportOrders} className="flex items-center gap-2 border border-line bg-cream-light px-4 py-2.5 text-[12px] font-medium text-ink hover:border-gold-light">
          <span aria-hidden="true">↓</span> {t("reports.exportOrders")}
        </button>
        <button type="button" onClick={exportProducts} className="flex items-center gap-2 border border-line bg-cream-light px-4 py-2.5 text-[12px] font-medium text-ink hover:border-gold-light">
          <span aria-hidden="true">↓</span> {t("reports.exportStock")}
        </button>
      </div>

      {loading ? (
        <p className="py-20 text-center text-sm text-ink-soft">{t("loading")}</p>
      ) : (
        <div className="space-y-6">
          {/* Aylık satış */}
          <section className="border border-line bg-cream-light p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">{t("reports.monthly")}</h2>
              <span className="text-[13px] text-ink-soft">{t("reports.total")}: <span className="font-semibold text-ink">{formatTRY(monthlyTotal, locale)}</span></span>
            </div>
            <div className="mt-4 space-y-1.5">
              {monthly.map((m) => (
                <div key={m.label} className="flex items-center gap-3 text-[12px]">
                  <span className="w-10 text-ink-soft">{m.label}</span>
                  <span className="h-3.5 flex-1 overflow-hidden bg-parchment/60">
                    <span className="block h-full bg-olive" style={{ width: `${(m.revenue / maxRev) * 100}%` }} />
                  </span>
                  <span className="w-16 text-right text-ink-soft">{m.count} {t("reports.orders")}</span>
                  <span className="w-28 text-right font-medium text-ink">{formatTRY(m.revenue, locale)}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* En çok satan */}
            <section className="border border-line bg-cream-light p-6">
              <h2 className="font-display text-lg text-ink">{t("reports.topProducts")}</h2>
              {topProducts.length === 0 ? (
                <p className="mt-4 text-[13px] text-ink-soft">{t("empty.orders")}</p>
              ) : (
                <table className="mt-4 w-full text-left text-[13px]">
                  <tbody className="divide-y divide-line">
                    {topProducts.map((p) => (
                      <tr key={p.name}>
                        <td className="py-2 text-ink">{p.name}</td>
                        <td className="py-2 text-right text-ink-soft">{formatCount(p.qty, locale)} {t("reports.units")}</td>
                        <td className="py-2 text-right font-medium text-ink">{formatTRY(p.revenue, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Düşük stok */}
            <section className="border border-line bg-cream-light p-6">
              <h2 className="font-display text-lg text-ink">{t("reports.lowStock")}</h2>
              <p className="mt-1 text-[11px] text-ink-soft">{t("reports.lowStockHint", { n: LOW_STOCK })}</p>
              {lowStock.length === 0 ? (
                <p className="mt-4 text-[13px] text-[#3f6230]">✓ {t("reports.stockOk")}</p>
              ) : (
                <table className="mt-4 w-full text-left text-[13px]">
                  <tbody className="divide-y divide-line">
                    {lowStock.map((p) => (
                      <tr key={p.name}>
                        <td className="py-2 text-ink">{p.name} <span className="text-[11px] text-ink-soft">{p.size}</span></td>
                        <td className={`py-2 text-right font-semibold ${p.stock_quantity <= 5 ? "text-[#a8503f]" : "text-[#9a6a22]"}`}>{formatCount(p.stock_quantity, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}

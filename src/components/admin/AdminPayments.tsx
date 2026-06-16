"use client";

// Ödemeler: orders üzerinden ödeme görünümü — özet + yöntem dağılımı + işlem listesi.
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  formatTRY, formatShortDate, isRevenueStatus, paymentKey, PAYMENT_COLORS,
  statusBadgeClasses, type Locale, type PaymentKey,
} from "@/lib/admin";

type Order = {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  total: number;
  payment_method: string | null;
  payment_id: string | null;
  email: string | null;
};

export default function AdminPayments() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    supabase
      .from("orders")
      .select("id, order_number, status, created_at, total, payment_method, payment_id, email")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setRows((data as Order[]) ?? []);
        setLoading(false);
      });
  }, []);

  const stats = useMemo(() => {
    let collected = 0, pending = 0, refunded = 0;
    const byMethod: Record<PaymentKey, number> = { card: 0, bank_transfer: 0, cod: 0, other: 0 };
    for (const o of rows) {
      const v = Number(o.total);
      if (isRevenueStatus(o.status)) {
        collected += v;
        byMethod[paymentKey(o.payment_method)] += v;
      } else if (o.status === "pending") pending += v;
      else if (o.status === "refunded") refunded += v;
    }
    const keys: PaymentKey[] = ["card", "bank_transfer", "cod", "other"];
    const methods = keys
      .map((k) => ({ key: k, amount: byMethod[k], pct: collected ? Math.round((byMethod[k] / collected) * 100) : 0 }))
      .filter((m) => m.amount > 0);
    return { collected, pending, refunded, methods };
  }, [rows]);

  return (
    <>
      <AdminPageHeader title={t("nav.payments")} subtitle={t("payments.subtitle")} showControls={false} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Kpi label={t("payments.collected")} value={formatTRY(stats.collected, locale)} tone="ok" />
        <Kpi label={t("payments.pending")} value={formatTRY(stats.pending, locale)} tone="warn" />
        <Kpi label={t("payments.refunded")} value={formatTRY(stats.refunded, locale)} tone="bad" />
      </div>

      {stats.methods.length > 0 && (
        <section className="mt-6 border border-line bg-cream-light p-6">
          <h2 className="font-display text-lg text-ink">{t("payments.byMethod")}</h2>
          <ul className="mt-4 space-y-2.5">
            {stats.methods.map((m) => (
              <li key={m.key} className="flex items-center gap-3 text-[13px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PAYMENT_COLORS[m.key] }} />
                <span className="w-36 text-ink">{t(`payment.${m.key}`)}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-parchment/70">
                  <span className="block h-full" style={{ width: `${m.pct}%`, background: PAYMENT_COLORS[m.key] }} />
                </span>
                <span className="w-10 text-right text-ink-soft">%{m.pct}</span>
                <span className="w-28 text-right font-medium text-ink">{formatTRY(m.amount, locale)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 overflow-x-auto border border-line bg-cream-light">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-ink-soft">
              <th className="px-4 py-3 font-semibold">{t("orders.col.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("orders.col.customer")}</th>
              <th className="px-4 py-3 font-semibold">{t("orders.col.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("payments.method")}</th>
              <th className="px-4 py-3 font-semibold">{t("orders.col.status")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("orders.col.total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-ink-soft">{t("loading")}</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-ink-soft">{t("empty.payments")}</td></tr>}
            {rows.map((o) => (
              <tr key={o.id} className="text-[13px] text-ink">
                <td className="px-4 py-3 font-medium">#{o.order_number}</td>
                <td className="px-4 py-3 text-ink-soft">{o.email ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{formatShortDate(o.created_at, locale)}</td>
                <td className="px-4 py-3 text-ink-soft">{t(`payment.${paymentKey(o.payment_method)}`)}</td>
                <td className="px-4 py-3">
                  <span className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusBadgeClasses(o.status)}`}>
                    {t(`status.${o.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatTRY(Number(o.total), locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "bad" }) {
  const color = tone === "ok" ? "text-[#3f6230]" : tone === "warn" ? "text-[#9a6a22]" : "text-[#a8503f]";
  return (
    <div className="border border-line bg-cream-light p-6">
      <span className="block text-[12px] text-ink-soft">{label}</span>
      <span className={`mt-2 block font-display text-[26px] leading-none ${color}`}>{value}</span>
    </div>
  );
}

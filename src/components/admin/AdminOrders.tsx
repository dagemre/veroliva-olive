"use client";

// Siparişler modülü: liste + durum güncelleme + detay (kalemler, adres, kargo takip).
// Durum değişince orders.status güncellenir; status_history trigger'ı otomatik ekler.

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAdmin } from "./AdminShell";
import AdminPageHeader from "./AdminPageHeader";
import AdminModal from "./AdminModal";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  formatShortDate,
  formatTRY,
  ORDER_STATUS_KEYS,
  paymentKey,
  statusBadgeClasses,
  type Locale,
} from "@/lib/admin";
import { parseShippingAddress } from "@/lib/orders";
import type { Json } from "@/lib/database.types";

type Item = { id: string; product_name: string; product_size: string | null; quantity: number; unit_price: number; total: number };
type Order = {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  email: string | null;
  payment_method: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  shipping_address: Json | null;
  order_items: Item[];
};

const COLS =
  "id, order_number, status, created_at, total, subtotal, shipping_cost, discount, email, payment_method, tracking_carrier, tracking_number, shipping_address, order_items(id, product_name, product_size, quantity, unit_price, total)";

const inputCls = "w-full border border-line bg-cream px-3 py-2.5 text-[13px] text-ink focus:border-gold-light focus:outline-none";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft mb-1.5";

export default function AdminOrders() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>("all");

  async function load() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    const { data } = await supabase.from("orders").select(COLS).order("created_at", { ascending: false }).limit(500);
    setRows((data as Order[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  return (
    <>
      <AdminPageHeader title={t("nav.orders")} subtitle={t("orders.subtitle")} />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={t("orders.filterAll")} />
        {ORDER_STATUS_KEYS.map((k) => (
          <FilterChip key={k} active={filter === k} onClick={() => setFilter(k)} label={t(`status.${k}`)} />
        ))}
      </div>

      <div className="overflow-x-auto border border-line bg-cream-light">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-ink-soft">
              <th className="px-4 py-3 font-semibold">{t("orders.col.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("orders.col.customer")}</th>
              <th className="px-4 py-3 font-semibold">{t("orders.col.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("orders.col.total")}</th>
              <th className="px-4 py-3 font-semibold">{t("orders.col.payment")}</th>
              <th className="px-4 py-3 font-semibold">{t("orders.col.status")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("orders.col.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-ink-soft">{t("loading")}</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-ink-soft">{t("empty.orders")}</td></tr>}
            {filtered.map((o) => (
              <tr key={o.id} className="text-[13px] text-ink">
                <td className="px-4 py-3 font-medium">#{o.order_number}</td>
                <td className="px-4 py-3 text-ink-soft">{o.email ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{formatShortDate(o.created_at, locale)}</td>
                <td className="px-4 py-3 font-medium">{formatTRY(Number(o.total), locale)}</td>
                <td className="px-4 py-3 text-ink-soft">{t(`payment.${paymentKey(o.payment_method)}`)}</td>
                <td className="px-4 py-3">
                  <span className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusBadgeClasses(o.status)}`}>
                    {t(`status.${o.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setDetail(o)} className="text-[12px] font-medium text-olive hover:text-olive-deep">
                    {t("orders.detail")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <OrderDetailModal order={detail} onClose={() => setDetail(null)} onSaved={() => { setDetail(null); load(); }} />
      )}
    </>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active ? "border-olive bg-olive text-cream" : "border-line bg-cream-light text-ink-soft hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function OrderDetailModal({ order, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: () => void }) {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [status, setStatus] = useState(order.status);
  const [carrier, setCarrier] = useState(order.tracking_carrier ?? "");
  const [trackNo, setTrackNo] = useState(order.tracking_number ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const addr = parseShippingAddress(order.shipping_address);

  async function save() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        tracking_carrier: carrier || null,
        tracking_number: trackNo || null,
      })
      .eq("id", order.id);
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    onSaved();
  }

  return (
    <AdminModal title={`#${order.order_number}`} onClose={onClose}>
      {/* Kalemler */}
      <div className="border border-line">
        {order.order_items.map((it) => (
          <div key={it.id} className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[13px] last:border-0">
            <div className="min-w-0">
              <span className="block truncate text-ink">{it.product_name}</span>
              <span className="text-[11px] text-ink-soft">{it.product_size} · {it.quantity}×</span>
            </div>
            <span className="font-medium text-ink">{formatTRY(Number(it.total), locale)}</span>
          </div>
        ))}
      </div>

      {/* Toplamlar */}
      <dl className="mt-3 space-y-1 text-[12px]">
        <Row label={t("orders.subtotal")} value={formatTRY(Number(order.subtotal), locale)} />
        <Row label={t("orders.shipping")} value={order.shipping_cost ? formatTRY(Number(order.shipping_cost), locale) : t("orders.free")} />
        {order.discount > 0 && <Row label={t("orders.discount")} value={`− ${formatTRY(Number(order.discount), locale)}`} />}
        <div className="flex justify-between border-t border-line pt-1.5 text-[13px] font-semibold text-ink">
          <span>{t("orders.col.total")}</span>
          <span>{formatTRY(Number(order.total), locale)}</span>
        </div>
      </dl>

      {/* Adres */}
      {(addr.full_name || addr.address_line) && (
        <div className="mt-4 border border-line bg-cream p-3 text-[12px] text-ink-soft">
          <span className="block font-semibold text-ink">{addr.full_name}</span>
          {addr.phone && <span className="block">{addr.phone}</span>}
          {addr.address_line && <span className="block">{addr.address_line}</span>}
          <span className="block">{[addr.district, addr.city, addr.postal_code].filter(Boolean).join(", ")}</span>
        </div>
      )}

      {/* Durum + kargo */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>{t("orders.col.status")}</label>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {ORDER_STATUS_KEYS.map((k) => (
              <option key={k} value={k}>{t(`status.${k}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{t("orders.carrier")}</label>
          <input className={inputCls} value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Yurtiçi / Aras..." />
        </div>
        <div>
          <label className={labelCls}>{t("orders.trackingNo")}</label>
          <input className={inputCls} value={trackNo} onChange={(e) => setTrackNo(e.target.value)} />
        </div>
      </div>

      {err && <p className="mt-3 text-[12px] text-[#a8503f]">{err}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="border border-line px-5 py-2.5 text-[12px] font-medium text-ink-soft hover:text-ink">{t("cancel")}</button>
        <button type="button" onClick={save} disabled={busy} className="bg-olive px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-cream hover:bg-olive-deep disabled:opacity-60">
          {busy ? t("saving") : t("save")}
        </button>
      </div>
    </AdminModal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-soft">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

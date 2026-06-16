"use client";

// Kargo Yönetimi: gönderim kuyruğu. Hazırlanan/kargolanan siparişlere firma +
// takip no girilir ve durum ilerletilir (orders.update; status_history trigger).

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { formatShortDate, statusBadgeClasses, type Locale } from "@/lib/admin";
import { parseShippingAddress } from "@/lib/orders";
import type { Json } from "@/lib/database.types";

type Order = {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  email: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  shipping_address: Json | null;
};

type Draft = { carrier: string; tracking: string; status: string; saving?: boolean; saved?: boolean };

const QUEUE = ["paid", "preparing", "shipped"];
const STATUS_OPTS = ["paid", "preparing", "shipped", "delivered"];
const inputCls = "w-full border border-line bg-cream px-2.5 py-2 text-[12px] text-ink focus:border-gold-light focus:outline-none";

export default function AdminShipping() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [rows, setRows] = useState<Order[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status, created_at, email, tracking_carrier, tracking_number, shipping_address")
      .in("status", QUEUE)
      .order("created_at", { ascending: true });
    const list = (data as Order[]) ?? [];
    setRows(list);
    const d: Record<string, Draft> = {};
    for (const o of list) d[o.id] = { carrier: o.tracking_carrier ?? "", tracking: o.tracking_number ?? "", status: o.status };
    setDrafts(d);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function setDraft(id: string, p: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...p, saved: false } }));
  }

  async function save(o: Order) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const d = drafts[o.id];
    setDraft(o.id, { saving: true });
    const { error } = await supabase
      .from("orders")
      .update({ status: d.status, tracking_carrier: d.carrier || null, tracking_number: d.tracking || null })
      .eq("id", o.id);
    setDrafts((prev) => ({ ...prev, [o.id]: { ...prev[o.id], saving: false, saved: !error } }));
    // Kuyruktan çıkan (delivered) satırı kısa süre sonra listeden düş.
    if (!error && d.status === "delivered") {
      setTimeout(() => setRows((prev) => prev.filter((x) => x.id !== o.id)), 800);
    }
  }

  return (
    <>
      <AdminPageHeader title={t("nav.shipping")} subtitle={t("shipping.subtitle")} showControls={false} />

      <p className="mb-5 text-[13px] text-ink-soft">{t("shipping.queueCount", { count: rows.length })}</p>

      {loading ? (
        <p className="py-20 text-center text-sm text-ink-soft">{t("loading")}</p>
      ) : rows.length === 0 ? (
        <div className="border border-dashed border-line bg-cream-light px-6 py-20 text-center text-[13px] text-ink-soft">
          {t("shipping.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const d = drafts[o.id];
            const addr = parseShippingAddress(o.shipping_address);
            return (
              <div key={o.id} className="border border-line bg-cream-light p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[13px] font-semibold text-ink">#{o.order_number}</span>
                    <span className="ml-3 text-[12px] text-ink-soft">{addr.full_name || o.email}</span>
                    <span className="ml-3 text-[11px] text-ink-soft">{formatShortDate(o.created_at, locale)}</span>
                  </div>
                  <span className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusBadgeClasses(o.status)}`}>
                    {t(`status.${o.status}`)}
                  </span>
                </div>
                {(addr.address_line || addr.city) && (
                  <p className="mt-2 text-[12px] text-ink-soft">
                    {[addr.address_line, addr.district, addr.city, addr.postal_code].filter(Boolean).join(", ")}
                    {addr.phone ? ` · ${addr.phone}` : ""}
                  </p>
                )}
                <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.08em] text-ink-soft">{t("orders.carrier")}</label>
                    <input className={inputCls} value={d.carrier} onChange={(e) => setDraft(o.id, { carrier: e.target.value })} placeholder="Yurtiçi / Aras..." />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.08em] text-ink-soft">{t("orders.trackingNo")}</label>
                    <input className={inputCls} value={d.tracking} onChange={(e) => setDraft(o.id, { tracking: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.08em] text-ink-soft">{t("orders.col.status")}</label>
                    <select className={inputCls} value={d.status} onChange={(e) => setDraft(o.id, { status: e.target.value })}>
                      {STATUS_OPTS.map((s) => (
                        <option key={s} value={s}>{t(`status.${s}`)}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => save(o)}
                    disabled={d.saving}
                    className="h-[38px] bg-olive px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-cream hover:bg-olive-deep disabled:opacity-60"
                  >
                    {d.saving ? t("saving") : d.saved ? t("shipping.saved") : t("save")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

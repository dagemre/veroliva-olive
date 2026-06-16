"use client";

// Kampanyalar / kupon yönetimi: liste + yeni/düzenle modalı + aktif-pasif.
// coupons tablosu admin RLS'li. Kullanım sayısı user_coupons'tan (used_at dolu).
// Silme YOK (user_coupons FK'si) — kupon pasifleştirilir.

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import AdminModal from "./AdminModal";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { formatShortDate, formatTRY, type Locale } from "@/lib/admin";

type Coupon = {
  id: string;
  code: string;
  description_tr: string;
  description_en: string;
  discount_type: string;
  value: number;
  min_subtotal: number;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
};

const COLS = "id, code, description_tr, description_en, discount_type, value, min_subtotal, valid_until, is_active, created_at";
const inputCls = "w-full border border-line bg-cream px-3 py-2.5 text-[13px] text-ink focus:border-gold-light focus:outline-none";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft mb-1.5";

function discountLabel(c: Coupon, locale: Locale): string {
  return c.discount_type === "percent" ? `%${c.value}` : formatTRY(Number(c.value), locale);
}

export default function AdminCampaigns() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [rows, setRows] = useState<Coupon[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Coupon | null>(null);
  const [adding, setAdding] = useState(false);

  async function load() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    const [cRes, uRes] = await Promise.all([
      supabase.from("coupons").select(COLS).order("created_at", { ascending: false }),
      supabase.from("user_coupons").select("coupon_id, used_at"),
    ]);
    setRows((cRes.data as Coupon[]) ?? []);
    const tally: Record<string, number> = {};
    for (const u of (uRes.data as { coupon_id: string; used_at: string | null }[]) ?? []) {
      if (u.used_at) tally[u.coupon_id] = (tally[u.coupon_id] ?? 0) + 1;
    }
    setUsage(tally);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggleActive(c: Coupon) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setRows((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)));
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
  }

  const activeCount = useMemo(() => rows.filter((r) => r.is_active).length, [rows]);

  return (
    <>
      <AdminPageHeader title={t("nav.campaigns")} subtitle={t("campaigns.subtitle")} showControls={false} />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-soft">{t("campaigns.count", { count: rows.length, active: activeCount })}</p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-olive px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep"
        >
          <span aria-hidden="true">+</span>
          {t("campaigns.add")}
        </button>
      </div>

      <div className="overflow-x-auto border border-line bg-cream-light">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-ink-soft">
              <th className="px-4 py-3 font-semibold">{t("campaigns.col.code")}</th>
              <th className="px-4 py-3 font-semibold">{t("campaigns.col.discount")}</th>
              <th className="px-4 py-3 font-semibold">{t("campaigns.col.min")}</th>
              <th className="px-4 py-3 font-semibold">{t("campaigns.col.validUntil")}</th>
              <th className="px-4 py-3 font-semibold">{t("campaigns.col.usage")}</th>
              <th className="px-4 py-3 font-semibold">{t("campaigns.col.status")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("campaigns.col.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-ink-soft">{t("loading")}</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-ink-soft">{t("campaigns.empty")}</td></tr>}
            {rows.map((c) => (
              <tr key={c.id} className="text-[13px] text-ink">
                <td className="px-4 py-3">
                  <span className="inline-block border border-line bg-cream px-2.5 py-1 font-mono text-[12px] font-semibold tracking-[0.1em]">{c.code}</span>
                </td>
                <td className="px-4 py-3 font-medium">{discountLabel(c, locale)}</td>
                <td className="px-4 py-3 text-ink-soft">{Number(c.min_subtotal) > 0 ? formatTRY(Number(c.min_subtotal), locale) : "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{c.valid_until ? formatShortDate(c.valid_until, locale) : t("campaigns.noExpiry")}</td>
                <td className="px-4 py-3 text-ink-soft">{usage[c.id] ?? 0}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${
                      c.is_active
                        ? "border-[#9bb38a] bg-[#eaf0e2] text-[#3f6230]"
                        : "border-line bg-parchment/60 text-ink-soft"
                    }`}
                  >
                    {c.is_active ? t("campaigns.active") : t("campaigns.passive")}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setEdit(c)} className="text-[12px] font-medium text-olive hover:text-olive-deep">
                    {t("products.edit")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(edit || adding) && (
        <CouponForm
          coupon={edit}
          onClose={() => {
            setEdit(null);
            setAdding(false);
          }}
          onSaved={() => {
            setEdit(null);
            setAdding(false);
            load();
          }}
        />
      )}
    </>
  );
}

function CouponForm({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("admin");
  const [code, setCode] = useState(coupon?.code ?? "");
  const [type, setType] = useState(coupon?.discount_type ?? "percent");
  const [value, setValue] = useState(coupon ? String(coupon.value) : "");
  const [minSub, setMinSub] = useState(coupon ? String(coupon.min_subtotal) : "0");
  const [until, setUntil] = useState(coupon?.valid_until ? coupon.valid_until.slice(0, 10) : "");
  const [descTr, setDescTr] = useState(coupon?.description_tr ?? "");
  const [descEn, setDescEn] = useState(coupon?.description_en ?? "");
  const [active, setActive] = useState(coupon?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const cleanCode = code.trim().toLocaleUpperCase("tr-TR").replace(/\s+/g, "");
    if (!cleanCode || !value) {
      setErr(t("campaigns.required"));
      return;
    }
    setBusy(true);
    setErr(null);
    const payload = {
      code: cleanCode,
      discount_type: type,
      value: Number(value),
      min_subtotal: Number(minSub) || 0,
      valid_until: until ? new Date(`${until}T23:59:59`).toISOString() : null,
      description_tr: descTr,
      description_en: descEn || descTr,
      is_active: active,
    };
    const { error } = coupon
      ? await supabase.from("coupons").update(payload).eq("id", coupon.id)
      : await supabase.from("coupons").insert(payload);
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    setBusy(false);
    onSaved();
  }

  return (
    <AdminModal title={coupon ? coupon.code : t("campaigns.addTitle")} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>{t("campaigns.form.code")}</label>
          <input className={`${inputCls} font-mono uppercase tracking-[0.1em]`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="HOSGELDIN15" />
        </div>
        <div>
          <label className={labelCls}>{t("campaigns.form.type")}</label>
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="percent">{t("campaigns.form.percent")}</option>
            <option value="fixed">{t("campaigns.form.fixed")}</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{type === "percent" ? t("campaigns.form.valuePercent") : t("campaigns.form.valueFixed")}</label>
          <input className={inputCls} type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{t("campaigns.form.minSubtotal")} (TL)</label>
          <input className={inputCls} type="number" value={minSub} onChange={(e) => setMinSub(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{t("campaigns.form.validUntil")}</label>
          <input className={inputCls} type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
          <p className="mt-1 text-[11px] text-ink-soft">{t("campaigns.form.validNote")}</p>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>{t("campaigns.form.descTr")}</label>
          <input className={inputCls} value={descTr} onChange={(e) => setDescTr(e.target.value)} placeholder="İlk siparişe özel %15 indirim" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>{t("campaigns.form.descEn")}</label>
          <input className={inputCls} value={descEn} onChange={(e) => setDescEn(e.target.value)} placeholder="15% off your first order" />
        </div>
        <label className="col-span-2 flex items-center gap-2.5 text-[13px] text-ink">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#3d4a22]" />
          {t("campaigns.form.activeLabel")}
        </label>
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

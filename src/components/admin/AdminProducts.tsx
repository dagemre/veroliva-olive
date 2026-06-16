"use client";

// Ürünler modülü: liste + fiyat/etiket/aktiflik düzenleme + stok hareketi + yeni ürün.
// Stok ASLA doğrudan UPDATE edilmez; stock_movements eklenir (trigger stoğu günceller).

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAdmin } from "./AdminShell";
import AdminPageHeader from "./AdminPageHeader";
import AdminModal from "./AdminModal";
import ProductEditor from "./ProductEditor";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { formatCount, formatTRY, productImage, type Locale } from "@/lib/admin";

type Row = {
  id: string;
  name: string;
  slug: string;
  size: string;
  price: number;
  currency: string;
  badge_tr: string;
  badge_en: string;
  category: string | null;
  medal: string | null;
  is_active: boolean;
  stock_quantity: number;
  sort_order: number;
};

const COLS = "id, name, slug, size, price, currency, badge_tr, badge_en, category, medal, is_active, stock_quantity, sort_order";

const inputCls =
  "w-full border border-line bg-cream px-3 py-2.5 text-[13px] text-ink focus:border-gold-light focus:outline-none";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft mb-1.5";

function slugify(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminProducts() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const { user } = useAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function load() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    const { data } = await supabase.from("products").select(COLS).order("sort_order");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggleActive(r: Row) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_active: !x.is_active } : x)));
    await supabase.from("products").update({ is_active: !r.is_active }).eq("id", r.id);
  }

  const totalStock = useMemo(() => rows.reduce((s, r) => s + r.stock_quantity, 0), [rows]);

  return (
    <>
      <AdminPageHeader title={t("nav.products")} subtitle={t("products.subtitle")} />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-soft">
          {t("products.count", { count: rows.length })} · {t("products.totalStock", { count: formatCount(totalStock, locale) })}
        </p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-olive px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep"
        >
          <span aria-hidden="true">+</span>
          {t("productMgmt.add")}
        </button>
      </div>

      <div className="overflow-x-auto border border-line bg-cream-light">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-ink-soft">
              <th className="px-4 py-3 font-semibold">{t("products.col.product")}</th>
              <th className="px-4 py-3 font-semibold">{t("products.col.badge")}</th>
              <th className="px-4 py-3 font-semibold">{t("products.col.price")}</th>
              <th className="px-4 py-3 font-semibold">{t("products.col.stock")}</th>
              <th className="px-4 py-3 font-semibold">{t("products.col.status")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("products.col.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-ink-soft">{t("loading")}</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-ink-soft">{t("empty.products")}</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="text-[13px] text-ink">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-line bg-cream">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImage(r.slug)} alt="" className="h-full w-full object-contain" />
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate font-medium">{r.name}</span>
                      <span className="block text-[11px] text-ink-soft">{r.size}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{locale === "tr" ? r.badge_tr : r.badge_en}</td>
                <td className="px-4 py-3 font-medium">{formatTRY(Number(r.price), locale)}</td>
                <td className="px-4 py-3">
                  <span className={r.stock_quantity <= 5 ? "font-semibold text-[#a8503f]" : ""}>
                    {formatCount(r.stock_quantity, locale)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(r)}
                    className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${
                      r.is_active
                        ? "border-[#9bb38a] bg-[#eaf0e2] text-[#3f6230]"
                        : "border-line bg-parchment/60 text-ink-soft"
                    }`}
                  >
                    {r.is_active ? t("products.active") : t("products.passive")}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditId(r.id)}
                    className="text-[12px] font-medium text-olive hover:text-olive-deep"
                  >
                    {t("products.edit")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editId && (
        <ProductEditor
          productId={editId}
          userId={user.id}
          onClose={() => setEditId(null)}
          onSaved={() => {
            setEditId(null);
            load();
          }}
        />
      )}
      {adding && (
        <AddProduct
          userId={user.id}
          nextSort={(rows.at(-1)?.sort_order ?? 0) + 1}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            load();
          }}
        />
      )}
    </>
  );
}

function AddProduct({
  userId,
  nextSort,
  onClose,
  onSaved,
}: {
  userId: string;
  nextSort: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("admin");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [badgeTr, setBadgeTr] = useState("");
  const [badgeEn, setBadgeEn] = useState("");
  const [category, setCategory] = useState("");
  const [medal, setMedal] = useState("");
  const [stock, setStock] = useState("0");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  function onName(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function save() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (!name || !slug || !size || !price) {
      setErr(t("products.form.required"));
      return;
    }
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        size,
        price: Number(price),
        badge_tr: badgeTr || name,
        badge_en: badgeEn || badgeTr || name,
        category: category || null,
        medal: medal || null,
        is_active: true,
        sort_order: nextSort,
      })
      .select("id")
      .single();
    if (error || !data) {
      setErr(error?.message ?? "Hata");
      setBusy(false);
      return;
    }
    const initial = parseInt(stock, 10);
    if (!Number.isNaN(initial) && initial > 0) {
      await supabase.from("stock_movements").insert({
        product_id: data.id,
        change: initial,
        reason: "initial",
        created_by: userId,
        note: "İlk stok (admin)",
      });
    }
    setBusy(false);
    onSaved();
  }

  return (
    <AdminModal title={t("products.addTitle")} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>{t("products.form.name")}</label>
          <input className={inputCls} value={name} onChange={(e) => onName(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{t("products.form.slug")}</label>
          <input className={inputCls} value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
        </div>
        <div>
          <label className={labelCls}>{t("products.form.size")}</label>
          <input className={inputCls} value={size} onChange={(e) => setSize(e.target.value)} placeholder="500 ml" />
        </div>
        <div>
          <label className={labelCls}>{t("products.col.price")} (TL)</label>
          <input className={inputCls} type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{t("products.form.initialStock")}</label>
          <input className={inputCls} type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{t("products.form.badgeTr")}</label>
          <input className={inputCls} value={badgeTr} onChange={(e) => setBadgeTr(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{t("products.form.badgeEn")}</label>
          <input className={inputCls} value={badgeEn} onChange={(e) => setBadgeEn(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{t("products.form.category")}</label>
          <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>{t("products.form.medal")}</label>
          <select className={inputCls} value={medal} onChange={(e) => setMedal(e.target.value)}>
            <option value="">{t("products.form.medalNone")}</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>
        </div>
      </div>
      {err && <p className="mt-3 text-[12px] text-[#a8503f]">{err}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="border border-line px-5 py-2.5 text-[12px] font-medium text-ink-soft hover:text-ink">
          {t("cancel")}
        </button>
        <button type="button" onClick={save} disabled={busy} className="bg-olive px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-cream hover:bg-olive-deep disabled:opacity-60">
          {busy ? t("saving") : t("products.addCta")}
        </button>
      </div>
    </AdminModal>
  );
}

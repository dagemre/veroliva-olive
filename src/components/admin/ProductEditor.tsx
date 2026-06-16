"use client";

// Tam ürün editörü: canlı ürün detay sayfasındaki TÜM metin/yapısal alanlar
// (Genel, İçerik, Detaylar, Besin, Görseller) + sağda birebir canlı önizleme.
// Stok ASLA doğrudan UPDATE edilmez; stock_movements eklenir (trigger günceller).

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AdminModal from "./AdminModal";
import ProductDetailView from "@/components/product/ProductDetailView";
import DetailIcon from "@/components/product/DetailIcon";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { normalizeDetails, serializeDetails, type Product, type ProductDetails } from "@/lib/products";
import type { Json } from "@/lib/database.types";

export const ICON_KEYS = [
  "leaf", "press", "drop", "molecule", "pin", "olive", "calendar", "package",
  "salad", "breakfast", "meze", "bread", "cooking", "oven", "sauce",
  "truck", "clock", "shield", "refresh",
] as const;

const inputCls = "w-full border border-line bg-cream px-3 py-2.5 text-[13px] text-ink focus:border-gold-light focus:outline-none";
const inputCls2 = "w-full border border-line bg-cream px-3 py-2 text-[13px] text-ink focus:border-gold-light focus:outline-none";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft mb-1.5";

type TFn = (key: string) => string;

type Draft = {
  name: string; slug: string; size: string; price: string;
  category: string; medal: "" | "gold" | "silver"; is_active: boolean; stock: string;
  badge_tr: string; badge_en: string; description_tr: string; description_en: string;
  details: ProductDetails;
};

type TabKey = "general" | "content" | "details" | "nutrition" | "images" | "preview";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><label className={labelCls}>{label}</label>{children}</div>);
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (<Field label={label}><input className={inputCls} type={type} value={value} onChange={(e) => onChange(e.target.value)} /></Field>);
}

function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (<Field label={label}><textarea className={`${inputCls} min-h-24`} value={value} onChange={(e) => onChange(e.target.value)} /></Field>);
}

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment text-olive"><DetailIcon name={value} size={17} /></span>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
    </span>
  );
}

export default function ProductEditor({
  productId, userId, onClose, onSaved,
}: {
  productId: string; userId: string; onClose: () => void; onSaved: () => void;
}) {
  const t0 = useTranslations("admin");
  const t = t0 as unknown as TFn;
  const [tab, setTab] = useState<TabKey>("general");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [initialStock, setInitialStock] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, badge_tr, badge_en, size, price, medal, category, description_tr, description_en, details, is_active, stock_quantity")
        .eq("id", productId)
        .single();
      if (!data) return;
      const d = data as Record<string, unknown>;
      setInitialStock(Number(d.stock_quantity) || 0);
      setDraft({
        name: String(d.name ?? ""), slug: String(d.slug ?? ""), size: String(d.size ?? ""),
        price: String(d.price ?? ""), category: String(d.category ?? ""),
        medal: (d.medal === "gold" || d.medal === "silver" ? d.medal : "") as Draft["medal"],
        is_active: Boolean(d.is_active ?? true), stock: String(d.stock_quantity ?? 0),
        badge_tr: String(d.badge_tr ?? ""), badge_en: String(d.badge_en ?? ""),
        description_tr: String(d.description_tr ?? ""), description_en: String(d.description_en ?? ""),
        details: normalizeDetails(d.details),
      });
    })();
  }, [productId]);

  function patch(p: Partial<Draft>) { setDraft((cur) => (cur ? { ...cur, ...p } : cur)); }
  function patchDetails(p: Partial<ProductDetails>) { setDraft((cur) => (cur ? { ...cur, details: { ...cur.details, ...p } } : cur)); }

  const previewProduct: Product | null = draft && {
    id: productId, slug: draft.slug, name: draft.name,
    badge: { tr: draft.badge_tr, en: draft.badge_en }, size: draft.size,
    price: Number(draft.price) || 0, medal: draft.medal || undefined,
    description: { tr: draft.description_tr, en: draft.description_en }, details: draft.details,
  };

  async function save() {
    if (!draft) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true); setErr(null);
    const { error: upErr } = await supabase.from("products").update({
      name: draft.name, slug: draft.slug, size: draft.size, price: Number(draft.price),
      category: draft.category || null, medal: draft.medal || null, is_active: draft.is_active,
      badge_tr: draft.badge_tr, badge_en: draft.badge_en,
      description_tr: draft.description_tr, description_en: draft.description_en,
      details: serializeDetails(draft.details) as Json,
    }).eq("id", productId);
    if (upErr) { setErr(upErr.message); setBusy(false); return; }
    const newStock = parseInt(draft.stock, 10);
    const delta = (Number.isNaN(newStock) ? initialStock : newStock) - initialStock;
    if (delta !== 0) {
      const { error: mvErr } = await supabase.from("stock_movements").insert({
        product_id: productId, change: delta, reason: "adjustment", created_by: userId, note: "Admin editör düzeltmesi",
      });
      if (mvErr) { setErr(mvErr.message); setBusy(false); return; }
    }
    setBusy(false); onSaved();
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: "general", label: t("products.editor.tabGeneral") },
    { key: "content", label: t("products.editor.tabContent") },
    { key: "details", label: t("products.editor.tabDetails") },
    { key: "nutrition", label: t("products.editor.tabNutrition") },
    { key: "images", label: t("products.editor.tabImages") },
    { key: "preview", label: t("products.editor.tabPreview") },
  ];

  return (
    <AdminModal title={draft ? draft.name : t("loading")} onClose={onClose} size="wide">
      {!draft ? (
        <p className="py-10 text-center text-[13px] text-ink-soft">{t("loading")}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          {/* Sol: form */}
          <div>
            <div className="mb-4 flex flex-wrap gap-1.5 border-b border-line pb-3">
              {TABS.map((x) => (
                <button key={x.key} type="button" onClick={() => setTab(x.key)}
                  className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${tab === x.key ? "bg-olive text-cream" : "text-ink-soft hover:text-ink"}`}>
                  {x.label}
                </button>
              ))}
            </div>

            {tab === "general" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><TextField label={t("products.form.name")} value={draft.name} onChange={(v) => patch({ name: v })} /></div>
                <TextField label={t("products.form.slug")} value={draft.slug} onChange={(v) => patch({ slug: v })} />
                <TextField label={t("products.form.size")} value={draft.size} onChange={(v) => patch({ size: v })} />
                <TextField label={`${t("products.col.price")} (TL)`} value={draft.price} onChange={(v) => patch({ price: v })} type="number" />
                <TextField label={t("products.col.stock")} value={draft.stock} onChange={(v) => patch({ stock: v })} type="number" />
                <TextField label={t("products.form.category")} value={draft.category} onChange={(v) => patch({ category: v })} />
                <Field label={t("products.form.medal")}>
                  <select className={inputCls} value={draft.medal} onChange={(e) => patch({ medal: e.target.value as Draft["medal"] })}>
                    <option value="">{t("products.form.medalNone")}</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                  </select>
                </Field>
                <Field label={t("products.col.status")}>
                  <button type="button" onClick={() => patch({ is_active: !draft.is_active })}
                    className={`border px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] ${draft.is_active ? "border-[#9bb38a] bg-[#eaf0e2] text-[#3f6230]" : "border-line bg-parchment/60 text-ink-soft"}`}>
                    {draft.is_active ? t("products.active") : t("products.passive")}
                  </button>
                </Field>
                <p className="col-span-2 text-[11px] text-ink-soft">{t("products.form.stockNote")}</p>
              </div>
            )}

            {tab === "content" && (
              <div className="grid gap-4">
                <TextField label={t("products.form.badgeTr")} value={draft.badge_tr} onChange={(v) => patch({ badge_tr: v })} />
                <TextField label={t("products.form.badgeEn")} value={draft.badge_en} onChange={(v) => patch({ badge_en: v })} />
                <AreaField label={t("products.editor.descTr")} value={draft.description_tr} onChange={(v) => patch({ description_tr: v })} />
                <AreaField label={t("products.editor.descEn")} value={draft.description_en} onChange={(v) => patch({ description_en: v })} />
              </div>
            )}

            {tab === "details" && <DetailsTab draft={draft} patchDetails={patchDetails} t={t} />}
            {tab === "nutrition" && <NutritionTab draft={draft} patchDetails={patchDetails} t={t} />}
            {tab === "images" && <ImagesTab draft={draft} patchDetails={patchDetails} t={t} />}
            {tab === "preview" && <p className="text-[12px] text-ink-soft lg:hidden">{t("products.editor.previewHint")}</p>}

            {err && <p className="mt-3 text-[12px] text-[#a8503f]">{err}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="border border-line px-5 py-2.5 text-[12px] font-medium text-ink-soft hover:text-ink">{t("cancel")}</button>
              <button type="button" onClick={save} disabled={busy} className="bg-olive px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-cream hover:bg-olive-deep disabled:opacity-60">{busy ? t("saving") : t("save")}</button>
            </div>
          </div>

          {/* Sağ: canlı önizleme */}
          <div className="hidden max-h-[78vh] overflow-y-auto border border-line bg-cream lg:block">
            {previewProduct && <div className="origin-top scale-[0.92]"><ProductDetailView product={previewProduct} preview /></div>}
          </div>
        </div>
      )}
    </AdminModal>
  );
}

function RowShell({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative border border-line bg-cream-light p-3 pr-9">
      {children}
      <button type="button" onClick={onRemove} aria-label="Sil" className="absolute right-2 top-2 text-ink-soft hover:text-[#a8503f]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-1 flex items-center gap-2 border border-dashed border-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft hover:border-gold-light hover:text-ink">
      <span aria-hidden="true">+</span>{label}
    </button>
  );
}

function DetailsTab({ draft, patchDetails, t }: { draft: Draft; patchDetails: (p: Partial<ProductDetails>) => void; t: TFn }) {
  const d = draft.details;
  return (
    <div className="space-y-6">
      {/* Highlights */}
      <section>
        <h3 className={labelCls}>{t("products.editor.highlights")}</h3>
        <div className="space-y-2">
          {d.highlights.map((h, i) => (
            <RowShell key={i} onRemove={() => patchDetails({ highlights: d.highlights.filter((_, j) => j !== i) })}>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><IconSelect value={h.icon} onChange={(v) => patchDetails({ highlights: d.highlights.map((x, j) => j === i ? { ...x, icon: v } : x) })} /></div>
                <input className={inputCls2} placeholder={t("products.editor.titleTr")} value={h.title.tr} onChange={(e) => patchDetails({ highlights: d.highlights.map((x, j) => j === i ? { ...x, title: { ...x.title, tr: e.target.value } } : x) })} />
                <input className={inputCls2} placeholder={t("products.editor.titleEn")} value={h.title.en} onChange={(e) => patchDetails({ highlights: d.highlights.map((x, j) => j === i ? { ...x, title: { ...x.title, en: e.target.value } } : x) })} />
                <input className={inputCls2} placeholder={t("products.editor.subTr")} value={h.sub.tr} onChange={(e) => patchDetails({ highlights: d.highlights.map((x, j) => j === i ? { ...x, sub: { ...x.sub, tr: e.target.value } } : x) })} />
                <input className={inputCls2} placeholder={t("products.editor.subEn")} value={h.sub.en} onChange={(e) => patchDetails({ highlights: d.highlights.map((x, j) => j === i ? { ...x, sub: { ...x.sub, en: e.target.value } } : x) })} />
              </div>
            </RowShell>
          ))}
        </div>
        <AddButton label={t("products.editor.addRow")} onClick={() => patchDetails({ highlights: [...d.highlights, { icon: "olive", title: { tr: "", en: "" }, sub: { tr: "", en: "" } }] })} />
      </section>

      {/* About specs */}
      <section>
        <h3 className={labelCls}>{t("products.editor.aboutSpecs")}</h3>
        <div className="space-y-2">
          {d.aboutSpecs.map((s, i) => (
            <RowShell key={i} onRemove={() => patchDetails({ aboutSpecs: d.aboutSpecs.filter((_, j) => j !== i) })}>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><IconSelect value={s.icon} onChange={(v) => patchDetails({ aboutSpecs: d.aboutSpecs.map((x, j) => j === i ? { ...x, icon: v } : x) })} /></div>
                <input className={inputCls2} placeholder={t("products.editor.labelTr")} value={s.label.tr} onChange={(e) => patchDetails({ aboutSpecs: d.aboutSpecs.map((x, j) => j === i ? { ...x, label: { ...x.label, tr: e.target.value } } : x) })} />
                <input className={inputCls2} placeholder={t("products.editor.labelEn")} value={s.label.en} onChange={(e) => patchDetails({ aboutSpecs: d.aboutSpecs.map((x, j) => j === i ? { ...x, label: { ...x.label, en: e.target.value } } : x) })} />
                <input className={inputCls2} placeholder={t("products.editor.valueTr")} value={s.value.tr} onChange={(e) => patchDetails({ aboutSpecs: d.aboutSpecs.map((x, j) => j === i ? { ...x, value: { ...x.value, tr: e.target.value } } : x) })} />
                <input className={inputCls2} placeholder={t("products.editor.valueEn")} value={s.value.en} onChange={(e) => patchDetails({ aboutSpecs: d.aboutSpecs.map((x, j) => j === i ? { ...x, value: { ...x.value, en: e.target.value } } : x) })} />
              </div>
            </RowShell>
          ))}
        </div>
        <AddButton label={t("products.editor.addRow")} onClick={() => patchDetails({ aboutSpecs: [...d.aboutSpecs, { icon: "olive", label: { tr: "", en: "" }, value: { tr: "", en: "" } }] })} />
      </section>

      {/* Taste */}
      <section>
        <h3 className={labelCls}>{t("products.editor.taste")}</h3>
        <div className="space-y-3">
          {(["fruity", "bitter", "pungent"] as const).map((k) => (
            <label key={k} className="flex items-center gap-3 text-[12px] text-ink">
              <span className="w-20 shrink-0">{t(`products.editor.${k}`)}</span>
              <input type="range" min={0} max={5} step={1} value={d.taste[k]} onChange={(e) => patchDetails({ taste: { ...d.taste, [k]: Number(e.target.value) } })} className="flex-1" />
              <span className="w-6 text-right text-ink-soft">{d.taste[k]}</span>
            </label>
          ))}
          <input className={inputCls2} placeholder={t("products.editor.notesTr")} value={d.taste.notes.tr} onChange={(e) => patchDetails({ taste: { ...d.taste, notes: { ...d.taste.notes, tr: e.target.value } } })} />
          <input className={inputCls2} placeholder={t("products.editor.notesEn")} value={d.taste.notes.en} onChange={(e) => patchDetails({ taste: { ...d.taste, notes: { ...d.taste.notes, en: e.target.value } } })} />
        </div>
      </section>

      {/* Usage */}
      <section>
        <h3 className={labelCls}>{t("products.editor.usage")}</h3>
        <div className="space-y-2">
          <input className={inputCls2} placeholder={t("products.editor.usageTextTr")} value={d.usage.text.tr} onChange={(e) => patchDetails({ usage: { ...d.usage, text: { ...d.usage.text, tr: e.target.value } } })} />
          <input className={inputCls2} placeholder={t("products.editor.usageTextEn")} value={d.usage.text.en} onChange={(e) => patchDetails({ usage: { ...d.usage, text: { ...d.usage.text, en: e.target.value } } })} />
          {d.usage.items.map((u, i) => (
            <RowShell key={i} onRemove={() => patchDetails({ usage: { ...d.usage, items: d.usage.items.filter((_, j) => j !== i) } })}>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><IconSelect value={u.icon} onChange={(v) => patchDetails({ usage: { ...d.usage, items: d.usage.items.map((x, j) => j === i ? { ...x, icon: v } : x) } })} /></div>
                <input className={inputCls2} placeholder={t("products.editor.labelTr")} value={u.label.tr} onChange={(e) => patchDetails({ usage: { ...d.usage, items: d.usage.items.map((x, j) => j === i ? { ...x, label: { ...x.label, tr: e.target.value } } : x) } })} />
                <input className={inputCls2} placeholder={t("products.editor.labelEn")} value={u.label.en} onChange={(e) => patchDetails({ usage: { ...d.usage, items: d.usage.items.map((x, j) => j === i ? { ...x, label: { ...x.label, en: e.target.value } } : x) } })} />
              </div>
            </RowShell>
          ))}
        </div>
        <AddButton label={t("products.editor.addRow")} onClick={() => patchDetails({ usage: { ...d.usage, items: [...d.usage.items, { icon: "salad", label: { tr: "", en: "" } }] } })} />
      </section>
    </div>
  );
}

function NutritionTab({ draft, patchDetails, t }: { draft: Draft; patchDetails: (p: Partial<ProductDetails>) => void; t: TFn }) {
  const n = draft.details.nutrition;
  return (
    <div className="space-y-3">
      <h3 className={labelCls}>{t("products.editor.nutrition")}</h3>
      {n.rows.map((r, i) => (
        <RowShell key={i} onRemove={() => patchDetails({ nutrition: { ...n, rows: n.rows.filter((_, j) => j !== i) } })}>
          <div className="grid grid-cols-3 gap-2">
            <input className={inputCls2} placeholder={t("products.editor.labelTr")} value={r.label.tr} onChange={(e) => patchDetails({ nutrition: { ...n, rows: n.rows.map((x, j) => j === i ? { ...x, label: { ...x.label, tr: e.target.value } } : x) } })} />
            <input className={inputCls2} placeholder={t("products.editor.labelEn")} value={r.label.en} onChange={(e) => patchDetails({ nutrition: { ...n, rows: n.rows.map((x, j) => j === i ? { ...x, label: { ...x.label, en: e.target.value } } : x) } })} />
            <input className={inputCls2} placeholder={t("products.editor.value")} value={r.value} onChange={(e) => patchDetails({ nutrition: { ...n, rows: n.rows.map((x, j) => j === i ? { ...x, value: e.target.value } : x) } })} />
          </div>
        </RowShell>
      ))}
      <AddButton label={t("products.editor.addRow")} onClick={() => patchDetails({ nutrition: { ...n, rows: [...n.rows, { label: { tr: "", en: "" }, value: "" }] } })} />
      <input className={inputCls2} placeholder={t("products.editor.footnoteTr")} value={n.footnote.tr} onChange={(e) => patchDetails({ nutrition: { ...n, footnote: { ...n.footnote, tr: e.target.value } } })} />
      <input className={inputCls2} placeholder={t("products.editor.footnoteEn")} value={n.footnote.en} onChange={(e) => patchDetails({ nutrition: { ...n, footnote: { ...n.footnote, en: e.target.value } } })} />
    </div>
  );
}

function ImagesTab({ draft, patchDetails, t }: { draft: Draft; patchDetails: (p: Partial<ProductDetails>) => void; t: TFn }) {
  const g = draft.details.gallery;
  return (
    <div className="space-y-3">
      <h3 className={labelCls}>{t("products.editor.gallery")}</h3>
      <p className="text-[11px] text-ink-soft">{t("products.editor.galleryNote")}</p>
      {g.map((src, i) => (
        <RowShell key={i} onRemove={() => patchDetails({ gallery: g.filter((_, j) => j !== i) })}>
          <input className={inputCls2} placeholder="/images/galeri/ornek.webp" value={src} onChange={(e) => patchDetails({ gallery: g.map((x, j) => j === i ? e.target.value : x) })} />
        </RowShell>
      ))}
      <AddButton label={t("products.editor.addRow")} onClick={() => patchDetails({ gallery: [...g, ""] })} />
    </div>
  );
}

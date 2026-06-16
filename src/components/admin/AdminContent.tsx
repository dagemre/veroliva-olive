"use client";

// İçerik Yönetimi: ürün detay sayfası içeriklerini düzenler.
// products.description_tr/en + products.details (jsonb, snake_case _tr/_en).
// Storefront tarafı normalizeDetails() ile okur; burada AYNI snake_case
// şekilde yazıyoruz ki round-trip bozulmasın. Boş bırakılan bölümlerde
// storefront DEFAULT_DETAILS'e düşer.

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Json } from "@/lib/database.types";

type ProductOpt = { id: string; name: string; slug: string };

type Highlight = { icon: string; title_tr: string; title_en: string; sub_tr: string; sub_en: string };
type Spec = { icon: string; label_tr: string; label_en: string; value_tr: string; value_en: string };
type UsageItem = { icon: string; label_tr: string; label_en: string };
type NutRow = { label_tr: string; label_en: string; value: string };

type Details = {
  gallery: string[];
  highlights: Highlight[];
  about_specs: Spec[];
  taste: { fruity: number; bitter: number; pungent: number; notes_tr: string; notes_en: string };
  usage: { text_tr: string; text_en: string; items: UsageItem[] };
  nutrition: { rows: NutRow[]; footnote_tr: string; footnote_en: string };
};

const ICON_KEYS = "leaf, press, drop, molecule, pin, olive, calendar, package, salad, breakfast, meze, bread, cooking, oven, sauce, truck, clock, shield, refresh";

const inputCls = "w-full border border-line bg-cream px-3 py-2 text-[13px] text-ink focus:border-gold-light focus:outline-none";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft mb-1.5";

/* eslint-disable @typescript-eslint/no-explicit-any */
function asStr(v: any): string {
  return typeof v === "string" ? v : "";
}
function asNum(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(5, Math.max(0, Math.round(n))) : 0;
}
function coerce(raw: any): Details {
  const d = raw && typeof raw === "object" ? raw : {};
  return {
    gallery: Array.isArray(d.gallery) ? d.gallery.filter((x: any) => typeof x === "string") : [],
    highlights: Array.isArray(d.highlights)
      ? d.highlights.map((h: any) => ({ icon: asStr(h?.icon), title_tr: asStr(h?.title_tr), title_en: asStr(h?.title_en), sub_tr: asStr(h?.sub_tr), sub_en: asStr(h?.sub_en) }))
      : [],
    about_specs: Array.isArray(d.about_specs)
      ? d.about_specs.map((s: any) => ({ icon: asStr(s?.icon), label_tr: asStr(s?.label_tr), label_en: asStr(s?.label_en), value_tr: asStr(s?.value_tr), value_en: asStr(s?.value_en) }))
      : [],
    taste: {
      fruity: asNum(d?.taste?.fruity), bitter: asNum(d?.taste?.bitter), pungent: asNum(d?.taste?.pungent),
      notes_tr: asStr(d?.taste?.notes_tr), notes_en: asStr(d?.taste?.notes_en),
    },
    usage: {
      text_tr: asStr(d?.usage?.text_tr), text_en: asStr(d?.usage?.text_en),
      items: Array.isArray(d?.usage?.items) ? d.usage.items.map((u: any) => ({ icon: asStr(u?.icon), label_tr: asStr(u?.label_tr), label_en: asStr(u?.label_en) })) : [],
    },
    nutrition: {
      rows: Array.isArray(d?.nutrition?.rows) ? d.nutrition.rows.map((r: any) => ({ label_tr: asStr(r?.label_tr), label_en: asStr(r?.label_en), value: asStr(r?.value) })) : [],
      footnote_tr: asStr(d?.nutrition?.footnote_tr), footnote_en: asStr(d?.nutrition?.footnote_en),
    },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function AdminContent() {
  const t = useTranslations("admin");
  const [products, setProducts] = useState<ProductOpt[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [descTr, setDescTr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.from("products").select("id, name, slug").order("sort_order").then(({ data }) => {
      const opts = (data as ProductOpt[]) ?? [];
      setProducts(opts);
      if (opts[0]) setSelected(opts[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setLoading(true);
    setMsg(null);
    supabase
      .from("products")
      .select("description_tr, description_en, details")
      .eq("id", selected)
      .single()
      .then(({ data }) => {
        setDescTr((data?.description_tr as string) ?? "");
        setDescEn((data?.description_en as string) ?? "");
        setDetails(coerce((data as { details?: Json })?.details));
        setLoading(false);
      });
  }, [selected]);

  async function save() {
    const supabase = getSupabaseBrowser();
    if (!supabase || !details) return;
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("products")
      .update({ description_tr: descTr, description_en: descEn, details: details as unknown as Json })
      .eq("id", selected);
    setBusy(false);
    setMsg(error ? `⚠ ${error.message}` : t("content.saved"));
  }

  function patch(p: Partial<Details>) {
    setDetails((d) => (d ? { ...d, ...p } : d));
  }

  return (
    <>
      <AdminPageHeader title={t("nav.content")} subtitle={t("content.subtitle")} showControls={false} />

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className={labelCls}>{t("content.selectProduct")}</label>
          <select className={`${inputCls} min-w-[260px]`} value={selected} onChange={(e) => setSelected(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading || !details ? (
        <p className="py-20 text-center text-sm text-ink-soft">{t("loading")}</p>
      ) : (
        <div className="space-y-6">
          {/* Açıklama */}
          <Section title={t("content.description")}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className={labelCls}>{t("content.descTr")}</label>
                <textarea className={inputCls} rows={4} value={descTr} onChange={(e) => setDescTr(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>{t("content.descEn")}</label>
                <textarea className={inputCls} rows={4} value={descEn} onChange={(e) => setDescEn(e.target.value)} />
              </div>
            </div>
          </Section>

          {/* Öne çıkanlar */}
          <Section title={t("content.highlights")} hint={`${t("content.iconHint")}: ${ICON_KEYS}`}>
            <RepeatList
              items={details.highlights}
              onChange={(highlights) => patch({ highlights })}
              empty={{ icon: "leaf", title_tr: "", title_en: "", sub_tr: "", sub_en: "" }}
              addLabel={t("content.addRow")}
              render={(it, set) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <input className={inputCls} placeholder="icon" value={it.icon} onChange={(e) => set({ ...it, icon: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.titleTr")} value={it.title_tr} onChange={(e) => set({ ...it, title_tr: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.titleEn")} value={it.title_en} onChange={(e) => set({ ...it, title_en: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.subTr")} value={it.sub_tr} onChange={(e) => set({ ...it, sub_tr: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.subEn")} value={it.sub_en} onChange={(e) => set({ ...it, sub_en: e.target.value })} />
                </div>
              )}
            />
          </Section>

          {/* Ürün hakkında özellikler */}
          <Section title={t("content.specs")} hint={`${t("content.iconHint")}: ${ICON_KEYS}`}>
            <RepeatList
              items={details.about_specs}
              onChange={(about_specs) => patch({ about_specs })}
              empty={{ icon: "olive", label_tr: "", label_en: "", value_tr: "", value_en: "" }}
              addLabel={t("content.addRow")}
              render={(it, set) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <input className={inputCls} placeholder="icon" value={it.icon} onChange={(e) => set({ ...it, icon: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.labelTr")} value={it.label_tr} onChange={(e) => set({ ...it, label_tr: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.labelEn")} value={it.label_en} onChange={(e) => set({ ...it, label_en: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.valueTr")} value={it.value_tr} onChange={(e) => set({ ...it, value_tr: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.valueEn")} value={it.value_en} onChange={(e) => set({ ...it, value_en: e.target.value })} />
                </div>
              )}
            />
          </Section>

          {/* Tat & aroma */}
          <Section title={t("content.taste")}>
            <div className="grid grid-cols-3 gap-3">
              {(["fruity", "bitter", "pungent"] as const).map((k) => (
                <div key={k}>
                  <label className={labelCls}>{t(`content.${k}`)} (0–5)</label>
                  <input className={inputCls} type="number" min={0} max={5} value={details.taste[k]}
                    onChange={(e) => patch({ taste: { ...details.taste, [k]: asNum(e.target.value) } })} />
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <input className={inputCls} placeholder={t("content.notesTr")} value={details.taste.notes_tr} onChange={(e) => patch({ taste: { ...details.taste, notes_tr: e.target.value } })} />
              <input className={inputCls} placeholder={t("content.notesEn")} value={details.taste.notes_en} onChange={(e) => patch({ taste: { ...details.taste, notes_en: e.target.value } })} />
            </div>
          </Section>

          {/* İdeal kullanım */}
          <Section title={t("content.usage")} hint={`${t("content.iconHint")}: ${ICON_KEYS}`}>
            <div className="mb-3 grid gap-3 lg:grid-cols-2">
              <input className={inputCls} placeholder={t("content.usageTextTr")} value={details.usage.text_tr} onChange={(e) => patch({ usage: { ...details.usage, text_tr: e.target.value } })} />
              <input className={inputCls} placeholder={t("content.usageTextEn")} value={details.usage.text_en} onChange={(e) => patch({ usage: { ...details.usage, text_en: e.target.value } })} />
            </div>
            <RepeatList
              items={details.usage.items}
              onChange={(items) => patch({ usage: { ...details.usage, items } })}
              empty={{ icon: "salad", label_tr: "", label_en: "" }}
              addLabel={t("content.addRow")}
              render={(it, set) => (
                <div className="grid grid-cols-3 gap-2">
                  <input className={inputCls} placeholder="icon" value={it.icon} onChange={(e) => set({ ...it, icon: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.labelTr")} value={it.label_tr} onChange={(e) => set({ ...it, label_tr: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.labelEn")} value={it.label_en} onChange={(e) => set({ ...it, label_en: e.target.value })} />
                </div>
              )}
            />
          </Section>

          {/* Besin değerleri */}
          <Section title={t("content.nutrition")}>
            <RepeatList
              items={details.nutrition.rows}
              onChange={(rows) => patch({ nutrition: { ...details.nutrition, rows } })}
              empty={{ label_tr: "", label_en: "", value: "" }}
              addLabel={t("content.addRow")}
              render={(it, set) => (
                <div className="grid grid-cols-3 gap-2">
                  <input className={inputCls} placeholder={t("content.labelTr")} value={it.label_tr} onChange={(e) => set({ ...it, label_tr: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.labelEn")} value={it.label_en} onChange={(e) => set({ ...it, label_en: e.target.value })} />
                  <input className={inputCls} placeholder={t("content.value")} value={it.value} onChange={(e) => set({ ...it, value: e.target.value })} />
                </div>
              )}
            />
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <input className={inputCls} placeholder={t("content.footnoteTr")} value={details.nutrition.footnote_tr} onChange={(e) => patch({ nutrition: { ...details.nutrition, footnote_tr: e.target.value } })} />
              <input className={inputCls} placeholder={t("content.footnoteEn")} value={details.nutrition.footnote_en} onChange={(e) => patch({ nutrition: { ...details.nutrition, footnote_en: e.target.value } })} />
            </div>
          </Section>

          {/* Galeri görselleri */}
          <Section title={t("content.gallery")} hint={t("content.galleryHint")}>
            <RepeatList
              items={details.gallery.map((g) => ({ path: g }))}
              onChange={(arr) => patch({ gallery: arr.map((a) => a.path) })}
              empty={{ path: "" }}
              addLabel={t("content.addImage")}
              render={(it, set) => (
                <input className={inputCls} placeholder="/images/galeri/ornek.webp" value={it.path} onChange={(e) => set({ path: e.target.value })} />
              )}
            />
          </Section>

          {/* Kaydet */}
          <div className="sticky bottom-0 flex items-center justify-end gap-4 border-t border-line bg-cream/95 py-4 backdrop-blur">
            {msg && <span className={`text-[13px] ${msg.startsWith("⚠") ? "text-[#a8503f]" : "text-[#3f6230]"}`}>{msg}</span>}
            <button type="button" onClick={save} disabled={busy} className="bg-olive px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream hover:bg-olive-deep disabled:opacity-60">
              {busy ? t("saving") : t("content.save")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-cream-light p-5">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      {hint && <p className="mt-1 text-[11px] text-ink-soft">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function RepeatList<T>({
  items,
  onChange,
  empty,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  addLabel: string;
  render: (item: T, set: (next: T) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">{render(it, (next) => onChange(items.map((x, j) => (j === i ? next : x))))}</div>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Sil"
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-line text-ink-soft hover:border-[#d7b3b3] hover:text-[#a8503f]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, structuredClone(empty)])}
        className="flex items-center gap-1.5 border border-line bg-cream px-3 py-2 text-[12px] font-medium text-olive hover:border-gold-light"
      >
        <span aria-hidden="true">+</span> {addLabel}
      </button>
    </div>
  );
}

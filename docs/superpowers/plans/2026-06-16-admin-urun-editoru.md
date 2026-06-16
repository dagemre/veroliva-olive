# Admin Tam Ürün Editörü + Canlı Önizleme — Uygulama Planı (Faz 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin → Ürünler "Düzenle" akışında, canlı ürün detay sayfasındaki tüm metin/yapısal alanların düzenlenebildiği geniş sekmeli bir editör + birebir canlı önizleme.

**Architecture:** Ürün detay gövdesi paylaşılan `ProductDetailView` client bileşenine çıkarılır; hem canlı sayfa hem admin önizleme bunu kullanır. Editör draft state tutar, her değişiklik önizlemeye yansır, kaydetme `products` UPDATE + `serializeDetails(details)` jsonb + stok için `stock_movements` insert ile yapılır. Faz 1'de yeni DB kolonu/migration yok.

**Tech Stack:** Next.js 15 (App Router), React 19, next-intl 4, Supabase (browser client), Tailwind 4.

**Doğrulama notu:** Projede birim test çatısı yok. Her görevin doğrulaması `npm run build` (tip + lint) ve gerektiğinde küçük node script'leridir. Sandbox supabase.co'ya erişemez → build/önizleme fallback veriyle çalışır (normal). Çalışma zamanı (gerçek DB) testi Emre'nin lokalinde.

---

### Task 1: `serializeDetails` — ProductDetails → jsonb (snake_case)

**Files:**
- Modify: `src/lib/products.ts` (yeni export fonksiyon, `normalizeDetails` yakınına)
- Test: `scripts/check-serialize-details.mjs` (geçici round-trip kontrolü)

- [ ] **Step 1: `serializeDetails`'i ekle**

`src/lib/products.ts` içinde `normalizeDetails` fonksiyonunun hemen altına ekle:

```ts
/** ProductDetails → Supabase jsonb (snake_case _tr/_en). normalizeDetails'in tersi. */
export function serializeDetails(d: ProductDetails): Record<string, unknown> {
  return {
    gallery: d.gallery,
    highlights: d.highlights.map((h) => ({
      icon: h.icon,
      title_tr: h.title.tr, title_en: h.title.en,
      sub_tr: h.sub.tr, sub_en: h.sub.en,
    })),
    about_specs: d.aboutSpecs.map((s) => ({
      icon: s.icon,
      label_tr: s.label.tr, label_en: s.label.en,
      value_tr: s.value.tr, value_en: s.value.en,
    })),
    taste: {
      fruity: d.taste.fruity, bitter: d.taste.bitter, pungent: d.taste.pungent,
      notes_tr: d.taste.notes.tr, notes_en: d.taste.notes.en,
    },
    usage: {
      text_tr: d.usage.text.tr, text_en: d.usage.text.en,
      items: d.usage.items.map((u) => ({ icon: u.icon, label_tr: u.label.tr, label_en: u.label.en })),
    },
    nutrition: {
      rows: d.nutrition.rows.map((r) => ({ label_tr: r.label.tr, label_en: r.label.en, value: r.value })),
      footnote_tr: d.nutrition.footnote.tr, footnote_en: d.nutrition.footnote.en,
    },
  };
}
```

- [ ] **Step 2: Round-trip doğrulama script'i yaz**

`scripts/check-serialize-details.mjs` oluştur:

```js
// normalize(serialize(normalize(x))) === normalize(x) olmalı (idempotent).
import { normalizeDetails, serializeDetails, DEFAULT_DETAILS } from "../src/lib/products.ts";

const once = normalizeDetails(serializeDetails(DEFAULT_DETAILS));
const twice = normalizeDetails(serializeDetails(once));
const a = JSON.stringify(once);
const b = JSON.stringify(twice);
if (a !== b) { console.error("ROUND-TRIP FAIL"); process.exit(1); }
if (!a.includes("Soğuk Sıkım")) { console.error("CONTENT LOST"); process.exit(1); }
console.log("round-trip OK");
```

- [ ] **Step 3: Script'i çalıştır (tsx ile)**

Run: `npx tsx scripts/check-serialize-details.mjs`
Expected: `round-trip OK`
(tsx yoksa: `npx --yes tsx@latest scripts/check-serialize-details.mjs`)

- [ ] **Step 4: Geçici script'i sil**

Run: `rm scripts/check-serialize-details.mjs && rmdir scripts 2>/dev/null || true`

- [ ] **Step 5: Commit**

```bash
git add src/lib/products.ts
git commit -m "Ürün: serializeDetails (ProductDetails → jsonb) eklendi"
```

---

### Task 2: `ProductDetailView` paylaşılan bileşenine çıkar

**Files:**
- Create: `src/components/product/ProductDetailView.tsx`
- Modify: `src/app/[locale]/urun/[slug]/page.tsx` (gövdeyi bileşene devret)

- [ ] **Step 1: `ProductDetailView.tsx` oluştur**

`page.tsx`'teki `USAGE_IMAGES`, `shortDescription`, `Breadcrumb`, `TasteBar`, `ProductDetail` parçalarını buraya taşı; `preview` prop'u ekle. Tam içerik:

```tsx
"use client";

import Image from "next/image";
import { preload } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice, formatUnitPrice, normalizeDetails, type Product, type ProductDetails } from "@/lib/products";
import ProductGallery, { type GalleryImage } from "@/components/product/ProductGallery";
import PurchasePanel from "@/components/product/PurchasePanel";
import DetailIcon from "@/components/product/DetailIcon";
import ProductCard from "@/components/product/ProductCard";
import Carousel from "@/components/home/Carousel";

const USAGE_IMAGES: Record<string, string> = {
  salad: "/icons/salatalar.webp",
  breakfast: "/icons/kahvaltilik.webp",
  meze: "/icons/soguk-mezeler.webp",
  bread: "/icons/ekmek-bandirma.webp",
};

function shortDescription(text: string | undefined): string {
  if (!text) return "";
  const sentences = text.split(/(?<=\.)\s+/);
  return sentences.slice(0, 2).join(" ");
}

function Breadcrumb({ product, preview }: { product: Product; preview: boolean }) {
  const t = useTranslations("productPage");
  return (
    <nav aria-label="breadcrumb" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
        <li><Link href="/" className="hover:text-gold transition-colors">{t("breadcrumbHome")}</Link></li>
        <li aria-hidden="true" className="select-none">›</li>
        <li><Link href="/koleksiyon" className="hover:text-gold transition-colors">{t("breadcrumbCollection")}</Link></li>
        <li aria-hidden="true" className="select-none">›</li>
        <li className="font-medium text-ink" aria-current="page">{product.name}</li>
      </ol>
    </nav>
  );
}

function TasteBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        <span className="text-xs text-ink-soft">{value}/5</span>
      </div>
      <div className="mt-1.5 flex gap-1" role="img" aria-label={`${label}: ${value}/5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 ${i < value ? "bg-olive" : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailView({
  product,
  relatedProducts = [],
  preview = false,
}: {
  product: Product;
  relatedProducts?: Product[];
  preview?: boolean;
}) {
  const t = useTranslations("productPage");
  const locale = useLocale() as "tr" | "en";
  const L = (l: { tr: string; en: string }) => l[locale];

  const details: ProductDetails = product.details ?? normalizeDetails(null);
  const description = locale === "tr" ? product.description?.tr : product.description?.en;
  const unitPrice = formatUnitPrice(product.price, product.size);

  const bottleUrl = `/images/products/${product.slug}.webp`;
  if (!preview) preload(bottleUrl, { as: "image", fetchPriority: "high" });

  const bottleAlt = locale === "tr"
    ? `${product.name} ${product.size} natürel sızma zeytinyağı şişesi`
    : `${product.name} ${product.size} Turkish extra virgin olive oil bottle`;

  const galleryImages: GalleryImage[] = [
    { src: bottleUrl, alt: bottleAlt, kind: "bottle" },
    ...details.gallery.map((src, i) => ({ src, alt: `${product.name} — ${t("galleryImage")} ${i + 2}`, kind: "photo" as const })),
  ];

  const trustItems = [
    { icon: "truck", title: t("trust.shippingTitle"), sub: t("trust.shippingSub") },
    { icon: "clock", title: t("trust.sameDayTitle"), sub: t("trust.sameDaySub") },
    { icon: "shield", title: t("trust.secureTitle"), sub: t("trust.secureSub") },
    { icon: "refresh", title: t("trust.returnTitle"), sub: t("trust.returnSub") },
  ];

  return (
    <>
      <Breadcrumb product={product} preview={preview} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <ProductGallery images={galleryImages} medal={product.medal} />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{product.badge[locale]}</span>
            <h1 className="mt-2.5 font-display text-3xl leading-snug text-ink sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-sm text-ink-soft">
              {product.size}
              <span aria-hidden="true" className="mx-2.5 text-line">|</span>
              {t("productType")}
            </p>
            <p className="mt-5 font-display text-3xl text-ink">{formatPrice(product.price)}</p>
            {unitPrice && <p className="mt-1 text-xs text-ink-soft">{unitPrice}</p>}
            {description && <p className="mt-4 text-sm leading-relaxed text-ink-soft">{shortDescription(description)}</p>}

            {details.highlights.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-y-4 border-y border-line py-4 lg:grid-cols-4">
                {details.highlights.map((h, i) => (
                  <div key={i} className={`flex items-center gap-2.5 px-1 lg:px-3 ${i > 0 ? "lg:border-l lg:border-line" : "lg:pl-0"}`}>
                    <DetailIcon name={h.icon} size={24} className="shrink-0 text-olive" />
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold leading-tight text-ink">{L(h.title)}</span>
                      <span className="block text-[11px] leading-tight text-ink-soft">{L(h.sub)}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!preview && (
              <div className="mt-6">
                <PurchasePanel product={{ id: product.id, slug: product.slug, name: product.name, size: product.size, price: product.price, badge: product.badge }} />
              </div>
            )}

            <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-line pt-5 lg:grid-cols-4">
              {trustItems.map((item) => (
                <div key={item.title} className="flex items-center gap-2.5">
                  <DetailIcon name={item.icon} size={20} className="shrink-0 text-ink-soft" />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold leading-tight text-ink">{item.title}</span>
                    <span className="block text-[10.5px] leading-tight text-ink-soft">{item.sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="border border-line bg-cream-light p-6 sm:p-7">
            <h2 className="font-display text-xl text-ink">{t("aboutTitle")}</h2>
            {description && <p className="mt-3.5 text-[13px] leading-relaxed text-ink-soft">{description}</p>}
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-5">
              {details.aboutSpecs.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment text-olive"><DetailIcon name={s.icon} size={17} /></span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold leading-tight text-ink">{L(s.label)}</span>
                    <span className="block text-[11.5px] leading-tight text-ink-soft">{L(s.value)}</span>
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="relative overflow-hidden border border-line bg-cream-light p-6 sm:p-7">
            <h2 className="font-display text-xl text-ink">{t("tasteTitle")}</h2>
            <div className="mt-5 space-y-4">
              <TasteBar label={t("fruity")} value={details.taste.fruity} />
              <TasteBar label={t("bitter")} value={details.taste.bitter} />
              <TasteBar label={t("pungent")} value={details.taste.pungent} />
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-ink-soft">{L(details.taste.notes)}</p>
            <Image src="/icons/zeytindali.svg" alt="" aria-hidden="true" width={96} height={72} className="pointer-events-none absolute -bottom-3 -right-2 h-20 w-auto opacity-50" />
          </article>

          <article className="border border-line bg-cream-light p-6 sm:p-7">
            <h2 className="font-display text-xl text-ink">{t("usageTitle")}</h2>
            <p className="mt-3.5 text-[13px] leading-relaxed text-ink-soft">{L(details.usage.text)}</p>
            {details.usage.items.every((u) => USAGE_IMAGES[u.icon]) ? (
              <div className="mt-5 grid grid-cols-2 items-end gap-x-4 gap-y-5 border-t border-line pt-5">
                {details.usage.items.map((u, i) => (
                  <figure key={i} className="flex flex-col items-center gap-1.5">
                    <Image src={USAGE_IMAGES[u.icon]} alt="" width={300} height={150} sizes="132px" className="h-auto w-[132px]" />
                    <figcaption className="text-center text-[12px] font-medium leading-tight text-ink">{L(u.label)}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 border-t border-line pt-5">
                {details.usage.items.map((u, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    {USAGE_IMAGES[u.icon] ? (
                      <Image src={USAGE_IMAGES[u.icon]} alt="" width={400} height={400} sizes="96px" className="h-auto w-full max-w-24" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-parchment text-olive"><DetailIcon name={u.icon} size={22} /></span>
                    )}
                    <span className="text-[11px] font-medium leading-tight text-ink">{L(u.label)}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <details open className="group border border-line bg-cream-light">
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 sm:px-7 [&::-webkit-details-marker]:hidden" aria-label={t("nutritionToggle")}>
            <h2 className="font-display text-xl text-ink">{t("nutritionTitle")}</h2>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-soft transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <div className="border-t border-line px-6 pb-6 pt-4 sm:px-7">
            <dl className="gap-x-12 lg:columns-3">
              {details.nutrition.rows.map((row, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4 border-b border-line/70 py-2 break-inside-avoid">
                  <dt className="text-[13px] text-ink-soft">{L(row.label)}</dt>
                  <dd className="text-[13px] font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-right text-[11px] text-ink-soft">{L(details.nutrition.footnote)}</p>
          </div>
        </details>
      </section>

      {!preview && relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">{t("relatedTitle")}</h2>
            <Link href="/koleksiyon" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft underline-offset-4 transition-colors hover:text-gold">{t("backToCollection")} →</Link>
          </div>
          <Carousel>{relatedProducts.map((p) => <ProductCard key={p.slug} product={p} />)}</Carousel>
        </section>
      )}
    </>
  );
}
```

- [ ] **Step 2: `page.tsx`'i sadeleştir**

`page.tsx`'ten taşınan parçaları sil; `ProductDetail`/`Breadcrumb`/`TasteBar`/`USAGE_IMAGES`/`shortDescription` tanımlarını kaldır. Kullanılmayan importları (`Image`, `preload`, `useTranslations`, `useLocale`, `Link`, `ProductCard`, `ProductGallery`, `PurchasePanel`, `DetailIcon`, `Carousel`, `normalizeDetails`, `formatUnitPrice`, `ProductDetails`) temizle. `ProductDetailView`'ı import et. Sayfa sonundaki render bloğunu şu hale getir:

```tsx
import ProductDetailView from "@/components/product/ProductDetailView";
```

Render:

```tsx
  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
```

`generateStaticParams`, `generateMetadata`, `revalidate`, JSON-LD üretimi ve veri çekme (`getProductBySlug`, `getProducts`) `page.tsx`'te server tarafında kalır.

- [ ] **Step 3: Build ile doğrula**

Run: `npm run build`
Expected: Derleme başarılı; ürün sayfaları üretilir (sandbox'ta fallback veriyle). Tip/lint hatası yok.

- [ ] **Step 4: Commit**

```bash
git add src/components/product/ProductDetailView.tsx "src/app/[locale]/urun/[slug]/page.tsx"
git commit -m "Ürün: detay gövdesi paylaşılan ProductDetailView bileşenine çıkarıldı (preview prop)"
```

---

### Task 3: `AdminModal`'a geniş boyut varyantı

**Files:**
- Modify: `src/components/admin/AdminModal.tsx`

- [ ] **Step 1: `size` prop'u ekle**

`AdminModal`'ı şu hale getir (geriye dönük uyumlu; varsayılan `default`):

```tsx
"use client";

import { useEffect } from "react";

export default function AdminModal({
  title,
  onClose,
  children,
  size = "default",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "default" | "wide";
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const maxW = size === "wide" ? "max-w-6xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <button type="button" aria-label="Kapat" onClick={onClose} className="fixed inset-0 bg-ink/45" />
      <div className={`relative z-10 w-full ${maxW} border border-line bg-cream-light shadow-xl`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Kapat" className="text-ink-soft hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build ile doğrula**

Run: `npm run build`
Expected: Başarılı; mevcut `AddProduct`/eski `EditProduct` (size belirtmeyenler) `default` ile aynı görünür.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminModal.tsx
git commit -m "Admin: AdminModal geniş (wide) boyut varyantı"
```

---

### Task 4: Editör form ilkelendirmeleri + ProductEditor (Genel & İçerik sekmeleri + iskelet)

**Files:**
- Create: `src/components/admin/ProductEditor.tsx`

Bu görev editörün iskeletini, ortak form bileşenlerini, draft state'i, tam veri çekimini ve canlı önizlemeyi kurar. Detaylar/Besin/Görseller sekmelerinin içeriği Task 5'te doldurulur (Task 5'e kadar o sekmeler boş kapsayıcıdır).

- [ ] **Step 1: `ProductEditor.tsx` oluştur**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AdminModal from "./AdminModal";
import ProductDetailView from "@/components/product/ProductDetailView";
import DetailIcon from "@/components/product/DetailIcon";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { normalizeDetails, serializeDetails, type Product, type ProductDetails } from "@/lib/products";

export const ICON_KEYS = [
  "leaf", "press", "drop", "molecule", "pin", "olive", "calendar", "package",
  "salad", "breakfast", "meze", "bread", "cooking", "oven", "sauce",
  "truck", "clock", "shield", "refresh",
] as const;

const inputCls = "w-full border border-line bg-cream px-3 py-2.5 text-[13px] text-ink focus:border-gold-light focus:outline-none";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft mb-1.5";

type Draft = {
  name: string; slug: string; size: string; price: string;
  category: string; medal: "" | "gold" | "silver"; is_active: boolean; stock: string;
  badge_tr: string; badge_en: string; description_tr: string; description_en: string;
  details: ProductDetails;
};

type TabKey = "general" | "content" | "details" | "nutrition" | "images" | "preview";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><label className={labelCls}>{label}</label>{children}</div>);
}

export function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (<Field label={label}><input className={inputCls} type={type} value={value} onChange={(e) => onChange(e.target.value)} /></Field>);
}

export function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (<Field label={label}><textarea className={`${inputCls} min-h-24`} value={value} onChange={(e) => onChange(e.target.value)} /></Field>);
}

export function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
  const t = useTranslations("admin");
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
        .select("id, slug, name, badge_tr, badge_en, size, price, medal, category, description_tr, description_en, details, stock_quantity")
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
      details: serializeDetails(draft.details),
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
            {previewProduct && <div className="scale-[0.92] origin-top"><ProductDetailView product={previewProduct} preview /></div>}
          </div>
        </div>
      )}
    </AdminModal>
  );
}
```

> Not: `DetailsTab`, `NutritionTab`, `ImagesTab` Task 5'te aynı dosyada tanımlanacak. Bu görevde build'in geçmesi için Task 5 koddan ÖNCE bu üç bileşenin geçici minimal stub'larını dosyanın altına ekle:

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
function DetailsTab({ t }: any) { return <p className="text-[12px] text-ink-soft">{t("soon")}</p>; }
function NutritionTab({ t }: any) { return <p className="text-[12px] text-ink-soft">{t("soon")}</p>; }
function ImagesTab({ t }: any) { return <p className="text-[12px] text-ink-soft">{t("soon")}</p>; }
/* eslint-enable @typescript-eslint/no-explicit-any */
```

- [ ] **Step 2: i18n anahtarlarının geçici varlığı**

Build'in `t(...)` çağrılarında patlamaması için Task 7'deki anahtarları şimdi ekleyebilir veya Task 7'yi bu adımdan önce uygulayabilirsin. next-intl eksik anahtarda hata fırlatmaz (anahtar adını basar), bu yüzden build kırılmaz; yine de Task 7 anahtarları nihai metinleri verir.

- [ ] **Step 3: Build ile doğrula**

Run: `npm run build`
Expected: Başarılı (stub'lar ve önizleme derlenir).

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ProductEditor.tsx
git commit -m "Admin: ProductEditor iskeleti — sekmeler, draft state, canlı önizleme (Genel/İçerik)"
```

---

### Task 5: Detaylar / Besin / Görseller sekmeleri (satır ekle-çıkar)

**Files:**
- Modify: `src/components/admin/ProductEditor.tsx` (stub'ları gerçek bileşenlerle değiştir)

- [ ] **Step 1: Ortak repeatable yardımcılarını ve üç sekmeyi yaz**

Dosyanın altındaki geçici stub bloğunu sil ve yerine ekle:

```tsx
type TFn = (key: string) => string;

function RowShell({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative border border-line bg-cream-light p-3 pr-9">
      {children}
      <button type="button" onClick={onRemove} aria-label="Sil"
        className="absolute right-2 top-2 text-ink-soft hover:text-[#a8503f]">
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

const inputCls2 = "w-full border border-line bg-cream px-3 py-2 text-[13px] text-ink focus:border-gold-light focus:outline-none";

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
              <span className="w-20 shrink-0 capitalize">{t(`products.editor.${k}`)}</span>
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
```

- [ ] **Step 2: Build ile doğrula**

Run: `npm run build`
Expected: Başarılı. Tip hataları yoksa sekmeler tamamdır.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ProductEditor.tsx
git commit -m "Admin: ProductEditor Detaylar/Besin/Görseller sekmeleri (satır ekle-çıkar)"
```

---

### Task 6: AdminProducts'ı yeni editöre bağla

**Files:**
- Modify: `src/components/admin/AdminProducts.tsx`

- [ ] **Step 1: Eski `EditProduct` yerine `ProductEditor`'ı kullan**

`AdminProducts.tsx`'te:

1. Üstte import ekle: `import ProductEditor from "./ProductEditor";`
2. `edit` state'i id tutacak şekilde sadeleştir: `const [editId, setEditId] = useState<string | null>(null);` (eski `const [edit, setEdit] = useState<Row | null>(null);` yerine).
3. Liste satırındaki düzenle butonunu güncelle: `onClick={() => setEdit(r)}` → `onClick={() => setEditId(r.id)}`.
4. Render bloğunu güncelle:

```tsx
      {editId && (
        <ProductEditor
          productId={editId}
          userId={user.id}
          onClose={() => setEditId(null)}
          onSaved={() => { setEditId(null); load(); }}
        />
      )}
```

5. Dosyanın altındaki eski `function EditProduct(...) { ... }` tanımını TAMAMEN sil (artık kullanılmıyor). `AddProduct` ve `slugify`/`inputCls`/`labelCls` aynen kalır.

- [ ] **Step 2: Build ile doğrula**

Run: `npm run build`
Expected: Başarılı; kullanılmayan `EditProduct`/import uyarısı kalmamalı (sildiğin için).

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminProducts.tsx
git commit -m "Admin: Ürünler listesi yeni ProductEditor'a bağlandı; eski dar modal kaldırıldı"
```

---

### Task 7: i18n anahtarları (TR + EN)

**Files:**
- Modify: `messages/tr.json` (`admin.products` altına `editor` nesnesi + eksik `descTr/descEn` yoksa)
- Modify: `messages/en.json` (aynı yapı)

- [ ] **Step 1: TR anahtarlarını ekle**

`messages/tr.json` → `admin` → `products` nesnesinin içine `editor` ekle:

```json
"editor": {
  "tabGeneral": "Genel",
  "tabContent": "İçerik",
  "tabDetails": "Detaylar",
  "tabNutrition": "Besin",
  "tabImages": "Görseller",
  "tabPreview": "Önizleme",
  "previewHint": "Önizleme masaüstünde sağ tarafta görünür.",
  "descTr": "Açıklama (TR)",
  "descEn": "Açıklama (EN)",
  "highlights": "Hızlı Özellikler",
  "aboutSpecs": "Ürün Hakkında Özellikleri",
  "taste": "Tat Profili",
  "usage": "İdeal Kullanım",
  "nutrition": "Besin Değerleri",
  "gallery": "Galeri Görselleri",
  "galleryNote": "Şişe görseli otomatik ilk sıradadır. Buraya ek galeri görsel yolları girin.",
  "addRow": "Satır Ekle",
  "titleTr": "Başlık (TR)", "titleEn": "Başlık (EN)",
  "subTr": "Alt metin (TR)", "subEn": "Alt metin (EN)",
  "labelTr": "Etiket (TR)", "labelEn": "Etiket (EN)",
  "valueTr": "Değer (TR)", "valueEn": "Değer (EN)",
  "value": "Değer",
  "fruity": "Meyvemsi", "bitter": "Acı", "pungent": "Yakıcı",
  "notesTr": "Notlar (TR)", "notesEn": "Notlar (EN)",
  "usageTextTr": "Kullanım metni (TR)", "usageTextEn": "Kullanım metni (EN)",
  "footnoteTr": "Dipnot (TR)", "footnoteEn": "Dipnot (EN)"
}
```

- [ ] **Step 2: EN anahtarlarını ekle**

`messages/en.json` → `admin` → `products` → `editor`:

```json
"editor": {
  "tabGeneral": "General",
  "tabContent": "Content",
  "tabDetails": "Details",
  "tabNutrition": "Nutrition",
  "tabImages": "Images",
  "tabPreview": "Preview",
  "previewHint": "The preview appears on the right on desktop.",
  "descTr": "Description (TR)",
  "descEn": "Description (EN)",
  "highlights": "Highlights",
  "aboutSpecs": "About Specs",
  "taste": "Taste Profile",
  "usage": "Ideal Usage",
  "nutrition": "Nutrition Facts",
  "gallery": "Gallery Images",
  "galleryNote": "The bottle image is shown first automatically. Add extra gallery image paths here.",
  "addRow": "Add Row",
  "titleTr": "Title (TR)", "titleEn": "Title (EN)",
  "subTr": "Subtitle (TR)", "subEn": "Subtitle (EN)",
  "labelTr": "Label (TR)", "labelEn": "Label (EN)",
  "valueTr": "Value (TR)", "valueEn": "Value (EN)",
  "value": "Value",
  "fruity": "Fruity", "bitter": "Bitter", "pungent": "Pungent",
  "notesTr": "Notes (TR)", "notesEn": "Notes (EN)",
  "usageTextTr": "Usage text (TR)", "usageTextEn": "Usage text (EN)",
  "footnoteTr": "Footnote (TR)", "footnoteEn": "Footnote (EN)"
}
```

- [ ] **Step 3: JSON geçerliliğini ve build'i doğrula**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/tr.json','utf8')); JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('json ok')"`
Expected: `json ok`
Run: `npm run build`
Expected: Başarılı.

- [ ] **Step 4: Commit**

```bash
git add messages/tr.json messages/en.json
git commit -m "i18n: admin ürün editörü anahtarları (TR + EN)"
```

---

### Task 8: Nihai doğrulama

- [ ] **Step 1: Temiz build**

Run: `npm run build`
Expected: Hatasız; tüm sayfalar üretilir.

- [ ] **Step 2: Emre lokal kontrol listesi (çalışma zamanı — gerçek DB)**

- `npm run dev` ile admin → Ürünler → bir üründe Düzenle.
- Genel/İçerik/Detaylar/Besin/Görseller sekmelerinde değişiklik yap; sağdaki önizlemenin canlı sayfayla aynı göründüğünü doğrula.
- Kaydet → ürünün canlı `/urun/[slug]` sayfasında değişikliklerin göründüğünü doğrula.
- Stok alanını değiştir → kaydet → stok hareketi (movement) eklendiğini ve `stock_quantity`'nin doğru güncellendiğini doğrula.
- Slug değiştirip kaydetmenin eski URL'i kırdığını unutma (gerekirse slug'ı değiştirme).

- [ ] **Step 3: Onay sonrası deploy**

Emre lokalde onaylayınca push/deploy (proje kuralı: önce lokal inceleme, sonra deploy).

---

## Self-Review (plan yazarı)

- **Spec coverage:** Paylaşılan önizleme (Task 2) ✓, geniş editör + sekmeler (Task 3-5) ✓, tüm alanlar — genel/içerik/highlights/about/taste/usage/nutrition/gallery (Task 4-5) ✓, serializeDetails (Task 1) ✓, stok movement korunumu (Task 4 save) ✓, getProductBySlug category — editör kendi select'inde category çekiyor, ayrıca canlı sayfada category kullanılmadığı için page select değişikliği gereksiz; spec'teki "category ekle" maddesi editör fetch'inde karşılandı ✓, i18n (Task 7) ✓. Faz 2 (görsel yükleme) kapsam dışı ✓.
- **Placeholder scan:** Stub'lar yalnızca Task 4→5 arası geçici; Task 5 onları gerçek kodla değiştiriyor. Kalıcı placeholder yok.
- **Type consistency:** `Draft`, `ProductDetails`, `patchDetails`, `IconSelect`, `RowShell`, `AddButton`, `inputCls2`, `TFn` tüm görevlerde aynı imzalarla kullanılıyor. `serializeDetails`/`normalizeDetails` tutarlı.

"use client";

// Yorumlar: ürün değerlendirmelerini moderasyon (onayla/reddet/sil).
// reviews tablosu database.types'ta yok → `any` istemci. Tablo yoksa bilgi verilir.
// NOT: Storefront tarafı yorum gönderimi/gösterimi ayrı bir iş (henüz yok).

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { formatShortDate, type Locale } from "@/lib/admin";

type Review = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  status: string;
  created_at: string;
  products: { name: string } | null;
};

const STATUSES = ["pending", "approved", "rejected"] as const;

function statusClasses(s: string): string {
  if (s === "approved") return "border-[#9bb38a] bg-[#eaf0e2] text-[#3f6230]";
  if (s === "rejected") return "border-[#d7b3b3] bg-[#f4e6e6] text-[#9a3d3d]";
  return "border-[#d8c08a] bg-[#f6eed6] text-[#9a6a22]";
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-[13px] tracking-[0.1em] text-gold" aria-label={`${n}/5`}>
      {"★".repeat(Math.max(0, Math.min(5, n)))}
      <span className="text-line">{"★".repeat(5 - Math.max(0, Math.min(5, n)))}</span>
    </span>
  );
}

export default function AdminReviews() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  async function load() {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const sb = getSupabaseBrowser() as any;
    if (!sb) return setLoading(false);
    const { data, error } = await sb
      .from("reviews")
      .select("id, product_id, author_name, rating, title, body, status, created_at, products(name)")
      .order("created_at", { ascending: false });
    if (error) setMissing(true);
    else setRows((data as Review[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(r: Review, status: string) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const sb = getSupabaseBrowser() as any;
    if (!sb) return;
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
    await sb.from("reviews").update({ status }).eq("id", r.id);
  }
  async function remove(r: Review) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const sb = getSupabaseBrowser() as any;
    if (!sb) return;
    setRows((prev) => prev.filter((x) => x.id !== r.id));
    await sb.from("reviews").delete().eq("id", r.id);
  }

  const filtered = useMemo(() => (filter === "all" ? rows : rows.filter((r) => r.status === filter)), [rows, filter]);
  const pending = useMemo(() => rows.filter((r) => r.status === "pending").length, [rows]);

  return (
    <>
      <AdminPageHeader title={t("nav.reviews")} subtitle={t("reviews.subtitle", { count: pending })} showControls={false} />

      {missing ? (
        <div className="border border-[#d8c08a] bg-[#f6eed6] p-4 text-[13px] text-[#7a5a16]">{t("reviews.missing")}</div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Chip active={filter === "all"} onClick={() => setFilter("all")} label={t("messages.filterAll")} />
            {STATUSES.map((s) => (
              <Chip key={s} active={filter === s} onClick={() => setFilter(s)} label={t(`reviews.status.${s}`)} />
            ))}
          </div>

          {loading ? (
            <p className="py-20 text-center text-sm text-ink-soft">{t("loading")}</p>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-line bg-cream-light px-6 py-20 text-center text-[13px] text-ink-soft">{t("reviews.empty")}</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div key={r.id} className="border border-line bg-cream-light p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <Stars n={r.rating} />
                        <span className="text-[13px] font-semibold text-ink">{r.author_name}</span>
                        <span className="text-[11px] text-ink-soft">{r.products?.name ?? "—"}</span>
                        <span className="text-[11px] text-ink-soft">{formatShortDate(r.created_at, locale)}</span>
                      </div>
                      {r.title && <p className="mt-2 text-[13px] font-medium text-ink">{r.title}</p>}
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{r.body}</p>
                    </div>
                    <span className={`shrink-0 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusClasses(r.status)}`}>
                      {t(`reviews.status.${r.status}`)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {r.status !== "approved" && (
                      <button type="button" onClick={() => setStatus(r, "approved")} className="border border-[#9bb38a] bg-[#eaf0e2] px-3 py-1.5 text-[11px] font-semibold text-[#3f6230] hover:opacity-80">
                        {t("reviews.approve")}
                      </button>
                    )}
                    {r.status !== "rejected" && (
                      <button type="button" onClick={() => setStatus(r, "rejected")} className="border border-line bg-cream px-3 py-1.5 text-[11px] font-medium text-ink-soft hover:text-ink">
                        {t("reviews.reject")}
                      </button>
                    )}
                    <button type="button" onClick={() => remove(r)} className="border border-[#d7b3b3] bg-[#f4e6e6] px-3 py-1.5 text-[11px] font-medium text-[#9a3d3d] hover:opacity-80">
                      {t("reviews.delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
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

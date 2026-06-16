"use client";

// Genel Bakış panosu — tasarıma birebir. Tüm veriler oturumdaki admin ile
// Supabase'den çekilir (RLS admin'e izin verir). Veri yoksa sayılar 0 görünür.

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAdmin } from "./AdminShell";
import AdminPageHeader from "./AdminPageHeader";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import {
  computeDelta,
  donutSegments,
  formatCount,
  formatShortDate,
  formatTRY,
  isRevenueStatus,
  monthBuckets,
  paymentKey,
  PAYMENT_COLORS,
  productImage,
  smoothLinePath,
  statusBadgeClasses,
  weekBuckets,
  type Delta,
  type Locale,
  type PaymentKey,
} from "@/lib/admin";

type OrderLite = {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  total: number;
  payment_method: string | null;
  user_id: string | null;
  email: string | null;
  order_items: { product_name: string; product_size: string | null; products: { slug: string } | null }[];
};

type ProductLite = {
  id: string;
  name: string;
  size: string;
  slug: string;
  stock_quantity: number;
  sort_order: number;
};

type ProfileLite = {
  id: string;
  full_name: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
};

function niceMax(v: number): number {
  if (v <= 0) return 1000;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

function kFormat(v: number): string {
  if (v >= 1000) return `${v / 1000 % 1 === 0 ? v / 1000 : (v / 1000).toFixed(0)}K`;
  return `${v}`;
}

export default function AdminOverview() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const { profile, user } = useAdmin();

  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<"monthly" | "weekly">("monthly");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const [ordersRes, productsRes, profilesRes, countRes] = await Promise.all([
        supabase
          .from("orders")
          .select(
            "id, order_number, status, created_at, total, payment_method, user_id, email, order_items(product_name, product_size, products(slug))",
          )
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("products")
          .select("id, name, size, slug, stock_quantity, sort_order")
          .order("sort_order", { ascending: true }),
        supabase
          .from("profiles")
          .select("id, full_name, first_name, last_name, email, is_admin, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", false),
      ]);
      setOrders((ordersRes.data as OrderLite[]) ?? []);
      setProducts((productsRes.data as ProductLite[]) ?? []);
      setProfiles((profilesRes.data as ProfileLite[]) ?? []);
      setCustomerCount(countRes.count ?? 0);
      setLoading(false);
    })();
  }, []);

  // ── KPI hesapları ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const now = Date.now();
    const d30 = now - 30 * 86400000;
    const d60 = now - 60 * 86400000;
    const inCur = (o: OrderLite) => new Date(o.created_at).getTime() >= d30;
    const inPrev = (o: OrderLite) => {
      const ts = new Date(o.created_at).getTime();
      return ts >= d60 && ts < d30;
    };
    const cur = orders.filter(inCur);
    const prev = orders.filter(inPrev);
    const rev = (list: OrderLite[]) =>
      list.filter((o) => isRevenueStatus(o.status)).reduce((s, o) => s + Number(o.total), 0);
    const custSet = (list: OrderLite[]) =>
      new Set(list.map((o) => o.user_id || o.email || o.id)).size;

    const ordCur = cur.length;
    const ordPrev = prev.length;
    const salesCur = rev(cur);
    const salesPrev = rev(prev);
    const avgCur = ordCur ? salesCur / ordCur : 0;
    const avgPrev = ordPrev ? salesPrev / ordPrev : 0;
    const custCur = custSet(cur);
    const custPrev = custSet(prev);

    return {
      orders: { value: ordCur, delta: computeDelta(ordCur, ordPrev) },
      sales: { value: salesCur, delta: computeDelta(salesCur, salesPrev) },
      avg: { value: avgCur, delta: computeDelta(avgCur, avgPrev) },
      customers: { value: customerCount, activeDelta: computeDelta(custCur, custPrev) },
    };
  }, [orders, customerCount]);

  // ── Satış grafiği ──────────────────────────────────────────────────────────
  const chart = useMemo(() => {
    const buckets =
      chartMode === "monthly" ? monthBuckets(7, locale) : weekBuckets(8, locale);
    const series = buckets.map((b) => {
      const sum = orders
        .filter((o) => isRevenueStatus(o.status))
        .filter((o) => {
          const ts = new Date(o.created_at).getTime();
          return ts >= b.start.getTime() && ts < b.end.getTime();
        })
        .reduce((s, o) => s + Number(o.total), 0);
      return { label: b.label, value: sum };
    });
    const max = niceMax(Math.max(...series.map((s) => s.value), 0));
    return { series, max };
  }, [orders, chartMode, locale]);

  // ── Ödeme özeti ────────────────────────────────────────────────────────────
  const payments = useMemo(() => {
    const tally: Record<PaymentKey, number> = { card: 0, bank_transfer: 0, cod: 0, other: 0 };
    let total = 0;
    for (const o of orders) {
      if (!isRevenueStatus(o.status)) continue;
      tally[paymentKey(o.payment_method)] += Number(o.total);
      total += Number(o.total);
    }
    const keys: PaymentKey[] = ["card", "bank_transfer", "cod", "other"];
    const rows = keys
      .map((k) => ({ key: k, amount: tally[k], pct: total ? Math.round((tally[k] / total) * 100) : 0 }))
      .filter((r) => r.amount > 0);
    return { rows, total };
  }, [orders]);

  const recentOrders = orders.slice(0, 4);
  const topProducts = products.slice(0, 3);

  if (loading) {
    return (
      <>
        <AdminPageHeader title={t("overview.welcome", { name: greetingName(profile, user.email) })} subtitle={t("overview.subtitle")} />
        <p className="py-24 text-center text-sm text-ink-soft">{t("loading")}</p>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={t("overview.welcome", { name: greetingName(profile, user.email) })}
        subtitle={t("overview.subtitle")}
      />

      {/* ── KPI kartları ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t("kpi.orders")}
          value={formatCount(kpis.orders.value, locale)}
          delta={kpis.orders.delta}
          t={t}
          icon="M6 7h12l-1 13H7zM9 7a3 3 0 0 1 6 0"
        />
        <KpiCard
          label={t("kpi.sales")}
          value={formatTRY(kpis.sales.value, locale)}
          delta={kpis.sales.delta}
          t={t}
          icon="M3 17l5-5 4 3 6-7M21 8h-4M21 8v4"
        />
        <KpiCard
          label={t("kpi.avg")}
          value={formatTRY(kpis.avg.value, locale)}
          delta={kpis.avg.delta}
          t={t}
          icon="M4 7h16v10H4zM4 11h16M8 15h3"
        />
        <KpiCard
          label={t("kpi.customers")}
          value={formatCount(kpis.customers.value, locale)}
          delta={kpis.customers.activeDelta}
          t={t}
          icon="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19c0-3 2.7-5 6-5s6 2 6 5M16 14c2 .3 3 2 3 4.5"
        />
      </div>

      {/* ── Grafik + Son Siparişler ── */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Satış Özeti */}
        <section className="border border-line bg-cream-light p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">{t("sales.title")}</h2>
            <select
              value={chartMode}
              onChange={(e) => setChartMode(e.target.value as "monthly" | "weekly")}
              className="border border-line bg-cream px-3 py-1.5 text-[12px] text-ink focus:outline-none"
            >
              <option value="monthly">{t("sales.monthly")}</option>
              <option value="weekly">{t("sales.weekly")}</option>
            </select>
          </div>
          <SalesChart series={chart.series} max={chart.max} />
        </section>

        {/* Son Siparişler */}
        <section className="border border-line bg-cream-light p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">{t("recentOrders.title")}</h2>
            <Link href="/admin/siparisler" className="flex items-center gap-1 text-[12px] font-medium text-olive hover:text-olive-deep">
              {t("recentOrders.all")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {recentOrders.length === 0 && <p className="py-8 text-center text-[13px] text-ink-soft">{t("empty.orders")}</p>}
            {recentOrders.map((o) => {
              const item = o.order_items[0];
              return (
                <div key={o.id} className="flex items-center gap-4 py-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-line bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={productImage(item?.products?.slug)} alt="" className="h-full w-full object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-ink">#{o.order_number}</span>
                    <span className="block truncate text-[13px] text-ink">{item?.product_name ?? "—"}</span>
                    {item?.product_size && <span className="block text-[11px] text-ink-soft">{item.product_size}</span>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusBadgeClasses(o.status)}`}>
                      {t(`status.${o.status}`)}
                    </span>
                    <span className="text-[13px] font-semibold text-ink">{formatTRY(Number(o.total), locale)}</span>
                    <span className="text-[11px] text-ink-soft">{formatShortDate(o.created_at, locale)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Ürün Yönetimi + Kullanıcılar + Ödeme Özeti ── */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Ürün Yönetimi */}
        <section className="border border-line bg-cream-light p-6">
          <CardHead title={t("productMgmt.title")} href="/admin/urunler" allLabel={t("all")} />
          <div className="mt-4 space-y-3.5">
            {topProducts.length === 0 && <p className="py-6 text-center text-[13px] text-ink-soft">{t("empty.products")}</p>}
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-line bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImage(p.slug)} alt="" className="h-full w-full object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">{p.name}</span>
                  <span className="block text-[11px] text-ink-soft">{p.size}</span>
                </div>
                <span className="flex items-center gap-1.5 text-[12px] text-ink-soft">
                  {t("productMgmt.inStock")}
                  <span className="font-semibold text-ink">{formatCount(p.stock_quantity, locale)}</span>
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/urunler"
            className="mt-5 flex w-full items-center justify-center gap-2 bg-olive px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep"
          >
            <span aria-hidden="true">+</span>
            {t("productMgmt.add")}
          </Link>
        </section>

        {/* Kullanıcılar */}
        <section className="border border-line bg-cream-light p-6">
          <CardHead title={t("usersCard.title")} href="/admin/kullanicilar" allLabel={t("all")} />
          <div className="mt-4 space-y-3.5">
            {profiles.length === 0 && <p className="py-6 text-center text-[13px] text-ink-soft">{t("empty.users")}</p>}
            {profiles.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment text-[11px] font-semibold text-ink">
                  {profileInitials(p)}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">{profileName(p)}</span>
                  <span className="block truncate text-[11px] text-ink-soft">{p.email}</span>
                </div>
                <span className="shrink-0 text-[11px] text-ink-soft">
                  {p.is_admin ? t("role") : t("usersCard.customer")}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Ödeme Özeti */}
        <section className="border border-line bg-cream-light p-6">
          <CardHead title={t("paymentSummary.title")} href="/admin/odemeler" allLabel={t("all")} />
          {payments.total === 0 ? (
            <p className="py-10 text-center text-[13px] text-ink-soft">{t("empty.payments")}</p>
          ) : (
            <div className="mt-4 flex items-center gap-5">
              <PaymentDonut rows={payments.rows} />
              <ul className="flex-1 space-y-2.5">
                {payments.rows.map((r) => (
                  <li key={r.key} className="flex items-center gap-2 text-[12px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PAYMENT_COLORS[r.key] }} />
                    <span className="flex-1 text-ink-soft">{t(`payment.${r.key}`)}</span>
                    <span className="text-ink-soft">%{r.pct}</span>
                    <span className="w-20 text-right font-medium text-ink">{formatTRY(r.amount, locale)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {payments.total > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[13px]">
              <span className="font-medium text-ink">{t("paymentSummary.total")}</span>
              <span className="font-semibold text-ink">{formatTRY(payments.total, locale)}</span>
            </div>
          )}
        </section>
      </div>

      {/* ── Hızlı İşlemler ── */}
      <section className="mt-6 border border-line bg-cream-light p-6">
        <h2 className="font-display text-xl text-ink">{t("quick.title")}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.key}
              href={a.href}
              className="flex items-center gap-3 border border-line bg-cream px-4 py-4 transition-colors hover:border-gold-light hover:bg-parchment/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-parchment text-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={a.icon} />
                </svg>
              </span>
              <span className="text-[13px] font-medium text-ink">{t(`quick.${a.key}`)}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Alt bileşenler ─────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  delta,
  icon,
  t,
}: {
  label: string;
  value: string;
  delta: Delta | null;
  icon: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="border border-line bg-cream-light p-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="block text-[12px] text-ink-soft">{label}</span>
          <span className="mt-2 block font-display text-[28px] leading-none text-ink">{value}</span>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-parchment text-ink-soft">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={icon} />
          </svg>
        </span>
      </div>
      <div className="mt-3 h-4 text-[12px]">
        {delta && (
          <span className={delta.dir === "down" ? "text-[#a8503f]" : "text-[#4a7a3a]"}>
            <span aria-hidden="true">{delta.dir === "down" ? "↓" : "↑"}</span>{" "}
            {delta.isNew ? t("kpi.new") : `%${delta.pct} ${t("kpi.vsLast")}`}
          </span>
        )}
      </div>
    </div>
  );
}

function CardHead({ title, href, allLabel }: { title: string; href: React.ComponentProps<typeof Link>["href"]; allLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-[12px] font-medium text-olive hover:text-olive-deep">
        {allLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function SalesChart({ series, max }: { series: { label: string; value: number }[]; max: number }) {
  const W = 560;
  const H = 230;
  const padL = 44;
  const padR = 12;
  const padT = 14;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = series.length;
  const points = series.map((s, i) => ({
    x: padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW),
    y: padT + innerH - (s.value / max) * innerH,
  }));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: padT + innerH - f * innerH,
    label: kFormat(Math.round(f * max)),
  }));
  const path = smoothLinePath(points);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="Satış grafiği">
      {ticks.map((tk, i) => (
        <g key={i}>
          <line x1={padL} y1={tk.y} x2={W - padR} y2={tk.y} stroke="var(--color-line)" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
          <text x={padL - 8} y={tk.y + 3} textAnchor="end" fontSize="10" fill="var(--color-ink-soft)">{tk.label}</text>
        </g>
      ))}
      {path && <path d={path} fill="none" stroke="var(--color-olive)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
      {series.map((s, i) => (
        <text key={i} x={points[i].x} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--color-ink-soft)">{s.label}</text>
      ))}
    </svg>
  );
}

function PaymentDonut({ rows }: { rows: { key: PaymentKey; amount: number }[] }) {
  const segs = donutSegments(rows.map((r) => r.amount), 100, 16);
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0" role="img" aria-label="Ödeme dağılımı">
      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-line)" strokeWidth="16" opacity="0.35" />
      {segs.map((s) => (
        <path key={s.index} d={s.d} fill="none" stroke={PAYMENT_COLORS[rows[s.index].key]} strokeWidth="16" strokeLinecap="butt" />
      ))}
    </svg>
  );
}

// ── Yardımcılar ────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { key: "addProduct", href: "/admin/urunler" as const, icon: "M12 5v14M5 12h14" },
  { key: "addCampaign", href: "/admin/kampanyalar" as const, icon: "M4 12.5 13 3h6v6l-9.5 9.5zM15.5 7.5h.01" },
  { key: "addCarrier", href: "/admin/kargo" as const, icon: "M3 7h11v8H3zM14 10h4l3 3v2h-7zM7.5 18.5a1.6 1.6 0 1 0 0-3.2M17.5 18.5a1.6 1.6 0 1 0 0-3.2" },
  { key: "publishPost", href: "/admin/icerik" as const, icon: "M4 4h11l5 5v11H4zM15 4v5h5M8 13h8M8 16h5" },
];

function greetingName(profile: { first_name?: string } | null, email: string | undefined): string {
  return profile?.first_name || email?.split("@")[0] || "Admin";
}

function profileName(p: ProfileLite): string {
  return p.full_name || `${p.first_name} ${p.last_name}`.trim() || p.email || "—";
}

function profileInitials(p: ProfileLite): string {
  return (
    profileName(p)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toLocaleUpperCase("tr-TR"))
      .join("") || "?"
  );
}

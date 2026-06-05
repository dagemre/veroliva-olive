"use client";

// Hesap özeti (dashboard) — Emre'nin tasarımına göre; "Toplam Harcama" kartı
// Emre'nin isteğiyle ÇIKARILDI → 3 kart: Toplam Sipariş, Mevcut Kupon, Favori Ürün.
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAccount } from "@/components/account/AccountShell";
import OrderRowCard from "@/components/account/OrderRowCard";
import { ORDER_SELECT, type OrderRow } from "@/lib/orders";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Tables } from "@/lib/database.types";

type AddressRow = Tables<"addresses">;

export default function Overview() {
  const t = useTranslations("accountPage.overview");
  const { user, profile } = useAccount();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [couponCount, setCouponCount] = useState(0);
  const [favoriteName, setFavoriteName] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    let cancelled = false;

    (async () => {
      const [ordersRes, couponsRes, addressesRes] = await Promise.all([
        supabase
          .from("orders")
          .select(ORDER_SELECT, { count: "exact" })
          .order("created_at", { ascending: false })
          .limit(4),
        supabase.rpc("my_coupons"),
        supabase
          .from("addresses")
          .select("*")
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(2),
      ]);
      if (cancelled) return;

      const rows = (ordersRes.data ?? []) as unknown as OrderRow[];
      setOrders(rows);
      setOrderCount(ordersRes.count ?? rows.length);
      setCouponCount(
        (couponsRes.data ?? []).filter((c) => !c.used_at).length,
      );
      setAddresses(addressesRes.data ?? []);

      // En çok sipariş edilen ürün (eldeki son siparişlerden hesap)
      const tally = new Map<string, number>();
      for (const o of rows) {
        for (const item of o.order_items) {
          tally.set(item.product_name, (tally.get(item.product_name) ?? 0) + item.quantity);
        }
      }
      const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
      setFavoriteName(top ? top[0] : null);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const firstName =
    profile?.first_name ||
    ((user.user_metadata?.first_name as string | undefined) ?? "");

  const cardCls = "flex items-start gap-4 border border-line bg-cream-light p-5";
  const iconCls =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-parchment text-ink-soft";

  return (
    <div>
      {/* Hoş geldin */}
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        {firstName ? t("welcome", { name: firstName }) : t("welcomeNoName")}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">{t("welcomeSub")}</p>

      {/* 3 istatistik kartı */}
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className={cardCls}>
          <span className={iconCls} aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
          </span>
          <span>
            <span className="block text-[12px] font-medium text-ink-soft">{t("totalOrders")}</span>
            <span className="mt-1 block font-display text-2xl text-ink">{loaded ? orderCount : "…"}</span>
            <span className="mt-0.5 block text-[11px] text-ink-soft">{t("allTime")}</span>
          </span>
        </div>

        <div className={cardCls}>
          <span className={iconCls} aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12.5 12.5 3H21v8.5L11.5 21z" />
              <circle cx="16.5" cy="7.5" r="1.3" />
            </svg>
          </span>
          <span>
            <span className="block text-[12px] font-medium text-ink-soft">{t("coupons")}</span>
            <span className="mt-1 block font-display text-2xl text-ink">{loaded ? couponCount : "…"}</span>
            <span className="mt-0.5 block text-[11px] text-ink-soft">{t("couponsSub")}</span>
          </span>
        </div>

        <div className={cardCls}>
          <span className={iconCls} aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="15" r="4.5" />
              <path d="M12 9.5C12 5.5 14.5 3 18.5 2.5c.5 3.5-1.5 6.5-5 7.5" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-medium text-ink-soft">{t("favorite")}</span>
            <span className="mt-1 block truncate font-display text-lg leading-7 text-ink">
              {loaded ? (favoriteName ?? t("favoriteNone")) : "…"}
            </span>
            <span className="mt-0.5 block text-[11px] text-ink-soft">{t("favoriteSub")}</span>
          </span>
        </div>
      </div>

      {/* Son siparişler */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">{t("recentOrders")}</h2>
          <Link
            href="/hesap/siparislerim"
            className="border border-line bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:border-gold-light"
          >
            {t("allOrders")}
          </Link>
        </div>
        <div className="mt-4 border border-line bg-cream-light">
          {!loaded ? (
            <p className="px-5 py-10 text-center text-sm text-ink-soft">…</p>
          ) : orders.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-ink-soft">{t("noOrders")}</p>
              <Link
                href="/koleksiyon"
                className="mt-4 inline-block bg-olive px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
              >
                {t("shopNow")} →
              </Link>
            </div>
          ) : (
            orders.map((o) => <OrderRowCard key={o.id} order={o} />)
          )}
        </div>
      </div>

      {/* Kişisel bilgiler + adresler */}
      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        {/* Kişisel bilgilerim */}
        <div className="border border-line bg-cream-light p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">{t("personalTitle")}</h2>
            <Link
              href="/hesap/bilgilerim"
              className="border border-line bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:border-gold-light"
            >
              {t("edit")}
            </Link>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("nameLabel")}</dt>
              <dd className="mt-1 font-medium text-ink">
                {profile?.full_name || `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || t("notSet")}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("emailLabel")}</dt>
              <dd className="mt-1 font-medium text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("phoneLabel")}</dt>
              <dd className="mt-1 font-medium text-ink">{profile?.phone || t("notSet")}</dd>
            </div>
          </dl>
          <div className="mt-6 flex items-start gap-3 border border-line bg-parchment/50 p-4">
            <svg className="mt-0.5 shrink-0 text-ink-soft" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" />
              <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
            </svg>
            <span>
              <span className="block text-[12px] font-semibold text-ink">{t("secureTitle")}</span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-soft">{t("secureText")}</span>
            </span>
          </div>
        </div>

        {/* Kayıtlı adreslerim */}
        <div className="border border-line bg-cream-light p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">{t("addressesTitle")}</h2>
            <Link
              href="/hesap/adreslerim"
              className="border border-line bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:border-gold-light"
            >
              {t("addAddress")}
            </Link>
          </div>
          {!loaded ? (
            <p className="py-8 text-center text-sm text-ink-soft">…</p>
          ) : addresses.length === 0 ? (
            <p className="mt-5 text-sm text-ink-soft">{t("noAddresses")}</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {addresses.map((a) => (
                <li key={a.id} className="border-b border-line pb-4 last:border-b-0 last:pb-0">
                  <span className="flex items-center gap-2.5">
                    <span className="text-[13px] font-semibold text-ink">{a.title}</span>
                    {a.is_default && (
                      <span className="border border-gold-light px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">
                        {t("default")}
                      </span>
                    )}
                  </span>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
                    {a.address_line}
                    <br />
                    {a.district} / {a.city}
                    <br />
                    {a.country}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 border-t border-line pt-4 text-center">
            <Link
              href="/hesap/adreslerim"
              className="text-[12px] font-semibold text-olive underline-offset-4 hover:underline"
            >
              {t("viewAllAddresses")} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

// Sipariş detayı — durum çizelgesi, ürünler, özet, kargo takip ve bilgi kartları.
import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAccount } from "@/components/account/AccountShell";
import { useCart } from "@/components/cart/CartProvider";
import PerksBand from "@/components/cart/PerksBand";
import { formatPrice } from "@/lib/products";
import {
  ORDER_SELECT,
  TIMELINE_STEPS,
  formatOrderDate,
  parseShippingAddress,
  statusAt,
  timelineIndex,
  type OrderRow,
} from "@/lib/orders";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const STEP_ICONS: Record<(typeof TIMELINE_STEPS)[number], string> = {
  received: "M4 12.5 9.5 18 20 6.5",
  preparing: "M4.5 7.5h15v12h-15zM4.5 7.5 7 4h10l2.5 3.5M9.5 11h5",
  shipped: "M1.5 6h12v11h-12zM13.5 9h4.5l3 3.5V17h-7.5M5.5 18.5h.01M17.5 18.5h.01",
  delivered: "M8.8 12l2.2 2.2 4.2-4.4M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
};

const STEP_LABEL_KEYS = {
  received: "stepReceived",
  preparing: "stepPreparing",
  shipped: "stepShipped",
  delivered: "stepDelivered",
} as const;

const STEP_STATUSES: Record<(typeof TIMELINE_STEPS)[number], string[]> = {
  received: ["pending", "paid"],
  preparing: ["preparing"],
  shipped: ["shipped"],
  delivered: ["delivered"],
};

export default function OrderDetail({ orderNumber }: { orderNumber: string }) {
  const t = useTranslations("accountPage.orderDetail");
  const tp = useTranslations("paymentMethods");
  const locale = useLocale() as "tr" | "en";
  const { user } = useAccount();
  const { add } = useCart();
  const [order, setOrder] = useState<OrderRow | null | undefined>(undefined);
  const [reordered, setReordered] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("order_number", orderNumber)
      .maybeSingle()
      .then(({ data }) => setOrder((data as unknown as OrderRow) ?? null));
  }, [orderNumber, user.id]);

  async function handleReorder() {
    if (!order) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const slugs = order.order_items
      .map((i) => i.products?.slug)
      .filter((s): s is string => Boolean(s));
    if (slugs.length === 0) return;
    const { data: products } = await supabase
      .from("products")
      .select("slug, name, badge_tr, badge_en, size, price")
      .in("slug", slugs)
      .eq("is_active", true);
    for (const item of order.order_items) {
      const p = products?.find((x) => x.slug === item.products?.slug);
      if (!p) continue;
      add(
        {
          slug: p.slug,
          name: p.name,
          size: p.size,
          price: Number(p.price),
          badge: { tr: p.badge_tr, en: p.badge_en },
        },
        item.quantity,
      );
    }
    setReordered(true);
    window.setTimeout(() => setReordered(false), 3000);
  }

  if (order === undefined) {
    return <p className="py-24 text-center text-sm text-ink-soft">…</p>;
  }
  if (order === null) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-ink-soft">{t("notFound")}</p>
        <Link
          href="/hesap/siparislerim"
          className="mt-5 inline-block border border-line bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-gold-light"
        >
          ← {t("backToOrders")}
        </Link>
      </div>
    );
  }

  const addr = parseShippingAddress(order.shipping_address);
  const activeIdx = timelineIndex(order.status);
  const isCancelled = activeIdx === -1;
  const bannerKey = `banner${order.status.charAt(0).toUpperCase()}${order.status.slice(1)}` as
    | "bannerPending"
    | "bannerPaid"
    | "bannerPreparing"
    | "bannerShipped"
    | "bannerDelivered"
    | "bannerCancelled"
    | "bannerRefunded";

  return (
    <div>
      {/* Başlık */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {t("orderNumberLabel")}{" "}
            <span className="font-semibold text-olive">#{order.order_number}</span>
          </p>
          <p className="mt-1 text-[12px] text-ink-soft">
            {t("placedAt", { date: formatOrderDate(locale, order.created_at, true) })}
          </p>
        </div>
        <Link
          href="/hesap/siparislerim"
          className="border border-line bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:border-gold-light"
        >
          ← {t("backToOrders")}
        </Link>
      </div>

      {/* Sipariş durumu */}
      <div className="mt-6 border border-line bg-cream-light p-5 sm:p-7">
        <h2 className="font-display text-lg text-ink">{t("statusTitle")}</h2>

        {!isCancelled && (
          <ol className="mt-6 flex items-start">
            {TIMELINE_STEPS.map((step, i) => {
              const done = i < activeIdx;
              const active = i === activeIdx;
              const date = statusAt(order.status_history, STEP_STATUSES[step]);
              return (
                <li key={step} className={`flex items-start ${i > 0 ? "flex-1" : ""}`}>
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className={`mx-2 mt-5 h-px flex-1 sm:mx-3 ${i <= activeIdx ? "bg-olive/60" : "bg-line"}`}
                    />
                  )}
                  <span className="flex w-16 flex-col items-center text-center sm:w-24">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                        active
                          ? "border-olive bg-olive text-cream"
                          : done
                            ? "border-[#4a7a3a] text-[#4a7a3a]"
                            : "border-line text-ink-soft/60"
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={done ? "M4 12.5 9.5 18 20 6.5" : STEP_ICONS[step]} />
                        {!done && step === "shipped" && (
                          <>
                            <circle cx="5.5" cy="18.5" r="0.4" />
                            <circle cx="17.5" cy="18.5" r="0.4" />
                          </>
                        )}
                      </svg>
                    </span>
                    <span className={`mt-2.5 text-[11px] font-semibold leading-tight sm:text-[12px] ${active || done ? "text-ink" : "text-ink-soft/70"}`}>
                      {t(STEP_LABEL_KEYS[step])}
                    </span>
                    <span className="mt-1 text-[10px] text-ink-soft sm:text-[11px]">
                      {date ? formatOrderDate(locale, date) : "–"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {/* Bilgi bandı */}
        <div className="mt-6 flex items-start gap-3.5 border border-line bg-parchment/50 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive text-cream" aria-hidden="true">
            <Image src="/icons/zeytindali.svg" alt="" width={20} height={20} className="h-5 w-auto brightness-0 invert" />
          </span>
          <p className="text-[13px] leading-relaxed text-ink">{t(bannerKey)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_330px]">
        {/* Sipariş ürünleri */}
        <div className="border border-line bg-cream-light p-5 sm:p-7">
          <h2 className="font-display text-lg text-ink">{t("itemsTitle")}</h2>
          <ul className="mt-4 divide-y divide-line">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-4 py-4">
                <span
                  className="relative block h-18 w-16 shrink-0 bg-parchment bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/urun-fon.webp')" }}
                >
                  {item.products?.slug && (
                    <Image
                      src={`/images/products/${item.products.slug}.webp`}
                      alt={item.product_name}
                      width={877}
                      height={900}
                      sizes="64px"
                      className="h-full w-full object-contain p-1.5"
                    />
                  )}
                </span>
                <span className="min-w-36 flex-1">
                  <span className="block text-[14px] font-semibold text-ink">{item.product_name}</span>
                  {item.product_size && (
                    <span className="mt-0.5 block text-[12px] text-ink-soft">{item.product_size}</span>
                  )}
                </span>
                <span className="min-w-20 text-[13px]">
                  <span className="block text-[11px] text-ink-soft">{t("unitPrice")}</span>
                  <span className="mt-0.5 block font-medium text-ink">{formatPrice(Number(item.unit_price))}</span>
                </span>
                <span className="min-w-10 text-[13px]">
                  <span className="block text-[11px] text-ink-soft">{t("quantity")}</span>
                  <span className="mt-0.5 block font-medium text-ink">{item.quantity}</span>
                </span>
                <span className="min-w-20 text-right text-[13px]">
                  <span className="block text-[11px] text-ink-soft">{t("lineTotal")}</span>
                  <span className="mt-0.5 block font-semibold text-ink">{formatPrice(Number(item.total))}</span>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleReorder}
            className="mt-4 flex items-center gap-2.5 border border-line bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-gold-light"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7M3 4.5V9h4.5" />
            </svg>
            {reordered ? "✓" : t("reorder")}
          </button>
        </div>

        {/* Sağ: özet + kargo takip */}
        <aside className="space-y-5 self-start">
          <div className="border border-line bg-cream-light p-6">
            <h2 className="font-display text-lg text-ink">{t("summaryTitle")}</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{locale === "tr" ? "Ara Toplam" : "Subtotal"}</dt>
                <dd className="font-medium text-ink">{formatPrice(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{locale === "tr" ? "Kargo" : "Shipping"}</dt>
                <dd className={Number(order.shipping_cost) === 0 ? "font-medium text-[#4a7a3a]" : "font-medium text-ink"}>
                  {Number(order.shipping_cost) === 0
                    ? locale === "tr" ? "Ücretsiz" : "Free"
                    : formatPrice(Number(order.shipping_cost))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{locale === "tr" ? "İndirim" : "Discount"}</dt>
                <dd className="font-medium text-ink">
                  {Number(order.discount) > 0 ? `− ${formatPrice(Number(order.discount))}` : "-"}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink">
                {locale === "tr" ? "Toplam" : "Total"}
              </span>
              <span className="font-display text-2xl text-olive">{formatPrice(Number(order.total))}</span>
            </div>
            <p className="mt-1 text-[11px] text-ink-soft">{locale === "tr" ? "KDV dahildir." : "VAT included."}</p>
          </div>

          {(order.tracking_carrier || order.tracking_number) && (
            <div className="border border-line bg-cream-light p-6">
              <h2 className="font-display text-lg text-ink">{t("trackingTitle")}</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                {order.tracking_carrier && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">{t("carrier")}</dt>
                    <dd className="font-semibold text-ink">{order.tracking_carrier}</dd>
                  </div>
                )}
                {order.tracking_number && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">{t("trackingNo")}</dt>
                    <dd className="font-semibold text-ink">{order.tracking_number}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </aside>
      </div>

      {/* Alt bilgi kartları */}
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div className="border border-line bg-cream-light p-6">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-soft">
              <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {t("deliveryTitle")}
          </h2>
          <div className="mt-4 text-[13px] leading-relaxed">
            <p className="font-semibold text-ink">{addr.full_name}</p>
            {addr.phone && <p className="mt-0.5 text-ink-soft">{addr.phone}</p>}
            <p className="mt-2 text-ink-soft">
              {addr.address_line}
              <br />
              {addr.district} / {addr.city}
              <br />
              {addr.country ?? "Türkiye"}
            </p>
          </div>
        </div>

        <div className="border border-line bg-cream-light p-6">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" className="text-ink-soft">
              <rect x="2.5" y="6" width="19" height="13" />
              <path d="M2.5 10h19" />
            </svg>
            {t("paymentTitle")}
          </h2>
          <dl className="mt-4 space-y-2.5 text-[13px]">
            <div className="flex justify-between gap-2">
              <dt className="text-ink-soft">{locale === "tr" ? "Ödeme Yöntemi" : "Payment Method"}</dt>
              <dd className="text-right font-semibold text-ink">{tp(order.payment_method as "card")}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-soft">{locale === "tr" ? "Ödeme Tutarı" : "Amount"}</dt>
              <dd className="font-semibold text-ink">{formatPrice(Number(order.total))}</dd>
            </div>
          </dl>
        </div>

        <div className="border border-line bg-cream-light p-6">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-soft">
              <path d="M4.5 7.5h15v12h-15zM4.5 7.5 7 4h10l2.5 3.5" />
            </svg>
            {t("orderInfoTitle")}
          </h2>
          <dl className="mt-4 space-y-2.5 text-[13px]">
            <div className="flex justify-between gap-2">
              <dt className="text-ink-soft">{locale === "tr" ? "Sipariş Numarası" : "Order Number"}</dt>
              <dd className="font-semibold text-ink">#{order.order_number}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-soft">{locale === "tr" ? "Sipariş Tarihi" : "Order Date"}</dt>
              <dd className="text-right font-semibold text-ink">{formatOrderDate(locale, order.created_at)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-soft">{locale === "tr" ? "Kargo Yöntemi" : "Shipping"}</dt>
              <dd className="font-semibold text-ink">
                {Number(order.shipping_cost) === 0
                  ? locale === "tr" ? "Ücretsiz Kargo" : "Free Shipping"
                  : locale === "tr" ? "Standart Kargo" : "Standard Shipping"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <PerksBand />
      </div>
    </div>
  );
}

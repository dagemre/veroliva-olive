"use client";

// Kargo Takibi — panoda kargoda/hazırlanan siparişler, takip no + kargom nerede.
// Kargo firmasının takip sayfasına derin link verir (carrierTrackingUrl).
import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAccount } from "@/components/account/AccountShell";
import {
  ORDER_SELECT,
  TIMELINE_STEPS,
  carrierTrackingUrl,
  estimatedDelivery,
  timelineIndex,
  type OrderRow,
} from "@/lib/orders";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const STEP_LABEL_KEYS = {
  received: "stepReceived",
  preparing: "stepPreparing",
  shipped: "stepShipped",
  delivered: "stepDelivered",
} as const;

export default function ShipmentTracking() {
  const t = useTranslations("accountPage.shipping");
  const locale = useLocale() as "tr" | "en";
  const { user } = useAccount();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .in("status", ["preparing", "shipped"])
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as unknown as OrderRow[]));
  }, [user.id]);

  async function copyTracking(no: string) {
    try {
      await navigator.clipboard.writeText(no);
      setCopied(no);
      window.setTimeout(() => setCopied((c) => (c === no ? null : c)), 2000);
    } catch {
      /* pano kapalıysa yoksay */
    }
  }

  // Yüklenmediyse veya hiç aktif kargo yoksa bölümü gösterme (panoyu sade tut).
  if (orders === null || orders.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2.5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink">
          <path d="M1.5 6h12v11h-12zM13.5 9h4.5l3 3.5V17h-7.5" />
          <circle cx="5.5" cy="18.5" r="1.8" />
          <circle cx="17.5" cy="18.5" r="1.8" />
        </svg>
        <h2 className="font-display text-xl text-ink">{t("title")}</h2>
      </div>
      <p className="mt-1.5 text-sm text-ink-soft">{t("subtitle")}</p>

      <div className="mt-4 space-y-4">
        {orders.map((order) => {
          const first = order.order_items[0];
          const extra = order.order_items.length - 1;
          const activeIdx = timelineIndex(order.status); // preparing=1, shipped=2
          const trackingUrl = carrierTrackingUrl(order.tracking_carrier, order.tracking_number);
          const isShipped = order.status === "shipped";

          return (
            <article key={order.id} className="border border-line bg-cream-light">
              {/* Üst: ürün + durum + tahmini teslimat */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line p-5">
                <span
                  className="relative block h-16 w-[3.4rem] shrink-0 bg-parchment bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/urun-fon.webp')" }}
                >
                  {first?.products?.slug && (
                    <Image
                      src={`/images/products/${first.products.slug}.webp`}
                      alt={first.product_name}
                      width={877}
                      height={900}
                      sizes="54px"
                      className="h-full w-full object-contain p-1"
                    />
                  )}
                </span>
                <div className="min-w-32 flex-1">
                  <span className="block text-[13px] font-semibold text-ink">
                    {first?.product_name ?? "—"}
                    {extra > 0 && <span className="font-normal text-ink-soft"> +{extra}</span>}
                  </span>
                  <Link
                    href={{ pathname: "/hesap/siparislerim/[orderNumber]", params: { orderNumber: order.order_number } }}
                    className="mt-0.5 inline-block text-[11px] text-ink-soft underline-offset-2 hover:text-gold hover:underline"
                  >
                    #{order.order_number}
                  </Link>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                    isShipped
                      ? "border border-[#c07b2d]/40 bg-[#c07b2d]/10 text-[#c07b2d]"
                      : "border border-line bg-white text-ink-soft"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isShipped ? "bg-[#c07b2d]" : "bg-ink-soft"}`} aria-hidden="true" />
                  {isShipped ? t("inTransit") : t("preparing")}
                </span>
              </div>

              {/* Orta: mini durum çizelgesi */}
              <div className="px-5 pt-5">
                <ol className="flex items-start">
                  {TIMELINE_STEPS.map((step, i) => {
                    const done = i < activeIdx;
                    const active = i === activeIdx;
                    return (
                      <li key={step} className={`flex items-start ${i > 0 ? "flex-1" : ""}`}>
                        {i > 0 && (
                          <span
                            aria-hidden="true"
                            className={`mx-2 mt-3.5 h-px flex-1 ${i <= activeIdx ? "bg-olive/60" : "bg-line"}`}
                          />
                        )}
                        <span className="flex w-14 flex-col items-center text-center sm:w-20">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${
                              active
                                ? "border-olive bg-olive text-cream"
                                : done
                                  ? "border-[#4a7a3a] text-[#4a7a3a]"
                                  : "border-line text-ink-soft/50"
                            }`}
                          >
                            {done ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4 12.5 9.5 18 20 6.5" />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </span>
                          <span className={`mt-1.5 text-[10px] font-semibold leading-tight sm:text-[11px] ${active || done ? "text-ink" : "text-ink-soft/60"}`}>
                            {t(STEP_LABEL_KEYS[step])}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Alt: takip no + kargom nerede / tahmini teslimat */}
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-line p-5">
                {order.tracking_number ? (
                  <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                    {order.tracking_carrier && (
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("carrier")}</dt>
                        <dd className="mt-0.5 font-semibold text-ink">{order.tracking_carrier}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.1em] text-ink-soft">{t("trackingNo")}</dt>
                      <dd className="mt-0.5 flex items-center gap-2">
                        <span className="font-mono font-semibold tracking-[0.06em] text-ink">{order.tracking_number}</span>
                        <button
                          type="button"
                          onClick={() => copyTracking(order.tracking_number!)}
                          className="text-ink-soft transition-colors hover:text-gold"
                          aria-label={t("copy")}
                          title={copied === order.tracking_number ? t("copied") : t("copy")}
                        >
                          {copied === order.tracking_number ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M4 12.5 9.5 18 20 6.5" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="9" y="9" width="11" height="11" rx="1.5" />
                              <path d="M5 15V5a1.5 1.5 0 0 1 1.5-1.5H15" />
                            </svg>
                          )}
                        </button>
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="max-w-sm text-[12px] leading-relaxed text-ink-soft">
                    {t("noTrackingYet")}
                    <span className="mt-1 block">
                      {t("estimated")}:{" "}
                      <span className="font-semibold text-ink">
                        {estimatedDelivery(locale, order.created_at)}
                      </span>
                    </span>
                  </p>
                )}

                <div className="flex items-center gap-3">
                  {trackingUrl ? (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-olive px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                      {t("whereIsMyCargo")}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 17 17 7M9 7h8v8" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      href={{ pathname: "/hesap/siparislerim/[orderNumber]", params: { orderNumber: order.order_number } }}
                      className="inline-flex items-center gap-2 border border-line bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-gold-light"
                    >
                      {t("viewOrder")}
                      <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

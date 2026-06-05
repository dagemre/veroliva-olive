"use client";

// Sipariş onayı sayfası (adım 4) — Emre'nin tasarımına göre.
// Siparişi order_number ile Supabase'den okur (RLS: yalnızca sahibi görür).
import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import CheckoutSteps from "@/components/cart/CheckoutSteps";
import PerksBand from "@/components/cart/PerksBand";
import { formatPrice } from "@/lib/products";
import {
  ORDER_SELECT,
  estimatedDelivery,
  formatOrderDate,
  parseShippingAddress,
  type OrderRow,
} from "@/lib/orders";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function OrderConfirmation({ orderNumber }: { orderNumber: string }) {
  const t = useTranslations("confirmation");
  const tp = useTranslations("paymentMethods");
  const locale = useLocale() as "tr" | "en";
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "unauthenticated" }
    | { status: "notfound" }
    | { status: "ok"; order: OrderRow }
  >({ status: "loading" });

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setState({ status: "notfound" });
      return;
    }
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setState({ status: "unauthenticated" });
        return;
      }
      const { data: order, error } = await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (error || !order) {
        setState({ status: "notfound" });
        return;
      }
      setState({ status: "ok", order: order as unknown as OrderRow });
    });
  }, [orderNumber]);

  if (state.status === "loading") {
    return (
      <p className="py-32 text-center text-sm text-ink-soft">{t("loading")}</p>
    );
  }

  if (state.status === "unauthenticated" || state.status === "notfound") {
    return (
      <div className="mx-auto max-w-xl px-4 pb-24 pt-16 text-center sm:px-6">
        <h1 className="font-display text-3xl text-ink">
          {state.status === "unauthenticated" ? t("loginToView") : t("notFound")}
        </h1>
        <div className="mt-7">
          {state.status === "unauthenticated" ? (
            <Link
              href="/giris"
              className="inline-block bg-olive px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
            >
              {locale === "tr" ? "Giriş Yap" : "Sign In"}
            </Link>
          ) : (
            <Link
              href="/koleksiyon"
              className="inline-block bg-olive px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
            >
              {t("continueShopping")}
            </Link>
          )}
        </div>
      </div>
    );
  }

  const { order } = state;
  const addr = parseShippingAddress(order.shipping_address);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <CheckoutSteps current={4} />

      {/* Üst kutu: onay mesajı */}
      <div className="mt-9 border border-line bg-cream-light px-6 py-10 sm:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
          {/* Onay ikonu + zeytin dalı */}
          <div className="relative mx-auto lg:mx-0">
            <span className="flex h-28 w-28 items-center justify-center rounded-full border border-gold-light/70 text-gold">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12.5 9.5 18 20 6.5" />
              </svg>
            </span>
            <Image
              src="/icons/zeytindali.svg"
              alt=""
              width={90}
              height={90}
              aria-hidden="true"
              className="absolute -bottom-6 -left-7 h-20 w-auto opacity-80"
            />
          </div>

          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl text-ink sm:text-[2.6rem]">{t("title")}</h1>
            <p className="mt-3 text-sm text-ink-soft">{t("text1")}</p>
            <p className="mt-1 text-sm text-ink-soft">{t("text2")}</p>

            <div className="mx-auto mt-6 inline-block border border-line bg-parchment/60 px-7 py-4 text-center lg:mx-0">
              <span className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <rect x="4" y="5" width="16" height="16" />
                  <path d="M8 3v4M16 3v4M4 10h16" />
                </svg>
                {t("orderNumberLabel")}
              </span>
              <span className="mt-1.5 block font-display text-xl text-olive">
                #{order.order_number}
              </span>
            </div>
            <p className="mt-4 text-[12px] text-ink-soft">{t("trackNote")}</p>
          </div>

          <div className="hidden max-w-56 text-center lg:block">
            <h2 className="font-display text-lg leading-snug text-ink">{t("preparingTitle")}</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{t("preparingText")}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Sol: sipariş özeti */}
        <div className="border border-line bg-cream-light p-5 sm:p-7">
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-ink">
            {t("summaryTitle")}
          </h2>
          <ul className="mt-5 divide-y divide-line">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span
                  className="relative block h-20 w-[4.25rem] shrink-0 bg-parchment bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/urun-fon.webp')" }}
                >
                  {item.products?.slug && (
                    <Image
                      src={`/images/products/${item.products.slug}.webp`}
                      alt={item.product_name}
                      width={877}
                      height={900}
                      sizes="68px"
                      className="h-full w-full object-contain p-1.5"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-ink">{item.product_name}</span>
                  {item.product_size && (
                    <span className="block text-[12px] text-ink-soft">{item.product_size}</span>
                  )}
                  <span className="mt-1 block text-[14px] font-medium text-ink">
                    {formatPrice(Number(item.unit_price))}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-[12px] text-ink-soft">{t("qty", { count: item.quantity })}</span>
                  <span className="mt-1 block text-[14px] font-semibold text-ink">
                    {formatPrice(Number(item.total))}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
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
            <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink">
              {locale === "tr" ? "Toplam" : "Total"}
            </span>
            <span className="font-display text-2xl text-olive">{formatPrice(Number(order.total))}</span>
          </div>
          <p className="mt-1 text-[11px] text-ink-soft">
            {locale === "tr" ? "KDV dahildir." : "VAT included."}
          </p>
        </div>

        {/* Sağ: teslimat + ödeme + sipariş bilgileri */}
        <aside className="space-y-5 self-start">
          <div className="border border-line bg-cream-light p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink">
              {t("deliveryTitle")}
            </h2>
            <div className="mt-4 flex items-start gap-3 text-sm">
              <span className="mt-0.5 text-ink-soft" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-ink">{addr.full_name}</p>
                {addr.phone && <p className="mt-0.5 text-ink-soft">{addr.phone}</p>}
                <p className="mt-2 leading-relaxed text-ink-soft">
                  {addr.address_line}
                  <br />
                  {addr.district} / {addr.city}
                  <br />
                  {addr.country ?? "Türkiye"}
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                {t("estimated")}
              </span>
              <p className="mt-1 text-sm font-semibold text-ink">
                {estimatedDelivery(locale, order.created_at)}
              </p>
            </div>
          </div>

          <div className="border border-line bg-cream-light p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink">
              {t("paymentTitle")}
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">{t("method")}</dt>
                <dd className="text-right font-semibold text-ink">{tp(order.payment_method as "card")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">{t("amount")}</dt>
                <dd className="font-semibold text-ink">{formatPrice(Number(order.total))}</dd>
              </div>
            </dl>
            {order.payment_method === "bank_transfer" && (
              <p className="mt-4 border-t border-line pt-4 text-[12px] leading-relaxed text-ink-soft">
                {t("bankText")}
              </p>
            )}
          </div>

          <div className="border border-line bg-cream-light p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink">
              {t("orderInfoTitle")}
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">{t("orderNo")}</dt>
                <dd className="font-semibold text-ink">#{order.order_number}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">{t("orderDate")}</dt>
                <dd className="text-right font-semibold text-ink">
                  {formatOrderDate(locale, order.created_at, true)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">{t("shippingMethod")}</dt>
                <dd className="font-semibold text-ink">
                  {Number(order.shipping_cost) === 0 ? t("freeShipping") : t("standardShipping")}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <PerksBand />
      </div>

      {/* Alt aksiyonlar */}
      <div className="mt-10 text-center">
        <Link
          href="/koleksiyon"
          className="inline-block bg-olive px-10 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-olive-deep"
        >
          {t("continueShopping")}
        </Link>
        <div className="mt-5">
          <Link
            href="/hesap/siparislerim"
            className="text-[12px] font-semibold uppercase tracking-[0.14em] text-olive underline-offset-4 hover:underline"
          >
            {t("goToOrders")}
          </Link>
        </div>
      </div>
    </div>
  );
}

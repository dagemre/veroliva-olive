"use client";

// Sipariş listesi satırı (özet + Siparişlerim sayfalarında ortak).
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/products";
import { formatOrderDate, statusColorClass, statusAt, type OrderRow } from "@/lib/orders";

export default function OrderRowCard({ order }: { order: OrderRow }) {
  const t = useTranslations("accountPage.overview");
  const ts = useTranslations("orderStatus");
  const locale = useLocale() as "tr" | "en";

  const first = order.order_items[0];
  const extraCount = order.order_items.length - 1;
  const statusDate =
    statusAt(order.status_history, [order.status]) ?? order.created_at;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line px-5 py-4 last:border-b-0">
      {/* Görsel */}
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

      {/* Ürün adı */}
      <span className="min-w-32 flex-1">
        <span className="block text-[13px] font-semibold leading-snug text-ink">
          {first?.product_name ?? "—"}
          {extraCount > 0 && (
            <span className="font-normal text-ink-soft"> +{extraCount}</span>
          )}
        </span>
        {first?.product_size && (
          <span className="mt-0.5 block text-[11px] text-ink-soft">{first.product_size}</span>
        )}
      </span>

      {/* Sipariş no */}
      <span className="hidden min-w-24 sm:block">
        <span className="block text-[11px] text-ink-soft">{t("orderNo")}</span>
        <span className="mt-0.5 block text-[12px] font-semibold text-ink">#{order.order_number}</span>
      </span>

      {/* Tarih */}
      <span className="hidden min-w-28 md:block">
        <span className="block text-[11px] text-ink-soft">{t("orderDate")}</span>
        <span className="mt-0.5 block text-[12px] font-medium text-ink">
          {formatOrderDate(locale, order.created_at)}
        </span>
      </span>

      {/* Durum */}
      <span className="min-w-28">
        <span className={`block text-[12px] font-semibold ${statusColorClass(order.status)}`}>
          {ts(order.status as "pending")}
        </span>
        <span className="mt-0.5 block text-[11px] text-ink-soft">
          {formatOrderDate(locale, statusDate)}
        </span>
      </span>

      {/* Tutar */}
      <span className="min-w-20 text-right text-[14px] font-semibold text-ink">
        {formatPrice(Number(order.total))}
      </span>

      {/* Detay */}
      <Link
        href={{ pathname: "/hesap/siparislerim/[orderNumber]", params: { orderNumber: order.order_number } }}
        className="flex items-center gap-1.5 border border-line bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:border-gold-light"
      >
        {t("details")}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

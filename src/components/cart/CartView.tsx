"use client";

// Sepet sayfası içeriği — Emre'nin tasarımına göre.
import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import PerksBand from "@/components/cart/PerksBand";
import { formatPrice } from "@/lib/products";
import { FREE_SHIPPING_THRESHOLD, shippingCostFor } from "@/lib/cart";
import {
  clearStoredCoupon,
  getStoredCoupon,
  parseCouponResult,
  storeCoupon,
} from "@/lib/coupon";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale() as "tr" | "en";
  const router = useRouter();
  const { items, ready, count, subtotal, setQty, remove } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponState, setCouponState] = useState<
    | { status: "idle" }
    | { status: "checking" }
    | { status: "applied"; code: string; discount: number }
    | { status: "error"; message: string }
  >({ status: "idle" });

  async function applyCoupon(code: string, silent = false) {
    const trimmed = code.trim();
    if (!trimmed) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      if (!silent) setCouponState({ status: "error", message: t("couponError") });
      return;
    }
    setCouponState({ status: "checking" });
    const { data, error } = await supabase.rpc("validate_coupon", {
      p_code: trimmed,
      p_subtotal: subtotal,
    });
    if (error) {
      setCouponState({ status: "error", message: t("couponError") });
      return;
    }
    const result = parseCouponResult(data);
    if (result.valid) {
      storeCoupon(result.code);
      setCouponState({ status: "applied", code: result.code, discount: result.discount });
    } else {
      clearStoredCoupon();
      if (silent) {
        setCouponState({ status: "idle" });
        return;
      }
      const message =
        result.reason === "expired"
          ? t("couponExpired")
          : result.reason === "min_subtotal"
            ? t("couponMin", { amount: formatPrice(result.min_subtotal ?? 0) })
            : result.reason === "already_used"
              ? t("couponUsed")
              : t("couponNotFound");
      setCouponState({ status: "error", message });
    }
  }

  // Daha önce uygulanmış kupon varsa sessizce yeniden doğrula.
  const storedReady = ready && subtotal > 0;
  useEffect(() => {
    if (!storedReady) return;
    const stored = getStoredCoupon();
    if (stored) void applyCoupon(stored, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedReady]);

  function removeCoupon() {
    clearStoredCoupon();
    setCouponInput("");
    setCouponState({ status: "idle" });
  }

  if (!ready) {
    return <div className="min-h-[40vh]" aria-hidden="true" />;
  }

  // ── Boş sepet ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 text-center sm:px-6">
        <svg className="mx-auto text-ink-soft" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
        <h1 className="mt-6 font-display text-4xl text-ink">{t("emptyTitle")}</h1>
        <p className="mt-3 text-sm text-ink-soft">{t("emptyText")}</p>
        <Link
          href="/koleksiyon"
          className="mt-8 inline-block bg-olive px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
        >
          {t("emptyCta")} →
        </Link>
      </div>
    );
  }

  const discount = couponState.status === "applied" ? couponState.discount : 0;
  const shippingCost = shippingCostFor(subtotal);
  const total = Math.max(subtotal + shippingCost - discount, 0);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="pt-2 text-xs text-ink-soft">
        <Link href="/" className="hover:text-gold">{t("breadcrumbHome")}</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-ink">{t("title")}</span>
      </nav>

      {/* Başlık */}
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-4xl text-ink">
          {t("title")}{" "}
          <span className="text-2xl text-ink-soft">{t("itemCount", { count })}</span>
        </h1>
        <Link
          href="/koleksiyon"
          className="text-[13px] font-medium text-ink-soft transition-colors hover:text-gold"
        >
          ← {t("continueShopping")}
        </Link>
      </div>
      <p className="mt-2 text-sm text-ink-soft">{t("subtitle")}</p>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Sol: ürünler + indirim kodu */}
        <div>
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.slug}
                className="relative border border-line bg-cream-light p-4 sm:p-5"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Görsel */}
                  <Link
                    href={{ pathname: "/urun/[slug]", params: { slug: item.slug } }}
                    className="relative block h-28 w-24 shrink-0 bg-parchment bg-cover bg-center sm:h-36 sm:w-32"
                    style={{ backgroundImage: "url('/images/urun-fon.webp')" }}
                  >
                    <Image
                      src={`/images/products/${item.slug}.webp`}
                      alt={item.name}
                      width={877}
                      height={900}
                      sizes="128px"
                      className="h-full w-full object-contain p-2"
                    />
                  </Link>

                  {/* Bilgi */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={{ pathname: "/urun/[slug]", params: { slug: item.slug } }}
                          className="hover:text-gold"
                        >
                          <h2 className="text-[15px] font-semibold leading-snug text-ink">
                            {item.name}
                          </h2>
                        </Link>
                        <span className="mt-0.5 block text-xs text-ink-soft">{item.size}</span>
                        <span className="mt-2 block text-[15px] font-semibold text-ink">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.slug)}
                        aria-label={`${item.name} — ${t("remove")}`}
                        className="p-1.5 text-ink-soft transition-colors hover:text-ink"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                          <line x1="5" y1="5" x2="19" y2="19" />
                          <line x1="19" y1="5" x2="5" y2="19" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      {/* Stok + kargo bilgisi */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-soft">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#4a7a3a]" aria-hidden="true" />
                          {t("inStock")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M1.5 6h12v11h-12zM13.5 9h4.5l3 3.5V17h-7.5" />
                            <circle cx="5.5" cy="18.5" r="1.8" />
                            <circle cx="17.5" cy="18.5" r="1.8" />
                          </svg>
                          {t("shipsIn")}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6">
                        {/* Adet */}
                        <div className="flex items-center border border-line bg-white/50">
                          <button
                            type="button"
                            aria-label="−"
                            onClick={() => setQty(item.slug, item.qty - 1)}
                            className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:text-ink"
                          >
                            −
                          </button>
                          <span aria-live="polite" className="w-7 text-center text-sm font-semibold text-ink">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="+"
                            onClick={() => setQty(item.slug, item.qty + 1)}
                            className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:text-ink"
                          >
                            +
                          </button>
                        </div>
                        {/* Satır toplamı */}
                        <span className="min-w-20 text-right text-[16px] font-semibold text-ink">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* İndirim kodu */}
          <div className="mt-6 border border-line bg-cream-light p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-parchment text-ink-soft" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12.5 12.5 3H21v8.5L11.5 21z" />
                  <circle cx="16.5" cy="7.5" r="1.3" />
                </svg>
              </span>
              <div className="min-w-44 flex-1">
                <h2 className="text-[15px] font-semibold text-ink">{t("discountTitle")}</h2>
                <p className="mt-0.5 text-xs text-ink-soft">{t("discountText")}</p>
              </div>
              {couponState.status === "applied" ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-2 border border-[#4a7a3a]/40 bg-[#4a7a3a]/10 px-3 py-2 text-[12px] font-semibold text-[#4a7a3a]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12.5 9.5 18 20 6.5" />
                    </svg>
                    {t("applied", { code: couponState.code })}
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[12px] text-ink-soft underline underline-offset-4 hover:text-ink"
                  >
                    {t("removeCoupon")}
                  </button>
                </div>
              ) : (
                <form
                  className="flex w-full gap-0 sm:w-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void applyCoupon(couponInput);
                  }}
                >
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={t("discountPlaceholder")}
                    aria-label={t("discountTitle")}
                    className="h-11 w-full border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-gold-light focus:outline-none sm:w-56"
                  />
                  <button
                    type="submit"
                    disabled={couponState.status === "checking"}
                    className="h-11 shrink-0 bg-olive px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep disabled:opacity-60"
                  >
                    {couponState.status === "checking" ? t("applying") : t("apply")}
                  </button>
                </form>
              )}
            </div>
            <div aria-live="polite">
              {couponState.status === "error" && (
                <p className="mt-3 text-[12px] text-[#a04545]">{couponState.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sağ: sipariş özeti */}
        <aside className="space-y-5 self-start lg:sticky lg:top-6">
          <div className="border border-line bg-cream-light p-6">
            <h2 className="font-display text-xl text-ink">{t("summaryTitle")}</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">{t("subtotal")}</dt>
                <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{t("shipping")}</dt>
                <dd className={shippingCost === 0 ? "font-medium text-[#4a7a3a]" : "font-medium text-ink"}>
                  {shippingCost === 0 ? t("free") : formatPrice(shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">{t("discount")}</dt>
                <dd className="font-medium text-ink">
                  {discount > 0 ? `− ${formatPrice(discount)}` : "-"}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink">
                {t("total")}
              </span>
              <span className="font-display text-2xl text-olive">{formatPrice(total)}</span>
            </div>
            <p className="mt-1 text-[11px] text-ink-soft">{t("vatIncluded")}</p>

            <button
              type="button"
              onClick={() => router.push("/odeme")}
              className="mt-5 flex w-full items-center justify-center gap-2.5 bg-olive px-4 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="9" />
                <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
              </svg>
              {t("checkout")}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-soft">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2.5 4.5 5.5v6c0 4.7 3.2 8 7.5 10 4.3-2 7.5-5.3 7.5-10v-6L12 2.5Z" />
                <path d="M8.8 12l2.2 2.2 4.2-4.4" />
              </svg>
              {t("ssl")}
            </p>
          </div>

          {/* Ücretsiz kargo çubuğu */}
          <div className="border border-line bg-cream-light p-6">
            <h2 className="text-[13px] font-semibold text-ink">{t("freeShippingTitle")}</h2>
            <div className="mt-3 h-1.5 w-full bg-line" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-[#4a7a3a]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2.5 text-[12px] text-ink-soft">
              {remaining > 0
                ? t("freeShippingRemaining", { amount: formatPrice(remaining) })
                : t("freeShippingDone")}
            </p>
          </div>

          {/* Avantajlar */}
          <div className="space-y-5 border border-line bg-cream-light p-6">
            {(
              [
                ["perkSameDay", "perkSameDaySub", "M12 7v5l3 2M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"],
                ["perkReturn", "perkReturnSub", "M3 12a9 9 0 1 0 3-6.7M3 4.5V9h4.5"],
                ["perkSecure", "perkSecureSub", "M12 2.5 4.5 5.5v6c0 4.7 3.2 8 7.5 10 4.3-2 7.5-5.3 7.5-10v-6L12 2.5Z"],
              ] as const
            ).map(([titleKey, subKey, path]) => (
              <div key={titleKey} className="flex items-start gap-3.5">
                <span className="mt-0.5 text-ink-soft" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                  </svg>
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-ink">{t(titleKey)}</span>
                  <span className="block text-[12px] text-ink-soft">{t(subKey)}</span>
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Alt güven şeridi */}
      <div className="mt-10">
        <PerksBand />
      </div>
    </div>
  );
}

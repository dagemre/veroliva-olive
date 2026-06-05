"use client";

// İndirim Kuponlarım — my_coupons() RPC'sinden kullanıcının kuponları.
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAccount } from "@/components/account/AccountShell";
import { formatPrice } from "@/lib/products";
import { formatOrderDate } from "@/lib/orders";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type CouponRow = {
  id: string;
  code: string;
  description_tr: string;
  description_en: string;
  discount_type: string;
  value: number;
  min_subtotal: number;
  valid_until: string | null;
  used_at: string | null;
};

export default function Coupons() {
  const t = useTranslations("accountPage.couponsPage");
  const locale = useLocale() as "tr" | "en";
  const { user } = useAccount();
  const [coupons, setCoupons] = useState<CouponRow[] | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.rpc("my_coupons").then(({ data }) => {
      setCoupons((data ?? []) as CouponRow[]);
    });
  }, [user.id]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">{t("hint")}</p>

      {coupons === null ? (
        <p className="py-12 text-center text-sm text-ink-soft">…</p>
      ) : coupons.length === 0 ? (
        <div className="mt-6 border border-line bg-cream-light px-5 py-14 text-center">
          <p className="text-sm text-ink-soft">{t("empty")}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {coupons.map((c) => {
            const used = Boolean(c.used_at);
            return (
              <div
                key={c.id}
                className={`relative border border-dashed p-5 ${
                  used ? "border-line bg-cream-light/60 opacity-70" : "border-gold-light bg-cream-light"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-xl text-olive">
                    {c.discount_type === "percent"
                      ? t("percentOff", { value: c.value })
                      : t("amountOff", { amount: formatPrice(Number(c.value)) })}
                  </span>
                  <span
                    className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                      used
                        ? "border border-line text-ink-soft"
                        : "border border-[#4a7a3a]/40 bg-[#4a7a3a]/10 text-[#4a7a3a]"
                    }`}
                  >
                    {used ? t("used") : t("available")}
                  </span>
                </div>
                {(locale === "tr" ? c.description_tr : c.description_en) && (
                  <p className="mt-1.5 text-[13px] text-ink-soft">
                    {locale === "tr" ? c.description_tr : c.description_en}
                  </p>
                )}
                <div className="mt-4 inline-block border border-line bg-white px-4 py-2 font-mono text-[13px] font-semibold tracking-[0.14em] text-ink">
                  {c.code}
                </div>
                <div className="mt-3 space-y-0.5 text-[11px] text-ink-soft">
                  {Number(c.min_subtotal) > 0 && (
                    <p>{t("minSubtotal", { amount: formatPrice(Number(c.min_subtotal)) })}</p>
                  )}
                  <p>
                    {c.valid_until
                      ? t("validUntil", { date: formatOrderDate(locale, c.valid_until) })
                      : t("noExpiry")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

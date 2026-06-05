"use client";

// Bildirimlerim — okunmamışlar vurgulu; görüntülenince okundu işaretlenir.
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAccount } from "@/components/account/AccountShell";
import { formatOrderDate } from "@/lib/orders";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Tables } from "@/lib/database.types";

type NotificationRow = Tables<"notifications">;

export default function Notifications() {
  const t = useTranslations("accountPage.notificationsPage");
  const locale = useLocale() as "tr" | "en";
  const { user } = useAccount();
  const [items, setItems] = useState<NotificationRow[] | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const rows = data ?? [];
        setItems(rows);
        // Okunmamışları okundu işaretle (görüntülendi)
        const unread = rows.filter((n) => !n.read_at).map((n) => n.id);
        if (unread.length > 0) {
          await supabase
            .from("notifications")
            .update({ read_at: new Date().toISOString() })
            .in("id", unread);
        }
      });
  }, [user.id]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>

      {items === null ? (
        <p className="py-12 text-center text-sm text-ink-soft">…</p>
      ) : items.length === 0 ? (
        <div className="mt-6 border border-line bg-cream-light px-5 py-14 text-center">
          <svg className="mx-auto text-ink-soft" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
            <path d="M10.3 19.5a2 2 0 0 0 3.4 0" />
          </svg>
          <p className="mt-4 text-sm text-ink-soft">{t("empty")}</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border border-line bg-cream-light">
          {items.map((n) => (
            <li key={n.id} className="flex items-start gap-4 px-5 py-4">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-line" : "bg-gold"}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-ink">
                  {locale === "tr" ? n.title_tr : n.title_en || n.title_tr}
                </p>
                {(locale === "tr" ? n.body_tr : n.body_en || n.body_tr) && (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    {locale === "tr" ? n.body_tr : n.body_en || n.body_tr}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[11px] text-ink-soft">
                {formatOrderDate(locale, n.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

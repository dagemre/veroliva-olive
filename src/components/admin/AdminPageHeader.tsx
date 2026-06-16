"use client";

// Admin sayfalarının üst başlık satırı: solda başlık+alt metin, sağda bildirim
// zili (okunmamış iletişim mesajı sayısı) + tarih aralığı hapı.

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Locale } from "@/lib/admin";

function rangeLabel(locale: Locale): string {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
      day: "numeric",
      month: "long",
    }).format(d);
  return `${fmt(start)} – ${fmt(end)} ${end.getFullYear()}`;
}

export default function AdminPageHeader({
  title,
  subtitle,
  showControls = true,
}: {
  title: string;
  subtitle?: string;
  showControls?: boolean;
}) {
  const locale = useLocale() as Locale;
  const [bell, setBell] = useState(0);

  useEffect(() => {
    if (!showControls) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
      .then(({ count }) => setBell(count ?? 0));
  }, [showControls]);

  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-ink sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13px] text-ink-soft">{subtitle}</p>}
      </div>

      {showControls && (
        <div className="flex items-center gap-3">
          <Link
            href="/admin/mesajlar"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream-light text-ink-soft transition-colors hover:text-ink"
            aria-label="Mesajlar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            {bell > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-olive px-1 text-[10px] font-semibold text-cream">
                {bell}
              </span>
            )}
          </Link>

          <span className="flex items-center gap-2 border border-line bg-cream-light px-4 py-2.5 text-[12px] font-medium text-ink">
            {rangeLabel(locale)}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-soft">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}

"use client";

// Duyuru barı metni varsayılan olarak i18n'den gelir (SSR'da bu basılır →
// tüm sayfalar statik kalır). İstemcide Ayarlar panelinden (site_settings)
// bir override varsa metin onunla değiştirilir. Tablo yok/boşsa i18n kalır.
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function AnnouncementBar() {
  const t = useTranslations();
  const locale = useLocale();
  const [text, setText] = useState(t("announcement"));

  useEffect(() => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const sb = getSupabaseBrowser() as any;
    if (!sb) return;
    sb.from("site_settings")
      .select("announcement_tr, announcement_en")
      .eq("id", 1)
      .maybeSingle()
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      .then(({ data }: any) => {
        const ov = locale === "en" ? data?.announcement_en : data?.announcement_tr;
        if (typeof ov === "string" && ov.trim()) setText(ov);
      })
      .catch(() => {});
  }, [locale]);

  return (
    <div className="bg-[#d9cc9e] px-4 py-2.5">
      <p className="flex items-center justify-center gap-2 whitespace-nowrap text-[11px] tracking-wide text-ink sm:text-[13px]">
        <span>{text}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M1 7h13v9H1z" />
          <path d="M14 10h4l3 3v3h-7" />
          <circle cx="5.5" cy="17.5" r="1.8" />
          <circle cx="17.5" cy="17.5" r="1.8" />
        </svg>
      </p>
    </div>
  );
}

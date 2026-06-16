"use client";

// Henüz yapılmamış admin bölümleri için ortak "yakında" ekranı.
import { useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import { ADMIN_NAV } from "@/lib/admin";

export default function AdminPlaceholder({ sectionKey }: { sectionKey: string }) {
  const t = useTranslations("admin");
  const item = ADMIN_NAV.find((n) => n.key === sectionKey);
  return (
    <>
      <AdminPageHeader title={t(`nav.${sectionKey}`)} showControls={false} />
      <div className="flex flex-col items-center justify-center border border-dashed border-line bg-cream-light px-6 py-24 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-parchment text-ink-soft">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={item?.icon ?? "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"} />
          </svg>
        </span>
        <h2 className="mt-5 font-display text-xl text-ink">{t("soon.title")}</h2>
        <p className="mt-2 max-w-sm text-[13px] text-ink-soft">{t("soon.text")}</p>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

/* KVKK Aydınlatma Metni popup'ı. Metnin tamamı okunabilir; alttaki
   "Okudum, Kabul Ediyorum" butonu kayıt formundaki onay kutusunu işaretler.
   Metin sürümü değişirse RegisterForm'daki KVKK_VERSION'ı da güncelle. */
export default function KvkkModal({
  open,
  onClose,
  onAccept,
}: {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}) {
  const t = useTranslations("auth.kvkkModal");
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape ile kapat + arka plan kaydırmasını kilitle
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sections = t.raw("sections") as { h: string; p: string }[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kvkk-title"
    >
      {/* Arka plan örtüsü */}
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/50"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col border border-line bg-cream-light shadow-xl outline-none"
      >
        {/* Başlık */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
          <div>
            <h2 id="kvkk-title" className="font-display text-2xl text-ink">
              {t("title")}
            </h2>
            <p className="mt-1 text-xs text-ink-soft">{t("version")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="-mr-2 p-2 text-ink-soft transition-colors hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>

        {/* Kaydırılabilir metin */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {t("intro")}
          </p>
          {sections.map((s, i) => (
            <section key={i} className="mt-5">
              <h3 className="text-[13px] font-semibold text-ink">
                {i + 1}. {s.h}
              </h3>
              <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
                {s.p}
              </p>
            </section>
          ))}
        </div>

        {/* Alt eylem çubuğu */}
        <div className="flex flex-col gap-3 border-t border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
          >
            {t("close")}
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="bg-olive px-7 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

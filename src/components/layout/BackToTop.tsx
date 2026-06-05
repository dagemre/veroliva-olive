"use client";

import { useTranslations } from "next-intl";

export default function BackToTop() {
  const t = useTranslations("footer");

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("backToTop")}
      title={t("backToTop")}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-cream text-ink transition-colors hover:border-gold hover:text-gold"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 14 7-7 7 7" />
        <path d="M12 7v13" />
      </svg>
    </button>
  );
}

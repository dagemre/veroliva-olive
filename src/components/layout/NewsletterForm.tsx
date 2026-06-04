"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function NewsletterForm() {
  const t = useTranslations("newsletter");
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="text-sm font-medium text-olive">{t("success")}</p>;
  }

  return (
    <form
      className="flex w-full max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: Supabase'e abone kaydı
        setDone(true);
      }}
    >
      <input
        type="email"
        required
        placeholder={t("placeholder")}
        className="h-11 min-w-0 flex-1 border border-line bg-white px-4 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-gold"
      />
      <button
        type="submit"
        className="h-11 shrink-0 bg-olive px-6 text-xs font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep"
      >
        {t("button")}
      </button>
    </form>
  );
}

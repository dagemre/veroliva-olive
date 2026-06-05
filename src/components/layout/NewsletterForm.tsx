"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitForm } from "@/lib/forms";

export default function NewsletterForm() {
  const t = useTranslations("newsletter");
  const [status, setStatus] = useState<
    "idle" | "sending" | "done" | "error"
  >("idle");

  if (status === "done") {
    return <p className="text-sm font-medium text-olive">{t("success")}</p>;
  }

  return (
    <div className="w-full max-w-md">
      <form
        className="flex w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(
            new FormData(e.currentTarget).entries()
          ) as Record<string, string>;
          setStatus("sending");
          try {
            // TODO: Supabase kurulunca aboneyi veritabanına da kaydet
            await submitForm({
              ...data,
              _subject: "Veroliva Bülten Kaydı",
            });
            setStatus("done");
          } catch {
            setStatus("error");
          }
        }}
      >
        {/* WCAG: görünmez ama ekran okuyucuya açık label */}
        <label htmlFor="newsletter-email" className="sr-only">
          {t("placeholder")}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t("placeholder")}
          className="h-11 min-w-0 flex-1 border border-line bg-white px-4 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-gold"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-11 shrink-0 bg-olive px-6 text-xs font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep disabled:cursor-wait disabled:opacity-60"
        >
          {status === "sending" ? "…" : t("button")}
        </button>
      </form>
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {t("error")}
        </p>
      )}
    </div>
  );
}

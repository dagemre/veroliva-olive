"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, getPathname } from "@/i18n/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import AuthInput from "@/components/auth/AuthInput";

export default function ForgotForm() {
  const t = useTranslations("auth.forgot");
  const tc = useTranslations("auth.common");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowser();
    if (!supabase) return setError(tc("errorGeneric"));

    const email = String(new FormData(e.currentTarget).get("email")).trim();
    const resetPath = getPathname({
      locale: locale as "tr" | "en",
      href: "/sifre-yenile",
    });

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${resetPath}`,
    });
    setLoading(false);

    if (error) return setError(tc("errorGeneric"));
    setDone(true);
  }

  if (done) {
    return (
      <div>
        <h1 className="font-display text-4xl text-ink">{t("successTitle")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {t("successText")}
        </p>
        <Link
          href="/giris"
          className="mt-8 inline-block text-[13px] text-olive underline underline-offset-2 hover:text-gold"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-4xl text-ink">{t("title")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t("text")}</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
        <AuthInput
          id="email"
          name="email"
          type="email"
          icon="mail"
          label={t("email")}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          required
        />

        {error && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-olive py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-olive-deep disabled:opacity-60"
        >
          {loading ? tc("loading") : t("submit")}
        </button>
      </form>

      <p className="mt-7 text-center text-[13px] text-ink-soft">
        <Link href="/giris" className="text-olive underline underline-offset-2 hover:text-gold">
          {t("backToLogin")}
        </Link>
      </p>
    </>
  );
}

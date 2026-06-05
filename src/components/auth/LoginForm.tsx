"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import AuthInput from "@/components/auth/AuthInput";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const tc = useTranslations("auth.common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowser();
    if (!supabase) return setError(tc("errorGeneric"));

    const data = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(data.get("email")).trim(),
      password: String(data.get("password")),
    });
    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError(t("errorInvalid"));
      } else if (error.message.includes("Email not confirmed")) {
        setError(t("errorUnconfirmed"));
      } else {
        setError(tc("errorGeneric"));
      }
      return;
    }
    router.push("/hesap");
    router.refresh();
  }

  return (
    <>
      <h1 className="font-display text-4xl text-ink">{t("title")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        {t("subtitle")}
      </p>

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
        <AuthInput
          id="password"
          name="password"
          type="password"
          icon="lock"
          label={t("password")}
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              className="h-4 w-4 cursor-pointer accent-olive"
            />
            {t("remember")}
          </label>
          <Link
            href="/sifremi-unuttum"
            className="text-[13px] text-ink-soft underline-offset-2 hover:text-gold hover:underline"
          >
            {t("forgot")}
          </Link>
        </div>

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

      <GoogleButton label={t("google")} orLabel={t("or")} />

      <p className="mt-7 text-center text-[13px] text-ink-soft">
        {t("noAccount")}{" "}
        <Link href="/kayit" className="text-olive underline underline-offset-2 hover:text-gold">
          {t("register")}
        </Link>
      </p>
    </>
  );
}

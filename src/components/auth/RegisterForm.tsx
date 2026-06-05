"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import AuthInput from "@/components/auth/AuthInput";
import GoogleButton from "@/components/auth/GoogleButton";
import KvkkModal from "@/components/auth/KvkkModal";

/* Şifre kuralları — tasarımdaki canlı kontrol listesi. */
const RULES = [
  { key: "length", test: (p: string) => p.length >= 8 },
  { key: "upper", test: (p: string) => /[A-ZÇĞİÖŞÜ]/.test(p) },
  { key: "digit", test: (p: string) => /\d/.test(p) },
] as const;

/* Onaylanan KVKK metni sürümü — metin değişirse güncelle (profiles.kvkk_version). */
const KVKK_VERSION = "2026-06";

export default function RegisterForm() {
  const t = useTranslations("auth.register");
  const tc = useTranslations("auth.common");
  const [password, setPassword] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [kvkkOpen, setKvkkOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseBrowser();
    if (!supabase) return setError(tc("errorGeneric"));

    const data = new FormData(e.currentTarget);
    const firstName = String(data.get("firstName")).trim();
    const lastName = String(data.get("lastName")).trim();
    const email = String(data.get("email")).trim();
    const confirm = String(data.get("confirm"));

    if (!firstName || !lastName) return setError(t("errorName"));
    if (RULES.some((r) => !r.test(password))) return setError(t("errorRules"));
    if (password !== confirm) return setError(t("errorMatch"));
    if (!kvkk) return setError(t("errorKvkk"));

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          // KVKK onayı — handle_new_user trigger'ı profiles'a kopyalar (CRM)
          kvkk_accepted_at: new Date().toISOString(),
          kvkk_version: KVKK_VERSION,
        },
        emailRedirectTo: `${window.location.origin}/giris`,
      },
    });
    setLoading(false);

    if (error) {
      setError(
        error.message.includes("already registered")
          ? t("errorExists")
          : tc("errorGeneric")
      );
      return;
    }
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
          className="mt-8 inline-block bg-olive px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-olive-deep"
        >
          {t("successCta")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-4xl text-ink">{t("title")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        {t("subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
        <AuthInput
          id="firstName"
          name="firstName"
          type="text"
          icon="user"
          label={t("firstName")}
          placeholder={t("firstNamePlaceholder")}
          autoComplete="given-name"
          required
        />
        <AuthInput
          id="lastName"
          name="lastName"
          type="text"
          icon="user"
          label={t("lastName")}
          placeholder={t("lastNamePlaceholder")}
          autoComplete="family-name"
          required
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <AuthInput
          id="confirm"
          name="confirm"
          type="password"
          icon="lock"
          label={t("confirm")}
          placeholder={t("confirmPlaceholder")}
          autoComplete="new-password"
          required
        />

        {/* Şifre kuralları — canlı kontrol */}
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink">{t("rulesTitle")}</p>
          <ul className="flex flex-col gap-1.5">
            {RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <li
                  key={rule.key}
                  className={`flex items-center gap-2 text-[13px] ${
                    ok ? "text-olive" : "text-ink-soft"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m4 12.5 5 5L20 7" />
                  </svg>
                  {t(`rules.${rule.key}`)}
                </li>
              );
            })}
          </ul>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-ink">
          <input
            type="checkbox"
            name="kvkk"
            checked={kvkk}
            onChange={(e) => {
              // İşaretlemek için metni görmek şart — popup açılır,
              // onay ancak popup'taki butonla verilir. Kaldırmak serbest.
              if (e.target.checked) {
                e.preventDefault();
                setKvkkOpen(true);
              } else {
                setKvkk(false);
              }
            }}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-olive"
          />
          <span>
            {t.rich("kvkk", {
              link: (chunks) => (
                <button
                  type="button"
                  onClick={() => setKvkkOpen(true)}
                  className="text-olive underline underline-offset-2 hover:text-gold"
                >
                  {chunks}
                </button>
              ),
            })}
          </span>
        </label>

        {error && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !kvkk}
          className="w-full bg-olive py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-olive-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? tc("loading") : t("submit")}
        </button>
      </form>

      <KvkkModal
        open={kvkkOpen}
        onClose={() => setKvkkOpen(false)}
        onAccept={() => {
          setKvkk(true);
          setKvkkOpen(false);
          setError(null);
        }}
      />

      <GoogleButton label={t("google")} orLabel={t("or")} />

      <p className="mt-7 text-center text-[13px] text-ink-soft">
        {t("haveAccount")}{" "}
        <Link href="/giris" className="text-olive underline underline-offset-2 hover:text-gold">
          {t("login")}
        </Link>
      </p>
    </>
  );
}

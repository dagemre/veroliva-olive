"use client";

// Şifre Değiştir — kayıt sayfasıyla aynı kurallar (8+ karakter, büyük harf, rakam).
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const inputCls =
  "h-11 w-full border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-gold-light focus:outline-none";
const labelCls = "mb-1.5 block text-[12px] font-semibold text-ink";

export default function PasswordChange() {
  const t = useTranslations("accountPage.passwordPage");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<
    { status: "idle" | "saving" | "done" } | { status: "error"; message: string }
  >({ status: "idle" });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8 || !/[A-ZÇĞİÖŞÜ]/.test(password) || !/\d/.test(password)) {
      setState({ status: "error", message: t("weak") });
      return;
    }
    if (password !== confirm) {
      setState({ status: "error", message: t("mismatch") });
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setState({ status: "saving" });
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setState({ status: "error", message: t("error") });
      return;
    }
    setPassword("");
    setConfirm("");
    setState({ status: "done" });
    window.setTimeout(() => setState({ status: "idle" }), 4000);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>

      <form onSubmit={handleSave} className="mt-6 max-w-md border border-line bg-cream-light p-6 sm:p-7">
        <div className="space-y-4">
          <div>
            <label htmlFor="pw-new" className={labelCls}>{t("newPassword")}</label>
            <input
              id="pw-new"
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">{t("rule")}</p>
          </div>
          <div>
            <label htmlFor="pw-confirm" className={labelCls}>{t("confirmPassword")}</label>
            <input
              id="pw-confirm"
              type="password"
              className={inputCls}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div aria-live="polite" className="min-h-6 pt-3">
          {state.status === "done" && (
            <p className="text-[12px] font-medium text-[#4a7a3a]">{t("success")}</p>
          )}
          {state.status === "error" && (
            <p className="text-[12px] text-[#a04545]">{state.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={state.status === "saving"}
          className="mt-2 bg-olive px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep disabled:opacity-60"
        >
          {state.status === "saving" ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}

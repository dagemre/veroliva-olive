"use client";

// Kişisel Bilgilerim — ad/soyad/telefon güncelleme (profiles tablosu).
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAccount } from "@/components/account/AccountShell";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

const inputCls =
  "h-11 w-full border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-gold-light focus:outline-none";
const labelCls = "mb-1.5 block text-[12px] font-semibold text-ink";

export default function PersonalInfo() {
  const t = useTranslations("accountPage.personal");
  const { user, profile, refreshProfile } = useAccount();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    setFirstName(profile?.first_name ?? "");
    setLastName(profile?.last_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setState("saving");
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: fullName || null,
        phone: phone.trim() || null,
      })
      .eq("id", user.id);
    if (error) {
      setState("error");
      return;
    }
    // Auth metadata'sını da senkron tut (hoş geldin mesajları için)
    await supabase.auth.updateUser({
      data: { first_name: firstName.trim(), last_name: lastName.trim() },
    });
    await refreshProfile();
    setState("saved");
    window.setTimeout(() => setState("idle"), 3000);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>

      <form onSubmit={handleSave} className="mt-6 max-w-xl border border-line bg-cream-light p-6 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pi-first" className={labelCls}>{t("firstName")}</label>
            <input id="pi-first" className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
          </div>
          <div>
            <label htmlFor="pi-last" className={labelCls}>{t("lastName")}</label>
            <input id="pi-last" className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
          </div>
          <div>
            <label htmlFor="pi-phone" className={labelCls}>{t("phone")}</label>
            <input id="pi-phone" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" />
          </div>
          <div>
            <label htmlFor="pi-email" className={labelCls}>{t("email")}</label>
            <input id="pi-email" className={`${inputCls} text-ink-soft`} value={user.email ?? ""} readOnly />
            <p className="mt-1.5 text-[11px] text-ink-soft">{t("emailNote")}</p>
          </div>
        </div>

        <div aria-live="polite" className="min-h-6 pt-3">
          {state === "saved" && <p className="text-[12px] font-medium text-[#4a7a3a]">{t("saved")}</p>}
          {state === "error" && <p className="text-[12px] text-[#a04545]">{t("error")}</p>}
        </div>

        <button
          type="submit"
          disabled={state === "saving"}
          className="mt-2 bg-olive px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep disabled:opacity-60"
        >
          {state === "saving" ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}

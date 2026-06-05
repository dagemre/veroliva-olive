"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

/* Basit hesap paneli — oturum yoksa girişe yönlendirir.
   Sipariş geçmişi vb. sipariş altyapısı kurulunca eklenecek. */
export default function AccountPanel() {
  const t = useTranslations("auth.account");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      router.replace("/giris");
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/giris");
      } else {
        setUser(data.user);
        setLoading(false);
      }
    });
  }, [router]);

  async function handleSignOut() {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <p className="py-24 text-center text-sm text-ink-soft">{t("loading")}</p>
    );
  }

  const firstName =
    (user?.user_metadata?.first_name as string | undefined) ?? "";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="font-display text-4xl text-ink">
        {firstName ? t("welcomeName", { name: firstName }) : t("welcome")}
      </h1>
      <p className="mt-3 text-sm text-ink-soft">{user?.email}</p>

      <div className="mt-10 border border-line bg-cream-light p-8">
        <h2 className="font-display text-xl text-ink">{t("ordersTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {t("ordersEmpty")}
        </p>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-8 border border-line bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-gold-light"
      >
        {t("signOut")}
      </button>
    </div>
  );
}

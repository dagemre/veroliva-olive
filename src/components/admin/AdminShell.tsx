"use client";

// Admin paneli iskeleti: sol menü + içerik. Yalnızca is_admin=true kullanıcılar girer;
// oturum yoksa /giris'e, admin değilse anasayfaya yönlendirir.
// Sayfalar kullanıcıya useAdmin() ile erişir; başlık satırını <AdminPageHeader> kurar.

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Tables } from "@/lib/database.types";
import { ADMIN_NAV } from "@/lib/admin";

type Profile = Tables<"profiles">;

type AdminCtx = { user: User; profile: Profile | null; signOut: () => Promise<void> };

const Ctx = createContext<AdminCtx | null>(null);

export function useAdmin(): AdminCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin yalnızca AdminShell içinde kullanılabilir.");
  return ctx;
}

function Wordmark() {
  // Tasarımdaki VEROLIVA kelime-logosu: serif harfler + O'nun üstünde altın zeytin filizi.
  return (
    <span className="relative inline-block font-display text-[22px] leading-none tracking-[0.22em] text-ink">
      VER
      <span className="relative inline-block">
        O
        <svg
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-gold"
          width="16" height="11" viewBox="0 0 24 16" fill="none" stroke="currentColor"
          strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"
        >
          <path d="M3 13C9 12 16 8 21 2" />
          <ellipse cx="8" cy="10.5" rx="1.7" ry="2.7" transform="rotate(48 8 10.5)" fill="currentColor" stroke="none" />
          <ellipse cx="13.5" cy="7" rx="1.7" ry="2.7" transform="rotate(48 13.5 7)" fill="currentColor" stroke="none" />
        </svg>
      </span>
      LIVA
    </span>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      router.replace("/giris");
      return;
    }
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/giris");
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!p?.is_admin) {
        setState("denied");
        return;
      }
      setUser(data.user);
      setProfile(p);
      setState("ok");
    });
  }, [router]);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (state === "loading") {
    return <p className="py-40 text-center text-sm text-ink-soft">{t("loading")}</p>;
  }

  if (state === "denied" || !user) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <h1 className="font-display text-2xl text-ink">{t("denied.title")}</h1>
        <p className="mt-3 text-sm text-ink-soft">{t("denied.text")}</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-olive px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
        >
          {t("denied.cta")}
        </Link>
      </div>
    );
  }

  const displayName =
    profile?.full_name ||
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
    user.email ||
    "Admin";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toLocaleUpperCase("tr-TR"))
      .join("") || "A";

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navList = (
    <nav className="space-y-0.5">
      {ADMIN_NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setDrawer(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-[13px] transition-colors ${
              active
                ? "bg-parchment font-semibold text-ink"
                : "font-medium text-ink-soft hover:bg-parchment/50 hover:text-ink"
            }`}
          >
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true" className="shrink-0"
            >
              <path d={item.icon} />
            </svg>
            <span className="truncate">{t(`nav.${item.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );

  const userBlock = (
    <div className="border-t border-line px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment text-[12px] font-semibold text-ink">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-ink">{displayName}</span>
          <span className="block truncate text-[11px] text-ink-soft">{t("role")}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-soft">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="mt-3 flex w-full items-center gap-2.5 px-1 text-[12px] font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 4h-9v16h9M10 12h11M18 8.5 21.5 12 18 15.5" />
        </svg>
        {t("signOut")}
      </button>
    </div>
  );

  return (
    <Ctx.Provider value={{ user, profile, signOut }}>
      <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[224px_1fr]">
        {/* ── Masaüstü sol menü ── */}
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-cream-light lg:flex">
          <div className="flex h-[68px] items-center border-b border-line px-5">
            <Link href="/admin" aria-label="Veroliva">
              <Wordmark />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 py-4">{navList}</div>
          {userBlock}
        </aside>

        {/* ── Mobil üst bar ── */}
        <div className="flex h-[60px] items-center justify-between border-b border-line bg-cream-light px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label={t("menu")}
            className="flex h-9 w-9 items-center justify-center text-ink"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Wordmark />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-parchment text-[12px] font-semibold text-ink">
            {initials}
          </span>
        </div>

        {/* ── Mobil çekmece ── */}
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Kapat"
              onClick={() => setDrawer(false)}
              className="absolute inset-0 bg-ink/40"
            />
            <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-cream-light shadow-xl">
              <div className="flex h-[60px] items-center justify-between border-b border-line px-5">
                <Wordmark />
                <button type="button" onClick={() => setDrawer(false)} aria-label="Kapat" className="text-ink-soft">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-2.5 py-4">{navList}</div>
              {userBlock}
            </div>
          </div>
        )}

        {/* ── İçerik ── */}
        <main className="min-w-0 px-5 py-7 sm:px-8 lg:px-10">{children}</main>
      </div>
    </Ctx.Provider>
  );
}

"use client";

// Hesap paneli iskeleti: sol menü + içerik. Oturum yoksa /giris'e yönlendirir.
// İçerik componentleri kullanıcıya useAccountUser() ile erişir.
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Tables } from "@/lib/database.types";

type Profile = Tables<"profiles">;

type AccountCtx = {
  user: User;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AccountCtx | null>(null);

export function useAccount(): AccountCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAccount yalnızca AccountShell içinde kullanılabilir.");
  return ctx;
}

// NOT: Özel menü ikonlarını Emre hazırlıyor — gelince buradaki çizgi SVG'ler
// <img src="/icons/hesap/..." /> ile değiştirilecek.
const NAV = [
  {
    key: "overview",
    href: "/hesap",
    icon: "M4 11.5 12 4l8 7.5M6 10v9h12v-9",
  },
  {
    key: "orders",
    href: "/hesap/siparislerim",
    icon: "M4.5 7.5h15v12h-15zM4.5 7.5 7 4h10l2.5 3.5M9.5 11h5",
  },
  {
    key: "addresses",
    href: "/hesap/adreslerim",
    icon: "M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  },
  {
    key: "personal",
    href: "/hesap/bilgilerim",
    icon: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c0-3.3 3.4-5.5 7.5-5.5s7.5 2.2 7.5 5.5",
  },
  {
    key: "favorites",
    href: "/hesap/favorilerim",
    icon: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
  },
  {
    key: "coupons",
    href: "/hesap/kuponlarim",
    icon: "M3 12.5 12.5 3H21v8.5L11.5 21zM16.5 7.5h.01",
  },
  {
    key: "notifications",
    href: "/hesap/bildirimlerim",
    icon: "M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6M10.3 19.5a2 2 0 0 0 3.4 0",
  },
  {
    key: "password",
    href: "/hesap/sifre",
    icon: "M5 11h14v9.5H5zM8 11V7.5a4 4 0 0 1 8 0V11",
  },
] as const;

export default function AccountShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("accountPage");
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
      setUser(data.user);
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      setProfile(p ?? null);
      setLoading(false);
    });
  }, [router]);

  async function refreshProfile() {
    const supabase = getSupabaseBrowser();
    if (!supabase || !user) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(p ?? null);
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowser();
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading || !user) {
    return <p className="py-32 text-center text-sm text-ink-soft">{t("loading")}</p>;
  }

  const displayName =
    profile?.full_name ||
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
    ((user.user_metadata?.first_name as string | undefined) ?? "");
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toLocaleUpperCase("tr-TR"))
      .join("") || "V";

  const isActive = (href: string) =>
    href === "/hesap" ? pathname === "/hesap" : pathname.startsWith(href);

  const navLinkCls = (active: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${
      active
        ? "bg-parchment/80 text-ink"
        : "text-ink-soft hover:bg-parchment/40 hover:text-ink"
    }`;

  return (
    <Ctx.Provider value={{ user, profile, refreshProfile }}>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-7 lg:grid-cols-[270px_1fr]">
          {/* ── Sol menü ── */}
          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="border border-line bg-cream-light p-6">
              {/* Profil özeti */}
              <div className="flex flex-col items-center border-b border-line pb-5 text-center">
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-parchment font-display text-2xl text-ink">
                  {initials}
                  <svg
                    className="absolute -right-2 bottom-0 text-gold"
                    width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true"
                  >
                    <path d="M4 20C9 18 13 13 14 6" />
                    <path d="M9 14c1.8.4 2.6 1.8 2.4 3.6M12.5 9.5c1.8.3 2.7 1.6 2.6 3.4M7 17.5c1.5.3 2.3 1.3 2.3 2.9" fill="currentColor" stroke="none" />
                    <ellipse cx="9.6" cy="15.7" rx="1.7" ry="2.6" transform="rotate(40 9.6 15.7)" fill="currentColor" stroke="none" />
                    <ellipse cx="13.2" cy="11" rx="1.6" ry="2.5" transform="rotate(40 13.2 11)" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span className="mt-3.5 text-[15px] font-semibold text-ink">{displayName || "—"}</span>
                <span className="mt-1 max-w-full truncate text-[12px] text-ink-soft">{user.email}</span>
                <Link
                  href="/hesap/bilgilerim"
                  className="mt-2.5 text-[12px] font-medium text-olive underline underline-offset-4 hover:text-olive-deep"
                >
                  {t("sidebar.viewProfile")}
                </Link>
              </div>

              {/* Menü */}
              <nav className="mt-4 -mx-2">
                <ul className="space-y-0.5">
                  {NAV.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={navLinkCls(isActive(item.href))}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                          <path d={item.icon} />
                        </svg>
                        {t(`sidebar.${item.key}`)}
                      </Link>
                    </li>
                  ))}
                  <li className="!mt-2 border-t border-line pt-2">
                    <button type="button" onClick={handleSignOut} className={`w-full ${navLinkCls(false)}`}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                        <path d="M14 4h-9v16h9M10 12h11M18 8.5 21.5 12 18 15.5" />
                      </svg>
                      {t("sidebar.signOut")}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Yardım kartı */}
            <div className="border border-line bg-cream-light p-6">
              <h2 className="text-[14px] font-semibold text-ink">{t("help.title")}</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{t("help.text")}</p>
              <dl className="mt-4 space-y-2 text-[12px] text-ink-soft">
                <div className="flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" />
                    <path d="m3 6 9 7 9-7" />
                  </svg>
                  <dd>info@verolivaolive.com</dd>
                </div>
              </dl>
              <Link
                href="/iletisim"
                className="mt-5 block w-full bg-olive px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
              >
                {t("help.cta")}
              </Link>
            </div>
          </aside>

          {/* ── İçerik ── */}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </Ctx.Provider>
  );
}

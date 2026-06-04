"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const NAV_ITEMS = [
  { key: "collection", href: "/koleksiyon" },
  { key: "guide", href: "/rehber" },
  { key: "about", href: "/hakkimizda" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-40">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        {/* Sol: masaüstü nav / mobil menü düğmesi */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:text-gold"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="justify-self-start p-2 lg:hidden"
          aria-label="Menü"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Orta: logo */}
        <Link href="/" className="justify-self-center" aria-label="Veroliva — Anasayfa">
          <Image
            src="/Logo.svg"
            alt="Veroliva Zeytinyağı"
            width={190}
            height={53}
            priority
            className="h-11 w-auto sm:h-13"
          />
        </Link>

        {/* Sağ: ikonlar */}
        <div className="flex items-center justify-end gap-1 sm:gap-3">
          <button type="button" className="hidden p-2 text-ink transition-colors hover:text-gold sm:block" aria-label={t("search")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>
          <Link href="/hesap" className="hidden p-2 text-ink transition-colors hover:text-gold sm:block" aria-label={t("account")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
            </svg>
          </Link>
          <Link href="/sepet" className="relative p-2 text-ink transition-colors hover:text-gold" aria-label={t("cart")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-olive text-[10px] font-semibold text-cream">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* Mobil menü */}
      {menuOpen && (
        <nav className="absolute inset-x-0 top-full border-y border-line bg-cream px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2.5 text-sm font-medium uppercase tracking-[0.12em] text-ink"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

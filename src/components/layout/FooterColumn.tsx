"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

type FooterLink = {
  label: string;
  href: React.ComponentProps<typeof Link>["href"];
};

export default function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label={title}
      className="border-t border-line text-left last:border-b sm:border-0"
    >
      {/* Mobil: tam genişlik satır — başlık solda, artı sağda */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left text-[12px] font-semibold uppercase tracking-[0.16em] text-ink sm:hidden"
      >
        {title}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Masaüstü: sabit başlık */}
      <h3 className="mb-4 hidden text-[12px] font-semibold uppercase tracking-[0.16em] text-ink sm:block">
        {title}
      </h3>

      {/* Linkler — mobilde akordeon, sm+ hep açık */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        } sm:block`}
      >
        <ul className="space-y-2.5 overflow-hidden">
          {links.map((link) => (
            <li key={link.label} className="last:pb-4 sm:last:pb-0">
              <Link
                href={link.href}
                className="text-[13px] text-ink-soft transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

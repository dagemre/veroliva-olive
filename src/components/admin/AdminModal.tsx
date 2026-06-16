"use client";

import { useEffect } from "react";

export default function AdminModal({
  title,
  onClose,
  children,
  size = "default",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "default" | "wide";
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const maxW = size === "wide" ? "max-w-6xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <button type="button" aria-label="Kapat" onClick={onClose} className="fixed inset-0 bg-ink/45" />
      <div className={`relative z-10 w-full ${maxW} border border-line bg-cream-light shadow-xl`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Kapat" className="text-ink-soft hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

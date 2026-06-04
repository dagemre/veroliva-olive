"use client";

import { useRef, type ReactNode } from "react";

/**
 * Yatay kaydırmalı karusel — ürün kartları ve blog kartları için ortak.
 * Ok düğmesi bir kart genişliği kadar kaydırır.
 */
export default function Carousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 20 : 300;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="relative min-w-0">
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Sonraki"
        className="absolute -right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream-light text-ink shadow-sm transition-colors hover:border-gold hover:text-gold lg:flex"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

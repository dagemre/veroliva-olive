"use client";

import { useEffect, useRef } from "react";

export default function MadeWith() {
  const ref = useRef<HTMLAnchorElement>(null);

  // Mobil: link %90 görünür olunca animasyonu otomatik oynat
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Hover'ı olan cihazlarda (masaüstü) otomatik tetikleme yok
    if (window.matchMedia("(hover: hover)").matches) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.9) {
            el.classList.add("is-beating");
            clearTimeout(timer);
            timer = setTimeout(() => el.classList.remove("is-beating"), 2600);
          } else {
            el.classList.remove("is-beating");
          }
        });
      },
      { threshold: [0, 0.9] }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <a
      ref={ref}
      href="https://m-re.org/"
      target="_blank"
      rel="noopener"
      className="madewith"
    >
      Made with{" "}
      <span className="heart" aria-hidden="true">
        ❤
        <span className="heart-mini heart-mini--1">❤</span>
        <span className="heart-mini heart-mini--2">❤</span>
      </span>{" "}
      <span className="madewith__name">Mre Creative</span>
    </a>
  );
}

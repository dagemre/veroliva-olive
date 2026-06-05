"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export type GalleryImage = {
  src: string;
  alt: string;
  /** Şişe fotoğrafı parşömen fon üstünde "contain", diğerleri "cover" gösterilir. */
  kind: "bottle" | "photo";
};

/**
 * Ürün galerisi — solda dikey küçük resimler (mobilde ana görselin altında yatay),
 * sağda büyük ana görsel. Tüm ürün sayfalarında ortak.
 */
export default function ProductGallery({
  images,
  medal,
}: {
  images: GalleryImage[];
  medal?: "gold" | "silver";
}) {
  const t = useTranslations("productPage");
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      {/* Küçük resimler */}
      {images.length > 1 && (
        <div
          className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:w-20 lg:flex-col lg:overflow-visible"
          role="tablist"
          aria-label={t("galleryImage")}
        >
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`${t("galleryImage")} ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden border transition-colors lg:w-20 ${
                i === active ? "border-gold" : "border-line hover:border-gold-light"
              } ${img.kind === "bottle" ? "bg-parchment" : "bg-cream-light"}`}
              style={
                img.kind === "bottle"
                  ? { backgroundImage: "url('/images/urun-fon.webp')", backgroundSize: "cover" }
                  : undefined
              }
            >
              <Image
                src={img.src}
                alt=""
                width={160}
                height={160}
                sizes="80px"
                className={`h-full w-full ${img.kind === "bottle" ? "object-contain p-1.5" : "object-cover"}`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Ana görsel */}
      <div
        className={`relative order-1 aspect-square min-w-0 flex-1 overflow-hidden lg:order-2 ${
          current.kind === "bottle" ? "bg-parchment bg-cover bg-center" : "bg-cream-light"
        }`}
        style={
          current.kind === "bottle"
            ? { backgroundImage: "url('/images/urun-fon.webp')" }
            : undefined
        }
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={900}
          height={900}
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className={`h-full w-full ${
            current.kind === "bottle" ? "object-contain p-10 sm:p-14" : "object-cover"
          }`}
        />

        {medal && (
          <span
            className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide ${
              medal === "gold"
                ? "border-gold bg-gold/10 text-gold"
                : "border-ink-soft/40 bg-ink-soft/10 text-ink-soft"
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2 9.5 8.5 2.5 9l5.2 4.6L6 21l6-3.6L18 21l-1.7-7.4L21.5 9l-7-.5L12 2Z" />
            </svg>
            {medal === "gold" ? "Gold" : "Silver"}
          </span>
        )}
      </div>
    </div>
  );
}

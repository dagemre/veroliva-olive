import { preload } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("hero");

  // LCP: hero görsellerini erkenden indir (CSS background'lar normalde
  // geç keşfedilir). Mobil ve masaüstü ayrı görsel kullanıyor.
  preload("/images/hero-mobile.webp", { as: "image", fetchPriority: "high" });
  preload("/images/hero.webp", { as: "image", fetchPriority: "high" });

  return (
    <section
      className="relative -mt-20 flex min-h-[640px] items-end bg-olive bg-cover bg-bottom bg-no-repeat lg:min-h-[720px] lg:items-center"
      style={{ backgroundImage: "url('/images/hero-mobile.webp')" }}
    >
      {/* Masaüstü görseli — mobil görselin üzerine biner (yalnızca lg) */}
      <div
        className="pointer-events-none absolute inset-0 hidden bg-cover bg-center bg-no-repeat lg:block"
        aria-hidden="true"
        style={{ backgroundImage: "url('/images/hero.webp')" }}
      />
      {/* Üstten krem geçiş — header harmanı (her boyutta) */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(244,239,224,0.95) 0%, rgba(238,229,202,0.6) 90px, rgba(238,229,202,0) 240px)",
        }}
      />
      {/* Mobil: alttan yukarı siyah gradyen (yazı okunurluğu) */}
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 22%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0) 60%)",
        }}
      />
      {/* Masaüstü: soldan koyu geçiş (orijinal düzen) */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(35,42,20,0.6) 0%, rgba(35,42,20,0.3) 55%, rgba(35,42,20,0.08) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 pt-32 sm:px-6 lg:px-8 lg:pb-20 lg:pt-40">
        {/* Mobil: yazılar görselin altında alt alta — Masaüstü: orijinal sol-orta */}
        <div className="flex max-w-xl flex-col">
          <h1 className="font-display text-4xl leading-tight text-cream sm:text-5xl lg:text-[3.4rem]">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/90 sm:text-base lg:mt-6">
            {t("text")}
          </p>
          <Link
            href="/koleksiyon"
            className="mt-7 inline-flex items-center gap-3 self-start border border-gold-light px-7 py-3.5 text-[13px] font-medium tracking-wide text-cream transition-colors hover:bg-gold-light/15 lg:mt-9"
          >
            {t("cta")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

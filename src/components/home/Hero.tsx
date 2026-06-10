import { preload } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("hero");

  // LCP: hero arka plan görselini erkenden indir (CSS background'lar
  // normalde geç keşfedilir, preload ile LCP < 2.5s hedeflenir).
  preload("/images/hero.webp", { as: "image", fetchPriority: "high" });

  return (
    <section
      className="relative -mt-20 flex min-h-[640px] items-end bg-olive bg-cover bg-[right_bottom] lg:min-h-[760px]"
      style={{
        backgroundImage:
          // 1) üstten krem geçiş (header harmanı) 2) alttan yukarı siyah gradyen (yazı okunurluğu) 3) görsel
          "linear-gradient(to bottom, rgba(244,239,224,0.95) 0%, rgba(238,229,202,0.6) 90px, rgba(238,229,202,0) 240px), linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 22%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0) 60%), url('/images/hero.webp')",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-32 sm:px-6 lg:px-8 lg:pb-16">
        {/* Yazılar görselin altında alt alta */}
        <div className="flex max-w-xl flex-col">
          <h1 className="font-display text-4xl leading-tight text-cream sm:text-5xl lg:text-[3.4rem]">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/90 sm:text-base">
            {t("text")}
          </p>
          <Link
            href="/koleksiyon"
            className="mt-7 inline-flex items-center gap-3 self-start border border-gold-light px-7 py-3.5 text-[13px] font-medium tracking-wide text-cream transition-colors hover:bg-gold-light/15"
          >
            {t("cta")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

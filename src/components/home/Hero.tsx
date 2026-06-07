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
      className="relative -mt-20 flex min-h-[640px] items-start bg-olive bg-cover bg-[68%_center] sm:bg-center lg:min-h-[720px] lg:items-center"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(244,239,224,0.95) 0%, rgba(238,229,202,0.75) 110px, rgba(238,229,202,0) 300px), linear-gradient(to right, rgba(35,42,20,0.6) 0%, rgba(35,42,20,0.3) 55%, rgba(35,42,20,0.08) 100%), url('/images/hero.webp')",
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col self-stretch px-4 pb-16 pt-28 sm:px-6 lg:block lg:self-auto lg:px-8 lg:pb-20 lg:pt-40">
        <div className="flex max-w-xl flex-1 flex-col lg:block">
          <h1 className="font-display text-4xl leading-tight text-cream sm:text-5xl lg:text-[3.4rem]">
            {t("title")}
          </h1>
          {/* Mobil: paragraf + CTA hero'nun alt kısmına iner; masaüstü: başlığın hemen altında */}
          <p className="mt-auto max-w-md text-sm leading-relaxed text-cream/85 sm:text-base lg:mt-6">
            {t("text")}
          </p>
          <Link
            href="/koleksiyon"
            className="mt-6 inline-flex items-center gap-3 self-start border border-gold-light px-7 py-3.5 text-[13px] font-medium tracking-wide text-cream transition-colors hover:bg-gold-light/15 lg:mt-9"
          >
            {t("cta")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

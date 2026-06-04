import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      className="relative flex min-h-[560px] items-center bg-olive bg-cover bg-center lg:min-h-[640px]"
      style={{
        backgroundImage:
          "linear-gradient(to top, #f4efe0 0%, rgba(244,239,224,0) 26%), linear-gradient(to right, rgba(35,42,20,0.72) 0%, rgba(35,42,20,0.35) 55%, rgba(35,42,20,0.1) 100%), url('/images/hero.jpg')",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl leading-tight text-cream sm:text-5xl lg:text-[3.4rem]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-cream/85 sm:text-base">
            {t("text")}
          </p>
          <Link
            href="/koleksiyon"
            className="mt-9 inline-flex items-center gap-3 border border-gold-light px-7 py-3.5 text-[13px] font-medium tracking-wide text-cream transition-colors hover:bg-gold-light/15"
          >
            {t("cta")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

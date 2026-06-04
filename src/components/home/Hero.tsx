import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      className="relative -mt-20 flex min-h-[640px] items-center bg-olive bg-cover bg-center lg:min-h-[720px]"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(244,239,224,0.95) 0%, rgba(238,229,202,0.75) 110px, rgba(238,229,202,0) 300px), linear-gradient(to right, rgba(35,42,20,0.6) 0%, rgba(35,42,20,0.3) 55%, rgba(35,42,20,0.08) 100%), url('/images/hero.jpg')",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-40 sm:px-6 lg:px-8">
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

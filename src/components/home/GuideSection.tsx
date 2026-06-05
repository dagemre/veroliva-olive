import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { posts } from "@/lib/posts";
import Carousel from "./Carousel";

export default function GuideSection() {
  const t = useTranslations("guide");
  const locale = useLocale() as "tr" | "en";

  return (
    <section className="border-t border-line bg-cream-light">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[260px_1fr] lg:gap-14 lg:px-8 lg:py-20">
        {/* Sol tanıtım */}
        <div className="flex flex-col justify-center">
          <h2 className="font-display text-3xl text-ink lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {t("text")}
          </p>
          <Link
            href="/rehber"
            className="mt-7 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink underline-offset-4 transition-colors hover:text-gold"
          >
            {t("cta")} <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Yazı kartları */}
        <Carousel>
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group w-72 shrink-0 snap-start border border-line bg-cream sm:w-80"
            >
              <Link
                href={{ pathname: "/rehber/[slug]", params: { slug: post.slug } }}
                className="block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-parchment">
                  <Image
                    src={`/images/blog/${post.slug}.webp`}
                    alt={post.title[locale]}
                    fill
                    sizes="(min-width: 640px) 320px, 288px"
                    loading="lazy"
                    className="object-cover"
                  />
                  <span className="absolute left-3 top-3 bg-olive px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-cream">
                    {post.tag[locale]}
                  </span>
                </div>
                <h3 className="p-4 text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-gold">
                  {post.title[locale]}
                </h3>
              </Link>
            </article>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage" });
  return buildPageMetadata({
    locale: locale as "tr" | "en",
    path: "/sss",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "faqPage" });

  const faqs = FAQ_KEYS.map((key, i) => ({
    question: t(`items.q${i + 1}`),
    answer: t(`items.a${i + 1}`),
  }));

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd
        data={breadcrumbSchema(locale as "tr" | "en", [
          { name: "Veroliva", path: "/" },
          { name: t("title"), path: "/sss" },
        ])}
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 lg:pb-24 lg:pt-14">
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
            {t("intro")}
          </p>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-semibold text-ink transition-colors hover:text-gold [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-gold transition-transform group-open:rotate-45"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <p className="pb-6 pr-8 text-sm leading-relaxed text-ink-soft">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 border border-gold-light bg-gold-light/80 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light"
            >
              {t("contactCta")} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

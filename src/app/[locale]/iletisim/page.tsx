import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, localBusinessSchema } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";
import ContactForm from "@/components/contact/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return buildPageMetadata({
    locale: locale as "tr" | "en",
    path: "/iletisim",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contactPage" });

  return (
    <>
      <JsonLd data={localBusinessSchema(locale as "tr" | "en")} />
      <JsonLd
        data={breadcrumbSchema(locale as "tr" | "en", [
          { name: "Veroliva", path: "/" },
          { name: t("title"), path: "/iletisim" },
        ])}
      />

      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:pb-24 lg:pt-14 lg:px-8">
          <div className="max-w-xl">
            <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft sm:text-base">
              {t("text")}
            </p>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[340px_1fr] lg:gap-16">
            {/* İletişim bilgileri + B2B */}
            <div className="space-y-10">
              <section aria-labelledby="contact-info-title">
                <h2
                  id="contact-info-title"
                  className="text-[12px] font-bold uppercase tracking-[0.16em] text-gold"
                >
                  {t("infoTitle")}
                </h2>
                <dl className="mt-5 space-y-5 text-sm">
                  <div>
                    <dt className="font-semibold text-ink">{t("addressLabel")}</dt>
                    <dd className="mt-1 leading-relaxed text-ink-soft">
                      {t("address")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink">{t("emailLabel")}</dt>
                    <dd className="mt-1">
                      <a
                        href="mailto:info@verolivaolive.com"
                        className="text-ink-soft underline-offset-4 transition-colors hover:text-gold"
                      >
                        info@verolivaolive.com
                      </a>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="contact-b2b-title"
                className="border border-line bg-cream-light p-6"
              >
                <h2
                  id="contact-b2b-title"
                  className="font-display text-xl text-ink"
                >
                  {t("b2bTitle")}
                </h2>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                  {t("b2bText")}
                </p>
              </section>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}

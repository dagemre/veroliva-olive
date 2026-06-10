import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NewsletterForm from "./NewsletterForm";
import BackToTop from "./BackToTop";
import MadeWith from "./MadeWith";
import FooterColumn from "./FooterColumn";

const SOCIALS = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V5.1c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
      </svg>
    ),
  },
];

type FooterLink = {
  label: string;
  href: React.ComponentProps<typeof Link>["href"];
};

export default function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t("footer.corporate.title"),
      links: [
        { label: t("footer.corporate.about"), href: "/hakkimizda" },
        { label: t("footer.corporate.production"), href: "/uretim" },
        { label: t("footer.corporate.quality"), href: "/kalite" },
        { label: t("footer.corporate.contact"), href: "/iletisim" },
      ],
    },
    {
      title: t("footer.collection.title"),
      links: [
        { label: t("footer.collection.all"), href: "/koleksiyon" },
        { label: t("footer.collection.earlyHarvest"), href: "/koleksiyon" },
        { label: t("footer.collection.classic"), href: "/koleksiyon" },
        { label: t("footer.collection.tins"), href: "/koleksiyon" },
      ],
    },
    {
      title: t("footer.help.title"),
      links: [
        { label: t("footer.help.faq"), href: "/sss" },
        { label: t("footer.help.shipping"), href: "/kargo" },
        { label: t("footer.help.returns"), href: "/iade" },
        { label: t("footer.help.privacy"), href: "/gizlilik" },
      ],
    },
  ];

  return (
    <footer>
      {/* Bülten bandı */}
      <section className="border-y border-line bg-parchment">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:gap-10 lg:px-8">
          {/* Zeytin dalı süslemesi — bant yüksekliğini büyütmeden taşarak büyür */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/zeytindali.svg"
            alt=""
            aria-hidden="true"
            className="-my-6 hidden h-28 w-auto shrink-0 lg:block"
          />

          <h2 className="max-w-xs text-center font-display text-xl text-ink lg:text-left">
            {t("newsletter.title")}
          </h2>

          <div className="flex flex-1 justify-center lg:justify-end">
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Ana footer */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl gap-0 px-4 py-12 text-center sm:grid-cols-2 sm:gap-10 sm:px-6 sm:text-left lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div className="mb-8 sm:mb-0">
            <Image
              src="/Logo.svg"
              alt="Veroliva Zeytinyağı"
              width={170}
              height={47}
              className="mx-auto h-10 w-auto sm:mx-0"
            />
            <div className="mt-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                {t("newsletter.follow")}
              </span>
              <div className="mt-3 flex items-center justify-center gap-4 sm:justify-start">
                {SOCIALS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="text-ink transition-colors hover:text-gold"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          {columns.map((col) => (
            <FooterColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </div>

        {/* Alt bar */}
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:px-8">
            {/* Mobilde sıra: rozetler (1) → copyright (2) → Made with (3); masaüstünde değişmez */}
            <div className="order-2 flex flex-col items-center gap-1.5 lg:order-none lg:flex-row lg:gap-5">
              <p className="text-xs text-ink-soft">
                {t("footer.copyright", { year })}
              </p>
              <MadeWith />
            </div>
            <div className="order-1 flex flex-wrap items-center justify-center gap-4 lg:order-none lg:gap-6">
              {/* Rozetler mobilde de tek satır: kendi içinde sarmalanmaz, yazı/boşluk küçülür */}
              <div className="flex items-center justify-center gap-3 sm:gap-6">
                <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-soft sm:gap-2 sm:text-[11px] sm:tracking-[0.14em]">
                  <svg className="h-[13px] w-[13px] shrink-0 sm:h-[15px] sm:w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M12 3c-4 3-7 4-7 9a7 7 0 0 0 14 0c0-5-3-6-7-9Z" />
                  </svg>
                  {t("footer.badges.natural")}
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-soft sm:gap-2 sm:text-[11px] sm:tracking-[0.14em]">
                  <svg className="h-[13px] w-[13px] shrink-0 sm:h-[15px] sm:w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  {t("footer.badges.securePayment")}
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-soft sm:gap-2 sm:text-[11px] sm:tracking-[0.14em]">
                  <svg className="h-[13px] w-[13px] shrink-0 sm:h-[15px] sm:w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
                    <circle cx="7" cy="17" r="2" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                  {t("footer.badges.fastShipping")}
                </span>
              </div>
              <BackToTop />
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

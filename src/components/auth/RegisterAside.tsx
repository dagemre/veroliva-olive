import Image from "next/image";
import { useTranslations } from "next-intl";

const BENEFIT_ICONS = [
  /* etiket — size özel fırsatlar */
  <g key="tag">
    <path d="M4 4h7l9 9-7 7-9-9V4Z" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </g>,
  /* kutu — hızlı sipariş */
  <g key="box">
    <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
    <path d="M4 7l8 4 8-4M12 11v10" />
  </g>,
  /* kalp — favoriler */
  <path
    key="heart"
    d="M12 20s-7-4.6-9-9.2C1.6 7.4 3.6 4.5 6.8 4.5c2 0 3.6 1.1 4.4 2.7l.8 1.6.8-1.6c.8-1.6 2.4-2.7 4.4-2.7 3.2 0 5.2 2.9 3.8 6.3C19 15.4 12 20 12 20Z"
  />,
  /* kamyon — sipariş takibi */
  <g key="truck">
    <path d="M2 6h12v10H2zM14 9h4l3 3v4h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17.5" cy="17.5" r="1.8" />
  </g>,
] as const;

/* Kayıt sayfası sağ paneli — başlık + üyelik avantajları, görsel zemin. */
export default function RegisterAside() {
  const t = useTranslations("auth.register.aside");

  return (
    <div className="relative h-full min-h-[640px]">
      <Image
        src="/images/hero4.webp"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 55vw, 0px"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(244,239,224,0.96) 0%, rgba(244,239,224,0.88) 45%, rgba(244,239,224,0.35) 75%, rgba(244,239,224,0) 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col px-12 pt-14">
        <h2 className="max-w-md font-display text-3xl leading-snug text-olive-deep xl:text-4xl">
          {t("title")}
        </h2>
        <div className="mt-5 h-px w-12 bg-gold" />
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
          {t("text")}
        </p>

        <ul className="mt-9 flex max-w-sm flex-col gap-7">
          {BENEFIT_ICONS.map((icon, i) => (
            <li key={i} className="flex items-start gap-4">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0 text-olive"
                aria-hidden="true"
              >
                {icon}
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {t(`items.${i}.title`)}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                  {t(`items.${i}.text`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

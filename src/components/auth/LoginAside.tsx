import Image from "next/image";
import { useTranslations } from "next-intl";

/* Giriş sayfası sağ paneli — hero4 görseli üzerinde mühür rozeti ve başlık. */
export default function LoginAside() {
  const t = useTranslations("auth.login");

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
      {/* Üstten hafif krem pus — metin okunurluğu için */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(244,239,224,0.92) 0%, rgba(244,239,224,0.55) 32%, rgba(244,239,224,0) 60%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col px-12 pt-14">
        {/* Mühür rozeti — dairesel yazı */}
        <svg
          width="116"
          height="116"
          viewBox="0 0 120 120"
          className="text-olive"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
          <defs>
            <path id="badge-top" d="M 60,60 m -47,0 a 47,47 0 1,1 94,0" />
            <path id="badge-bottom" d="M 60,60 m -47,0 a 47,47 0 1,0 94,0" />
          </defs>
          <text
            fill="currentColor"
            fontSize="11"
            fontWeight="600"
            letterSpacing="2.5"
            fontFamily="var(--font-body)"
          >
            <textPath href="#badge-top" startOffset="50%" textAnchor="middle">
              {t("badgeTop")}
            </textPath>
          </text>
          <text
            fill="currentColor"
            fontSize="11"
            fontWeight="600"
            letterSpacing="2.5"
            fontFamily="var(--font-body)"
          >
            <textPath href="#badge-bottom" startOffset="50%" textAnchor="middle">
              {t("badgeBottom")}
            </textPath>
          </text>
          {/* Ortada zeytin dalı */}
          <g stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round">
            <path d="M48 72c8-2 16-10 22-24" />
            <ellipse cx="56" cy="58" rx="3" ry="6" transform="rotate(-35 56 58)" />
            <ellipse cx="66" cy="50" rx="3" ry="6" transform="rotate(35 66 50)" />
            <circle cx="61" cy="64" r="2.6" fill="currentColor" stroke="none" />
          </g>
        </svg>

        <h2 className="mt-10 max-w-md font-display text-3xl leading-snug text-olive-deep xl:text-4xl">
          {t("asideTitle")}
        </h2>
      </div>
    </div>
  );
}

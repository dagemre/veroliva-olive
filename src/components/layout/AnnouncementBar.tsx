import { useTranslations } from "next-intl";

export default function AnnouncementBar() {
  const t = useTranslations();

  return (
    <div className="bg-[#d9cc9e] px-4 py-2.5">
      <p className="flex items-center justify-center gap-2 whitespace-nowrap text-[11px] tracking-wide text-ink sm:text-[13px]">
        <span>{t("announcement")}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M1 7h13v9H1z" />
          <path d="M14 10h4l3 3v3h-7" />
          <circle cx="5.5" cy="17.5" r="1.8" />
          <circle cx="17.5" cy="17.5" r="1.8" />
        </svg>
      </p>
    </div>
  );
}

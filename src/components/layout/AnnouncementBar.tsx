import { useTranslations } from "next-intl";

export default function AnnouncementBar() {
  const t = useTranslations();

  return (
    <div className="bg-olive-deep px-4 py-2.5 text-center">
      <p className="text-xs tracking-wide text-cream sm:text-[13px]">
        {t("announcement")}
      </p>
    </div>
  );
}

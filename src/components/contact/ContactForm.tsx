"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/* Tasarım gereği alanlar placeholder ile gösteriliyor; erişilebilirlik için
   her alanın sr-only <label>'ı var (WCAG). */
const inputClass =
  "w-full border border-line bg-white px-4 py-3.5 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-gold";

export default function ContactForm() {
  const t = useTranslations("contactPage.form");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p
        role="status"
        className="border border-line bg-white p-6 text-sm font-medium text-olive"
      >
        {t("success")}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: Supabase'e mesaj kaydı
        setDone(true);
      }}
      className="mt-6 space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="sr-only">
            {t("name")}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder={t("name")}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="sr-only">
            {t("email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("email")}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-phone" className="sr-only">
          {t("phone")}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={t("phone")}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className="sr-only">
          {t("subject")}
        </label>
        <select
          id="contact-subject"
          name="subject"
          defaultValue=""
          className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%3E%3Cpath%20d%3D%22M1%201l5%205%205-5%22%20fill%3D%22none%22%20stroke%3D%22%236B6A58%22%20stroke-width%3D%221.5%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_8px] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
        >
          <option value="" disabled>
            {t("subject")}
          </option>
          <option>{t("subjectGeneral")}</option>
          <option>{t("subjectOrder")}</option>
          <option>{t("subjectWholesale")}</option>
          <option>{t("subjectPrivateLabel")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="sr-only">
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder={t("message")}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="mt-2 flex w-full items-center justify-center gap-2 bg-olive px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep"
      >
        {t("submit")} <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

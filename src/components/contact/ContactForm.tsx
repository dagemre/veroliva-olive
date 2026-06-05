"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// WCAG: tüm alanlar görünür <label> ile etiketli.
const inputClass =
  "w-full border border-line bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-gold";
const labelClass =
  "mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-ink";

export default function ContactForm() {
  const t = useTranslations("contactPage.form");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p role="status" className="border border-line bg-cream-light p-6 text-sm font-medium text-olive">
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
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            {t("name")}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            {t("email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className={labelClass}>
          {t("subject")}
        </label>
        <select id="contact-subject" name="subject" className={inputClass}>
          <option>{t("subjectGeneral")}</option>
          <option>{t("subjectWholesale")}</option>
          <option>{t("subjectPrivateLabel")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="bg-olive px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep"
      >
        {t("submit")}
      </button>
    </form>
  );
}

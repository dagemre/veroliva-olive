"use client";

// Ayarlar: site_settings (tek satır, id=1) — duyuru barı metni + iletişim/IBAN.
// site_settings tablosu database.types'ta yok → sorgular `any` istemciyle yapılır.
// Tablo yoksa (migration çalışmadıysa) kullanıcı bilgilendirilir.

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/cart";
import { formatTRY } from "@/lib/admin";

type Settings = {
  announcement_tr: string;
  announcement_en: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  iban: string;
  bank_account_name: string;
};

const EMPTY: Settings = {
  announcement_tr: "", announcement_en: "", contact_email: "", contact_phone: "",
  contact_address: "", iban: "", bank_account_name: "",
};

const inputCls = "w-full border border-line bg-cream px-3 py-2.5 text-[13px] text-ink focus:border-gold-light focus:outline-none";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft mb-1.5";

export default function AdminSettings() {
  const t = useTranslations("admin");
  const [s, setS] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const sb = getSupabaseBrowser() as any;
    if (!sb) return setLoading(false);
    sb.from("site_settings").select("*").eq("id", 1).maybeSingle().then(
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      ({ data, error }: any) => {
        if (error) {
          setMissing(true);
        } else if (data) {
          setS({
            announcement_tr: data.announcement_tr ?? "", announcement_en: data.announcement_en ?? "",
            contact_email: data.contact_email ?? "", contact_phone: data.contact_phone ?? "",
            contact_address: data.contact_address ?? "", iban: data.iban ?? "", bank_account_name: data.bank_account_name ?? "",
          });
        }
        setLoading(false);
      },
    );
  }, []);

  function set(p: Partial<Settings>) {
    setS((prev) => ({ ...prev, ...p }));
  }

  async function save() {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const sb = getSupabaseBrowser() as any;
    if (!sb) return;
    setBusy(true);
    setMsg(null);
    const { error } = await sb.from("site_settings").update({ ...s, updated_at: new Date().toISOString() }).eq("id", 1);
    setBusy(false);
    setMsg(error ? `⚠ ${error.message}` : t("content.saved"));
  }

  if (loading) return <><AdminPageHeader title={t("nav.settings")} showControls={false} /><p className="py-20 text-center text-sm text-ink-soft">{t("loading")}</p></>;

  return (
    <>
      <AdminPageHeader title={t("nav.settings")} subtitle={t("settings.subtitle")} showControls={false} />

      {missing && (
        <div className="mb-6 border border-[#d8c08a] bg-[#f6eed6] p-4 text-[13px] text-[#7a5a16]">
          {t("settings.missing")}
        </div>
      )}

      <div className="space-y-6">
        <section className="border border-line bg-cream-light p-5">
          <h2 className="font-display text-lg text-ink">{t("settings.announcement")}</h2>
          <p className="mt-1 text-[11px] text-ink-soft">{t("settings.announcementHint")}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <label className={labelCls}>{t("content.descTr")}</label>
              <input className={inputCls} value={s.announcement_tr} onChange={(e) => set({ announcement_tr: e.target.value })} placeholder="İlk Siparişe %15 İndirim ve 1500 TL Üzeri Ücretsiz Kargo." />
            </div>
            <div>
              <label className={labelCls}>{t("content.descEn")}</label>
              <input className={inputCls} value={s.announcement_en} onChange={(e) => set({ announcement_en: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="border border-line bg-cream-light p-5">
          <h2 className="font-display text-lg text-ink">{t("settings.contact")}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <label className={labelCls}>{t("settings.email")}</label>
              <input className={inputCls} value={s.contact_email} onChange={(e) => set({ contact_email: e.target.value })} placeholder="info@verolivaolive.com" />
            </div>
            <div>
              <label className={labelCls}>{t("settings.phone")}</label>
              <input className={inputCls} value={s.contact_phone} onChange={(e) => set({ contact_phone: e.target.value })} />
            </div>
            <div className="lg:col-span-2">
              <label className={labelCls}>{t("settings.address")}</label>
              <input className={inputCls} value={s.contact_address} onChange={(e) => set({ contact_address: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="border border-line bg-cream-light p-5">
          <h2 className="font-display text-lg text-ink">{t("settings.bank")}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <label className={labelCls}>{t("settings.bankName")}</label>
              <input className={inputCls} value={s.bank_account_name} onChange={(e) => set({ bank_account_name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>IBAN</label>
              <input className={`${inputCls} font-mono`} value={s.iban} onChange={(e) => set({ iban: e.target.value })} placeholder="TR.. .... .... .... .... .... .." />
            </div>
          </div>
        </section>

        <section className="border border-line bg-cream-light p-5">
          <h2 className="font-display text-lg text-ink">{t("settings.shipping")}</h2>
          <p className="mt-1 text-[11px] text-ink-soft">{t("settings.shippingHint")}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-[13px]">
            <div className="flex justify-between border border-line bg-cream px-4 py-3">
              <dt className="text-ink-soft">{t("settings.freeThreshold")}</dt>
              <dd className="font-semibold text-ink">{formatTRY(FREE_SHIPPING_THRESHOLD)}</dd>
            </div>
            <div className="flex justify-between border border-line bg-cream px-4 py-3">
              <dt className="text-ink-soft">{t("settings.shippingFee")}</dt>
              <dd className="font-semibold text-ink">{formatTRY(SHIPPING_FEE)}</dd>
            </div>
          </dl>
        </section>

        <div className="flex items-center justify-end gap-4">
          {msg && <span className={`text-[13px] ${msg.startsWith("⚠") ? "text-[#a8503f]" : "text-[#3f6230]"}`}>{msg}</span>}
          <button type="button" onClick={save} disabled={busy || missing} className="bg-olive px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream hover:bg-olive-deep disabled:opacity-60">
            {busy ? t("saving") : t("settings.save")}
          </button>
        </div>
      </div>
    </>
  );
}

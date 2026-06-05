"use client";

// Adreslerim — listele / ekle / düzenle / sil / varsayılan yap.
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAccount } from "@/components/account/AccountShell";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Tables } from "@/lib/database.types";

type AddressRow = Tables<"addresses">;

type FormState = {
  title: string;
  full_name: string;
  phone: string;
  address_line: string;
  district: string;
  city: string;
  postal_code: string;
};

const EMPTY: FormState = {
  title: "",
  full_name: "",
  phone: "",
  address_line: "",
  district: "",
  city: "",
  postal_code: "",
};

const inputCls =
  "h-11 w-full border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-gold-light focus:outline-none";
const labelCls = "mb-1.5 block text-[12px] font-semibold text-ink";

export default function Addresses() {
  const t = useTranslations("accountPage.addresses");
  const tc = useTranslations("checkout");
  const { user } = useAccount();

  const [addresses, setAddresses] = useState<AddressRow[] | null>(null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    setAddresses(data ?? []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  function startEdit(a?: AddressRow) {
    setError(null);
    if (a) {
      setEditing(a.id);
      setForm({
        title: a.title,
        full_name: a.full_name,
        phone: a.phone,
        address_line: a.address_line,
        district: a.district,
        city: a.city,
        postal_code: a.postal_code,
      });
    } else {
      setEditing("new");
      setForm(EMPTY);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.address_line.trim() || !form.district.trim() || !form.city.trim()) {
      setError(tc("required"));
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim() || t("titlePh").replace("örn. ", "").replace("e.g. ", ""),
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      address_line: form.address_line.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
      postal_code: form.postal_code.trim(),
    };

    const result =
      editing === "new"
        ? await supabase.from("addresses").insert({
            ...payload,
            user_id: user.id,
            is_default: (addresses?.length ?? 0) === 0,
          })
        : await supabase.from("addresses").update(payload).eq("id", editing!);

    setSaving(false);
    if (result.error) {
      setError(t("error"));
      return;
    }
    setEditing(null);
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("confirmDelete"))) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.from("addresses").delete().eq("id", id);
    await load();
  }

  async function handleSetDefault(id: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    await load();
  }

  const setF = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const formEl = (
    <form onSubmit={handleSave} className="border border-olive bg-cream-light p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ad-title" className={labelCls}>{t("titleLabel")}</label>
          <input id="ad-title" className={inputCls} placeholder={t("titlePh")} value={form.title} onChange={setF("title")} />
        </div>
        <div>
          <label htmlFor="ad-name" className={labelCls}>{tc("fullName")}</label>
          <input id="ad-name" className={inputCls} value={form.full_name} onChange={setF("full_name")} autoComplete="name" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ad-line" className={labelCls}>{tc("addressLine")}</label>
          <input id="ad-line" className={inputCls} placeholder={tc("addressPh")} value={form.address_line} onChange={setF("address_line")} autoComplete="street-address" />
        </div>
        <div>
          <label htmlFor="ad-district" className={labelCls}>{tc("district")}</label>
          <input id="ad-district" className={inputCls} value={form.district} onChange={setF("district")} />
        </div>
        <div>
          <label htmlFor="ad-city" className={labelCls}>{tc("city")}</label>
          <input id="ad-city" className={inputCls} value={form.city} onChange={setF("city")} />
        </div>
        <div>
          <label htmlFor="ad-phone" className={labelCls}>{tc("phone")}</label>
          <input id="ad-phone" className={inputCls} value={form.phone} onChange={setF("phone")} autoComplete="tel" inputMode="tel" />
        </div>
        <div>
          <label htmlFor="ad-postal" className={labelCls}>{tc("postalCode")}</label>
          <input id="ad-postal" className={inputCls} value={form.postal_code} onChange={setF("postal_code")} inputMode="numeric" />
        </div>
      </div>
      <div aria-live="polite">
        {error && <p className="mt-3 text-[12px] text-[#a04545]">{error}</p>}
      </div>
      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-olive px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-olive-deep disabled:opacity-60"
        >
          {saving ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="border border-line bg-white px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-gold-light"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">{t("title")}</h1>
        {editing === null && (
          <button
            type="button"
            onClick={() => startEdit()}
            className="bg-olive px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-olive-deep"
          >
            + {t("add")}
          </button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {editing === "new" && formEl}

        {addresses === null ? (
          <p className="py-10 text-center text-sm text-ink-soft">…</p>
        ) : addresses.length === 0 && editing === null ? (
          <div className="border border-line bg-cream-light px-5 py-12 text-center">
            <p className="text-sm text-ink-soft">{t("empty")}</p>
          </div>
        ) : (
          addresses.map((a) =>
            editing === a.id ? (
              <div key={a.id}>{formEl}</div>
            ) : (
              <div key={a.id} className="border border-line bg-cream-light p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="flex items-center gap-2.5">
                    <span className="text-[14px] font-semibold text-ink">{a.title}</span>
                    {a.is_default && (
                      <span className="border border-gold-light px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">
                        {t("default")}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    {!a.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(a.id)}
                        className="px-2 py-1 text-[11px] font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                      >
                        {t("setDefault")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(a)}
                      aria-label={t("edit")}
                      className="p-1.5 text-ink-soft transition-colors hover:text-ink"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      aria-label={t("delete")}
                      className="p-1.5 text-ink-soft transition-colors hover:text-[#a04545]"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 7h16M9 7V5h6v2M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </span>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                  <span className="font-medium text-ink">{a.full_name}</span>
                  {a.phone && <> — {a.phone}</>}
                  <br />
                  {a.address_line}
                  <br />
                  {a.district} / {a.city}
                  {a.postal_code && <> · {a.postal_code}</>}
                  <br />
                  {a.country}
                </p>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}

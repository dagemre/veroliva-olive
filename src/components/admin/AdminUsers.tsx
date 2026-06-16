"use client";

// Kullanıcılar modülü: kayıtlı profillerin listesi (CRM görünümü) + arama.
// Salt görüntüleme — yetki değişimi güvenlik için panelden yapılmaz (Supabase'den).

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { formatShortDate, type Locale } from "@/lib/admin";

type Profile = {
  id: string;
  full_name: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  is_admin: boolean;
  kvkk_accepted_at: string | null;
  created_at: string;
};

export default function AdminUsers() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    supabase
      .from("profiles")
      .select("id, full_name, first_name, last_name, email, phone, is_admin, kvkk_accepted_at, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Profile[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr-TR");
    if (!term) return rows;
    return rows.filter((r) =>
      [r.full_name, r.first_name, r.last_name, r.email, r.phone]
        .filter(Boolean)
        .some((v) => v!.toLocaleLowerCase("tr-TR").includes(term)),
    );
  }, [rows, q]);

  const name = (p: Profile) => p.full_name || `${p.first_name} ${p.last_name}`.trim() || "—";

  return (
    <>
      <AdminPageHeader title={t("nav.users")} subtitle={t("users.subtitle")} />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-soft">{t("users.count", { count: rows.length })}</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("users.search")}
          className="w-full max-w-xs border border-line bg-cream-light px-3 py-2.5 text-[13px] text-ink focus:border-gold-light focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto border border-line bg-cream-light">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-ink-soft">
              <th className="px-4 py-3 font-semibold">{t("users.col.name")}</th>
              <th className="px-4 py-3 font-semibold">{t("users.col.email")}</th>
              <th className="px-4 py-3 font-semibold">{t("users.col.phone")}</th>
              <th className="px-4 py-3 font-semibold">{t("users.col.joined")}</th>
              <th className="px-4 py-3 font-semibold">{t("users.col.kvkk")}</th>
              <th className="px-4 py-3 font-semibold">{t("users.col.role")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-ink-soft">{t("loading")}</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-ink-soft">{t("empty.users")}</td></tr>}
            {filtered.map((p) => (
              <tr key={p.id} className="text-[13px] text-ink">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-parchment text-[11px] font-semibold text-ink">
                      {(name(p).split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toLocaleUpperCase("tr-TR")).join("")) || "?"}
                    </span>
                    <span className="font-medium">{name(p)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{p.email ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{p.phone ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{formatShortDate(p.created_at, locale)}</td>
                <td className="px-4 py-3">
                  {p.kvkk_accepted_at ? (
                    <span className="text-[12px] text-[#3f6230]">✓ {formatShortDate(p.kvkk_accepted_at, locale)}</span>
                  ) : (
                    <span className="text-[12px] text-ink-soft">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${
                    p.is_admin ? "border-gold-light bg-[#f6eed6] text-[#9a6a22]" : "border-line bg-parchment/60 text-ink-soft"
                  }`}>
                    {p.is_admin ? t("role") : t("usersCard.customer")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

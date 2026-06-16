"use client";

// İletişim kutusu: contact_messages listesi + durum filtresi + detay.
// Mesaj açılınca 'new' → 'read' (UPDATE, admin RLS politikası gerektirir).
// "E-posta ile yanıtla" mailto açar; gönderince elle "Yanıtlandı" işaretlenir.

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AdminPageHeader from "./AdminPageHeader";
import AdminModal from "./AdminModal";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { formatShortDate, type Locale } from "@/lib/admin";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

const STATUSES = ["new", "read", "replied"] as const;

function statusClasses(status: string): string {
  switch (status) {
    case "new":
      return "border-[#9bb38a] bg-[#eaf0e2] text-[#3f6230]";
    case "replied":
      return "border-gold-light bg-[#f6eed6] text-[#9a6a22]";
    default:
      return "border-line bg-parchment/60 text-ink-soft";
  }
}

export default function AdminMessages() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<Message | null>(null);

  async function load() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    const { data } = await supabase
      .from("contact_messages")
      .select("id, name, email, phone, subject, message, status, created_at")
      .order("created_at", { ascending: false });
    setRows((data as Message[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(m: Message, status: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setRows((prev) => prev.map((x) => (x.id === m.id ? { ...x, status } : x)));
    setOpen((prev) => (prev && prev.id === m.id ? { ...prev, status } : prev));
    await supabase.from("contact_messages").update({ status }).eq("id", m.id);
  }

  function openMessage(m: Message) {
    setOpen(m);
    if (m.status === "new") setStatus(m, "read");
  }

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );
  const newCount = useMemo(() => rows.filter((r) => r.status === "new").length, [rows]);

  return (
    <>
      <AdminPageHeader
        title={t("messages.title")}
        subtitle={t("messages.subtitle", { count: newCount })}
        showControls={false}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} label={t("messages.filterAll")} />
        {STATUSES.map((s) => (
          <Chip key={s} active={filter === s} onClick={() => setFilter(s)} label={t(`messages.status.${s}`)} />
        ))}
      </div>

      <div className="overflow-x-auto border border-line bg-cream-light">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.06em] text-ink-soft">
              <th className="px-4 py-3 font-semibold">{t("messages.col.from")}</th>
              <th className="px-4 py-3 font-semibold">{t("messages.col.subject")}</th>
              <th className="px-4 py-3 font-semibold">{t("messages.col.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("messages.col.status")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("messages.col.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px] text-ink-soft">{t("loading")}</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-[13px] text-ink-soft">{t("messages.empty")}</td></tr>}
            {filtered.map((m) => (
              <tr key={m.id} className={`text-[13px] text-ink ${m.status === "new" ? "bg-cream/60" : ""}`}>
                <td className="px-4 py-3">
                  <span className="block font-medium">{m.name}</span>
                  <span className="block text-[11px] text-ink-soft">{m.email}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="block text-ink-soft">{m.subject || "—"}</span>
                  <span className="block max-w-[280px] truncate text-[11px] text-ink-soft/80">{m.message}</span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatShortDate(m.created_at, locale)}</td>
                <td className="px-4 py-3">
                  <span className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusClasses(m.status)}`}>
                    {t(`messages.status.${m.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => openMessage(m)} className="text-[12px] font-medium text-olive hover:text-olive-deep">
                    {t("messages.read")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <AdminModal title={open.subject || t("messages.noSubject")} onClose={() => setOpen(null)}>
          <div className="space-y-1 text-[13px]">
            <p className="font-semibold text-ink">{open.name}</p>
            <p className="text-ink-soft">{open.email}{open.phone ? ` · ${open.phone}` : ""}</p>
            <p className="text-[11px] text-ink-soft">{formatShortDate(open.created_at, locale)}</p>
          </div>
          <div className="mt-4 whitespace-pre-wrap border border-line bg-cream p-4 text-[13px] leading-relaxed text-ink">
            {open.message}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            {open.status !== "replied" && (
              <button
                type="button"
                onClick={() => setStatus(open, "replied")}
                className="border border-line px-5 py-2.5 text-[12px] font-medium text-ink-soft hover:text-ink"
              >
                {t("messages.markReplied")}
              </button>
            )}
            <a
              href={`mailto:${open.email}?subject=${encodeURIComponent("Re: " + (open.subject || "Veroliva"))}`}
              className="flex items-center gap-2 bg-olive px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-cream hover:bg-olive-deep"
            >
              {t("messages.replyEmail")}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </AdminModal>
      )}
    </>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active ? "border-olive bg-olive text-cream" : "border-line bg-cream-light text-ink-soft hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

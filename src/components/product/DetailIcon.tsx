// Ürün detay sayfası ikonları — Supabase'deki details jsonb'sinde "icon" anahtarıyla
// seçilir (ör. "leaf", "salad"). Bilinmeyen anahtar zeytin dalı ikonuna düşer.
// Yeni ikon eklerken buraya bir <path> seti ekle; admin paneli bu listeden seçtirecek.

const PATHS: Record<string, React.ReactNode> = {
  leaf: (
    <>
      <path d="M5 19C5 10 10 4.5 19 4c.5 9-4 15-13 15Z" />
      <path d="M5 19c3-5 7-9 11-11" />
    </>
  ),
  press: (
    <>
      <path d="M6 3h12v4H6z" />
      <path d="M8 7v3c0 1.5 1 2.5 2.5 3l1.5.5 1.5-.5c1.5-.5 2.5-1.5 2.5-3V7" />
      <path d="M12 14v2" />
      <path d="M12 19c0-1.2.8-2 .8-2s.7.8.7 2a.75.75 0 1 1-1.5 0Z" />
    </>
  ),
  drop: (
    <>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
      <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  molecule: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="6" r="1.8" />
      <circle cx="19" cy="6" r="1.8" />
      <circle cx="12" cy="20" r="1.8" />
      <path d="M6.5 7.2 9.8 10M17.5 7.2 14.2 10M12 15v3" />
    </>
  ),
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  olive: (
    <>
      <circle cx="9.5" cy="14.5" r="4.5" />
      <circle cx="16" cy="10" r="3.5" />
      <path d="M14 7c1-3 4-4 6-4-0.5 3-2 5-4.5 5.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  package: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
  salad: (
    <>
      <path d="M4 12h16a8 8 0 0 1-16 0Z" />
      <path d="M9 12c0-3 1.5-5 3-6 1.5 1 3 3 3 6" />
      <path d="M7 9c1-1.5 2.5-2 4-2M17 9c-1-1.5-2.5-2-4-2" />
    </>
  ),
  breakfast: (
    <>
      <circle cx="10" cy="12" r="6" />
      <circle cx="10" cy="12" r="2.5" />
      <path d="M19 6v12M21.5 6v5a2.5 2.5 0 0 1-5 0V6" />
    </>
  ),
  meze: (
    <>
      <path d="M5 11h14v3a6 6 0 0 1-3 5H8a6 6 0 0 1-3-5v-3Z" />
      <path d="M3 11h18M9 8c0-1.5 1.3-1.6 1.3-3M13.5 8c0-1.5 1.3-1.6 1.3-3" />
    </>
  ),
  bread: (
    <>
      <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 1.5 7.7V19H6.5v-5.3A4 4 0 0 1 4 10Z" />
      <path d="M10 9.5c1.5 1.5 1.5 3 0 4.5M14 9.5c1.5 1.5 1.5 3 0 4.5" />
    </>
  ),
  cooking: (
    <>
      <path d="M4 10h16v4a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-4Z" />
      <path d="M2 10h20M9 6c0-1.5 1.3-1.6 1.3-3M14 6c0-1.5 1.3-1.6 1.3-3" />
    </>
  ),
  oven: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="1" />
      <path d="M3 9h18M7 6.5h.01M11 6.5h.01M15 6.5h.01" />
      <rect x="7" y="12" width="10" height="5" />
    </>
  ),
  sauce: (
    <>
      <path d="M10 3h4v3l1.5 2v12a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V8L10 6V3Z" />
      <path d="M8.5 13h7" />
    </>
  ),
  truck: (
    <>
      <rect x="1" y="5" width="14" height="11" />
      <path d="M15 9h4l3 4v3h-7V9Z" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 11.5 2 2 4-4.5" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
};

export default function DetailIcon({
  name,
  size = 26,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name] ?? PATHS.olive}
    </svg>
  );
}

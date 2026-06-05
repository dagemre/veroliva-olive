/* Etiketli form alanı — sağda alan tipine göre ikon (tasarımdaki gibi). */

const ICONS = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
    </>
  ),
} as const;

export default function AuthInput({
  id,
  label,
  icon,
  ...props
}: {
  id: string;
  label: string;
  icon: keyof typeof ICONS;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-medium text-ink"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="w-full border border-line bg-white px-4 py-3 pr-11 text-sm text-ink placeholder:text-ink-soft/70 focus:border-gold focus:outline-none"
          {...props}
        />
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {ICONS[icon]}
        </svg>
      </div>
    </div>
  );
}

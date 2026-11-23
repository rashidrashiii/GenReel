/** The genreel mark: a "g" whose bowl is a film reel and whose tail is film running off it (same as public/logo.svg). */
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="15" fill="#0a140f" />
      <circle cx="31" cy="27" r="15" fill="#ffd34d" />
      <circle cx="31" cy="18.5" r="2.6" fill="#0a140f" />
      <circle cx="38.36" cy="22.75" r="2.6" fill="#0a140f" />
      <circle cx="38.36" cy="31.25" r="2.6" fill="#0a140f" />
      <circle cx="31" cy="35.5" r="2.6" fill="#0a140f" />
      <circle cx="23.64" cy="31.25" r="2.6" fill="#0a140f" />
      <circle cx="23.64" cy="22.75" r="2.6" fill="#0a140f" />
      <circle cx="31" cy="27" r="2.4" fill="#0a140f" />
      <path d="M46 26v13c0 8-6 13-15 13h-6" fill="none" stroke="#ffd34d" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/** Accessible bilingual wordmark shared across public surfaces. */
export default function BrandMark({
  subtitle = true,
  className = "",
  onDark = false,
}: {
  subtitle?: boolean;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={`inline-flex min-w-0 flex-col leading-none ${className}`} aria-label="OurClinic | عيادتنا">
      <span className="logo-shine relative inline-block overflow-hidden">
        <span className={`block text-[1.08rem] font-extrabold uppercase tracking-[0.08em] ${onDark ? "text-white" : "text-navy-900"}`}>
          OURCLINIC
        </span>
        <svg
          viewBox="0 0 118 8"
          aria-hidden="true"
          className={`logo-pulse-line mt-0.5 h-1.5 w-full ${onDark ? "text-cyan-200/80" : "text-brand-500/80"}`}
        >
          <path
            d="M2 5 H38 L43 2 L48 6 L54 1.8 L60 5 H116"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      </span>
      {subtitle && (
        <span className={`mt-0.5 text-[8.5px] font-semibold uppercase tracking-[0.26em] ${onDark ? "text-cyan-100/80" : "text-brand-500"}`}>
          <span lang="ar" dir="rtl">عيادتنا</span>
        </span>
      )}
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M2.5 13.5 21 4l-6 16-3.5-6.5L2.5 13.5Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          <path d="M21 4 11.5 13.5" stroke="white" strokeWidth="0.9" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight text-slate-900">
          Sky Transport
        </span>
        <span className="block text-[11px] font-medium uppercase tracking-wider text-brand-600">
          Solutions
        </span>
      </span>
    </span>
  );
}

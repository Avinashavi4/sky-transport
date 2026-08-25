import Link from "next/link";

import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur no-print">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Sky Transport Solutions home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Track
          </Link>
          <Link
            href="/dispatch"
            className="rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Operations
          </Link>
        </nav>
      </div>
    </header>
  );
}

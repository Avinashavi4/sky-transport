"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TrackingSearch({ samples = [] }: { samples?: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/track/${encodeURIComponent(trimmed.toUpperCase())}`);
  }

  return (
    <div>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a tracking number, e.g. STS-2026-00042"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          aria-label="Tracking number"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          Track
        </button>
      </form>

      {samples.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Try:</span>
          {samples.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => router.push(`/track/${encodeURIComponent(s)}`)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

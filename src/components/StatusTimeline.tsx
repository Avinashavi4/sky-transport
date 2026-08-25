import { STATUS_META } from "@/lib/status";
import { formatDateTime } from "@/lib/format";
import type { TrackingEvent } from "@/lib/types";

export function StatusTimeline({ events }: { events: TrackingEvent[] }) {
  // Newest first.
  const ordered = [...events].reverse();

  return (
    <ol className="relative">
      {ordered.map((event, index) => {
        const meta = STATUS_META[event.status];
        const isLatest = index === 0;
        const isLast = index === ordered.length - 1;

        return (
          <li key={`${event.status}-${event.timestamp}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[7px] top-4 h-full w-px bg-slate-200"
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white ${meta.dot} ${
                isLatest ? "scale-110" : ""
              }`}
            />
            <div className="-mt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span
                  className={`text-sm font-semibold ${
                    isLatest ? "text-slate-900" : "text-slate-700"
                  }`}
                >
                  {meta.label}
                </span>
                <span className="text-xs text-slate-400">{event.location}</span>
              </div>
              <p className="mt-0.5 text-sm text-slate-600">{event.note}</p>
              <p className="mt-1 text-xs text-slate-400">{formatDateTime(event.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

import { STATUS_META } from "@/lib/status";
import type { ShipmentStatus } from "@/lib/types";

interface RouteProgressProps {
  originLabel: string;
  destinationLabel: string;
  currentLocation: string;
  status: ShipmentStatus;
  progress: number; // 0..1
}

export function RouteProgress({
  originLabel,
  destinationLabel,
  currentLocation,
  status,
  progress,
}: RouteProgressProps) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  const delayed = status === "exception";
  const barColor = delayed ? "bg-rose-400" : "bg-brand-500";

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>{originLabel}</span>
        <span>{destinationLabel}</span>
      </div>

      <div className="relative mt-3 h-2 rounded-full bg-slate-200">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pct}%` }}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow ${
              delayed ? "bg-rose-500" : "bg-brand-600"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor">
              <path d="M2.5 13.5 21 4l-6 16-3.5-6.5L2.5 13.5Z" />
            </svg>
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600">
        <span className={`font-medium ${delayed ? "text-rose-600" : "text-slate-900"}`}>
          {STATUS_META[status].label}
        </span>
        {" · "}
        {status === "delivered" ? "Completed at " : "Currently near "}
        <span className="font-medium text-slate-900">{currentLocation}</span>
      </p>
    </div>
  );
}

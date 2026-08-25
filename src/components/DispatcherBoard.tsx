"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, placeLabel } from "@/lib/format";
import type { Shipment } from "@/lib/types";

type ActionKind = "advance" | "delay";

export function DispatcherBoard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/shipments", { cache: "no-store" });
    const data = await res.json();
    setShipments(data.shipments);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function act(trackingNumber: string, action: ActionKind) {
    setBusy(trackingNumber);
    try {
      await fetch(`/api/shipments/${encodeURIComponent(trackingNumber)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    setBusy("__reset__");
    try {
      await fetch("/api/reset", { method: "POST" });
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  const active = shipments.filter((s) => s.status !== "delivered").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operations</h1>
          <p className="mt-1 text-sm text-slate-600">
            {loading ? "Loading shipments…" : `${active} active · ${shipments.length} total`}. Advance a
            shipment and the customer is notified automatically.
          </p>
        </div>
        <button
          onClick={reset}
          disabled={busy !== null}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Reset sample data
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Shipment</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Est. delivery</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((s) => {
                const rowBusy = busy === s.trackingNumber;
                const delivered = s.status === "delivered";
                const delayed = s.status === "exception";
                return (
                  <tr key={s.trackingNumber} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/track/${encodeURIComponent(s.trackingNumber)}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {s.trackingNumber}
                      </Link>
                      <div className="text-xs text-slate-500">{s.customerName}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {placeLabel(s.origin)}
                      <span className="text-slate-300"> → </span>
                      {placeLabel(s.destination)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(s.estimatedDelivery)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => act(s.trackingNumber, "advance")}
                          disabled={delivered || rowBusy}
                          className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          {delayed ? "Resume" : "Advance"}
                        </button>
                        <button
                          onClick={() => act(s.trackingNumber, "delay")}
                          disabled={delivered || delayed || rowBusy}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Flag delay
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Tip: open a shipment in another tab, then advance it here to watch the customer view and
        notifications update.
      </p>
    </div>
  );
}

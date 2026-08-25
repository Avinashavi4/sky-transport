import Link from "next/link";
import type { Metadata } from "next";

import { NotificationsFeed } from "@/components/NotificationsFeed";
import { RouteProgress } from "@/components/RouteProgress";
import { SiteHeader } from "@/components/SiteHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { TrackingSearch } from "@/components/TrackingSearch";
import { formatDate, formatDateTime, placeLabel, relativeFromNow } from "@/lib/format";
import { progressFor } from "@/lib/status";
import { getNotificationsForShipment, getShipment } from "@/lib/store";
import type { Shipment } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { trackingNumber: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const tn = decodeURIComponent(params.trackingNumber).toUpperCase();
  return { title: `${tn} — Sky Transport Solutions` };
}

export default function TrackPage({ params }: PageProps) {
  const trackingNumber = decodeURIComponent(params.trackingNumber);
  const shipment = getShipment(trackingNumber);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        {shipment ? <ShipmentView shipment={shipment} /> : <NotFound query={trackingNumber} />}
      </main>
    </div>
  );
}

function ShipmentView({ shipment }: { shipment: Shipment }) {
  const priorStatus = [...shipment.events]
    .reverse()
    .find((e) => e.status !== "exception")?.status;
  const progress = progressFor(shipment.status, priorStatus);
  const notifications = getNotificationsForShipment(shipment.trackingNumber);
  const delivered = shipment.status === "delivered";

  return (
    <div>
      <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Track another shipment
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Tracking number
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {shipment.trackingNumber}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {placeLabel(shipment.origin)} → {placeLabel(shipment.destination)}
            </p>
          </div>
          <div className="text-right">
            <StatusBadge status={shipment.status} />
            <p className="mt-2 text-sm text-slate-500">
              {delivered ? "Delivered" : "Estimated delivery"}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(shipment.estimatedDelivery)}
              {!delivered && (
                <span className="ml-1 font-normal text-slate-500">
                  ({relativeFromNow(shipment.estimatedDelivery)})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <RouteProgress
            originLabel={placeLabel(shipment.origin)}
            destinationLabel={placeLabel(shipment.destination)}
            currentLocation={shipment.currentLocation}
            status={shipment.status}
            progress={progress}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Tracking history</h2>
          <div className="mt-5">
            <StatusTimeline events={shipment.events} />
          </div>
        </section>

        <div className="lg:col-span-2 space-y-6">
          <ShipmentDetails shipment={shipment} />
          {delivered && shipment.proofOfDelivery && (
            <ProofOfDeliveryCard shipment={shipment} />
          )}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Updates we sent</h2>
        <p className="mt-1 text-sm text-slate-500">
          Every status change is pushed to the customer automatically — no need to call in.
        </p>
        <div className="mt-4">
          <NotificationsFeed notifications={notifications} />
        </div>
      </section>
    </div>
  );
}

function ShipmentDetails({ shipment }: { shipment: Shipment }) {
  const rows: [string, string][] = [
    ["Service", serviceLabel(shipment.service)],
    ["Pieces", String(shipment.pieces)],
    ["Weight", `${shipment.weightKg} kg`],
    ["Origin", placeLabel(shipment.origin)],
    ["Destination", placeLabel(shipment.destination)],
    ["Booked", formatDateTime(shipment.createdAt)],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Shipment details</h2>
      <dl className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ProofOfDeliveryCard({ shipment }: { shipment: Shipment }) {
  const pod = shipment.proofOfDelivery!;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-emerald-800">Proof of delivery</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-emerald-700/80">Signed by</dt>
          <dd className="font-medium text-emerald-900">{pod.signedBy}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-emerald-700/80">Delivered</dt>
          <dd className="font-medium text-emerald-900">{formatDateTime(pod.deliveredAt)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-emerald-700/80">Note</dt>
          <dd className="font-medium text-emerald-900">{pod.photoNote}</dd>
        </div>
      </dl>
      <Link
        href={`/track/${encodeURIComponent(shipment.trackingNumber)}/pod`}
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        View & download receipt
      </Link>
    </div>
  );
}

function NotFound({ query }: { query: string }) {
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">
        We couldn&apos;t find {query ? <span className="font-mono">{query}</span> : "that shipment"}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Double-check the tracking number and try again. It looks like{" "}
        <span className="font-mono">STS-2026-00042</span>.
      </p>
      <div className="mt-6 text-left">
        <TrackingSearch />
      </div>
    </div>
  );
}

function serviceLabel(service: Shipment["service"]): string {
  if (service === "express") return "Express";
  if (service === "freight") return "Freight (LTL)";
  return "Standard";
}

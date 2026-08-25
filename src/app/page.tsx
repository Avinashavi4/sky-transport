import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { TrackingSearch } from "@/components/TrackingSearch";
import { getShipments } from "@/lib/store";

export default function HomePage() {
  const samples = getShipments()
    .slice(0, 3)
    .map((s) => s.trackingNumber);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-5">
        <section className="py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Shipment tracking
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Know where your shipment is — without picking up the phone.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Enter your tracking number for a live status, an up-to-date delivery
            estimate, and proof of delivery the moment it arrives.
          </p>

          <div className="mt-8 max-w-2xl">
            <TrackingSearch samples={samples} />
          </div>
        </section>

        <section className="grid gap-4 border-t border-slate-200 py-10 sm:grid-cols-3">
          <Feature
            title="Live status"
            body="Every scan from pickup to delivery, in plain language and in one place."
          />
          <Feature
            title="Proactive updates"
            body="We message you at each step, so 'where is my order?' answers itself."
          />
          <Feature
            title="Proof of delivery"
            body="See who signed and when, and download a receipt as soon as it's delivered."
          />
        </section>

        <footer className="border-t border-slate-200 py-8 text-sm text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Sky Transport Solutions</span>
            <Link href="/dispatch" className="font-medium text-brand-600 hover:text-brand-700">
              Operations view →
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-600">{body}</p>
    </div>
  );
}

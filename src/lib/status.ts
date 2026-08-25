import type { ShipmentStatus } from "./types";

// The main happy-path a shipment moves through, in order.
export const STATUS_FLOW: ShipmentStatus[] = [
  "booked",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

interface StatusMeta {
  label: string;
  short: string;
  description: string;
  // Tailwind classes for the badge.
  badge: string;
  dot: string;
}

export const STATUS_META: Record<ShipmentStatus, StatusMeta> = {
  booked: {
    label: "Booked",
    short: "Booked",
    description: "Booking confirmed and scheduled for pickup.",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
  },
  picked_up: {
    label: "Picked up",
    short: "Picked up",
    description: "Collected from the origin and scanned into the network.",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  in_transit: {
    label: "In transit",
    short: "In transit",
    description: "Moving through the network toward the destination.",
    badge: "bg-brand-50 text-brand-700 ring-brand-200",
    dot: "bg-brand-500",
  },
  out_for_delivery: {
    label: "Out for delivery",
    short: "Out for delivery",
    description: "On the final vehicle and arriving today.",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  delivered: {
    label: "Delivered",
    short: "Delivered",
    description: "Delivered and signed for at the destination.",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  exception: {
    label: "Delayed",
    short: "Delayed",
    description: "Held up in the network. A new estimate has been issued.",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
};

export function isTerminal(status: ShipmentStatus): boolean {
  return status === "delivered";
}

// Progress from 0..1 for the route bar. Exceptions keep whatever
// forward progress the shipment already had.
export function progressFor(status: ShipmentStatus, priorStatus?: ShipmentStatus): number {
  const effective = status === "exception" ? priorStatus ?? "in_transit" : status;
  const idx = STATUS_FLOW.indexOf(effective);
  if (idx < 0) return 0.4;
  return idx / (STATUS_FLOW.length - 1);
}

// Given the current status, what does "advance" move to?
export function nextStatus(current: ShipmentStatus): ShipmentStatus | null {
  if (current === "delivered") return null;
  if (current === "exception") return "in_transit"; // recover from a delay
  const idx = STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

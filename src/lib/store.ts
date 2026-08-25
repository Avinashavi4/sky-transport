import fs from "node:fs";
import path from "node:path";

import { buildSeedShipments } from "./seed";
import { STATUS_META, nextStatus } from "./status";
import type {
  Notification,
  NotificationChannel,
  Shipment,
  ShipmentStatus,
  TrackingEvent,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "shipments.json");

// Module-level cache. In a single Node process this is shared across every
// request, which is all a demo needs. The JSON file keeps state across restarts
// when the filesystem is writable, and we fall back to memory-only when it isn't.
let cache: Shipment[] | null = null;

function load(): Shipment[] {
  if (cache) return cache;

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    cache = JSON.parse(raw) as Shipment[];
  } catch {
    cache = buildSeedShipments();
    persist();
  }

  return cache;
}

function persist(): void {
  if (!cache) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch {
    // Read-only filesystem (e.g. a serverless host). State stays in memory.
  }
}

export function getShipments(): Shipment[] {
  return [...load()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getShipment(trackingNumber: string): Shipment | undefined {
  const key = trackingNumber.trim().toUpperCase();
  return load().find((s) => s.trackingNumber.toUpperCase() === key);
}

function firstName(fullName: string): string {
  return fullName.split(" ")[0];
}

const SMS_STATUSES: ShipmentStatus[] = ["out_for_delivery", "delivered", "exception"];

function channelFor(status: ShipmentStatus): NotificationChannel {
  return SMS_STATUSES.includes(status) ? "sms" : "email";
}

function messageFor(shipment: Shipment, event: TrackingEvent): { subject: string; body: string } {
  const tn = shipment.trackingNumber;
  const to = shipment.destination.city;
  const from = shipment.origin.city;
  const name = firstName(shipment.customerName);
  const eta = new Date(shipment.estimatedDelivery).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  switch (event.status) {
    case "booked":
      return {
        subject: `Booking confirmed — ${tn}`,
        body: `Hi ${name}, we've received your shipment ${tn} from ${from} to ${to}. We'll keep you posted as it moves.`,
      };
    case "picked_up":
      return {
        subject: `Picked up — ${tn}`,
        body: `Your shipment ${tn} has been picked up in ${from} and is on its way to ${to}.`,
      };
    case "in_transit":
      return {
        subject: `In transit — ${tn}`,
        body: `Your shipment ${tn} is in transit to ${to}. Estimated delivery ${eta}.`,
      };
    case "out_for_delivery":
      return {
        subject: `Out for delivery — ${tn}`,
        body: `Your shipment ${tn} is out for delivery in ${to} and arriving today.`,
      };
    case "delivered":
      return {
        subject: `Delivered — ${tn}`,
        body: `Your shipment ${tn} was delivered in ${to}${
          shipment.proofOfDelivery ? `, signed by ${shipment.proofOfDelivery.signedBy}` : ""
        }. Thanks for shipping with Sky.`,
      };
    case "exception":
      return {
        subject: `Delay on ${tn}`,
        body: `Your shipment ${tn} is delayed near ${event.location}. Revised estimate ${eta}. Sorry for the holdup — we're on it.`,
      };
  }
}

// One notification per genuine status change (repeated in-transit scans don't
// re-notify). Derived from the event log so events stay the single source of truth.
function notificationsForShipment(shipment: Shipment): Notification[] {
  const out: Notification[] = [];
  let previous: ShipmentStatus | null = null;

  shipment.events.forEach((event, index) => {
    if (event.status === previous) {
      previous = event.status;
      return;
    }
    previous = event.status;

    const channel = channelFor(event.status);
    const { subject, body } = messageFor(shipment, event);
    out.push({
      id: `${shipment.trackingNumber}-${index}`,
      trackingNumber: shipment.trackingNumber,
      customerName: shipment.customerName,
      channel,
      to: channel === "sms" ? shipment.customerPhone : shipment.customerEmail,
      subject,
      body,
      sentAt: event.timestamp,
    });
  });

  return out;
}

export function getNotificationsForShipment(trackingNumber: string): Notification[] {
  const shipment = getShipment(trackingNumber);
  if (!shipment) return [];
  return notificationsForShipment(shipment).sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
  );
}

export function getAllNotifications(): Notification[] {
  return load()
    .flatMap(notificationsForShipment)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

function eventForStatus(shipment: Shipment, status: ShipmentStatus): TrackingEvent {
  const origin = `${shipment.origin.city}, ${shipment.origin.state}`;
  const destination = `${shipment.destination.city}, ${shipment.destination.state}`;
  const timestamp = new Date().toISOString();

  switch (status) {
    case "picked_up":
      return { status, location: origin, note: "Collected from the shipper.", timestamp };
    case "in_transit":
      return {
        status,
        location: shipment.status === "exception" ? shipment.currentLocation : `${shipment.origin.city} sort facility`,
        note: shipment.status === "exception" ? "Back in transit after the earlier delay." : "Departed the origin facility.",
        timestamp,
      };
    case "out_for_delivery":
      return { status, location: destination, note: "Loaded for final delivery.", timestamp };
    case "delivered":
      return { status, location: destination, note: "Delivered and signed for.", timestamp };
    case "exception":
      return {
        status,
        location: shipment.currentLocation,
        note: "Delayed in the network. A revised delivery estimate has been issued.",
        timestamp,
      };
    default:
      return { status, location: origin, note: STATUS_META[status].description, timestamp };
  }
}

function applyStatus(shipment: Shipment, status: ShipmentStatus): void {
  const event = eventForStatus(shipment, status);
  shipment.events.push(event);
  shipment.status = status;
  shipment.currentLocation = event.location;

  if (status === "delivered") {
    shipment.proofOfDelivery = {
      signedBy: shipment.proofOfDelivery?.signedBy ?? "Recipient",
      deliveredAt: event.timestamp,
      photoNote: "Signed for on delivery.",
    };
    shipment.estimatedDelivery = event.timestamp;
  }
}

export function advanceShipment(trackingNumber: string): Shipment | undefined {
  const shipment = getShipment(trackingNumber);
  if (!shipment) return undefined;

  const next = nextStatus(shipment.status);
  if (!next) return shipment; // already delivered

  applyStatus(shipment, next);
  persist();
  return shipment;
}

export function flagDelay(trackingNumber: string): Shipment | undefined {
  const shipment = getShipment(trackingNumber);
  if (!shipment) return undefined;
  if (shipment.status === "delivered" || shipment.status === "exception") return shipment;

  applyStatus(shipment, "exception");
  persist();
  return shipment;
}

// Rebuilds the sample data from seed. Handy for repeatable demos.
export function resetStore(): Shipment[] {
  cache = buildSeedShipments();
  persist();
  return cache;
}

export type ShipmentStatus =
  | "booked"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception";

export type ServiceLevel = "standard" | "express" | "freight";

export type NotificationChannel = "email" | "sms";

export interface TrackingEvent {
  status: ShipmentStatus;
  location: string;
  note: string;
  timestamp: string; // ISO
}

export interface ProofOfDelivery {
  signedBy: string;
  deliveredAt: string; // ISO
  photoNote: string;
}

export interface Place {
  city: string;
  state: string;
}

export interface Shipment {
  trackingNumber: string;
  status: ShipmentStatus;
  service: ServiceLevel;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  origin: Place;
  destination: Place;
  pieces: number;
  weightKg: number;
  currentLocation: string;
  createdAt: string; // ISO
  estimatedDelivery: string; // ISO
  events: TrackingEvent[];
  proofOfDelivery?: ProofOfDelivery;
}

export interface Notification {
  id: string;
  trackingNumber: string;
  customerName: string;
  channel: NotificationChannel;
  to: string;
  subject: string;
  body: string;
  sentAt: string; // ISO
}

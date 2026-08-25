import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { advanceShipment, flagDelay, getShipment } from "@/lib/store";

export const dynamic = "force-dynamic";

interface Context {
  params: { trackingNumber: string };
}

export async function POST(request: Request, { params }: Context) {
  const trackingNumber = decodeURIComponent(params.trackingNumber);

  let action = "advance";
  try {
    const body = await request.json();
    if (body && typeof body.action === "string") action = body.action;
  } catch {
    // No body — default to advance.
  }

  const shipment =
    action === "delay" ? flagDelay(trackingNumber) : advanceShipment(trackingNumber);

  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  // Keep the customer-facing tracking page in sync with the change.
  revalidatePath(`/track/${trackingNumber}`);
  return NextResponse.json({ shipment });
}

export function GET(_request: Request, { params }: Context) {
  const shipment = getShipment(decodeURIComponent(params.trackingNumber));
  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  return NextResponse.json({ shipment });
}

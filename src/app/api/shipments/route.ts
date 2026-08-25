import { NextResponse } from "next/server";

import { getShipments } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ shipments: getShipments() });
}

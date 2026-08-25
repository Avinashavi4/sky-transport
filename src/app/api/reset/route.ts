import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { resetStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export function POST() {
  const shipments = resetStore();
  revalidatePath("/");
  return NextResponse.json({ shipments });
}

import type { Metadata } from "next";

import { DispatcherBoard } from "@/components/DispatcherBoard";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Operations — Sky Transport Solutions",
};

export default function DispatchPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <DispatcherBoard />
      </main>
    </div>
  );
}

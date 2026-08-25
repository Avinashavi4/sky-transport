import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Sky Transport Solutions — Track your shipment",
  description:
    "Track a Sky Transport Solutions shipment: live status, estimated delivery, and proof of delivery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

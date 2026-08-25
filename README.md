# Sky Track

A shipment-tracking portal for a freight/courier operation. Customers look up a
tracking number and get a clear status, a delivery estimate, the full history,
and proof of delivery — instead of calling to ask "where's my shipment?". Every
status change is pushed to them automatically.

Built as a focused project for the Sky Transport Solutions candidate exercise.

## What's in it

- **Customer tracking** (`/`, `/track/[trackingNumber]`) — search, live status,
  route progress, ETA, event timeline, the notifications that were sent, and a
  printable proof-of-delivery receipt.
- **Operations view** (`/dispatch`) — every shipment with "Advance" and "Flag
  delay" controls. Advancing a shipment updates the customer view and sends the
  next notification.
- **Seeded sample data** — eight shipments across every status, generated with
  timestamps relative to now so it always looks current.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS. Data is held in a small
server-side store that persists to a JSON file (`/data`, regenerated from seed on
first run), so there's no database to set up.

## Run it locally

Requires Node 18.18+ (built on Node 22).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Sample tracking numbers to try:

| Tracking number | State |
| --- | --- |
| `STS-2026-00042` | In transit |
| `STS-2026-00051` | Out for delivery |
| `STS-2026-00039` | Delivered (has proof of delivery) |
| `STS-2026-00058` | Delayed |
| `STS-2026-00055` | Booked |

### See the whole loop

1. Open `STS-2026-00051` in one tab.
2. Open `/dispatch` in another and click **Advance** on that shipment.
3. Refresh the tracking tab — the status, timeline, and notifications have moved
   forward. **Reset sample data** on the operations view puts everything back.

## Project layout

```
src/
  app/
    page.tsx                     customer landing + search
    track/[trackingNumber]/      tracking page + printable POD receipt
    dispatch/                    operations view
    api/                         list / advance / delay / reset
  components/                    header, timeline, route bar, badges, feed, board
  lib/
    types.ts                     domain types
    seed.ts                      sample shipments
    store.ts                     the shipment store + notification derivation
    status.ts                    status flow, labels, progress
    format.ts                    date / label helpers
```

## Notes

Notifications are simulated — they're derived from each shipment's event log and
shown as the feed a customer would receive, rather than sent through a real
email/SMS provider. That keeps the app runnable with no accounts or secrets. See
`REPORT.md` for the reasoning behind that and the other trade-offs.

## Build

```bash
npm run build && npm start
```

## Docker

The app builds to a self-contained image (Next.js standalone output).

```bash
docker build -t sky-transport .
docker run --rm -p 3000:3000 sky-transport
```

Then open <http://localhost:3000>.

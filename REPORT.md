# Sky Track — project report

**Track:** Experience (with a good amount of Remove Friction)
**Time spent:** roughly a day of focused work.

---

## The problem

Pick almost any freight or courier operation and you'll find the same pattern: a
big chunk of inbound calls and emails are just *"where is my shipment?"*. The
information exists — it's in the dispatcher's system — but the customer can't see
it, so they call. Every one of those calls costs staff time, interrupts the ops
team, and still leaves the customer feeling like they're chasing.

The frustrating part is that nobody involved actually wants the phone call. The
customer wants an answer; the dispatcher wants to be left alone to move freight.
The call only happens because there's no self-serve way to get the status, and no
push to the customer when something changes.

So the problem I picked: **let a customer answer "where's my shipment?" for
themselves, and cut down the reasons they'd need to ask in the first place.**

## The idea

Two moves, both cheap:

1. **A self-serve tracking page.** Enter a tracking number, get a clear status,
   a delivery estimate, the full history, and proof of delivery once it arrives.
   No login, no phone call.
2. **Proactive updates.** Every time the shipment's status changes, the customer
   gets a message (email or SMS). If they already know it's out for delivery,
   they don't call to ask.

The second half is what actually reduces call volume — the tracking page helps
the people who still check, but the notifications stop many of them needing to.

To make it real (and demoable) I also built the other side: a small **operations
view** where a dispatcher advances a shipment's status. That's the thing that,
in a real business, generates the update. Wiring both sides together lets you see
the whole loop: dispatcher advances a shipment → the customer page updates → a
notification goes out.

## The implementation

It's one Next.js app (App Router, TypeScript, Tailwind) with three surfaces:

- **`/`** — customer landing + tracking search.
- **`/track/[trackingNumber]`** — the tracking page: status, route progress,
  estimated delivery, full timeline, the notifications that were sent, and a
  printable proof-of-delivery receipt once delivered.
- **`/dispatch`** — the operations view: every shipment, with "Advance" and
  "Flag delay" controls.

Data lives in a small server-side store seeded with eight sample shipments in
different states (booked, in transit, out for delivery, delivered, delayed). It
persists to a JSON file so status changes survive a restart, and falls back to
in-memory if the filesystem is read-only. I kept it deliberately simple — no
database server to stand up — because the interesting part is the flow, not the
storage.

The notifications aren't wired to a real email/SMS provider. They're **derived
from the event log** — one message per genuine status change — and rendered as
the feed the customer would receive. Swapping in a real provider (SendGrid,
Twilio) would be a single function; everything upstream already produces the
message content. I chose to simulate it so the whole thing runs with `npm install
&& npm run dev` and nothing else.

**Decisions worth calling out:**

- *Event log as the source of truth.* Status, current location, progress bar, and
  notifications are all derived from one ordered list of events per shipment. That
  keeps them from ever disagreeing with each other.
- *No map API.* A real map needs a key and adds a dependency and a failure mode
  for very little in a status check. A simple origin → destination progress bar
  communicates "how far along am I" just as well and keeps the app self-contained.
- *Simulated notifications over a real provider.* Same reason — I wanted the demo
  to be honest and runnable by anyone, without secrets.

## The result

It works end to end. You can:

- Track any of the eight sample shipments and see status, ETA, history, and
  proof of delivery.
- Open a shipment, then advance it from the operations view, and watch the
  customer page and the notification feed update to match.
- Print / save the delivery receipt as a PDF.

What's intentionally *not* real: notifications are shown, not actually sent; the
store is a JSON file, not a production database; and there's no auth. Those are
the right corners to cut for a two-day evaluation build, and each one has an
obvious upgrade path.

## What I learned / what I'd do next

The thing that surprised me a little is how much of the value is in the
*notifications*, not the tracking page. The page is table stakes; the reason call
volume drops is that people stop needing to look. If I were taking this further,
the notification side is where I'd invest first.

Next steps, roughly in order:

1. **Real delivery channel** — plug the message content into an email/SMS
   provider, add per-customer preferences and quiet hours.
2. **Persistence + auth** — move the store to Postgres, add a login for the
   operations side, and make tracking links signed so they're shareable but not
   guessable.
3. **Ingest instead of manual advance** — in a real operation, status changes come
   from driver scans / a TMS webhook, not a person clicking "Advance." The store
   is already shaped to accept that.
4. **A short "delay" explanation** — when something goes to exception, let the
   dispatcher attach a one-line reason that flows into the customer notification.

---

## Running it

See `README.md`. Short version: `npm install`, then `npm run dev`, then open
`http://localhost:3000`.

## Availability for a call

_(Add your own availability here before sending — e.g. "Weekdays 10:00–13:00 and
15:00–18:00, timezone …")_

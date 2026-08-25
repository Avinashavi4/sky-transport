import { formatDateTime } from "@/lib/format";
import type { Notification } from "@/lib/types";

function ChannelIcon({ channel }: { channel: Notification["channel"] }) {
  if (channel === "sms") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

interface NotificationsFeedProps {
  notifications: Notification[];
  showTracking?: boolean;
  emptyMessage?: string;
}

export function NotificationsFeed({
  notifications,
  showTracking = false,
  emptyMessage = "No notifications yet.",
}: NotificationsFeedProps) {
  if (notifications.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {notifications.map((n) => (
        <li key={n.id} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <ChannelIcon channel={n.channel} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-sm font-medium text-slate-900">{n.subject}</p>
              <span className="text-xs text-slate-400">{formatDateTime(n.sentAt)}</span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
            <p className="mt-1 text-xs text-slate-400">
              {n.channel === "sms" ? "SMS" : "Email"} to {n.to}
              {showTracking ? ` · ${n.trackingNumber}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

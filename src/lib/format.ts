const DATE_TIME = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const DATE_ONLY = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function formatDateTime(iso: string): string {
  return DATE_TIME.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return DATE_ONLY.format(new Date(iso));
}

export function relativeFromNow(iso: string): string {
  const target = new Date(iso).getTime();
  const diffMs = target - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (Math.abs(diffHours) < 1) return "within the hour";
  if (diffHours > 0 && diffHours < 24) return `in about ${diffHours}h`;
  if (diffHours <= 0 && diffHours > -24) return `${Math.abs(diffHours)}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays > 0) return `in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  return `${Math.abs(diffDays)} day${diffDays === -1 ? "" : "s"} ago`;
}

export function placeLabel(place: { city: string; state: string }): string {
  return `${place.city}, ${place.state}`;
}

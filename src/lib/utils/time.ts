export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const UNITS: [string, number][] = [
  ["y", 31536000],
  ["mo", 2592000],
  ["d", 86400],
  ["h", 3600],
  ["m", 60],
];

export function relativeTime(dateString: string): string {
  const diff = (Date.now() - new Date(dateString).getTime()) / 1000;

  if (diff < 60) return "just now";

  for (const [unit, seconds] of UNITS) {
    const value = Math.floor(diff / seconds);
    if (value >= 1) return `${value}${unit} ago`;
  }

  return "just now";
}

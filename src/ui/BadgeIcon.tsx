import type { Badge } from "../game/types";

export function BadgeIcon({ kind, size = 18 }: { kind: Badge["kind"]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "swim" && <><path d="m4 13 6-6 5 3 3 3M10 7 6 4" /><circle cx="17" cy="5" r="2" /><path d="M2 16q3-3 6 0t6 0t6 0M2 21q3-3 6 0t6 0t6 0" /></>}
      {kind === "resilience" && <><path d="M4 9a8 8 0 1 1 0 7M4 4v5h5" /><path d="m9 13 2 2 5-6" /></>}
      {kind === "boards" && <><path d="m2 9 10-5 10 5-10 5L2 9ZM6 11v6q6 5 12 0v-6M22 9v7" /></>}
      {kind === "shop" && <><path d="M4 11v10h16V11M3 4h18l1 6q-2 4-5 0-2 4-5 0-2 4-5 0-2 4-5 0l1-6ZM9 21v-7h6v7" /></>}
      {kind === "gym" && <><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" /></>}
      {kind === "skill" && <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" /></>}
    </svg>
  );
}
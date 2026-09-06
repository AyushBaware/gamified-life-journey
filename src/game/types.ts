/** Engine phases — the story state machine */
export type Phase =
  | "running"
  | "dive"
  | "swim"
  | "exit"
  | "gate"
  | "gateburst"
  | "card"
  | "scripted"
  | "walk"
  | "shopvisit"
  | "complete"
  | "hit"
  | "caught";

/** Hero animation modes */
export type HeroMode =
  | "idle"
  | "run"
  | "jump"
  | "dive"
  | "swim"
  | "exit"
  | "stumble"
  | "caught"
  | "happy"
  | "walk"
  | "wave";

/** Teacher animation modes */
export type TeacherMode =
  | "chase"
  | "sprint"
  | "swing"
  | "catch"
  | "point"
  | "retreat"
  | "idle";

export type Mood = "neutral" | "happy" | "startled" | "determined";

export interface MilestoneCardData {
  eyebrow: string;
  title: string;
  stat: string;
  sub: string;
  xp: number;
}

export type LevelEvent =
  | { kind: "hurdle"; id: string; x: number; label: string; h: number; w: number; variant: "books" | "desk" | "bar" | "bench" | "cone" | "bag" }
  | {
      kind: "slip";
      id: string;
      x: number;
      w: number;
      sign: string;
      popText: string;
      recoveryTitle: string;
      recoverySub: string;
      xp: number;
    }
  | { kind: "swim"; id: string; start: number; end: number; label: string; tooltip: string; xp: number }
  | { kind: "gate"; id: string; x: number; label: string; card: MilestoneCardData }
  | { kind: "shop"; id: string; x: number; title: string; sub: string }
  | { kind: "end"; id: string; x: number };

export interface LevelScript {
  name: string;
  chapterNo: string;
  length: number;
  events: LevelEvent[];
}

export type ObjectStatus = "pending" | "active" | "cleared" | "hit" | "collected" | "waiting" | "unlocked" | "done";

export interface Badge {
  id: string;
  kind: "swim" | "resilience" | "boards" | "shop";
  label: string;
  detail: string;
  xp: number;
}

export interface Toast {
  id: number;
  title: string;
  sub?: string;
  tone: "accent" | "neutral" | "success";
  ttl: number;
  badgeKind?: Badge["kind"];
}

export interface Pop {
  id: number;
  text: string;
  tone: "accent" | "success" | "soft";
}

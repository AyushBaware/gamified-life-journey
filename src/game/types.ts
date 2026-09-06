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
  | "powerup"
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

/** Character outfit stages — the visual growth arc */
export type Outfit = "school" | "twelfth" | "college" | "vesit";

/** Per-chapter color story (sky + accent) */
export interface ChapterTheme {
  accent: string;
  accent2: string;
  skyTop: string;
  skyMid: string;
  horizon: string;
  fog: string;
}

export type MilestoneWeight = "major" | "soft";

export interface MilestoneCardData {
  eyebrow: string;
  title: string;
  stat: string;
  sub: string;
  xp: number;
  weight?: MilestoneWeight;
}

export type LevelEvent =
  | { kind: "hurdle"; id: string; x: number; label: string; h: number; w: number; variant: "books" | "desk" | "bar" | "bench" | "cone" | "bag" | "flask" }
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
  | { kind: "powerup"; id: string; x: number; label: string; detail: string; xp: number; power: "gym" }
  | { kind: "skill"; id: string; x: number; skill: SkillId; xp: number }
  | { kind: "end"; id: string; x: number };

/** Every technology he learns across the journey — the collectible orbs */
export type SkillId =
  | "html" | "css" | "javascript" | "c" | "cpp" | "java"
  | "react" | "node" | "express" | "postgresql" | "sql" | "mongodb" | "threejs" | "iiot";

export interface SkillDef {
  id: SkillId;
  label: string;
  short: string;
  color: string;
  glow: string;
  learned: string;
}

export const SKILLS: Record<SkillId, SkillDef> = {
  html: { id: "html", label: "HTML", short: "<>", color: "#E44D26", glow: "#FF7A4D", learned: "Structured the web from day one." },
  css: { id: "css", label: "CSS", short: "{}", color: "#264DE4", glow: "#5B8CFF", learned: "Made things look the way they should." },
  javascript: { id: "javascript", label: "JavaScript", short: "JS", color: "#F0DB4F", glow: "#FFF07A", learned: "Brought pages to life." },
  c: { id: "c", label: "C", short: "C", color: "#5C6BC0", glow: "#8E9CF0", learned: "Learned how machines really think." },
  cpp: { id: "cpp", label: "C++", short: "C++", color: "#00599C", glow: "#3B93D6", learned: "Objects, pointers, and performance." },
  java: { id: "java", label: "Core Java", short: "Jv", color: "#EA8C1F", glow: "#FFB25E", learned: "Strong OOP foundations." },
  react: { id: "react", label: "React", short: "⚛", color: "#61DAFB", glow: "#A6EEFF", learned: "Component-driven interfaces." },
  node: { id: "node", label: "Node.js", short: "N", color: "#3C873A", glow: "#7BD07A", learned: "JavaScript on the server." },
  express: { id: "express", label: "Express", short: "Ex", color: "#8A9BA8", glow: "#C5D2DC", learned: "Fast, minimal APIs." },
  postgresql: { id: "postgresql", label: "PostgreSQL", short: "Pg", color: "#336791", glow: "#6FA5D4", learned: "Relational data, done right." },
  sql: { id: "sql", label: "SQL", short: "SQL", color: "#E38D49", glow: "#FFB77E", learned: "Asking data the right questions." },
  mongodb: { id: "mongodb", label: "MongoDB", short: "M", color: "#47A248", glow: "#7FD27F", learned: "Documents, vectors, and scale." },
  threejs: { id: "threejs", label: "Three.js", short: "3D", color: "#8B5CF6", glow: "#B99BFF", learned: "The web in three dimensions." },
  iiot: { id: "iiot", label: "IIoT Projects", short: "IoT", color: "#2DD4BF", glow: "#7FEEE0", learned: "Sensors, edge logic, real hardware." },
};

export type VehicleKind = "none" | "scooty";
export type ChaserKind = "teacher" | "officer";

export interface LevelScript {
  name: string;
  chapterNo: string;
  length: number;
  events: LevelEvent[];
  theme: ChapterTheme;
  outfit: Outfit;
  vehicle: VehicleKind;
  chaser: ChaserKind;
  students?: boolean;
}

export type ObjectStatus = "pending" | "active" | "cleared" | "hit" | "collected" | "waiting" | "unlocked" | "done";

export interface Badge {
  id: string;
  kind: "swim" | "resilience" | "boards" | "shop" | "gym" | "skill";
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
  skill?: SkillId;
}

export interface Pop {
  id: number;
  text: string;
  tone: "accent" | "success" | "soft";
}

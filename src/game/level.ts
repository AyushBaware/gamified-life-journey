import type { LevelScript } from "./types";
import { XP } from "./constants";

/**
 * CHAPTER 01 — School Days (JP English High School)
 * Subway-style chase: the teacher is always behind you.
 * Miss a jump → caught → run again.
 * Mid-run: the swimming pool set-piece (9th–10th).
 * After the 10th Boards gate: a happy visit to Father's fruit shop.
 */
export const CHAPTER_1: LevelScript = {
  name: "School Days",
  chapterNo: "01",
  length: 8500,
  events: [
    { kind: "hurdle", id: "h-books", x: 1200, label: "Book Pile", h: 48, w: 58, variant: "books" },
    { kind: "hurdle", id: "h-unit", x: 1950, label: "Unit Test", h: 56, w: 66, variant: "desk" },
    { kind: "hurdle", id: "h-homework", x: 2600, label: "Homework", h: 52, w: 48, variant: "bar" },
    {
      kind: "swim",
      id: "swim-1",
      start: 3200,
      end: 4150,
      label: "Swimming",
      tooltip: "Swimming — 6 months (9th–10th)",
      xp: XP.swim,
    },
    { kind: "hurdle", id: "h-midterm", x: 4850, label: "Mid-Terms", h: 58, w: 70, variant: "bench" },
    {
      kind: "slip",
      id: "s-marathi",
      x: 5550,
      w: 340,
      sign: "Marathi — 9th Std",
      popText: "Failed Marathi — 9th Std",
      recoveryTitle: "↻ Retry & Learn",
      recoverySub: "Back on his feet — the race goes on",
      xp: XP.resilience,
    },
    { kind: "hurdle", id: "h-sports", x: 6250, label: "Sports Day", h: 46, w: 42, variant: "cone" },
    { kind: "hurdle", id: "h-bag", x: 6700, label: "School Bag", h: 44, w: 50, variant: "bag" },
    { kind: "hurdle", id: "h-prelims", x: 7150, label: "Prelims", h: 60, w: 68, variant: "desk" },
    {
      kind: "gate",
      id: "g-tenth",
      x: 7750,
      label: "10th BOARDS",
      card: {
        eyebrow: "ACHIEVEMENT UNLOCKED",
        title: "10th Boards",
        stat: "89.40%",
        sub: "JP English High School",
        xp: XP.gate,
      },
    },
    {
      kind: "shop",
      id: "shop-1",
      x: 8250,
      title: "Visit to Father's Shop",
      sub: "Helping at the family fruit shop in Nagpur.",
    },
    { kind: "end", id: "end", x: 8500 },
  ],
};

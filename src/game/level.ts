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
  theme: { accent: "#FFB86B", accent2: "#F59E0B", skyTop: "#426581", skyMid: "#B0AAA6", horizon: "#EFC69A", fog: "#C1B5A5" },
  outfit: "school",
  vehicle: "none",
  chaser: "teacher",
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
    { kind: "hurdle", id: "h-prelims", x: 6550, label: "Prelims", h: 60, w: 68, variant: "desk" },
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
        weight: "major",
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

/**
 * CHAPTER 02 — 12th Standard (Shri Mathuradas Mohota College of Science, Nagpur)
 * He rides his Activa scooty to college — under 18 — so a TRAFFIC OFFICER
 * chases him instead of the teacher. Real college: big campus, students
 * walking, sun, clouds, birds and plenty of trees. No gym yet.
 */
export const CHAPTER_2: LevelScript = {
  name: "12th Standard",
  chapterNo: "02",
  length: 6400,
  theme: { accent: "#2DD4BF", accent2: "#0EA5E9", skyTop: "#16303A", skyMid: "#4A6B6E", horizon: "#8FC7C0", fog: "#A8C8C4" },
  outfit: "twelfth",
  vehicle: "scooty",
  chaser: "officer",
  students: true,
  events: [
    { kind: "hurdle", id: "h-lab", x: 1150, label: "Lab Bench", h: 56, w: 66, variant: "desk" },
    { kind: "hurdle", id: "h-flask", x: 2150, label: "Chemistry Flask", h: 60, w: 52, variant: "flask" },
    { kind: "hurdle", id: "h-maths", x: 3150, label: "Maths Paper", h: 58, w: 70, variant: "desk" },
    { kind: "hurdle", id: "h-practical", x: 4150, label: "Practical Exam", h: 62, w: 54, variant: "flask" },
    { kind: "hurdle", id: "h-phy", x: 4900, label: "Physics Formulas", h: 50, w: 58, variant: "books" },
    {
      kind: "gate",
      id: "g-twelfth",
      x: 5750,
      label: "12th BOARDS",
      card: {
        eyebrow: "CHECKPOINT",
        title: "12th Boards",
        stat: "63.17%",
        sub: "Shri Mathuradas Mohota College of Science, Nagpur",
        xp: 150,
        weight: "soft",
      },
    },
    { kind: "end", id: "end", x: 6400 },
  ],
};

/**
 * CHAPTER 03 — Graduation, B.Sc IT (2022–2025)
 * Same college, three years. Starts with "Joined Gym" (a real build change),
 * then the skills he learned appear as glowing orbs he collects in stride:
 * HTML → CSS → JavaScript → C → C++ → Core Java. A 1st-year dip is the
 * story beat, recovered with "Focused Up". Ends with Graduation Completed.
 */
export const CHAPTER_3: LevelScript = {
  name: "Graduation · B.Sc IT",
  chapterNo: "03",
  length: 9800,
  theme: { accent: "#22D3EE", accent2: "#2DD4BF", skyTop: "#0F2A3A", skyMid: "#3A6B78", horizon: "#9ED6D2", fog: "#A6CBCB" },
  outfit: "college",
  vehicle: "scooty",
  chaser: "officer",
  students: true,
  events: [
    { kind: "powerup", id: "p-gym", x: 900, label: "Joined Gym", detail: "Started working out — a stronger build.", xp: XP.gym, power: "gym" },
    { kind: "skill", id: "sk-html", x: 1700, skill: "html", xp: XP.skill },
    { kind: "hurdle", id: "h-sem1", x: 2300, label: "Semester 1", h: 56, w: 66, variant: "desk" },
    { kind: "skill", id: "sk-css", x: 2900, skill: "css", xp: XP.skill },
    {
      kind: "slip",
      id: "s-firstyear",
      x: 3600,
      w: 340,
      sign: "1st Year — Low Marks",
      popText: "1st Year — Low Marks",
      recoveryTitle: "🎯 Focused Up",
      recoverySub: "Buckled down — marks climbed back",
      xp: XP.resilience,
    },
    { kind: "skill", id: "sk-js", x: 4500, skill: "javascript", xp: XP.skill },
    { kind: "hurdle", id: "h-practicals", x: 5100, label: "Lab Practicals", h: 60, w: 52, variant: "flask" },
    { kind: "skill", id: "sk-c", x: 5700, skill: "c", xp: XP.skill },
    { kind: "skill", id: "sk-cpp", x: 6400, skill: "cpp", xp: XP.skill },
    { kind: "hurdle", id: "h-project", x: 7000, label: "Final Project", h: 54, w: 62, variant: "books" },
    { kind: "skill", id: "sk-java", x: 7700, skill: "java", xp: XP.skill },
    {
      kind: "gate",
      id: "g-grad",
      x: 8700,
      label: "GRADUATION",
      card: {
        eyebrow: "ACHIEVEMENT UNLOCKED",
        title: "B.Sc IT — Completed",
        stat: "2022–2025",
        sub: "Shri Mathuradas Mohota College of Science, Nagpur",
        xp: XP.gate,
        weight: "major",
      },
    },
    { kind: "end", id: "end", x: 9800 },
  ],
};

export const CHAPTERS: LevelScript[] = [CHAPTER_1, CHAPTER_2, CHAPTER_3];

/**
 * Seed data — real content, never regenerated or guessed.
 * Everything the game displays is sourced from here.
 */

export const playerProfile = {
  hudName: "AYUSH.EXE",
  fullName: "Ayush Baware",
  headline: "Software Engineer · Full-Stack (MERN) · AI/ML",
  location: "Vashi, Navi Mumbai",
  openToRoles: [
    "Software Engineer",
    "UI/UX Developer",
    "Full Stack Engineer",
    "Backend Developer",
  ],
  links: {
    github: "https://github.com/AyushBaware",
    linkedin: "https://www.linkedin.com/in/ayushbaware",
    mainSite: "https://ayush-dev-portfolio-nine.vercel.app",
    resume: "/Ayush_Baware_Resume_2026.pdf",
  },
} as const;

export type ChapterId =
  | "school"
  | "twelfth"
  | "graduation"
  | "mca-cet-boss"
  | "vesit"
  | "finale";

export interface ChapterTheme {
  accent: string;
  accent2: string;
  /** sky gradient stops, top → horizon */
  skyTop: string;
  skyMid: string;
  horizon: string;
  /** silhouette tones far → near */
  far: string;
  mid: string;
  near: string;
  ground: string;
}

export interface ChapterMeta {
  id: ChapterId;
  index: number;
  shortLabel: string; // used on the journey progress bar
  chapterNo: string; // "01"
  title: string; // shown on chapter card
  subtitle?: string;
  years?: string;
  theme: ChapterTheme;
}

export const chapters: ChapterMeta[] = [
  {
    id: "school",
    index: 0,
    shortLabel: "School",
    chapterNo: "01",
    title: "JP English High School",
    subtitle: "where it all began",
    theme: {
      accent: "#FFB86B",
      accent2: "#F59E0B",
      skyTop: "#0B0F19",
      skyMid: "#171633",
      horizon: "#3a2a2a",
      far: "#161b2d",
      mid: "#1b2238",
      near: "#222b45",
      ground: "#0e1322",
    },
  },
  {
    id: "twelfth",
    index: 1,
    shortLabel: "12th",
    chapterNo: "02",
    title: "Shri Mathuradas Mohota College of Science",
    subtitle: "Nagpur",
    theme: {
      accent: "#2DD4BF",
      accent2: "#0EA5E9",
      skyTop: "#0B0F19",
      skyMid: "#0f1f2e",
      horizon: "#123a3a",
      far: "#12202c",
      mid: "#172a38",
      near: "#1d3446",
      ground: "#0d1520",
    },
  },
  {
    id: "graduation",
    index: 2,
    shortLabel: "Grad",
    chapterNo: "03",
    title: "B.Sc IT — Shri Mathuradas Mohota College of Science",
    subtitle: "Nagpur",
    years: "2022–2025",
    theme: {
      accent: "#2DD4BF",
      accent2: "#22D3EE",
      skyTop: "#0B0F19",
      skyMid: "#0e2130",
      horizon: "#10403c",
      far: "#12212d",
      mid: "#182c3a",
      near: "#1e3748",
      ground: "#0d1520",
    },
  },
  {
    id: "mca-cet-boss",
    index: 3,
    shortLabel: "CET",
    chapterNo: "BOSS",
    title: "MCA-CET",
    subtitle: "the grind",
    theme: {
      accent: "#8B5CF6",
      accent2: "#EC4899",
      skyTop: "#0B0F19",
      skyMid: "#1a1030",
      horizon: "#3b1548",
      far: "#181430",
      mid: "#211a40",
      near: "#2a2150",
      ground: "#0f0d1e",
    },
  },
  {
    id: "vesit",
    index: 4,
    shortLabel: "VESIT",
    chapterNo: "04",
    title: "Vivekanand Education Society's Institute of Technology",
    subtitle: "Mumbai",
    years: "2025–2027 (MCA)",
    theme: {
      accent: "#EC4899",
      accent2: "#FBBF24",
      skyTop: "#0B0F19",
      skyMid: "#241233",
      horizon: "#4a1d3a",
      far: "#1c1530",
      mid: "#281a3e",
      near: "#34204d",
      ground: "#100c1c",
    },
  },
  {
    id: "finale",
    index: 5,
    shortLabel: "Now",
    chapterNo: "NOW",
    title: "Present Day — Job Ready",
    theme: {
      accent: "#FBBF24",
      accent2: "#F59E0B",
      skyTop: "#0B0F19",
      skyMid: "#1a1626",
      horizon: "#3b2f14",
      far: "#1a1a2a",
      mid: "#23233a",
      near: "#2d2d48",
      ground: "#110f1c",
    },
  },
];

export const projects = [
  {
    name: "DocuMind AI",
    tagline: "Full-stack RAG document assistant (MERN)",
    description:
      "Upload PDFs, Word docs, PPTs, and scanned images; summarize, extract notes, and chat with your documents. Tesseract.js OCR, Gemini embeddings + MongoDB Atlas Vector Search, Groq for auto session titles.",
    links: { demo: null as string | null, github: "https://github.com/AyushBaware" },
  },
  {
    name: "FinSight",
    tagline: "AI-powered personal finance PWA",
    description:
      "React + Firebase + Tailwind cross-device app with voice-based expense logging, automatic categorization, and a real-time analytics dashboard.",
    links: { demo: null as string | null, github: "https://github.com/AyushBaware" },
  },
  {
    name: "LeetFlow",
    tagline: "See GitHub for details",
    description: "",
    links: { demo: null as string | null, github: "https://github.com/AyushBaware" },
  },
  {
    name: "Adaptive Edge-Computing Smart Lighting System",
    tagline: "Arduino-based IIoT prototype",
    description:
      "PIR, ultrasonic, and LDR sensors control lighting locally with no cloud round-trip. Non-blocking millis()-based logic, PWM dimming, live status/energy-savings readout on an I2C LCD.",
    links: { simulation: null as string | null, github: "https://github.com/AyushBaware" },
  },
];

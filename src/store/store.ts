import { create } from "zustand";
import type { Badge, MilestoneCardData, Phase, Pop, Toast } from "../game/types";

const MUTE_KEY = "ayush-run:muted";

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

let toastSeq = 1;
let popSeq = 1;

interface State {
  screen: "start" | "game" | "finale";
  autoplay: boolean;
  muted: boolean;
  isTouch: boolean;
  ready: boolean;
  paused: boolean;
  hasJumped: boolean;
  badges: Badge[];

  phase: Phase;
  score: number;
  xp: number;
  distanceM: number;
  clearedCount: number;
  totalHurdles: number;

  toasts: Toast[];
  pops: Pop[];
  card: MilestoneCardData | null;
  caught: { meters: number } | null;
  chapterTitle: boolean;

  setScreen: (s: State["screen"]) => void;
  setAutoplay: (v: boolean) => void;
  toggleMute: () => void;
  setIsTouch: (v: boolean) => void;
  setReady: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  setHasJumped: (v: boolean) => void;
  addBadge: (badge: Badge) => void;
  setPhase: (p: Phase) => void;
  setStats: (score: number, xp: number, meters: number, cleared: number) => void;
  setTotalHurdles: (n: number) => void;
  pushToast: (t: Omit<Toast, "id" | "ttl"> & { ttl?: number }, ttl?: number) => void;
  clearToasts: () => void;
  dismissToast: (id: number) => void;
  pushPop: (text: string, tone?: Pop["tone"]) => void;
  removePop: (id: number) => void;
  setCard: (c: MilestoneCardData | null) => void;
  setCaught: (c: { meters: number } | null) => void;
  setChapterTitle: (v: boolean) => void;
  resetRunUI: () => void;
}

export const useStore = create<State>((set) => ({
  screen: "start",
  autoplay: false,
  muted: readMuted(),
  isTouch: false,
  ready: false,
  paused: false,
  hasJumped: false,
  badges: [],

  phase: "running",
  score: 0,
  xp: 0,
  distanceM: 0,
  clearedCount: 0,
  totalHurdles: 0,

  toasts: [],
  pops: [],
  card: null,
  caught: null,
  chapterTitle: false,

  setScreen: (screen) => set({ screen }),
  setAutoplay: (autoplay) => set({ autoplay }),
  toggleMute: () =>
    set((s) => {
      const muted = !s.muted;
      try {
        localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
      } catch {
        /* ignore */
      }
      return { muted };
    }),
  setIsTouch: (isTouch) => set({ isTouch }),
  setReady: (ready) => set({ ready }),
  setPaused: (paused) => set({ paused }),
  setHasJumped: (hasJumped) => set((s) => s.hasJumped === hasJumped ? s : { hasJumped }),
  addBadge: (badge) => set((s) => s.badges.some((b) => b.id === badge.id) ? s : { badges: [...s.badges, badge] }),
  setPhase: (phase) => set({ phase }),
  setStats: (score, xp, distanceM, clearedCount) => set({ score, xp, distanceM, clearedCount }),
  setTotalHurdles: (totalHurdles) => set({ totalHurdles }),
  pushToast: (t, ttl) => set({ toasts: [{ ...t, id: toastSeq++, ttl: ttl ?? t.ttl ?? 3000 }] }),
  clearToasts: () => set({ toasts: [], pops: [] }),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  pushPop: (text, tone = "accent") => set((s) => ({ pops: [...s.pops.slice(-3), { id: popSeq++, text, tone }] })),
  removePop: (id) => set((s) => ({ pops: s.pops.filter((p) => p.id !== id) })),
  setCard: (card) => set({ card }),
  setCaught: (caught) => set({ caught }),
  setChapterTitle: (chapterTitle) => set({ chapterTitle }),
  resetRunUI: () =>
    set({
      phase: "running",
      score: 0,
      xp: 0,
      distanceM: 0,
      clearedCount: 0,
      paused: false,
      hasJumped: false,
      badges: [],
      toasts: [],
      pops: [],
      card: null,
      caught: null,
      chapterTitle: true,
    }),
}));

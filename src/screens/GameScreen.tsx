import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { CHAPTER_1 } from "../game/level";
import { useGameEngine } from "../game/engine";
import { RunnerScene } from "../three/RunnerScene";
import type { ParticleAPI } from "../three/Particles";
import { BadgeTray, HintBar, JourneyBar, Pops, Toasts, TopBar } from "../ui/HUD";
import { CaughtOverlay, ChapterTitle, CompleteCard, HitFlash, MilestoneCard } from "../ui/Cards";
import { useStore } from "../store/store";

export default function GameScreen() {
  const reduced = useReducedMotion() ?? false;
  const particles = useRef<ParticleAPI | null>(null);
  const engine = useGameEngine(CHAPTER_1, particles);

  const action = engine.action;
  const restart = engine.restart;
  const toggleMute = useStore((s) => s.toggleMute);
  const setScreen = useStore((s) => s.setScreen);
  const xp = useStore((s) => s.xp);
  const cleared = useStore((s) => s.clearedCount);
  const totalHurdles = useStore((s) => s.totalHurdles);
  const ready = useStore((s) => s.ready);
  const paused = useStore((s) => s.paused);

  /* keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const interactive = e.target instanceof HTMLElement && e.target.closest("button, a, input, textarea, select");
      if (interactive && !["Escape", "KeyP", "KeyM"].includes(e.code)) return;
      switch (e.code) {
        case "Space":
        case "ArrowUp":
        case "KeyW":
        case "Enter":
          e.preventDefault();
          action();
          break;
        case "KeyM":
          toggleMute();
          break;
        case "Escape":
        case "KeyP":
          e.preventDefault();
          engine.togglePause();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [action, toggleMute, engine.togglePause]);

  return (
    <div
      className="fixed inset-0 select-none overflow-hidden"
      style={{ background: "#0B0F19", ["--accent" as string]: "#FFB86B", ["--accent-2" as string]: "#F59E0B" }}
    >
      <RunnerScene script={CHAPTER_1} sim={engine.sim} particles={particles} reduced={reduced} onReady={engine.markReady} />

      {/* full-screen tap zone */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ zIndex: 10, touchAction: "none" }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          e.preventDefault();
          action();
        }}
      />

      <HitFlash />
      <TopBar chapterName={CHAPTER_1.name} onPause={engine.togglePause} />
      <JourneyBar script={CHAPTER_1} />
      <BadgeTray />
      <Toasts />
      <Pops />
      <HintBar script={CHAPTER_1} />
      <ChapterTitle name={CHAPTER_1.name} chapterNo={CHAPTER_1.chapterNo} />
      <MilestoneCard onContinue={action} />
      <CaughtOverlay onRestart={restart} />
      <CompleteCard onReplay={restart} onPresent={() => setScreen("finale")} xp={xp} cleared={cleared} totalHurdles={totalHurdles} />
      {!ready && <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink/90 text-sm text-slate-300" role="status">Preparing the school path...</div>}
      {paused && <div className="absolute inset-0 z-[60] flex items-center justify-center bg-ink/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Game paused">
        <div className="px-6 text-center">
          <h2 className="font-display text-4xl text-white">Take a breather.</h2>
          <p className="mt-3 text-sm text-slate-300">Your place in the journey is saved.</p>
          <button type="button" onClick={(event) => { engine.togglePause(); if (event.detail > 0) event.currentTarget.blur(); }} className="mt-6 rounded-xl bg-amber px-7 py-3 text-sm font-semibold text-ink">Resume run</button>
          <p className="mt-3 text-[10px] text-slate-400">P or Escape to resume</p>
        </div>
      </div>}
    </div>
  );
}

import { motion } from "framer-motion";
import { Suspense, lazy } from "react";
import { MuteButton, SkipButton } from "../ui/HUD";
import { useStore } from "../store/store";
import { sfx } from "../audio/sfx";

const HeroStage = lazy(() => import("../three/HeroStage").then((m) => ({ default: m.HeroStage })));

/**
 * OPENING — character first. Ayush stands alive on a lit pedestal,
 * the teacher lurking behind him. One button starts the run.
 */
export default function StartScreen() {
  const setScreen = useStore((s) => s.setScreen);
  const setAutoplay = useStore((s) => s.setAutoplay);
  const autoplay = useStore((s) => s.autoplay);
  const isTouch = useStore((s) => s.isTouch);

  const begin = (auto: boolean) => {
    sfx.unlockAudio();
    sfx.play("start");
    setAutoplay(auto);
    setScreen("game");
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 30%, #1C2440 0%, #0B0F19 68%)", ["--accent" as string]: "#FFB86B", ["--accent-2" as string]: "#F59E0B" }}>
      {/* ambient layers */}
      <div className="bg-grid absolute inset-0" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 78%, rgba(255,184,107,0.14) 0%, transparent 55%)" }} />
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${(i * 67) % 100}%`, top: `${(i * 41) % 62}%`, width: 2 + (i % 2), height: 2 + (i % 2), opacity: 0.4, animationDelay: `${(i % 6) * 0.5}s` }}
        />
      ))}

      {/* 3D hero showcase */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <HeroStage mode="idle" showTeacher />
        </Suspense>
      </div>

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3 sm:p-4">
        <div className="hud-panel flex h-9 items-center gap-2.5 rounded-full pl-3 pr-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-bold tracking-[0.2em] text-white">READY TO RUN</span>
        </div>
        <div className="flex items-center gap-2">
          <MuteButton />
          <SkipButton />
        </div>
      </div>

      {/* title — bottom-left anchored, not a centered hero trio */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 pb-7 md:flex-row md:items-end md:justify-between md:px-10">
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--accent)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
              A life, gamified · Chapter 01
            </div>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.55)" }}>
              AYUSH<span style={{ color: "var(--accent)" }}>.</span>EXE
            </h1>
            <p className="mt-3 max-w-md text-sm text-slate-300 sm:text-base">
              Run through Ayush&apos;s real school days — dodge the hurdles, swim the pool, clear the{" "}
              <span className="font-semibold text-white">10th Boards</span>… and whatever you do, don&apos;t let{" "}
              <span className="font-semibold" style={{ color: "var(--accent)" }}>the teacher</span> catch you.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }} className="flex flex-col items-stretch gap-3 md:items-end">
            <button
              type="button"
              onClick={() => begin(false)}
              className="group relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 text-sm font-bold uppercase tracking-[0.2em] text-ink transition hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))", boxShadow: "0 12px 44px rgba(255,184,107,0.4)" }}
            >
              <span className="text-base">▶</span> Press to begin the run
              <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-full" style={{ clipPath: "polygon(20% 0, 45% 0, 25% 100%, 0 100%)" }} />
            </button>
            <div className="flex items-center justify-center gap-3 md:justify-end">
              <button
                type="button"
                onClick={() => begin(true)}
                className={`hud-panel flex h-11 items-center gap-2 rounded-2xl px-5 text-xs font-semibold transition hover:border-white/20 hover:text-white ${autoplay ? "text-white" : "text-slate-300"}`}
              >
                <span style={{ color: "var(--accent)" }}>◎</span> Cinematic mode
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">auto-run</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 md:justify-end">
              {isTouch ? (
                <span className="flex items-center gap-2">
                  <span className="text-sm leading-none">👆</span> Tap anywhere to jump
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="keycap">SPACE</span> jump
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="keycap">M</span> mute
                  </span>
                </>
              )}
              <span className="hidden h-3 w-px bg-white/10 sm:block" />
              <span>School chapter / about 40 seconds</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

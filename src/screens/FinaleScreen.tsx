import { motion } from "framer-motion";
import { Suspense, lazy } from "react";
import { MuteButton } from "../ui/HUD";
import { useStore } from "../store/store";
import { playerProfile } from "../data/profile";
import { sfx } from "../audio/sfx";

const HeroStage = lazy(() => import("../three/HeroStage").then((m) => ({ default: m.HeroStage })));

/**
 * PRESENT DAY — the bookend. Ayush, grown and confident (happy pose),
 * with the real links out to his work.
 */
export default function FinaleScreen() {
  const setScreen = useStore((s) => s.setScreen);

  const replay = () => {
    sfx.play("ui");
    setScreen("start");
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 30%, #241C38 0%, #0B0F19 70%)", ["--accent" as string]: "#FBBF24", ["--accent-2" as string]: "#F59E0B" }}>
      <div className="bg-grid absolute inset-0" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(251,191,36,0.12) 0%, transparent 55%)" }} />

      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <HeroStage mode="happy" showTeacher={false} />
        </Suspense>
      </div>

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3 sm:p-4">
        <div className="hud-panel flex h-9 items-center gap-2.5 rounded-full pl-3 pr-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--accent)" }}>
            Present day
          </span>
          <span className="h-4 w-px bg-white/10" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">Job ready</span>
        </div>
        <div className="flex items-center gap-2">
          <MuteButton />
          <button
            type="button"
            onClick={replay}
            className="hud-panel flex h-9 items-center gap-2 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            ↻ <span className="hidden sm:inline">Replay the run</span>
            <span className="sm:hidden">Replay</span>
          </button>
        </div>
      </div>

      {/* content */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 pb-7 md:flex-row md:items-end md:justify-between md:px-10">
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.26em]" style={{ borderColor: "#4ade8066", color: "#86efac", background: "#4ade8012" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Open to opportunities
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl">{playerProfile.fullName}</h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">{playerProfile.headline}</p>
            <p className="mt-1 text-xs text-slate-500">📍 {playerProfile.location} · School days were just Chapter 01 — more chapters loading…</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {playerProfile.openToRoles.map((r) => (
                <span key={r} className="rounded-full border px-3 py-1.5 text-xs font-semibold text-slate-100" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}>
                  {r}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }} className="flex flex-col gap-2.5">
            <a
              href={playerProfile.links.resume}
              download
              className="flex h-12 items-center justify-center gap-2 rounded-2xl px-8 text-xs font-bold uppercase tracking-[0.18em] text-ink transition hover:brightness-110"
              style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))", boxShadow: "0 12px 40px rgba(251,191,36,0.35)" }}
            >
              ⬇ Download Resume
            </a>
            <div className="grid grid-cols-3 gap-2.5">
              <a href={playerProfile.links.github} target="_blank" rel="noreferrer" className="hud-panel flex h-12 items-center justify-center gap-2 rounded-2xl text-xs font-bold uppercase tracking-[0.14em] text-slate-100 transition hover:border-white/20">
                GitHub
              </a>
              <a href={playerProfile.links.linkedin} target="_blank" rel="noreferrer" className="hud-panel flex h-12 items-center justify-center gap-2 rounded-2xl text-xs font-bold uppercase tracking-[0.14em] text-slate-100 transition hover:border-white/20">
                LinkedIn
              </a>
              <a href={playerProfile.links.mainSite} target="_blank" rel="noreferrer" className="hud-panel flex h-12 items-center justify-center gap-2 rounded-2xl text-xs font-bold uppercase tracking-[0.14em] transition hover:border-white/20" style={{ color: "var(--accent)" }}>
                Main site ↗
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

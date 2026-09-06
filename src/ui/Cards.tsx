import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/store";
import { sfx } from "../audio/sfx";

/* ---------- chapter title banner ---------- */

export function ChapterTitle({ name, chapterNo }: { name: string; chapterNo: string }) {
  const visible = useStore((s) => s.chapterTitle);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="chapter-title"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-none absolute left-1/2 top-[20%] z-30 w-[min(92vw,720px)] -translate-x-1/2 text-center"
        >
          <div className="mx-auto mb-3 h-[2px] w-24" style={{ background: "var(--accent)", boxShadow: "0 0 14px var(--accent)" }} />
          <div className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent sm:text-xs" style={{ color: "var(--accent)" }}>
            Chapter {chapterNo}
          </div>
          <h2 className="font-display mt-2 text-4xl font-bold leading-tight text-white sm:text-6xl" style={{ textShadow: "0 0 26px color-mix(in srgb, var(--accent) 55%, transparent)" }}>
            {name}
          </h2>
          <p className="mt-2 text-sm italic text-slate-300 sm:text-base">— the teacher is already chasing…</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- milestone card (10th Boards) ---------- */

export function MilestoneCard({ onContinue }: { onContinue: () => void }) {
  const card = useStore((s) => s.card);
  const isTouch = useStore((s) => s.isTouch);
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              sfx.play("ui");
              onContinue();
            }
          }}
          className="absolute inset-0 z-40 flex cursor-pointer items-center justify-center bg-ink/40 p-4 backdrop-blur-[3px]"
          style={{ background: "rgba(11,15,25,0.4)" }}
        >
          <motion.div
            initial={{ scale: 0.7, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border p-7 text-center sm:p-8"
            style={{
              background: "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(11,15,25,0.98))",
              borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 60px color-mix(in srgb, var(--accent) 22%, transparent)",
            }}
          >
            {/* rotating rays */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 opacity-25"
              style={{
                background: "conic-gradient(from 0deg, transparent 0 14deg, var(--accent) 14deg 18deg, transparent 18deg 32deg, var(--accent) 32deg 36deg, transparent 36deg 50deg, var(--accent) 50deg 54deg, transparent 54deg 68deg, var(--accent) 68deg 72deg, transparent 72deg 360deg)",
                animation: "spin 14s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: translateX(-50%) rotate(360deg); } }`}</style>

            <div className="relative text-[10px] font-bold uppercase tracking-[0.34em]" style={{ color: "var(--accent)" }}>
              {card.eyebrow}
            </div>

            {/* trophy mark */}
            <div className="relative mx-auto mt-3 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>

            <h3 className="font-display relative mt-3 text-2xl font-bold text-white sm:text-3xl">{card.title}</h3>
            <div
              className="font-display relative mt-1 text-6xl font-bold sm:text-7xl"
              style={{
                background: "linear-gradient(120deg, #ffffff 0%, var(--accent) 55%, var(--accent-2) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 0 44px color-mix(in srgb, var(--accent) 35%, transparent)",
              }}
            >
              {card.stat}
            </div>
            <p className="relative mt-2 text-sm text-slate-400">{card.sub}</p>

            <div className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              <span style={{ color: "var(--accent)" }}>+{card.xp}</span> XP
            </div>

            <button
              type="button"
              onClick={() => {
                sfx.play("ui");
                onContinue();
              }}
              className="relative mt-6 flex w-full items-center justify-center gap-3 rounded-2xl py-3 text-sm font-bold uppercase tracking-[0.18em] text-ink transition hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(90deg, var(--accent), #ffffff)" }}
            >
              Continue the run
              <span className="animate-press-pulse text-[10px] font-semibold tracking-[0.2em] opacity-70">{isTouch ? "TAP" : "SPACE"}</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- caught overlay — game over ---------- */

export function CaughtOverlay({ onRestart }: { onRestart: () => void }) {
  const caught = useStore((s) => s.caught);
  const isTouch = useStore((s) => s.isTouch);
  return (
    <AnimatePresence>
      {caught && (
        <motion.div
          key="caught"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onPointerDown={() => {
            sfx.play("start");
            onRestart();
          }}
          className="absolute inset-0 z-40 flex cursor-pointer items-center justify-center p-4"
          style={{ background: "radial-gradient(ellipse at center, rgba(127,29,29,0.45) 0%, rgba(11,15,25,0.82) 75%)", backdropFilter: "blur(2px)" }}
        >
          <motion.div
            initial={{ scale: 1.6, opacity: 0, rotate: -4 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="w-full max-w-[400px] text-center"
          >
            <div className="text-6xl">👨‍🏫</div>
            <h2 className="font-display mt-2 text-6xl font-bold tracking-tight text-red-300 sm:text-7xl" style={{ textShadow: "0 0 40px rgba(248,113,113,0.45), 0 4px 18px rgba(0,0,0,0.6)" }}>
              CAUGHT!
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              The teacher got you at <span className="font-bold text-white">{caught.meters}m</span>.<br />
              He&apos;s taking you back to the start — this time, <span className="font-semibold text-red-300">jump</span>.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="text-base">💡</span> Tip: press <span className="keycap">SPACE</span> just before an obstacle
            </div>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                sfx.play("start");
                onRestart();
              }}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/15 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-red-200 transition hover:bg-red-500/25 active:scale-[0.98]"
            >
              ↻ Run again
              <span className="animate-press-pulse text-[10px] font-semibold tracking-[0.2em] opacity-70">{isTouch ? "TAP" : "SPACE"}</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- chapter complete ---------- */

export function CompleteCard({ onReplay, onPresent, xp, cleared, totalHurdles }: { onReplay: () => void; onPresent: () => void; xp: number; cleared: number; totalHurdles: number }) {
  const phase = useStore((s) => s.phase);
  return (
    <AnimatePresence>
      {phase === "complete" && (
        <motion.div
          key="complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[3px]"
          style={{ background: "rgba(11,15,25,0.45)" }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.15 }}
            className="relative w-full max-w-[460px] overflow-hidden rounded-3xl border p-7 text-center sm:p-8"
            style={{
              background: "linear-gradient(180deg, rgba(17,24,39,0.96), rgba(11,15,25,0.98))",
              borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 60px color-mix(in srgb, var(--accent) 18%, transparent)",
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.34em]" style={{ color: "var(--accent)" }}>
              Chapter 01 cleared
            </div>
            <h3 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">School Days — done! 🎓</h3>
            <p className="mt-2 text-sm text-slate-400">10th Boards cleared, swimming practice, and a visit to Father&apos;s shop.</p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { v: xp.toLocaleString(), l: "XP" },
                { v: `${cleared}/${totalHurdles}`, l: "Hurdles" },
                { v: "89.40%", l: "10th Boards" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3">
                  <div className="font-display text-xl font-bold text-white">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  sfx.play("ui");
                  onReplay();
                }}
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/10"
              >
                ↻ Replay chapter
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.play("ui");
                  onPresent();
                }}
                className="flex-1 rounded-2xl py-3 text-xs font-bold uppercase tracking-[0.18em] text-ink transition hover:brightness-110"
                style={{ background: "linear-gradient(90deg, var(--accent), #ffffff)" }}
              >
                Present Day ➜
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- red flash on hit ---------- */

export function HitFlash() {
  const phase = useStore((s) => s.phase);
  return (
    <AnimatePresence>
      {(phase === "hit" || phase === "caught") && (
        <motion.div
          key="flash"
          initial={{ opacity: 0.55 }}
          animate={{ opacity: phase === "caught" ? 0.25 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: phase === "caught" ? 0.2 : 0.6 }}
          className="pointer-events-none absolute inset-0 z-20"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(190,30,30,0.5) 100%)" }}
        />
      )}
    </AnimatePresence>
  );
}

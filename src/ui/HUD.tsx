import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store/store";
import { sfx } from "../audio/sfx";
import type { LevelScript, Phase, Toast } from "../game/types";
import { GATE_STOP_DISTANCE, PX, SHOP_STOP_DISTANCE } from "../game/constants";
import { BadgeIcon } from "./BadgeIcon";

/* ---------- shared buttons ---------- */

export function MuteButton() {
  const muted = useStore((s) => s.muted);
  const toggleMute = useStore((s) => s.toggleMute);
  useEffect(() => {
    sfx.setMuted(muted);
  }, [muted]);
  return (
    <button
      type="button"
      onClick={(event) => {
        toggleMute();
        if (muted) sfx.play("ui");
        if (event.detail > 0) event.currentTarget.blur();
      }}
      aria-label={muted ? "Unmute" : "Mute"}
      title={muted ? "Unmute (M)" : "Mute (M)"}
      className={`hud-panel flex h-9 w-9 items-center justify-center rounded-full text-slate-200 transition hover:border-white/20 hover:text-white ${muted ? "opacity-60" : ""}`}
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 5a9 9 0 0 1 0 14" />
        </svg>
      )}
    </button>
  );
}

export function SkipButton() {
  const setScreen = useStore((s) => s.setScreen);
  return (
    <button
      type="button"
      onClick={() => {
        sfx.play("ui");
        setScreen("finale");
      }}
      className="hud-panel group flex h-9 items-center gap-2 rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300 transition hover:border-white/20 hover:text-white"
    >
      <span className="hidden sm:inline">Skip to Present Day</span>
      <span className="sm:hidden">Skip</span>
      <span className="transition group-hover:translate-x-0.5">➜</span>
    </button>
  );
}

/* ---------- top bar ---------- */

export function TopBar({ chapterName, onPause }: { chapterName: string; onPause: () => void }) {
  const score = useStore((s) => s.score);
  const distanceM = useStore((s) => s.distanceM);
  const phase = useStore((s) => s.phase);
  const paused = useStore((s) => s.paused);
  const autoplay = useStore((s) => s.autoplay);
  const setAutoplay = useStore((s) => s.setAutoplay);
  const phaseLabels: Record<Phase, string> = {
    running: "On the path", dive: "Into the pool", swim: "Swimming", exit: "Leaving the pool",
    gate: "10th Boards", gateburst: "Milestone unlocked", card: "10th Boards",
    scripted: "Retry & Learn", walk: "Visiting the shop", shopvisit: "Family shop",
    complete: "Chapter complete", hit: "Watch your step", caught: "Caught",
  };
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[70] flex items-start justify-between gap-2 p-3 sm:p-4">
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="hud-panel flex h-9 items-center gap-2.5 rounded-full pl-3 pr-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-bold tracking-[0.14em] text-white">CH.01<span className="hidden sm:inline"> / {chapterName.toUpperCase()}</span></span>
        </div>
        <button type="button" onClick={(event) => { setAutoplay(!autoplay); if (event.detail > 0) event.currentTarget.blur(); }} aria-pressed={autoplay} aria-label={autoplay ? "Take control: turn cinematic mode off" : "Watch hands-free: turn cinematic mode on"} title={autoplay ? "Cinematic mode. Click to take control." : "Manual mode. Click for cinematic mode."} className={`hud-panel flex h-9 items-center gap-2 rounded-full px-3 text-[10px] font-semibold ${autoplay ? "text-amber-200" : "text-slate-300"}`}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m7 4 9 6-9 6V4Z" /></svg>
          <span className="hidden md:inline">{autoplay ? "Cinematic / Take control" : "Manual play"}</span>
        </button>
        <div className="hidden h-9 items-center text-[10px] tracking-wider text-slate-200 lg:flex">
          {paused ? "Paused" : phaseLabels[phase]}
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <div className="hud-panel flex h-9 items-center gap-3 rounded-full px-3">
          <span className="text-xs font-bold tabular-nums text-white">
            <span className="text-[9px] text-amber-200">XP</span> {score}
          </span>
          <span className="hidden h-4 w-px bg-white/10 sm:block" />
          <span className="hidden text-xs font-semibold tabular-nums text-slate-300 sm:inline">{Math.floor(distanceM)}m</span>
        </div>
        <button type="button" onClick={(event) => { onPause(); if (event.detail > 0) event.currentTarget.blur(); }} aria-label={paused ? "Resume game" : "Pause game"} title="Pause or resume (P)" className="hud-panel flex h-9 w-9 items-center justify-center rounded-full text-slate-200">
          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">{paused ? <path d="m6 3 11 7-11 7V3Z" /> : <><rect x="5" y="4" width="3" height="12" rx="1" /><rect x="12" y="4" width="3" height="12" rx="1" /></>}</svg>
        </button>
        <MuteButton />
        <SkipButton />
      </div>
    </div>
  );
}

/* ---------- toasts ---------- */

function ToastItem({ id, title, sub, tone, ttl, badgeKind }: Toast) {
  const dismiss = useStore((s) => s.dismissToast);
  const paused = useStore((s) => s.paused);
  const remaining = useRef(ttl);
  useEffect(() => {
    if (paused) return;
    const started = performance.now();
    const timer = window.setTimeout(() => dismiss(id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [id, dismiss, paused]);
  const border =
    tone === "success" ? "#4ade8077" : tone === "neutral" ? "rgba(255,255,255,0.12)" : "color-mix(in srgb, var(--accent) 55%, transparent)";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="hud-panel flex items-center gap-3 rounded-xl px-4 py-2.5"
      style={{ borderColor: border }}
    >
      {badgeKind && <span className="shrink-0 text-amber-200"><BadgeIcon kind={badgeKind} size={22} /></span>}
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
      </div>
    </motion.div>
  );
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="pointer-events-none absolute left-1/2 top-16 z-30 flex w-[min(92vw,440px)] -translate-x-1/2 flex-col items-center gap-2 sm:top-[72px]" role="status" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- floating +XP pops near the player ---------- */

function PopItem({ id, text, tone }: { id: number; text: string; tone: string }) {
  const remove = useStore((s) => s.removePop);
  useEffect(() => {
    const t = window.setTimeout(() => remove(id), 1250);
    return () => window.clearTimeout(t);
  }, [id, remove]);
  const color = tone === "success" ? "#86efac" : tone === "soft" ? "#FCA5A5" : "var(--accent)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.8 }}
      animate={{ opacity: [0, 1, 1, 0], y: [10, -22, -52, -84], scale: [0.8, 1.15, 1, 1] }}
      transition={{ duration: 1.2, times: [0, 0.15, 0.6, 1], ease: "easeOut" }}
      className="font-display absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xl font-bold"
      style={{ color, textShadow: "0 2px 14px rgba(0,0,0,0.65)" }}
    >
      {text}
    </motion.div>
  );
}

export function Pops() {
  const pops = useStore((s) => s.pops);
  return (
    <div className="pointer-events-none absolute left-[38%] top-[40%] z-20">
      {pops.map((p) => (
        <PopItem key={p.id} {...p} />
      ))}
    </div>
  );
}

/* ---------- jump hint + teacher warning ---------- */

export function HintBar({ script }: { script: LevelScript }) {
  const hasJumped = useStore((s) => s.hasJumped);
  const isTouch = useStore((s) => s.isTouch);
  const phase = useStore((s) => s.phase);
  const badges = useStore((s) => s.badges);
  const distance = useStore((s) => s.distanceM * PX);
  const autoplay = useStore((s) => s.autoplay);
  const pool = script.events.find((event) => event.kind === "swim");
  const leavingPool = pool?.kind === "swim" && badges.some((badge) => badge.id === pool.id) && distance < pool.end + 430;
  if ((!leavingPool && hasJumped) || phase !== "running" || autoplay) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.3 }}
      className="pointer-events-none absolute bottom-[108px] left-1/2 z-30 w-max max-w-[90vw] -translate-x-1/2"
    >
      <div className="hud-panel flex items-center gap-3 rounded-full px-4 py-2 text-xs font-semibold text-slate-200">
        {isTouch ? (
          <>
            <span>{leavingPool ? "Back in control. Tap to jump." : "Tap to jump over the next obstacle."}</span>
          </>
        ) : (
          <>
            <span className="keycap">SPACE</span>
            <span className="text-slate-500">or</span>
            <span className="keycap">CLICK</span>
            <span>{leavingPool ? "Back in control. Jump when you choose." : "Jump just before an obstacle."}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ---------- journey progress (bottom-left) ---------- */

export function JourneyBar({ script }: { script: LevelScript }) {
  const distanceM = useStore((s) => s.distanceM);
  const phase = useStore((s) => s.phase);
  const cleared = useStore((s) => s.clearedCount);
  const totalHurdles = useStore((s) => s.totalHurdles);
  const badges = useStore((s) => s.badges);
  const progress = phase === "complete" ? 1 : Math.min(1, distanceM / (script.length / PX));
  const markers = useMemo(() => script.events.flatMap((event) => {
    if (event.kind === "swim") return [{ id: event.id, at: event.end / script.length, label: event.label }];
    if (event.kind === "slip") return [{ id: event.id, at: event.x / script.length, label: "Retry & Learn" }];
    if (event.kind === "gate") return [{ id: event.id, at: (event.x - GATE_STOP_DISTANCE) / script.length, label: event.card.title }];
    if (event.kind === "shop") return [{ id: event.id, at: (event.x - SHOP_STOP_DISTANCE) / script.length, label: event.title }];
    return [];
  }), [script]);
  if (phase === "caught") return null;
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-30 sm:bottom-4 sm:left-4">
      <div className="hud-panel rounded-2xl px-3 py-2.5 sm:px-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Journey</span>
          <span className="text-[10px] font-semibold tabular-nums text-slate-300">
            <span className="hidden sm:inline">{cleared}/{totalHurdles} hurdles / </span>{Math.round(progress * 100)}%
          </span>
        </div>
        <div className="relative h-1.5 w-[150px] rounded-full bg-white/10 sm:w-[250px]" role="progressbar" aria-label="School chapter progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))", boxShadow: "0 0 12px color-mix(in srgb, var(--accent) 60%, transparent)" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 26 }}
          />
          {markers.map((mk) => (
            <span
              key={mk.id} title={mk.label}
              className="absolute -top-[1px] h-2 w-2 rounded-full border border-amber-100/60 transition-colors"
              style={{ left: `calc(${mk.at * 100}% - 4px)`, background: badges.some((b) => b.id === mk.id) ? "#FFB86B" : "#1B2331" }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          <span>School</span>
          <span className="text-accent" style={{ color: "var(--accent)" }}>Family shop</span>
        </div>
      </div>
    </div>
  );
}

export function BadgeTray() {
  const badges = useStore((s) => s.badges);
  const [selected, setSelected] = useState<string | null>(null);
  const badge = badges.find((b) => b.id === selected);
  if (badges.length === 0) return null;
  return (
    <div className="absolute bottom-4 right-3 z-30 sm:right-4" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setSelected(null); }}>
      <AnimatePresence>
        {badge && <motion.div key={badge.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="hud-panel absolute bottom-full right-0 mb-3 w-60 rounded-xl p-3 text-xs" role="status">
          <p className="font-semibold text-amber-200">{badge.label}</p>
          <p className="mt-1 leading-relaxed text-slate-300">{badge.detail}</p>
          <p className="mt-2 text-[10px] text-slate-400">Earned this run / +{badge.xp} XP</p>
        </motion.div>}
      </AnimatePresence>
      <p className="mb-2 text-right text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-300">Memories collected</p>
      <div className="flex justify-end gap-1.5">
        {badges.map((b) => <motion.button key={b.id} type="button" initial={{ opacity: 0, scale: 0.7, y: 7 }} animate={{ opacity: 1, scale: 1, y: 0 }} onClick={() => setSelected(selected === b.id ? null : b.id)} aria-label={`${b.label}: ${b.detail}`} aria-expanded={selected === b.id} title={b.label} data-badge-id={b.id} className="hud-panel flex h-8 w-8 items-center justify-center rounded-full text-amber-200 transition hover:border-amber-200/60 focus-visible:outline-2 focus-visible:outline-amber-200">
          <BadgeIcon kind={b.kind} size={17} />
        </motion.button>)}
      </div>
    </div>
  );
}

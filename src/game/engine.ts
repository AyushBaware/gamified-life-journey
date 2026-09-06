import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useStore } from "../store/store";
import { sfx } from "../audio/sfx";
import { PX } from "./constants";
import { act, createSimulation, stepSimulation, type Sim, type SimulationEffect } from "./simulation";
import type { LevelScript } from "./types";
import type { ParticleAPI } from "../three/Particles";

export type { Sim } from "./simulation";

export interface EngineAPI {
  sim: MutableRefObject<Sim>;
  action: () => void;
  restart: () => void;
  loadChapter: (script: LevelScript) => void;
  togglePause: () => void;
  markReady: () => void;
}

export function useGameEngine(script: LevelScript, particles: MutableRefObject<ParticleAPI | null>): EngineAPI {
  const sim = useRef(createSimulation(script));
  const scriptRef = useRef(script);
  const ready = useRef(false);
  const frameClock = useRef(0);

  const syncStats = useCallback(() => {
    const s = sim.current;
    const store = useStore.getState();
    store.setStats(s.score, s.xp, s.distance / PX, s.clearedCount);
    store.setHasJumped(s.jumpCount > 0);
  }, []);

  const emit = useCallback((effect: SimulationEffect) => {
    const store = useStore.getState();
    const theme = scriptRef.current.theme;
    switch (effect.type) {
      case "phase":
        store.setPhase(effect.phase);
        if (["hit", "caught", "scripted", "gate", "shopvisit"].includes(effect.phase)) store.clearToasts();
        syncStats();
        break;
      case "sound": sfx.play(effect.name); break;
      case "toast": store.pushToast(effect.toast, effect.toast.ttl); break;
      case "pop": store.pushPop(effect.text, effect.tone); break;
      case "badge": store.addBadge(effect.badge); syncStats(); break;
      case "skill": store.addSkill(effect.skill); syncStats(); break;
      case "card": store.setCard(effect.card); break;
      case "caught": store.setCaught({ meters: effect.meters }); break;
      case "particles": {
        const p = particles.current;
        if (!p) break;
        const x = effect.x ?? 0;
        const y = effect.y ?? 1.5;
        const colors = [theme.accent, theme.accent2, "#FFFFFF", "#FBBF24"];
        if (effect.kind === "dust") p.dust(x, effect.distance, effect.count);
        if (effect.kind === "splash") p.splash(x, y, effect.distance, effect.count);
        if (effect.kind === "burst") p.burst(x, y, effect.distance, effect.color ?? theme.accent, effect.count);
        if (effect.kind === "confetti") p.confetti(x, y, effect.distance, colors, effect.count);
        break;
      }
    }
  }, [particles, syncStats]);

  const boot = useCallback((nextScript: LevelScript, preserveBadges: boolean) => {
    sim.current = createSimulation(nextScript, sim.current.revision + 1);
    particles.current?.clear();
    frameClock.current = 0;
    const store = useStore.getState();
    if (preserveBadges) store.resetForChapter();
    else store.resetRunUI();
    store.setReady(ready.current);
    store.setTotalHurdles(nextScript.events.filter((event) => event.kind === "hurdle").length);
    if (ready.current) sfx.play("start");
  }, [particles]);

  const restart = useCallback(() => {
    boot(scriptRef.current, false);
  }, [boot]);

  const loadChapter = useCallback((nextScript: LevelScript) => {
    scriptRef.current = nextScript;
    boot(nextScript, true);
  }, [boot]);

  const togglePause = useCallback(() => {
    if (!ready.current) return;
    sim.current.paused = !sim.current.paused;
    frameClock.current = 0;
    useStore.getState().setPaused(sim.current.paused);
  }, []);

  const action = useCallback(() => {
    if (!ready.current || sim.current.paused) return;
    const store = useStore.getState();
    if (sim.current.phase === "caught" && sim.current.caughtShown) {
      restart();
      return;
    }
    if (store.autoplay) store.setAutoplay(false);
    act(sim.current, scriptRef.current, emit);
    syncStats();
  }, [emit, restart, syncStats]);

  const markReady = useCallback(() => {
    if (ready.current) return;
    ready.current = true;
    frameClock.current = 0;
    useStore.getState().setReady(true);
    sfx.play("start");
  }, []);

  useEffect(() => {
    let raf = 0;
    let lastStats = 0;
    restart();
    const tick = (now: number) => {
      const dt = frameClock.current ? Math.min(0.05, (now - frameClock.current) / 1000) : 0;
      frameClock.current = now;
      if (ready.current && !document.hidden && !sim.current.paused) {
        stepSimulation(sim.current, scriptRef.current, dt, useStore.getState().autoplay, emit);
        if (sim.current.elapsed >= 2.6 && useStore.getState().chapterTitle) useStore.getState().setChapterTitle(false);
        if (now - lastStats >= 100) { syncStats(); lastStats = now; }
        if (sim.current.phase === "caught" && sim.current.phaseT >= 1.8 && useStore.getState().autoplay) restart();
      }
      raf = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      frameClock.current = 0;
      if (document.hidden && ready.current) {
        sim.current.paused = true;
        useStore.getState().setPaused(true);
      }
    };
    raf = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(() => ({ sim, action, restart, loadChapter, togglePause, markReady }), [action, restart, loadChapter, togglePause, markReady]);
}

import {
  AUTOPLAY_JUMP_LEAD, GATE_STOP_DISTANCE, GRAVITY, HIT_SLOW, JUMP_V,
  POOL_ENTRY_LEAD, POOL_EXIT_DISTANCE, POOL_EXIT_DURATION, PX,
  RUN_SPEED, SHOP_STOP_DISTANCE, SWIM_SPEED, TEACHER_GAP, WALK_SPEED, XP,
} from "./constants";
import { SKILLS, type Badge, type HeroMode, type LevelEvent, type LevelScript, type MilestoneCardData, type Mood, type ObjectStatus, type Phase, type SkillId, type TeacherMode, type Toast } from "./types";
import type { SfxName } from "../audio/sfx";

export interface Sim {
  distance: number;
  y: number;
  vy: number;
  grounded: boolean;
  phase: Phase;
  phaseT: number;
  heroMode: HeroMode;
  mood: Mood;
  gait: number;
  teacherX: number;
  teacherMode: TeacherMode;
  teacherGait: number;
  shake: number;
  statuses: Map<string, ObjectStatus>;
  awarded: Set<string>;
  swimEventId: string | null;
  activeEventId: string | null;
  shopEventId: string | null;
  gym: boolean;
  skills: SkillId[];
  scriptedStage: number;
  clearedCount: number;
  score: number;
  xp: number;
  elapsed: number;
  splashAt: number;
  paused: boolean;
  caughtShown: boolean;
  jumpCount: number;
  revision: number;
}

export type SimulationEffect =
  | { type: "phase"; phase: Phase }
  | { type: "sound"; name: SfxName }
  | { type: "toast"; toast: Omit<Toast, "id"> }
  | { type: "pop"; text: string; tone: "accent" | "success" | "soft" }
  | { type: "badge"; badge: Badge }
  | { type: "card"; card: MilestoneCardData | null }
  | { type: "caught"; meters: number }
  | { type: "skill"; skill: SkillId }
  | { type: "particles"; kind: "dust" | "splash" | "burst" | "confetti"; distance: number; y?: number; x?: number; color?: string; count?: number };

export type EffectSink = (effect: SimulationEffect) => void;
const noop: EffectSink = () => {};
const damp = (a: number, b: number, speed: number, dt: number) => a + (b - a) * (1 - Math.exp(-speed * dt));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function createSimulation(script: LevelScript, revision = 0): Sim {
  return {
    distance: 0, y: 0, vy: 0, grounded: true, phase: "running", phaseT: 0,
    heroMode: "run", mood: "neutral", gait: 0,
    teacherX: -TEACHER_GAP - 160, teacherMode: "chase", teacherGait: 0,
    shake: 0, statuses: new Map(script.events.map((event) => [event.id, "pending"])),
    awarded: new Set(), swimEventId: null, activeEventId: null, shopEventId: null,
    gym: false, skills: [], scriptedStage: 0, clearedCount: 0, score: 0, xp: 0, elapsed: 0,
    splashAt: 0, paused: false, caughtShown: false, jumpCount: 0, revision,
  };
}

function transition(s: Sim, phase: Phase, emit: EffectSink) {
  s.phase = phase;
  s.phaseT = 0;
  emit({ type: "phase", phase });
}

function ground(s: Sim) {
  s.y = 0;
  s.vy = 0;
  s.grounded = true;
}

function reward(s: Sim, badge: Badge, emit: EffectSink) {
  if (s.awarded.has(badge.id)) return false;
  s.awarded.add(badge.id);
  s.score += badge.xp;
  s.xp += badge.xp;
  emit({ type: "badge", badge });
  return true;
}

export function jump(s: Sim, emit: EffectSink = noop): boolean {
  if (s.paused || s.phase !== "running" || !s.grounded) return false;
  s.vy = JUMP_V;
  s.grounded = false;
  s.heroMode = "jump";
  s.jumpCount += 1;
  emit({ type: "sound", name: "jump" });
  emit({ type: "particles", kind: "dust", distance: s.distance, count: 5 });
  return true;
}

export function act(s: Sim, script: LevelScript, emit: EffectSink = noop) {
  if (s.paused) return;
  if (s.phase === "running") {
    jump(s, emit);
  } else if (s.phase === "gate") {
    const gate = script.events.find((event) => event.kind === "gate" && s.statuses.get(event.id) === "waiting");
    if (!gate || gate.kind !== "gate") return;
    s.statuses.set(gate.id, "unlocked");
    s.activeEventId = gate.id;
    ground(s);
    s.heroMode = "happy";
    s.mood = "happy";
    s.shake = 0.4;
    const major = gate.card.weight !== "soft";
    reward(s, { id: gate.id, kind: "boards", label: gate.card.title, detail: `${gate.card.stat} | ${gate.card.sub}`, xp: gate.card.xp }, emit);
    transition(s, "gateburst", emit);
    emit({ type: "sound", name: major ? "milestone" : "soft" });
    emit({ type: "particles", kind: "confetti", distance: gate.x, y: 4.6, count: major ? 65 : 18 });
    emit({ type: "particles", kind: "burst", distance: gate.x, y: 2.4, count: major ? 32 : 10 });
  } else if (s.phase === "card") {
    if (s.activeEventId) s.statuses.set(s.activeEventId, "done");
    s.activeEventId = null;
    emit({ type: "card", card: null });
    const hasShop = script.events.some((event) => event.kind === "shop" && s.statuses.get(event.id) === "pending");
    if (hasShop) {
      s.heroMode = "walk";
      s.teacherMode = "retreat";
      transition(s, "walk", emit);
    } else {
      s.heroMode = "run";
      s.mood = "happy";
      transition(s, "running", emit);
    }
  }
}

function enterWater(s: Sim, pool: Extract<LevelEvent, { kind: "swim" }>, emit: EffectSink) {
  ground(s);
  s.distance = Math.max(pool.start + 28, s.distance);
  s.heroMode = "swim";
  s.teacherMode = "point";
  s.splashAt = s.elapsed;
  transition(s, "swim", emit);
  emit({ type: "sound", name: "splash" });
  emit({ type: "particles", kind: "splash", distance: s.distance, y: -0.06, count: 20 });
  emit({ type: "toast", toast: { title: "School pool", sub: "Swimming practice during 9th-10th standard.", tone: "neutral", ttl: 2300 } });
}

function runningEvents(s: Sim, script: LevelScript, previous: number, previousY: number, autoplay: boolean, emit: EffectSink) {
  for (const event of script.events) {
    if (s.statuses.get(event.id) !== "pending") continue;
    if (event.kind === "hurdle") {
      // Collision depth runs along the course, unlike width across the lane.
      const depth = ({ books: 0.32, desk: 0.37, bar: 0.14, bench: 0.32, cone: 0.34, bag: 0.42, flask: 0.3 } as const)[event.variant] * PX + 6;
      const near = event.x - depth;
      const far = event.x + depth;
      if (previous <= far && s.distance >= near && Math.min(previousY, s.y) < event.h - 6) {
        s.statuses.set(event.id, "hit");
        ground(s);
        s.heroMode = "stumble";
        s.mood = "startled";
        s.teacherMode = "sprint";
        s.shake = 0.8;
        transition(s, "hit", emit);
        emit({ type: "sound", name: "stumble" });
        emit({ type: "particles", kind: "dust", distance: s.distance, count: 10 });
        return;
      }
      if (s.distance > far) {
        s.statuses.set(event.id, "cleared");
        s.clearedCount += 1;
        s.score += XP.hurdle;
        s.xp += XP.hurdle;
        emit({ type: "sound", name: "clear" });
        emit({ type: "pop", text: `+${XP.hurdle}`, tone: "accent" });
      } else if (autoplay && s.grounded && event.x > s.distance && event.x - s.distance <= RUN_SPEED * AUTOPLAY_JUMP_LEAD) {
        jump(s, emit);
      }
    } else if (event.kind === "swim") {
      // A completed pool must never re-enter the dive/swim/exit cycle.
      if (s.distance >= event.start - POOL_ENTRY_LEAD && previous < event.end && s.distance < event.end) {
        s.statuses.set(event.id, "active");
        s.swimEventId = event.id;
        s.heroMode = "dive";
        s.vy = 580;
        s.y = Math.max(0, s.y);
        s.grounded = false;
        transition(s, "dive", emit);
        emit({ type: "sound", name: "jump" });
        return;
      }
    } else if (event.kind === "skill") {
      // Collected in stride — grab it as you pass, like a coin. No stop.
      if (s.distance >= event.x - 26 && previous < event.x + 30) {
        s.statuses.set(event.id, "collected");
        if (!s.skills.includes(event.skill)) s.skills.push(event.skill);
        const def = SKILLS[event.skill];
        s.score += event.xp;
        s.xp += event.xp;
        s.mood = "happy";
        emit({ type: "skill", skill: event.skill });
        emit({ type: "sound", name: "collect" });
        emit({ type: "pop", text: `+ ${def.label}`, tone: "success" });
        emit({ type: "particles", kind: "burst", distance: event.x, y: 1.7, color: def.glow, count: 22 });
        emit({ type: "toast", toast: { title: `Learned ${def.label}`, sub: def.learned, tone: "success", ttl: 2200, badgeKind: "skill", skill: event.skill } });
      }
    } else if (event.kind === "slip" && s.distance >= event.x) {
      s.statuses.set(event.id, "active");
      s.activeEventId = event.id;
      s.scriptedStage = 0;
      ground(s);
      s.heroMode = "stumble";
      s.mood = "startled";
      s.teacherMode = "sprint";
      s.shake = 0.6;
      transition(s, "scripted", emit);
      emit({ type: "pop", text: event.popText, tone: "soft" });
      emit({ type: "sound", name: "stumble" });
      return;
    } else if (event.kind === "gate" && s.distance >= event.x - GATE_STOP_DISTANCE) {
      s.distance = event.x - GATE_STOP_DISTANCE;
      s.statuses.set(event.id, "waiting");
      ground(s);
      s.heroMode = "idle";
      s.mood = "determined";
      s.teacherMode = "idle";
      transition(s, "gate", emit);
      return;
    } else if (event.kind === "powerup" && s.distance >= event.x) {
      s.statuses.set(event.id, "active");
      s.activeEventId = event.id;
      ground(s);
      s.gym = true;
      s.heroMode = "happy";
      s.mood = "happy";
      reward(s, { id: event.id, kind: "gym", label: event.label, detail: event.detail, xp: event.xp }, emit);
      emit({ type: "toast", toast: { title: "Joined Gym", sub: `${event.detail} · +${event.xp} XP`, tone: "accent", ttl: 3000, badgeKind: "gym" } });
      emit({ type: "sound", name: "soft" });
      emit({ type: "particles", kind: "burst", distance: s.distance, y: 1.9, color: "#4ade80", count: 16 });
      transition(s, "powerup", emit);
      return;
    } else if (event.kind === "end" && s.distance >= event.x) {
      s.statuses.set(event.id, "done");
      s.heroMode = "happy";
      s.mood = "happy";
      transition(s, "complete", emit);
      emit({ type: "sound", name: "complete" });
      emit({ type: "particles", kind: "confetti", distance: event.x, y: 4.2, count: 55 });
      return;
    }
  }
}

/** Pure simulation: no React, WebGL, browser timers, or wall-clock dependencies. */
export function stepSimulation(s: Sim, script: LevelScript, delta: number, autoplay = false, emit: EffectSink = noop) {
  if (s.paused || delta <= 0) return;
  const dt = Math.min(delta, 0.05);
  const previous = s.distance;
  const previousY = s.y;
  s.elapsed += dt;
  s.phaseT += dt;
  s.shake = Math.max(0, s.shake - dt * 3);
  const pool = script.events.find((event) => event.kind === "swim" && event.id === s.swimEventId);

  switch (s.phase) {
    case "running": {
      s.distance += RUN_SPEED * dt;
      s.gait += dt * 9.5;
      if (!s.grounded) {
        s.y += s.vy * dt - 0.5 * GRAVITY * dt * dt;
        s.vy -= GRAVITY * dt;
        if (s.y <= 0) {
          ground(s);
          s.heroMode = "run";
          emit({ type: "sound", name: "land" });
          emit({ type: "particles", kind: "dust", distance: s.distance, count: 5 });
        }
      }
      runningEvents(s, script, previous, previousY, autoplay, emit);
      break;
    }
    case "dive": {
      s.distance += RUN_SPEED * dt;
      s.y += s.vy * dt - 0.5 * GRAVITY * dt * dt;
      s.vy -= GRAVITY * dt;
      if (pool?.kind === "swim" && ((s.vy < 0 && s.y <= 18) || s.phaseT > 0.85)) enterWater(s, pool, emit);
      break;
    }
    case "swim": {
      if (pool?.kind !== "swim") break;
      s.distance = Math.min(pool.end, s.distance + SWIM_SPEED * dt);
      s.gait += dt * 4.6;
      if (s.elapsed - s.splashAt > 0.24) {
        s.splashAt = s.elapsed;
        emit({ type: "particles", kind: "splash", distance: s.distance - 15, y: -0.06, count: 5 });
      }
      if (s.distance >= pool.end) {
        s.statuses.set(pool.id, "collected");
        if (reward(s, { id: pool.id, kind: "swim", label: pool.label, detail: pool.tooltip, xp: pool.xp }, emit)) {
          emit({ type: "sound", name: "collect" });
          emit({ type: "toast", toast: { title: "Swimming badge unlocked", sub: `${pool.tooltip} | +${pool.xp} XP`, tone: "accent", ttl: 3000, badgeKind: "swim" } });
        }
        // Step onto the deck, without injecting another jump into manual mode.
        ground(s);
        s.heroMode = "exit";
        s.mood = "happy";
        transition(s, "exit", emit);
        emit({ type: "particles", kind: "splash", distance: s.distance, y: -0.06, count: 10 });
      }
      break;
    }
    case "exit": {
      if (pool?.kind !== "swim") break;
      const t = Math.min(1, s.phaseT / POOL_EXIT_DURATION);
      s.distance = pool.end + POOL_EXIT_DISTANCE * smooth(t);
      ground(s);
      s.gait += dt * 5.2;
      if (t === 1) {
        s.statuses.set(pool.id, "done");
        s.swimEventId = null;
        s.heroMode = "run";
        s.mood = "neutral";
        s.teacherMode = "sprint";
        transition(s, "running", emit);
      }
      break;
    }
    case "hit": {
      s.teacherX = damp(s.teacherX, s.distance - 30, 7, dt);
      if (s.phaseT >= HIT_SLOW && Math.abs(s.teacherX - (s.distance - 30)) < 6) {
        s.heroMode = "caught";
        s.teacherMode = "catch";
        s.shake = 0.5;
        transition(s, "caught", emit);
        emit({ type: "sound", name: "whistle" });
      }
      break;
    }
    case "caught": {
      if (s.phaseT >= 0.65 && !s.caughtShown) {
        s.caughtShown = true;
        emit({ type: "caught", meters: Math.round(s.distance / PX) });
      }
      break;
    }
    case "scripted": {
      const event = script.events.find((item) => item.id === s.activeEventId);
      if (event?.kind !== "slip") break;
      const officer = script.chaser === "officer";
      s.teacherX = damp(s.teacherX, s.distance - 30, 7, dt);
      // Teacher: two comedic stick bonks. Officer: a stern whistle + pointed warning — no hitting.
      if (s.phaseT >= 0.45) s.teacherMode = officer ? "point" : "swing";
      const beat = s.phaseT >= 1.15 ? 2 : s.phaseT >= 0.75 ? 1 : 0;
      if (beat > s.scriptedStage) {
        s.scriptedStage = beat;
        s.shake = officer ? 0.15 : 0.35;
        emit({ type: "sound", name: officer ? "whistle" : "bonk" });
        emit({ type: "particles", kind: "burst", distance: s.distance, y: 2, color: officer ? "#FCA5A5" : "#FFD24A", count: 8 });
      }
      if (s.phaseT >= 1.7) {
        s.statuses.set(event.id, "done");
        reward(s, { id: event.id, kind: "resilience", label: "Retry & Learn", detail: "Learning from a setback in 9th standard.", xp: event.xp }, emit);
        emit({ type: "toast", toast: { title: "Retry & Learn", sub: `Back on his feet. +${event.xp} resilience XP`, tone: "success", ttl: 2500, badgeKind: "resilience" } });
        emit({ type: "sound", name: "recover" });
        s.heroMode = "run";
        s.mood = "determined";
        s.teacherMode = "retreat";
        s.activeEventId = null;
        transition(s, "running", emit);
      }
      break;
    }
    case "powerup":
      if (s.phaseT >= 1.5) {
        s.heroMode = "run";
        s.mood = "neutral";
        s.activeEventId = null;
        transition(s, "running", emit);
      }
      break;
    case "gate":
      if (autoplay && s.phaseT >= 1.1) act(s, script, emit);
      break;
    case "gateburst": {
      const event = script.events.find((item) => item.id === s.activeEventId);
      if (event?.kind === "gate" && s.phaseT >= 0.8) {
        s.heroMode = "idle";
        transition(s, "card", emit);
        emit({ type: "card", card: event.card });
      }
      break;
    }
    case "card":
      if (autoplay && s.phaseT >= 3.4) act(s, script, emit);
      break;
    case "walk": {
      s.distance += WALK_SPEED * dt;
      s.gait += dt * 5.2;
      const shop = script.events.find((event) => event.kind === "shop" && s.statuses.get(event.id) === "pending");
      if (shop?.kind === "shop" && s.distance >= shop.x - SHOP_STOP_DISTANCE) {
        s.distance = shop.x - SHOP_STOP_DISTANCE;
        s.statuses.set(shop.id, "active");
        s.shopEventId = shop.id;
        s.heroMode = "wave";
        s.teacherMode = "idle";
        s.mood = "happy";
        ground(s);
        reward(s, { id: shop.id, kind: "shop", label: "Family shop", detail: shop.sub, xp: XP.shop }, emit);
        transition(s, "shopvisit", emit);
        emit({ type: "toast", toast: { title: shop.title, sub: shop.sub, tone: "accent", ttl: 4300, badgeKind: "shop" } });
        emit({ type: "sound", name: "soft" });
        emit({ type: "particles", kind: "confetti", x: 60, distance: shop.x, y: 3.2, count: 35 });
      }
      break;
    }
    case "shopvisit":
      if (s.phaseT >= 4.6) {
        if (s.shopEventId) s.statuses.set(s.shopEventId, "done");
        transition(s, "complete", emit);
        emit({ type: "sound", name: "complete" });
      }
      break;
    case "complete":
      break;
  }

  if (s.phase === "running" || s.phase === "walk") {
    const target = s.distance - TEACHER_GAP;
    s.teacherX = damp(s.teacherX, target, 2.4, dt);
    const returning = target - s.teacherX > 240;
    s.teacherMode = s.phase === "walk" ? "retreat" : returning ? "sprint" : "chase";
    if (s.phaseT > 2 && s.mood === "determined") s.mood = "neutral";
  } else if ((s.phase === "swim" || s.phase === "dive" || s.phase === "exit") && pool?.kind === "swim") {
    s.teacherX = damp(s.teacherX, pool.start - 46, 4, dt);
    s.teacherMode = "point";
  } else if (["gate", "gateburst", "card", "powerup", "shopvisit", "complete"].includes(s.phase)) {
    s.teacherX = damp(s.teacherX, s.distance - 96, 2.4, dt);
    s.teacherMode = "idle";
  }
  s.teacherGait += dt * (s.teacherMode === "sprint" ? 13 : s.teacherMode === "chase" ? 10.5 : s.teacherMode === "retreat" ? 5 : 0);
}
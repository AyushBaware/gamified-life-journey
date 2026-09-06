import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import ts from "typescript";

// Read and transpile the real simulation in memory. No WebGL or test package is needed.
const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
function loadTS(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
    fileName: filename,
  });
  const evaluate = runInThisContext(`(function(exports, require, module) { ${outputText}\n})`, { filename });
  evaluate(module.exports, (id) => id.startsWith(".") ? loadTS(resolve(dirname(filename), `${id}.ts`)) : nativeRequire(id), module);
  return module.exports;
}

const root = fileURLToPath(new URL("../src/game/", import.meta.url));
const { createSimulation, stepSimulation, act, jump } = loadTS(resolve(root, "simulation.ts"));
const { CHAPTER_1, CHAPTER_2, CHAPTER_3, CHAPTERS } = loadTS(resolve(root, "level.ts"));
const { PX, RUNNER_YAW, POOL_EXIT_DISTANCE, SHOP_STOP_DISTANCE, WALK_SPEED, XP } = loadTS(resolve(root, "constants.ts"));
const pool = CHAPTER_1.events.find((event) => event.kind === "swim");
const gate = CHAPTER_1.events.find((event) => event.kind === "gate");
const shop = CHAPTER_1.events.find((event) => event.kind === "shop");
const poolOnly = { ...CHAPTER_1, events: [pool] };

function recorder(sim) {
  const effects = [];
  return { effects, emit: (effect) => effects.push({ ...effect, distance: sim.distance, time: sim.elapsed }) };
}

function until(sim, script, done, { fps = 60, autoplay = false, emit = () => {}, seconds = 65 } = {}) {
  for (let n = 0; n < fps * seconds && !done(); n++) stepSimulation(sim, script, 1 / fps, autoplay, emit);
  assert.ok(done(), `Simulation stopped in ${sim.phase} at ${sim.distance / PX}m`);
}

test("the gameplay orientation maps authored +Z forward to course -Z", () => {
  assert.ok(Math.abs(Math.sin(RUNNER_YAW)) < 0.00001);
  assert.ok(Math.abs(Math.cos(RUNNER_YAW) + 1) < 0.00001);
});

test("swimming enters once, earns its badge at the end, and stays grounded afterward", () => {
  const sim = createSimulation(poolOnly);
  const { effects, emit } = recorder(sim);
  sim.distance = pool.start - 45;
  until(sim, poolOnly, () => sim.phase === "swim", { emit });
  assert.equal(effects.filter((effect) => effect.type === "badge").length, 0);
  assert.equal(jump(sim, emit), false, "swimming does not queue manual jumps");
  until(sim, poolOnly, () => sim.statuses.get(pool.id) === "done", { emit });
  assert.equal(sim.distance, pool.end + POOL_EXIT_DISTANCE);
  assert.equal(sim.phase, "running");
  assert.equal(sim.swimEventId, null);
  const rewards = effects.filter((effect) => effect.type === "badge");
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].distance, pool.end);
  assert.equal(rewards[0].badge.id, pool.id);
  for (let i = 0; i < 180; i++) {
    stepSimulation(sim, poolOnly, 1 / 60, false, emit);
    assert.equal(sim.phase, "running");
    assert.equal(sim.y, 0);
    assert.equal(sim.vy, 0);
    assert.equal(sim.grounded, true);
  }
  assert.equal(sim.jumpCount, 0);
  assert.equal(sim.xp, XP.swim);
  assert.equal(effects.filter((e) => e.type === "phase" && e.phase === "dive").length, 1);
});

test("manual jump responds immediately after leaving the pool", () => {
  const sim = createSimulation(poolOnly);
  sim.distance = pool.start - 45;
  until(sim, poolOnly, () => sim.statuses.get(pool.id) === "done");
  act(sim, poolOnly);
  assert.equal(sim.heroMode, "jump");
  assert.equal(sim.grounded, false);
  stepSimulation(sim, poolOnly, 1 / 60);
  assert.ok(sim.y > 0);
  until(sim, poolOnly, () => sim.grounded);
  assert.equal(sim.jumpCount, 1);
  assert.equal(sim.heroMode, "run");
  assert.equal(sim.statuses.get(pool.id), "done");
});

test("the shop notice does not fire at the gate or on the walk to the stall", () => {
  const script = { ...CHAPTER_1, events: [gate, shop] };
  const sim = createSimulation(script);
  const { effects, emit } = recorder(sim);
  sim.distance = gate.x - 100;
  until(sim, script, () => sim.phase === "gate", { emit });
  act(sim, script, emit);
  until(sim, script, () => sim.phase === "card", { emit });
  assert.equal(sim.awarded.has(shop.id), false);
  act(sim, script, emit);
  const arrival = shop.x - SHOP_STOP_DISTANCE;
  while (sim.distance + WALK_SPEED / 60 < arrival) {
    stepSimulation(sim, script, 1 / 60, false, emit);
    assert.equal(sim.awarded.has(shop.id), false);
  }
  until(sim, script, () => sim.phase === "shopvisit", { emit });
  const notices = effects.filter((effect) => effect.type === "toast" && effect.toast.title === shop.title);
  assert.equal(notices.length, 1);
  assert.equal(notices[0].distance, arrival);
  assert.equal(sim.awarded.has(shop.id), true);
  until(sim, script, () => sim.phase === "complete", { emit });
  assert.equal(effects.filter((e) => e.type === "badge" && e.badge.id === shop.id).length, 1);
});

test("waiting at the gate does not award marks; repeated input cannot duplicate the unlock", () => {
  const script = { ...CHAPTER_1, events: [gate] };
  const sim = createSimulation(script);
  const { effects, emit } = recorder(sim);
  sim.distance = gate.x - 100;
  until(sim, script, () => sim.phase === "gate", { emit });
  for (let n = 0; n < 600; n++) stepSimulation(sim, script, 1 / 60, false, emit);
  assert.equal(sim.xp, 0);
  for (let n = 0; n < 8; n++) act(sim, script, emit);
  assert.equal(sim.xp, gate.card.xp);
  assert.equal(effects.filter((e) => e.type === "badge").length, 1);
  until(sim, script, () => sim.phase === "card", { emit });
  assert.equal(effects.find((e) => e.type === "card").card.stat, "89.40%");
});

test("missing an obstacle catches the runner without awarding a clearance", () => {
  const sim = createSimulation(CHAPTER_1);
  until(sim, CHAPTER_1, () => sim.caughtShown);
  assert.equal(sim.phase, "caught");
  assert.equal(sim.clearedCount, 0);
  assert.equal(sim.score, 0);
});

test("pausing freezes distance, swimming time, and input", () => {
  const sim = createSimulation(poolOnly);
  sim.distance = pool.start - 45;
  until(sim, poolOnly, () => sim.phase === "swim");
  sim.paused = true;
  const before = { distance: sim.distance, elapsed: sim.elapsed, phaseT: sim.phaseT, gait: sim.gait };
  for (let n = 0; n < 120; n++) stepSimulation(sim, poolOnly, 1 / 60, true);
  assert.equal(jump(sim), false);
  assert.deepEqual({ distance: sim.distance, elapsed: sim.elapsed, phaseT: sim.phaseT, gait: sim.gait }, before);
  sim.paused = false;
  stepSimulation(sim, poolOnly, 1 / 60);
  assert.ok(sim.distance > before.distance);
});

test("chapter 2 carries the Activa, traffic officer, and college students", () => {
  assert.equal(CHAPTER_2.vehicle, "scooty");
  assert.equal(CHAPTER_2.chaser, "officer");
  assert.equal(CHAPTER_2.students, true);
  assert.equal(CHAPTER_2.events.some((event) => event.kind === "powerup"), false, "no gym in 12th");
  assert.equal(CHAPTER_2.events.filter((event) => event.kind === "hurdle").length, 5, "only meaningful obstacles");
  assert.equal(CHAPTER_1.vehicle, "none");
  assert.equal(CHAPTER_1.chaser, "teacher");
});

test("chapter 2 completes via the end event after the soft 12th gate", () => {
  const sim = createSimulation(CHAPTER_2);
  const { effects, emit } = recorder(sim);
  const gate = CHAPTER_2.events.find((event) => event.kind === "gate");
  assert.equal(gate.card.weight, "soft");
  until(sim, CHAPTER_2, () => sim.phase === "complete", { autoplay: true, emit });
  const boards = effects.find((e) => e.type === "badge" && e.badge.id === gate.id);
  assert.ok(boards.badge.detail.includes("63.17%"));
  assert.equal(sim.clearedCount, CHAPTER_2.events.filter((event) => event.kind === "hurdle").length);
  assert.equal(sim.gym, false, "gym stays off during 12th");
});

test("a fresh simulation resets the grown-up build and memories", () => {
  const grown = createSimulation(CHAPTER_2);
  grown.gym = true;
  grown.awarded.add("g-twelfth");
  const fresh = createSimulation(CHAPTER_2, grown.revision + 1);
  assert.equal(fresh.gym, false);
  assert.equal(fresh.awarded.size, 0);
  assert.equal(fresh.xp, 0);
  assert.ok([...fresh.statuses.values()].every((status) => status === "pending"));
  assert.equal(CHAPTERS.length, 3);
  assert.equal(CHAPTERS[0].outfit, "school");
  assert.equal(CHAPTERS[1].outfit, "twelfth");
  assert.equal(CHAPTERS[1].vehicle, "scooty");
  assert.equal(CHAPTERS[2].outfit, "college");
  assert.equal(CHAPTERS[2].events[0].kind, "powerup", "gym opens graduation");
});

test("chapter 3 collects all six graduation skills in order without stopping", () => {
  const sim = createSimulation(CHAPTER_3);
  const { effects, emit } = recorder(sim);
  const skillEvents = CHAPTER_3.events.filter((event) => event.kind === "skill");
  assert.equal(skillEvents.length, 6);
  until(sim, CHAPTER_3, () => sim.phase === "complete", { autoplay: true, emit, seconds: 90 });
  assert.deepEqual(sim.skills, ["html", "css", "javascript", "c", "cpp", "java"]);
  const collects = effects.filter((e) => e.type === "skill");
  assert.equal(collects.length, 6);
  // each skill is awarded exactly once and while running (never a separate stopping phase)
  for (const e of collects) assert.ok(effects.find((p) => p.type === "phase" && p.time <= e.time && p.phase === "running"));
  assert.equal(sim.gym, true, "gym at the start of graduation");
  assert.ok(effects.some((e) => e.type === "badge" && e.badge.id === "g-grad"));
});

test("skill orbs are not awarded twice and survive a chapter reset only when preserved", () => {
  const sim = createSimulation(CHAPTER_3);
  until(sim, CHAPTER_3, () => sim.skills.length >= 2, { autoplay: true, seconds: 40 });
  const before = sim.skills.length;
  for (let i = 0; i < 120; i++) stepSimulation(sim, CHAPTER_3, 1 / 60, true);
  assert.ok(sim.skills.length >= before);
  assert.equal(new Set(sim.skills).size, sim.skills.length);
  const fresh = createSimulation(CHAPTER_3, sim.revision + 1);
  assert.deepEqual(fresh.skills, []);
});

test("officer chapters use a whistle warning, teacher chapters use the stick", () => {
  const officerSim = createSimulation(CHAPTER_3);
  const { effects: offFx, emit: offEmit } = recorder(officerSim);
  until(officerSim, CHAPTER_3, () => officerSim.phase === "scripted", { autoplay: true, emit: offEmit, seconds: 60 });
  until(officerSim, CHAPTER_3, () => officerSim.phase === "running" && officerSim.statuses.get("s-firstyear") === "done", { autoplay: true, emit: offEmit, seconds: 10 });
  assert.ok(offFx.some((e) => e.type === "sound" && e.name === "whistle"));
  assert.ok(!offFx.some((e) => e.type === "sound" && e.name === "bonk"), "officer never hits");

  const teacherSim = createSimulation(CHAPTER_1);
  const { effects: tFx, emit: tEmit } = recorder(teacherSim);
  until(teacherSim, CHAPTER_1, () => teacherSim.statuses.get("s-marathi") === "done", { autoplay: true, emit: tEmit, seconds: 60 });
  assert.ok(tFx.some((e) => e.type === "sound" && e.name === "bonk"));
});

test("a gym power-up still works when a later chapter adds one", () => {
  const withGym = {
    ...CHAPTER_2,
    events: [
      ...CHAPTER_2.events,
      { kind: "powerup", id: "p-gym-test", x: 5000, label: "Joined Gym", detail: "test", xp: 75, power: "gym" },
    ],
  };
  const sim = createSimulation(withGym);
  until(sim, withGym, () => sim.phase === "powerup");
  assert.equal(sim.gym, true);
  assert.equal(sim.awarded.has("p-gym-test"), true);
  until(sim, withGym, () => sim.phase === "running");
  assert.equal(sim.gym, true);
});

for (const fps of [30, 60, 120]) {
  test(`cinematic chapter completes with one of each badge at ${fps}Hz`, () => {
    const sim = createSimulation(CHAPTER_1);
    const { effects, emit } = recorder(sim);
    until(sim, CHAPTER_1, () => sim.phase === "complete", { fps, autoplay: true, emit });
    assert.equal(sim.clearedCount, CHAPTER_1.events.filter((event) => event.kind === "hurdle").length);
    assert.deepEqual(effects.filter((e) => e.type === "badge").map((e) => e.badge.id), [pool.id, "s-marathi", gate.id, shop.id]);
    assert.equal(sim.awarded.size, 4);
    const fresh = createSimulation(CHAPTER_1, sim.revision + 1);
    assert.equal(fresh.awarded.size, 0);
    assert.equal(fresh.xp, 0);
    assert.equal(fresh.jumpCount, 0);
    assert.ok([...fresh.statuses.values()].every((status) => status === "pending"));
  });
}
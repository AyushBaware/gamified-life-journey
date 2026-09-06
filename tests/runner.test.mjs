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
const { CHAPTER_1 } = loadTS(resolve(root, "level.ts"));
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
# Runner Refinement

This updates the current 3D build. It does not replace the characters, add later chapters, or require new npm packages.

## Gameplay Corrections

- Both gameplay rigs face down the course (-Z). The opening character showcase still faces its camera.
- Swimming progresses through pending, active, collected, and done states once per run.
- The exit is a short step onto the deck, not a repeated automatic jump. Space, click, and tap work again once the runner is on the path.
- Manual input takes over cinematic mode. The HUD also has a cinematic/manual toggle and a pause button.
- Swimming is awarded at the pool's far edge, resilience after recovery, boards on gate unlock, and the family-shop memory on arrival at the stall.
- Badge records, scores, popups, and progress markers use the same event state. Replay resets them all.
- Popups honor their display duration and pause with the game. Hidden tabs pause the run.
- World-space particles now spawn at the actual runner/event position, not behind the camera.

## Environment

- Softer golden-hour sky, drifting cloud textures, distant hills, flapping birds, and falling leaves.
- Wind-driven grass and tree crowns, varied paving, natural ground colors, and a stylized school building.
- The path extends through the full chapter, with a real opening around the pool.
- Open pool decking, a tiled basin, rippling water highlights, and instanced lane floats.
- No per-frame React rerenders for character animation; transforms read the live simulation directly.

## Updated Files

- `src/App.tsx`
- `src/audio/sfx.ts`
- `src/game/constants.ts`
- `src/game/engine.ts`
- `src/game/level.ts`
- `src/game/types.ts`
- `src/store/store.ts`
- `src/screens/GameScreen.tsx`
- `src/screens/StartScreen.tsx`
- `src/three/HeroStage.tsx`
- `src/three/Particles.tsx`
- `src/three/RunnerScene.tsx`
- `src/three/textures.ts`
- `src/three/characters/Hero.tsx`
- `src/three/characters/Teacher.tsx`
- `src/three/world/Backdrop.tsx`
- `src/three/world/Gate.tsx`
- `src/three/world/Obstacles.tsx`
- `src/three/world/Pool.tsx`
- `src/three/world/Track.tsx`
- `src/ui/Cards.tsx`
- `src/ui/HUD.tsx`

## New Files

- `src/game/simulation.ts`
- `src/three/world/Foliage.tsx`
- `src/ui/BadgeIcon.tsx`
- `tests/runner.test.mjs`
- `CHANGES.md`

Copy all updated and new source files together; the engine and UI changes depend on each other. `package.json`, Vite configuration, and your profile data are unchanged.

## Verification

The production build has been checked. The available build tool does not run a browser or a Node test command, so GPU rendering, a device playthrough, and the regression tests still need to be checked on your machine.

Run `node --test tests/runner.test.mjs` to check the actual simulation without a browser. It covers one-time swimming, post-pool manual input, collision/catch behavior, pause/resume, badge timing, replay reset, and cinematic completion at 30/60/120Hz.

For a visual check, start a manual run, clear the first three obstacles, and let the pool sequence finish. Do not press anything after the exit: the runner should stay grounded until you jump. The next obstacle must still require your input. Check the swimming badge at the far pool edge and the shop popup only after walking from the 10th gate to the stall.
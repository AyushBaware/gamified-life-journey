/** World scale: 40 logical px = 1 world unit */
export const PX = 40;

export const RUN_SPEED = 430; // px/s
export const SWIM_SPEED = 150;
export const WALK_SPEED = 185;

export const JUMP_V = 880; // px/s
export const GRAVITY = 2400; // px/s²

export const TEACHER_GAP = 112; // px behind the hero while chasing
export const HIT_SLOW = 0.55; // s stumble before catch

export const AUTOPLAY_JUMP_LEAD = 0.32; // s

// Models face +Z in the showcase; the course extends along -Z.
export const RUNNER_YAW = Math.PI;
export const POOL_ENTRY_LEAD = 34;
export const POOL_EXIT_DURATION = 0.55;
export const POOL_EXIT_DISTANCE = 72;
export const GATE_STOP_DISTANCE = 88;
export const SHOP_STOP_DISTANCE = 36;

export const XP = {
  hurdle: 50,
  resilience: 25,
  swim: 100,
  shop: 100,
  gate: 500,
} as const;

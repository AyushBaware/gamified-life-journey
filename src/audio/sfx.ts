/** Synthesized SFX — no asset files, instant start, one master gain. */

export type SfxName =
  | "ui"
  | "start"
  | "jump"
  | "land"
  | "clear"
  | "collect"
  | "stumble"
  | "bonk"
  | "whistle"
  | "splash"
  | "recover"
  | "milestone"
  | "soft"
  | "complete";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  ensure();
}

export function setMuted(v: boolean) {
  muted = v;
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(v ? 0 : 0.5, ctx.currentTime + 0.08);
  }
}

function tone(
  freq: number,
  { type = "sine", dur = 0.12, at = 0, gain = 0.25, to, attack = 0.005 }: { type?: OscillatorType; dur?: number; at?: number; gain?: number; to?: number; attack?: number } = {},
) {
  const c = ensure();
  if (!c || !master) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur = 0.18, gain = 0.18, at = 0, cutoff = 900) {
  const c = ensure();
  if (!c || !master) return;
  const t0 = c.currentTime + at;
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t0);
}

export function play(name: SfxName) {
  if (muted) {
    ensure();
    return;
  }
  switch (name) {
    case "ui":
      tone(660, { type: "triangle", dur: 0.06, gain: 0.12 });
      break;
    case "start":
      tone(392, { type: "triangle", dur: 0.16, gain: 0.18 });
      tone(523, { type: "triangle", dur: 0.16, gain: 0.18, at: 0.09 });
      tone(784, { type: "triangle", dur: 0.28, gain: 0.18, at: 0.18 });
      break;
    case "jump":
      tone(320, { type: "sine", dur: 0.16, gain: 0.2, to: 720 });
      break;
    case "land":
      noise(0.08, 0.08, 0, 500);
      break;
    case "clear":
      tone(880, { type: "triangle", dur: 0.08, gain: 0.12 });
      tone(1174, { type: "triangle", dur: 0.1, gain: 0.1, at: 0.05 });
      break;
    case "collect":
      tone(988, { type: "triangle", dur: 0.09, gain: 0.16 });
      tone(1318, { type: "triangle", dur: 0.14, gain: 0.16, at: 0.07 });
      tone(1976, { type: "sine", dur: 0.18, gain: 0.08, at: 0.12 });
      break;
    case "stumble":
      noise(0.22, 0.22, 0, 700);
      tone(140, { type: "sine", dur: 0.28, gain: 0.25, to: 60 });
      break;
    case "bonk":
      tone(190, { type: "square", dur: 0.09, gain: 0.16, to: 80 });
      tone(1200, { type: "sine", dur: 0.12, gain: 0.06, at: 0.02 });
      break;
    case "whistle":
      tone(1400, { type: "sine", dur: 0.14, gain: 0.16 });
      tone(1400, { type: "sine", dur: 0.3, gain: 0.16, at: 0.18, to: 1750 });
      break;
    case "splash":
      noise(0.3, 0.2, 0, 1400);
      tone(300, { type: "sine", dur: 0.2, gain: 0.08, to: 90 });
      break;
    case "recover":
      tone(523, { type: "triangle", dur: 0.1, gain: 0.14 });
      tone(659, { type: "triangle", dur: 0.16, gain: 0.14, at: 0.08 });
      break;
    case "soft":
      tone(659, { type: "triangle", dur: 0.14, gain: 0.14 });
      tone(880, { type: "triangle", dur: 0.22, gain: 0.12, at: 0.1 });
      break;
    case "milestone": {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((f, i) => tone(f, { type: "triangle", dur: 0.32, gain: 0.16, at: i * 0.07 }));
      tone(261.63, { type: "sine", dur: 0.9, gain: 0.12, at: 0.1 });
      break;
    }
    case "complete": {
      const notes = [392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => tone(f, { type: "triangle", dur: 0.3, gain: 0.14, at: i * 0.09 }));
      tone(1567.98, { type: "sine", dur: 0.7, gain: 0.07, at: 0.5 });
      break;
    }
  }
}

export const sfx = { play, setMuted, unlockAudio };

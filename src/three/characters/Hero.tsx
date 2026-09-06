import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { HeroMode, Mood } from "../../game/types";
import type { Sim } from "../../game/simulation";

/**
 * AYUSH — the hero.
 * Fully articulated low-poly character: hips → thighs → knees → shins → shoes,
 * shoulders → upper arms → elbows → forearms → hands with fingers,
 * torso with hoodie + backpack (secondary motion), expressive head.
 *
 * Every frame, target joint rotations are computed from the current mode and
 * damped toward — so switching run → jump → swim → caught always feels fluid.
 */

const SKIN = "#E8B48C";
const SKIN_D = "#D19A72";
const HAIR = "#23180F";
const HOODIE = "#F4F1EA";
const HOODIE_D = "#D8D3C8";
const ACCENT = "#FFB86B";
const PANTS = "#2A3A5C";
const PANTS_D = "#1E2C48";
const SHOE = "#FAFAF7";
const SOLE = "#1A1A1A";
const PACK = "#C2543A";
const PACK_D = "#9C3F2B";

interface Props {
  mode?: HeroMode;
  mood?: Mood;
  /** run-cycle phase driver (engine time × cadence) — keeps gait in sync with speed */
  gait?: number;
  stateRef?: MutableRefObject<Sim>;
  reduced?: boolean;
}

/* damp helper that works on plain numbers stored in a ref-map */
function useJointMap() {
  return useRef<Record<string, number>>({});
}
function d(map: Record<string, number>, key: string, target: number, dt: number, lambda = 12) {
  const cur = map[key] ?? target;
  const next = THREE.MathUtils.damp(cur, target, lambda, dt);
  map[key] = next;
  return next;
}

export function Hero({ mode: previewMode = "idle", mood: previewMood = "neutral", gait = 0, stateRef, reduced = false }: Props) {
  const root = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const elbowL = useRef<THREE.Group>(null);
  const elbowR = useRef<THREE.Group>(null);
  const pack = useRef<THREE.Group>(null);
  const eyeL = useRef<THREE.Group>(null);
  const eyeR = useRef<THREE.Group>(null);
  const browL = useRef<THREE.Mesh>(null);
  const browR = useRef<THREE.Mesh>(null);
  const mouthSmile = useRef<THREE.Mesh>(null);
  const mouthOpen = useRef<THREE.Mesh>(null);
  const j = useJointMap();
  const blinkAt = useRef(2);
  const t = useRef(0);

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6 }), []);
  const skinDMat = useMemo(() => new THREE.MeshStandardMaterial({ color: SKIN_D, roughness: 0.65 }), []);

  useFrame((_state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    t.current += dt;
    const time = t.current;
    const live = stateRef?.current;
    const mode = live?.paused ? "idle" : live?.heroMode ?? previewMode;
    const mood = live?.mood ?? previewMood;
    const g = live?.gait ?? gait;
    const m = j.current;
    if (!root.current) return;

    /* ---------- per-mode targets ---------- */
    let legLx = 0, legRx = 0, kneeLx = 0.1, kneeRx = 0.1;
    let armLx = 0.1, armRx = -0.1, elbowLx = -0.3, elbowRx = -0.3;
    let armLz = 0.12, armRz = -0.12;
    let torsoX = 0.06, torsoY = 0, torsoZ = 0, hipsY = 0.95;
    let headX = 0, headY = 0, headZ = 0;
    let rootX = 0, rootY = 0, rootZrot = 0;
    let bob = 0;

    const sin = Math.sin(g);
    const cos = Math.cos(g);

    switch (mode) {
      case "run": {
        legLx = sin * 1.0;
        legRx = -sin * 1.0;
        kneeLx = Math.max(0.12, -sin) * 1.35 + 0.12;
        kneeRx = Math.max(0.12, sin) * 1.35 + 0.12;
        armLx = -sin * 0.85;
        armRx = sin * 0.85;
        elbowLx = -1.05 - Math.max(0, -sin) * 0.35;
        elbowRx = -1.05 - Math.max(0, sin) * 0.35;
        torsoX = 0.22;
        torsoY = sin * 0.05;
        bob = Math.abs(cos) * 0.09;
        headX = -0.12;
        break;
      }
      case "walk": {
        legLx = sin * 0.55;
        legRx = -sin * 0.55;
        kneeLx = Math.max(0.1, -sin) * 0.5 + 0.08;
        kneeRx = Math.max(0.1, sin) * 0.5 + 0.08;
        armLx = -sin * 0.4;
        armRx = sin * 0.4;
        elbowLx = -0.5;
        elbowRx = -0.5;
        torsoX = 0.08;
        bob = Math.abs(cos) * 0.045;
        headY = Math.sin(time * 0.7) * 0.12;
        break;
      }
      case "jump": {
        legLx = -0.95;
        legRx = -0.5;
        kneeLx = 1.7;
        kneeRx = 1.2;
        armLx = -2.3;
        armRx = -2.6;
        elbowLx = -0.3;
        elbowRx = -0.2;
        torsoX = 0.14;
        headX = -0.1;
        break;
      }
      case "dive": {
        rootX = 1.15;
        legLx = 0.15;
        legRx = -0.1;
        kneeLx = 0.2;
        kneeRx = 0.2;
        armLx = -2.9;
        armRx = -2.9;
        armLz = 0.05;
        armRz = -0.05;
        elbowLx = -0.1;
        elbowRx = -0.1;
        torsoX = 0.1;
        headX = -0.35;
        break;
      }
      case "swim": {
        rootX = 1.32;
        const stroke = g;
        // alternating full crawl strokes
        armLx = -1.6 + Math.sin(stroke) * 1.5;
        armRx = -1.6 + Math.sin(stroke + Math.PI) * 1.5;
        elbowLx = -0.5 - Math.max(0, Math.sin(stroke + 1)) * 0.9;
        elbowRx = -0.5 - Math.max(0, Math.sin(stroke + Math.PI + 1)) * 0.9;
        armLz = 0.25;
        armRz = -0.25;
        legLx = Math.sin(stroke * 2) * 0.45;
        legRx = Math.sin(stroke * 2 + Math.PI) * 0.45;
        kneeLx = 0.25 + Math.max(0, Math.sin(stroke * 2)) * 0.4;
        kneeRx = 0.25 + Math.max(0, Math.sin(stroke * 2 + Math.PI)) * 0.4;
        torsoX = 0.05;
        headX = -0.95; // lift the face against the forward swimming pitch
        headY = Math.sin(stroke) * 0.12;
        bob = Math.sin(time * 2.4) * 0.035;
        break;
      }
      case "exit": {
        legLx = -0.35;
        legRx = 0.2;
        kneeLx = 0.7;
        kneeRx = 0.3;
        armLx = -0.75;
        armRx = -0.65;
        elbowLx = -0.6;
        elbowRx = -0.6;
        torsoX = 0.2;
        break;
      }
      case "stumble": {
        const w = Math.sin(time * 22) * Math.max(0, 1 - time * 0.001);
        rootX = 0.35 + w * 0.08;
        torsoX = 0.55 + w * 0.1;
        armLx = -1.9 + w * 0.6;
        armRx = -2.2 - w * 0.5;
        armLz = 0.7;
        armRz = -0.7;
        elbowLx = -0.4;
        elbowRx = -0.3;
        legLx = -0.5;
        legRx = 0.35;
        kneeLx = 1.1;
        kneeRx = 0.5;
        headX = 0.35;
        headZ = w * 0.15;
        break;
      }
      case "caught": {
        // surrender — arms up, knees bent, trembling
        const tr = Math.sin(time * 14) * 0.03;
        armLx = -2.9;
        armRx = -2.9;
        armLz = 0.45;
        armRz = -0.45;
        elbowLx = -0.15;
        elbowRx = -0.15;
        legLx = -0.25;
        legRx = 0.2;
        kneeLx = 0.5;
        kneeRx = 0.4;
        hipsY = 0.88;
        torsoX = 0.12 + tr;
        headX = 0.45;
        headY = -0.5; // look back at the teacher
        rootZrot = tr;
        break;
      }
      case "happy": {
        const hop = Math.abs(Math.sin(time * 5.5));
        rootY = hop * 0.22;
        armLx = -2.7;
        armRx = -2.7;
        armLz = 0.5 + Math.sin(time * 11) * 0.25;
        armRz = -0.5 - Math.sin(time * 11) * 0.25;
        elbowLx = -0.2;
        elbowRx = -0.2;
        legLx = -0.2;
        legRx = 0.15;
        kneeLx = hop * 0.7;
        kneeRx = hop * 0.5;
        torsoX = -0.08;
        headX = -0.2;
        break;
      }
      case "wave": {
        torsoX = 0.02;
        torsoY = 0.25;
        armRx = -2.8;
        armRz = -0.35 + Math.sin(time * 9) * 0.3;
        elbowRx = -0.25;
        armLx = 0.15;
        elbowLx = -0.35;
        legLx = 0.05;
        legRx = -0.08;
        kneeLx = 0.08;
        kneeRx = 0.12;
        headY = 0.35;
        headX = -0.08;
        bob = Math.sin(time * 2) * 0.02;
        break;
      }
      case "idle":
      default: {
        // alive idle: breathing, weight shift, looking around
        const br = Math.sin(time * 1.7);
        torsoX = 0.04 + br * 0.015;
        hipsY = 0.95 + br * 0.008;
        armLx = 0.08 + br * 0.03;
        armRx = -0.08 - br * 0.03;
        elbowLx = -0.3;
        elbowRx = -0.3;
        headY = reduced ? 0 : Math.sin(time * 0.45) * 0.3;
        headX = Math.sin(time * 0.3) * 0.06;
        const shift = Math.sin(time * 0.6) * 0.02;
        torsoZ = shift;
        break;
      }
    }

    /* ---------- damp everything toward targets ---------- */
    const D = 11;
    if (legL.current) legL.current.rotation.x = d(m, "ll", legLx, dt, D);
    if (legR.current) legR.current.rotation.x = d(m, "lr", legRx, dt, D);
    if (kneeL.current) kneeL.current.rotation.x = d(m, "kl", kneeLx, dt, D);
    if (kneeR.current) kneeR.current.rotation.x = d(m, "kr", kneeRx, dt, D);
    if (armL.current) {
      armL.current.rotation.x = d(m, "al", armLx, dt, D);
      armL.current.rotation.z = d(m, "alz", armLz, dt, D);
    }
    if (armR.current) {
      armR.current.rotation.x = d(m, "ar", armRx, dt, D);
      armR.current.rotation.z = d(m, "arz", armRz, dt, D);
    }
    if (elbowL.current) elbowL.current.rotation.x = d(m, "el", elbowLx, dt, D);
    if (elbowR.current) elbowR.current.rotation.x = d(m, "er", elbowRx, dt, D);
    if (torso.current) {
      torso.current.rotation.x = d(m, "tx", torsoX, dt, D);
      torso.current.rotation.y = d(m, "ty", torsoY, dt, D);
      torso.current.rotation.z = d(m, "tz", torsoZ, dt, D);
    }
    if (head.current) {
      head.current.rotation.x = d(m, "hx", headX, dt, 8);
      head.current.rotation.y = d(m, "hy", headY, dt, 6);
      head.current.rotation.z = d(m, "hz", headZ, dt, 8);
    }
    if (root.current) {
      root.current.rotation.x = d(m, "rx", rootX, dt, 9);
      root.current.rotation.z = d(m, "rz", rootZrot, dt, 9);
    }
    // hop + bob applied to hips so root stays free for engine Y placement
    if (hips.current) hips.current.position.y = d(m, "hy2", hipsY + bob + rootY, dt, 16);

    // backpack secondary motion — lags behind the torso
    if (pack.current) {
      const lag = mode === "run" ? Math.sin(g - 0.7) * 0.14 : mode === "swim" ? 0.3 : Math.sin(time * 1.7 - 0.5) * 0.03;
      pack.current.rotation.x = d(m, "px", 0.1 + lag, dt, 7);
    }

    /* ---------- face ---------- */
    // blink scheduling
    if (time > blinkAt.current) {
      blinkAt.current = time + 2.2 + Math.random() * 3.5;
    }
    const since = blinkAt.current - time;
    const blink = since < 0.11 ? Math.sin((since / 0.11) * Math.PI) : 0;
    const eyeScaleY = Math.max(0.08, 1 - blink);
    if (eyeL.current) eyeL.current.scale.y = eyeScaleY;
    if (eyeR.current) eyeR.current.scale.y = eyeScaleY;

    const browT =
      mood === "startled" ? { y: -0.02, fL: 0.35, fR: -0.35 } :
      mood === "determined" ? { y: 0.012, fL: -0.4, fR: 0.4 } :
      mood === "happy" ? { y: -0.012, fL: 0.18, fR: -0.18 } :
      { y: 0, fL: 0.08, fR: -0.08 };
    if (browL.current) {
      browL.current.position.y = d(m, "bly", 0.085 + browT.y, dt, 10);
      browL.current.rotation.z = d(m, "blr", browT.fL, dt, 10);
    }
    if (browR.current) {
      browR.current.position.y = d(m, "bry", 0.085 + browT.y, dt, 10);
      browR.current.rotation.z = d(m, "brr", browT.fR, dt, 10);
    }
    const smile = mood === "happy" || mode === "happy" || mode === "wave" || mode === "idle";
    const open = mood === "startled" || mode === "stumble" || mode === "caught" || mode === "dive";
    if (mouthSmile.current) mouthSmile.current.scale.setScalar(d(m, "ms", smile ? 1 : 0.001, dt, 10));
    if (mouthOpen.current) mouthOpen.current.scale.setScalar(d(m, "mo", open ? 1 : 0.001, dt, 10));
  });

  return (
    <group ref={root}>
      <group ref={hips} position={[0, 0.95, 0]}>
        {/* ---------- LEGS ---------- */}
        <group ref={legL} position={[-0.13, 0, 0]}>
          <mesh position={[0, -0.21, 0]} castShadow>
            <capsuleGeometry args={[0.095, 0.3, 6, 12]} />
            <meshStandardMaterial color={PANTS} roughness={0.8} />
          </mesh>
          <group ref={kneeL} position={[0, -0.42, 0]}>
            <mesh position={[0, -0.19, 0]} castShadow>
              <capsuleGeometry args={[0.08, 0.28, 6, 12]} />
              <meshStandardMaterial color={PANTS_D} roughness={0.8} />
            </mesh>
            <group position={[0, -0.4, 0.05]}>
              <mesh castShadow>
                <boxGeometry args={[0.17, 0.11, 0.3]} />
                <meshStandardMaterial color={SHOE} roughness={0.5} />
              </mesh>
              <mesh position={[0, -0.045, 0.02]}>
                <boxGeometry args={[0.18, 0.035, 0.32]} />
                <meshStandardMaterial color={SOLE} roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.02, 0.1]}>
                <boxGeometry args={[0.175, 0.025, 0.1]} />
                <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.9} toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>
        <group ref={legR} position={[0.13, 0, 0]}>
          <mesh position={[0, -0.21, 0]} castShadow>
            <capsuleGeometry args={[0.095, 0.3, 6, 12]} />
            <meshStandardMaterial color={PANTS} roughness={0.8} />
          </mesh>
          <group ref={kneeR} position={[0, -0.42, 0]}>
            <mesh position={[0, -0.19, 0]} castShadow>
              <capsuleGeometry args={[0.08, 0.28, 6, 12]} />
              <meshStandardMaterial color={PANTS_D} roughness={0.8} />
            </mesh>
            <group position={[0, -0.4, 0.05]}>
              <mesh castShadow>
                <boxGeometry args={[0.17, 0.11, 0.3]} />
                <meshStandardMaterial color={SHOE} roughness={0.5} />
              </mesh>
              <mesh position={[0, -0.045, 0.02]}>
                <boxGeometry args={[0.18, 0.035, 0.32]} />
                <meshStandardMaterial color={SOLE} roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.02, 0.1]}>
                <boxGeometry args={[0.175, 0.025, 0.1]} />
                <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.9} toneMapped={false} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ---------- TORSO ---------- */}
        <group ref={torso} position={[0, 0.06, 0]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <capsuleGeometry args={[0.205, 0.34, 8, 16]} />
            <meshStandardMaterial color={HOODIE} roughness={0.72} />
          </mesh>
          {/* chest stripe */}
          <mesh position={[0, 0.33, 0.185]}>
            <boxGeometry args={[0.3, 0.07, 0.03]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.75} toneMapped={false} />
          </mesh>
          {/* pocket */}
          <mesh position={[0, 0.14, 0.19]}>
            <boxGeometry args={[0.26, 0.13, 0.02]} />
            <meshStandardMaterial color={HOODIE_D} roughness={0.8} />
          </mesh>
          {/* hood bunched at the neck */}
          <mesh position={[0, 0.55, -0.13]} rotation={[0.5, 0, 0]}>
            <torusGeometry args={[0.14, 0.06, 10, 18]} />
            <meshStandardMaterial color={HOODIE_D} roughness={0.85} />
          </mesh>
          {/* drawstrings */}
          <mesh position={[-0.06, 0.46, 0.2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.14, 6]} />
            <meshStandardMaterial color={ACCENT} roughness={0.6} />
          </mesh>
          <mesh position={[0.06, 0.46, 0.2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.14, 6]} />
            <meshStandardMaterial color={ACCENT} roughness={0.6} />
          </mesh>

          {/* ---------- BACKPACK (secondary motion) ---------- */}
          <group ref={pack} position={[0, 0.32, -0.24]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.4, 0.16]} />
              <meshStandardMaterial color={PACK} roughness={0.75} />
            </mesh>
            <mesh position={[0, 0.14, -0.02]}>
              <boxGeometry args={[0.3, 0.14, 0.18]} />
              <meshStandardMaterial color={PACK_D} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.06, -0.09]}>
              <boxGeometry args={[0.22, 0.16, 0.06]} />
              <meshStandardMaterial color={PACK_D} roughness={0.8} />
            </mesh>
            {/* straps over shoulders */}
            <mesh position={[-0.11, 0.1, 0.16]} rotation={[0.25, 0, 0]}>
              <boxGeometry args={[0.05, 0.42, 0.02]} />
              <meshStandardMaterial color={PACK_D} roughness={0.8} />
            </mesh>
            <mesh position={[0.11, 0.1, 0.16]} rotation={[0.25, 0, 0]}>
              <boxGeometry args={[0.05, 0.42, 0.02]} />
              <meshStandardMaterial color={PACK_D} roughness={0.8} />
            </mesh>
          </group>

          {/* ---------- ARMS ---------- */}
          <group ref={armL} position={[-0.27, 0.48, 0]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.22, 6, 12]} />
              <meshStandardMaterial color={HOODIE} roughness={0.72} />
            </mesh>
            <group ref={elbowL} position={[0, -0.3, 0]}>
              <mesh position={[0, -0.13, 0]} castShadow>
                <capsuleGeometry args={[0.06, 0.2, 6, 12]} />
                <meshStandardMaterial color={HOODIE_D} roughness={0.72} />
              </mesh>
              {/* hand with fingers */}
              <group position={[0, -0.28, 0]}>
                <mesh castShadow material={skinMat}>
                  <sphereGeometry args={[0.07, 12, 10]} />
                </mesh>
                {[-0.035, 0, 0.035].map((fx, i) => (
                  <mesh key={i} position={[fx, -0.075, 0.012]} material={i === 1 ? skinMat : skinDMat}>
                    <capsuleGeometry args={[0.017, 0.045, 4, 8]} />
                  </mesh>
                ))}
                <mesh position={[0.065, -0.015, 0.02]} rotation={[0, 0, -0.6]} material={skinDMat}>
                  <capsuleGeometry args={[0.016, 0.04, 4, 8]} />
                </mesh>
              </group>
            </group>
          </group>
          <group ref={armR} position={[0.27, 0.48, 0]}>
            <mesh position={[0, -0.15, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.22, 6, 12]} />
              <meshStandardMaterial color={HOODIE} roughness={0.72} />
            </mesh>
            <group ref={elbowR} position={[0, -0.3, 0]}>
              <mesh position={[0, -0.13, 0]} castShadow>
                <capsuleGeometry args={[0.06, 0.2, 6, 12]} />
                <meshStandardMaterial color={HOODIE_D} roughness={0.72} />
              </mesh>
              <group position={[0, -0.28, 0]}>
                <mesh castShadow material={skinMat}>
                  <sphereGeometry args={[0.07, 12, 10]} />
                </mesh>
                {[-0.035, 0, 0.035].map((fx, i) => (
                  <mesh key={i} position={[fx, -0.075, 0.012]} material={i === 1 ? skinMat : skinDMat}>
                    <capsuleGeometry args={[0.017, 0.045, 4, 8]} />
                  </mesh>
                ))}
                <mesh position={[-0.065, -0.015, 0.02]} rotation={[0, 0, 0.6]} material={skinDMat}>
                  <capsuleGeometry args={[0.016, 0.04, 4, 8]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* ---------- HEAD ---------- */}
          <group ref={head} position={[0, 0.68, 0.01]}>
            <mesh castShadow material={skinMat}>
              <sphereGeometry args={[0.225, 24, 18]} />
            </mesh>
            {/* hair — cap + quiff + sides */}
            <mesh position={[0, 0.06, -0.02]}>
              <sphereGeometry args={[0.235, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>
            <mesh position={[0.05, 0.19, 0.14]} rotation={[0.5, 0.2, -0.15]}>
              <boxGeometry args={[0.16, 0.07, 0.12]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>
            <mesh position={[-0.21, 0.02, 0.02]}>
              <boxGeometry args={[0.05, 0.14, 0.14]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>
            <mesh position={[0.21, 0.02, 0.02]}>
              <boxGeometry args={[0.05, 0.14, 0.14]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>
            {/* ears */}
            <mesh position={[-0.22, -0.02, 0]} material={skinDMat}>
              <sphereGeometry args={[0.05, 10, 10]} />
            </mesh>
            <mesh position={[0.22, -0.02, 0]} material={skinDMat}>
              <sphereGeometry args={[0.05, 10, 10]} />
            </mesh>
            {/* brows */}
            <mesh ref={browL} position={[-0.085, 0.085, 0.2]}>
              <boxGeometry args={[0.085, 0.022, 0.02]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>
            <mesh ref={browR} position={[0.085, 0.085, 0.2]}>
              <boxGeometry args={[0.085, 0.022, 0.02]} />
              <meshStandardMaterial color={HAIR} roughness={0.9} />
            </mesh>
            {/* eyes — white + pupil + catchlight */}
            {[-0.085, 0.085].map((ex, i) => (
              <group key={i} ref={i === 0 ? eyeL : eyeR} position={[ex, 0.02, 0.19]}>
                <mesh>
                  <sphereGeometry args={[0.052, 14, 12]} />
                  <meshStandardMaterial color="#FFFFFF" roughness={0.25} />
                </mesh>
                <mesh position={[0, 0.004, 0.036]}>
                  <sphereGeometry args={[0.027, 12, 10]} />
                  <meshStandardMaterial color="#1B1207" roughness={0.3} />
                </mesh>
                <mesh position={[0.012, 0.02, 0.052]}>
                  <sphereGeometry args={[0.009, 8, 8]} />
                  <meshBasicMaterial color="#BFE8FF" toneMapped={false} />
                </mesh>
              </group>
            ))}
            {/* nose */}
            <mesh position={[0, -0.045, 0.22]} material={skinDMat}>
              <sphereGeometry args={[0.024, 10, 8]} />
            </mesh>
            {/* mouths (scale-toggled) */}
            <mesh ref={mouthSmile} position={[0, -0.115, 0.19]} rotation={[0.15, 0, Math.PI]}>
              <torusGeometry args={[0.055, 0.013, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#7A3A30" roughness={0.6} />
            </mesh>
            <mesh ref={mouthOpen} position={[0, -0.12, 0.2]} scale={0.001}>
              <sphereGeometry args={[0.045, 12, 10]} />
              <meshStandardMaterial color="#5A241E" roughness={0.6} />
            </mesh>
            {/* cheek blush */}
            <mesh position={[-0.14, -0.06, 0.16]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#E8927C" transparent opacity={0.5} roughness={0.8} />
            </mesh>
            <mesh position={[0.14, -0.06, 0.16]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#E8927C" transparent opacity={0.5} roughness={0.8} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

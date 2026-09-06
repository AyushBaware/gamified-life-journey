import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { TeacherMode } from "../../game/types";
import type { Sim } from "../../game/simulation";

/**
 * TRAFFIC OFFICER — the 12th-standard chaser.
 * Ayush is 17 and riding a scooty, so a khaki-clad traffic officer with a
 * peaked cap, whistle, and lathi runs him down instead of the teacher.
 * Same rig & modes as the teacher so the simulation stays unchanged.
 */

const SKIN = "#C98F62";
const SKIN_D = "#B07A50";
const KHAKI = "#B7A26B";
const KHAKI_D = "#94804F";
const PANTS = "#5A4A32";
const SHOE = "#2A2118";
const CAP = "#A38F5C";
const BELT = "#2E2418";
const WOOD = "#6B4423";

interface Props {
  mode?: TeacherMode;
  gait?: number;
  stateRef?: MutableRefObject<Sim>;
}

function useJointMap() {
  return useRef<Record<string, number>>({});
}
function d(map: Record<string, number>, key: string, target: number, dt: number, lambda = 12) {
  const cur = map[key] ?? target;
  const next = THREE.MathUtils.damp(cur, target, lambda, dt);
  map[key] = next;
  return next;
}

export function Officer({ mode: previewMode = "idle", gait: previewGait = 0, stateRef }: Props) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const belly = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const elbowR = useRef<THREE.Group>(null);
  const lathi = useRef<THREE.Group>(null);
  const j = useJointMap();
  const t = useRef(3);

  useFrame((_s, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    t.current += dt;
    const time = t.current;
    const live = stateRef?.current;
    const mode = live?.paused ? "idle" : live?.teacherMode ?? previewMode;
    const gait = live?.teacherGait ?? previewGait;
    const m = j.current;
    if (!root.current) return;

    let legLx = 0, legRx = 0, armLx = 0.15, armRx = -2.1, elbowRx = -0.5;
    let armLz = 0.15, armRz = -0.25;
    let torsoX = 0.2, headX = -0.1;
    let bounce = 0;

    const sin = Math.sin(gait);

    switch (mode) {
      case "chase": {
        legLx = sin * 0.85;
        legRx = -sin * 0.85;
        armLx = -sin * 0.6;
        armRx = -2.1 + sin * 0.15;
        torsoX = 0.22;
        bounce = Math.abs(Math.cos(gait)) * 0.07;
        headX = -0.15;
        break;
      }
      case "sprint": {
        const fast = Math.sin(gait * 1.7);
        legLx = fast * 1.15;
        legRx = -fast * 1.15;
        armLx = -fast * 0.9;
        armRx = -2.5;
        elbowRx = -0.3;
        torsoX = 0.42;
        bounce = Math.abs(Math.cos(gait * 1.7)) * 0.1;
        headX = -0.3;
        break;
      }
      case "swing": {
        // lathi raised and waved overhead
        legLx = 0.2;
        legRx = -0.3;
        armRx = -2.6 + Math.sin(time * 16) * 0.9;
        elbowRx = -0.2;
        armLx = -0.8;
        torsoX = 0.3 + Math.sin(time * 16) * 0.08;
        headX = -0.2;
        break;
      }
      case "catch": {
        armLx = -1.5;
        armLz = 0.1;
        armRx = -2.9;
        elbowRx = -0.15;
        torsoX = 0.1;
        legLx = -0.15;
        legRx = 0.25;
        headX = -0.05;
        bounce = Math.sin(time * 6) * 0.02;
        break;
      }
      case "point": {
        // whistle-blowing halt gesture at the poolside
        armRx = -1.55;
        elbowRx = -0.05;
        armLx = 0.2;
        torsoX = 0.06;
        legLx = 0.05;
        legRx = -0.05;
        headX = -0.1;
        const w = Math.sin(time * 3);
        armRz = -0.1 + w * 0.08;
        break;
      }
      case "retreat": {
        const slow = Math.sin(gait * 0.6);
        legLx = slow * 0.4;
        legRx = -slow * 0.4;
        armLx = -slow * 0.3;
        armRx = -1.9;
        torsoX = 0.12;
        headX = -0.1;
        break;
      }
      default: {
        const br = Math.sin(time * 1.5);
        torsoX = 0.06 + br * 0.015;
        armRx = -1.9 + br * 0.04;
        break;
      }
    }

    const D = 10;
    if (legL.current) legL.current.rotation.x = d(m, "ll", legLx, dt, D);
    if (legR.current) legR.current.rotation.x = d(m, "lr", legRx, dt, D);
    const moving = mode === "chase" || mode === "sprint" || mode === "retreat";
    if (kneeL.current) kneeL.current.rotation.x = d(m, "kl", moving ? 0.08 + Math.max(0, -legLx) * 1.1 : 0.04, dt, D);
    if (kneeR.current) kneeR.current.rotation.x = d(m, "kr", moving ? 0.08 + Math.max(0, -legRx) * 1.1 : 0.04, dt, D);
    if (armL.current) {
      armL.current.rotation.x = d(m, "al", armLx, dt, D);
      armL.current.rotation.z = d(m, "alz", armLz, dt, D);
    }
    if (armR.current) {
      armR.current.rotation.x = d(m, "ar", armRx, dt, D);
      armR.current.rotation.z = d(m, "arz", armRz, dt, D);
    }
    if (elbowR.current) elbowR.current.rotation.x = d(m, "er", elbowRx, dt, D);
    if (torso.current) {
      torso.current.rotation.x = d(m, "tx", torsoX, dt, D);
      torso.current.position.y = 1.12 + bounce;
      const jig = mode === "chase" || mode === "sprint" ? Math.sin(gait * 2) * 0.02 : 0;
      if (belly.current) belly.current.scale.set(1 + jig, 1 - jig * 0.6, 1 + jig);
    }
    if (head.current) {
      head.current.rotation.x = d(m, "hx", headX, dt, 8);
      head.current.rotation.z = mode === "swing" ? Math.sin(time * 16) * 0.06 : 0;
    }
    if (lathi.current) {
      lathi.current.rotation.z = mode === "swing" ? 0.3 + Math.sin(time * 16) * 0.25 : 0.18;
    }
  });

  return (
    <group ref={root}>
      {/* ---------- LEGS ---------- */}
      <group ref={legL} position={[-0.15, 0.98, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <capsuleGeometry args={[0.105, 0.34, 6, 12]} />
          <meshStandardMaterial color={PANTS} roughness={0.85} />
        </mesh>
        <group ref={kneeL} position={[0, -0.45, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.29, 6, 12]} />
            <meshStandardMaterial color={PANTS} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.45, 0.05]} castShadow>
            <boxGeometry args={[0.19, 0.1, 0.32]} />
            <meshStandardMaterial color={SHOE} roughness={0.5} />
          </mesh>
        </group>
      </group>
      <group ref={legR} position={[0.15, 0.98, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <capsuleGeometry args={[0.105, 0.34, 6, 12]} />
          <meshStandardMaterial color={PANTS} roughness={0.85} />
        </mesh>
        <group ref={kneeR} position={[0, -0.45, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.29, 6, 12]} />
            <meshStandardMaterial color={PANTS} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.45, 0.05]} castShadow>
            <boxGeometry args={[0.19, 0.1, 0.32]} />
            <meshStandardMaterial color={SHOE} roughness={0.5} />
          </mesh>
        </group>
      </group>

      {/* ---------- TORSO ---------- */}
      <group ref={torso} position={[0, 1.12, 0]}>
        <mesh position={[0, 0.32, 0]} castShadow>
          <capsuleGeometry args={[0.23, 0.4, 8, 16]} />
          <meshStandardMaterial color={KHAKI} roughness={0.75} />
        </mesh>
        <mesh ref={belly} position={[0, 0.16, 0.06]} castShadow>
          <sphereGeometry args={[0.26, 18, 14]} />
          <meshStandardMaterial color={KHAKI} roughness={0.75} />
        </mesh>
        {/* shirt pockets */}
        {[-0.17, 0.17].map((x) => (
          <mesh key={x} position={[x, 0.38, 0.24]}>
            <boxGeometry args={[0.11, 0.1, 0.02]} />
            <meshStandardMaterial color={KHAKI_D} roughness={0.8} />
          </mesh>
        ))}
        {/* epaulettes */}
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 0.58, 0.02]}>
            <boxGeometry args={[0.09, 0.02, 0.14]} />
            <meshStandardMaterial color={KHAKI_D} roughness={0.8} />
          </mesh>
        ))}
        {/* whistle cord */}
        <mesh position={[0, 0.52, 0.26]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.05, 0.08, 0.02]} />
          <meshStandardMaterial color="#B3122E" roughness={0.5} />
        </mesh>
        {/* belt + buckle */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.235, 0.24, 0.07, 16]} />
          <meshStandardMaterial color={BELT} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.03, 0.24]}>
          <boxGeometry args={[0.08, 0.05, 0.02]} />
          <meshStandardMaterial color="#D9B44A" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* ---------- ARMS ---------- */}
        <group ref={armL} position={[-0.29, 0.52, 0]}>
          <mesh position={[0, -0.17, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.24, 6, 12]} />
            <meshStandardMaterial color={KHAKI} roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.33, 0]}>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        </group>
        <group ref={armR} position={[0.29, 0.52, 0]}>
          <mesh position={[0, -0.17, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.24, 6, 12]} />
            <meshStandardMaterial color={KHAKI} roughness={0.75} />
          </mesh>
          <group ref={elbowR} position={[0, -0.32, 0]}>
            <mesh position={[0, -0.14, 0]} castShadow>
              <capsuleGeometry args={[0.07, 0.2, 6, 12]} />
              <meshStandardMaterial color={KHAKI_D} roughness={0.75} />
            </mesh>
            <group ref={lathi} position={[0, -0.3, 0.02]}>
              <mesh castShadow>
                <sphereGeometry args={[0.08, 12, 10]} />
                <meshStandardMaterial color={SKIN} roughness={0.6} />
              </mesh>
              {/* black police lathi */}
              <mesh position={[0, 0.42, 0]} castShadow>
                <cylinderGeometry args={[0.032, 0.04, 0.9, 10]} />
                <meshStandardMaterial color={WOOD} roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.88, 0]}>
                <cylinderGeometry args={[0.04, 0.032, 0.12, 10]} />
                <meshStandardMaterial color="#3A2A16" roughness={0.6} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ---------- HEAD ---------- */}
        <group ref={head} position={[0, 0.76, 0.02]}>
          <mesh castShadow>
            <sphereGeometry args={[0.215, 22, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.62} />
          </mesh>
          {/* peaked cap */}
          <mesh position={[0, 0.1, -0.01]}>
            <cylinderGeometry args={[0.225, 0.235, 0.1, 18]} />
            <meshStandardMaterial color={CAP} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.2, 0.225, 0.045, 18]} />
            <meshStandardMaterial color={KHAKI_D} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.02, 0.22]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.24, 0.03, 0.12]} />
            <meshStandardMaterial color={CAP} roughness={0.7} />
          </mesh>
          {/* cap badge */}
          <mesh position={[0, 0.14, 0.2]}>
            <circleGeometry args={[0.035, 10]} />
            <meshStandardMaterial color="#D9B44A" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* moustache */}
          <mesh position={[0, -0.075, 0.195]}>
            <boxGeometry args={[0.15, 0.045, 0.04]} />
            <meshStandardMaterial color="#2A2118" roughness={0.95} />
          </mesh>
          {/* stern eyes */}
          <mesh position={[-0.082, 0.02, 0.19]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#120B06" />
          </mesh>
          <mesh position={[0.082, 0.02, 0.19]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#120B06" />
          </mesh>
          <mesh position={[-0.082, 0.09, 0.195]} rotation={[0, 0, -0.45]}>
            <boxGeometry args={[0.09, 0.026, 0.02]} />
            <meshStandardMaterial color="#2A2118" roughness={0.95} />
          </mesh>
          <mesh position={[0.082, 0.09, 0.195]} rotation={[0, 0, 0.45]}>
            <boxGeometry args={[0.09, 0.026, 0.02]} />
            <meshStandardMaterial color="#2A2118" roughness={0.95} />
          </mesh>
          {/* ears */}
          <mesh position={[-0.21, -0.01, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color={SKIN_D} roughness={0.7} />
          </mesh>
          <mesh position={[0.21, -0.01, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color={SKIN_D} roughness={0.7} />
          </mesh>
          {/* frown */}
          <mesh position={[0, -0.135, 0.18]}>
            <torusGeometry args={[0.045, 0.011, 8, 14, Math.PI]} />
            <meshStandardMaterial color="#6E3A2A" roughness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

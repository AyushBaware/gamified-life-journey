import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { makeLabelTexture } from "../textures";
import { PX } from "../../game/constants";
import type { LevelEvent, ObjectStatus } from "../../game/types";

/** A floating label card above an obstacle */
function Label({ text, y }: { text: string; y: number }) {
  const { tex, aspect } = useMemo(() => makeLabelTexture(text, { font: "600 34px 'Space Grotesk', sans-serif" }), [text]);
  return (
    <mesh position={[0, y, 0]}>
      <planeGeometry args={[1.15 * aspect * 0.42, 1.15 * 0.42]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ------- variants ------- */

function Books({ w }: { w: number }) {
  const colors = ["#C2543A", "#3E6FB0", "#D9A441", "#4E8A5A"];
  return (
    <group>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[(i % 2 ? 0.05 : -0.05), 0.09 + i * 0.17, 0]} rotation={[0, (i % 2 ? 1 : -1) * 0.08, 0]} castShadow>
          <boxGeometry args={[w - i * 0.06, 0.16, 0.5]} />
          <meshStandardMaterial color={colors[i]} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0.1, 0.82, 0]} rotation={[0, 0.3, 0.12]} castShadow>
        <boxGeometry args={[0.4, 0.13, 0.42]} />
        <meshStandardMaterial color="#7A4FB0" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Desk({ w }: { w: number }) {
  return (
    <group>
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[w, 0.08, 0.62]} />
        <meshStandardMaterial color="#8A5A30" roughness={0.75} />
      </mesh>
      {[-w / 2 + 0.08, w / 2 - 0.08].map((lx, i) => (
        <mesh key={i} position={[lx, 0.3, 0]} castShadow>
          <boxGeometry args={[0.09, 0.6, 0.55]} />
          <meshStandardMaterial color="#6E4522" roughness={0.8} />
        </mesh>
      ))}
      {/* exam paper + pencil */}
      <mesh position={[-0.12, 0.675, 0.05]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.3, 0.4]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.2, 0.68, 0.1]} rotation={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.26, 6]} />
        <meshStandardMaterial color="#F2B04A" />
      </mesh>
    </group>
  );
}

function HurdleBar({ w, h }: { w: number; h: number }) {
  return (
    <group>
      {[-w / 2 + 0.06, w / 2 - 0.06].map((lx, i) => (
        <group key={i} position={[lx, 0, 0]}>
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, h, 10]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.3, 0.08, 0.3]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, h - 0.05, 0]} castShadow>
        <boxGeometry args={[w + 0.06, 0.13, 0.09]} />
        <meshStandardMaterial color="#FFB86B" emissive="#FFB86B" emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <mesh position={[0, h - 0.28, 0]}>
        <boxGeometry args={[w + 0.06, 0.05, 0.05]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
      </mesh>
    </group>
  );
}

function BenchObstacle({ w }: { w: number }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[w, 0.09, 0.5]} />
        <meshStandardMaterial color="#6B4A2B" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[w, 0.07, 0.5]} />
        <meshStandardMaterial color="#7A5636" roughness={0.85} />
      </mesh>
      {[-w / 2 + 0.1, w / 2 - 0.1].map((lx, i) => (
        <mesh key={i} position={[lx, 0.18, 0]}>
          <boxGeometry args={[0.1, 0.36, 0.44]} />
          <meshStandardMaterial color="#3F2E1E" roughness={0.9} />
        </mesh>
      ))}
      {/* forgotten sports bottle */}
      <mesh position={[0.3, 0.62, 0.1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 10]} />
        <meshStandardMaterial color="#2DD4BF" roughness={0.4} />
      </mesh>
    </group>
  );
}

function Cones({ w }: { w: number }) {
  return (
    <group>
      {[-w / 3, w / 3].map((cx, i) => (
        <group key={i} position={[cx, 0, i ? 0.12 : -0.1]}>
          <mesh position={[0, 0.26, 0]} castShadow>
            <coneGeometry args={[0.2, 0.52, 14]} />
            <meshStandardMaterial color="#EA580C" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.145, 0.165, 0.09, 14]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.42, 0.04, 0.42]} />
            <meshStandardMaterial color="#C2410C" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SchoolBag({ w }: { w: number }) {
  return (
    <group rotation={[0, 0.4, 0.12]}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[w * 0.8, 0.55, 0.3]} />
        <meshStandardMaterial color="#3E6FB0" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.42, 0.14]} castShadow>
        <boxGeometry args={[w * 0.6, 0.3, 0.1]} />
        <meshStandardMaterial color="#2C5288" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.6, -0.05]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 14]} />
        <meshStandardMaterial color="#22416E" roughness={0.8} />
      </mesh>
      {/* spilled notebooks */}
      <mesh position={[0.42, 0.02, 0.2]} rotation={[-Math.PI / 2, 0, 0.6]}>
        <planeGeometry args={[0.3, 0.4]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ------- wrapper ------- */

interface Props {
  ev: Extract<LevelEvent, { kind: "hurdle" }>;
  status: ObjectStatus;
}

export function Obstacle({ ev, status }: Props) {
  const ref = useRef<THREE.Group>(null);
  const hit = status === "hit";
  const cleared = status === "cleared";
  useFrame((_s, dt) => {
    if (!ref.current) return;
    const target = hit ? 1.25 : 0;
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, target, 7, dt);
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, hit ? -0.15 : 0, 5, dt);
  });
  const w = ev.w / PX;
  const h = ev.h / PX;
  const nativeHeight = { books: 0.97, desk: 0.72, bar: h, bench: 0.73, cone: 0.55, bag: 0.75 }[ev.variant];
  const tint = cleared ? "#4ade80" : undefined;

  return (
    <group position={[0, 0, -ev.x / PX]}>
      <group ref={ref}>
        <group scale={[1, h / nativeHeight, 1]}>
        {ev.variant === "books" && <Books w={w} />}
        {ev.variant === "desk" && <Desk w={w} />}
        {ev.variant === "bar" && <HurdleBar w={w} h={h} />}
        {ev.variant === "bench" && <BenchObstacle w={w} />}
        {ev.variant === "cone" && <Cones w={w} />}
        {ev.variant === "bag" && <SchoolBag w={w} />}
        </group>
        {cleared && (
          <mesh position={[0, h + 0.35, 0]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshBasicMaterial color={tint} toneMapped={false} />
          </mesh>
        )}
      </group>
      <Label text={cleared ? `✓ ${ev.label}` : ev.label} y={h + 0.62} />
      {/* ground shadow strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[w + 0.3, 0.9]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}

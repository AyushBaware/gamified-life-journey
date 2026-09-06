import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { makeLabelTexture } from "../textures";
import { PX } from "../../game/constants";
import type { ObjectStatus } from "../../game/types";

/**
 * The 10th Boards gate — a checkpoint arch with a shimmering energy
 * field. Waiting → pulsing prompt. Unlocked → field dissolves, pillars
 * flash green, confetti handled by the engine.
 */
export function Gate({ x, label, status }: { x: number; label: string; status: ObjectStatus }) {
  const energy = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const orbL = useRef<THREE.Mesh>(null);
  const orbR = useRef<THREE.Mesh>(null);
  const unlocked = status === "unlocked" || status === "done";
  const waiting = status === "waiting";

  const banner = useMemo(
    () => makeLabelTexture(label, { font: "700 46px 'Fredoka', sans-serif", color: "#1A1206", bg: "rgba(255,184,107,0.96)", border: "rgba(255,255,255,0.6)" }),
    [label],
  );
  const prompt = useMemo(
    () => makeLabelTexture("SPACE / TAP TO UNLOCK", { font: "600 34px 'Space Grotesk', sans-serif", color: "#FFE3AE", bg: "rgba(11,15,25,0.85)", border: "rgba(255,184,107,0.8)" }),
    [],
  );

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (energy.current) {
      const m = energy.current.material as THREE.MeshBasicMaterial;
      if (unlocked) {
        m.opacity = THREE.MathUtils.damp(m.opacity, 0, 5, dt);
        energy.current.scale.y = THREE.MathUtils.damp(energy.current.scale.y, 0.02, 5, dt);
      } else {
        energy.current.scale.y = 1;
        m.opacity = waiting ? 0.4 + Math.sin(t * 3.2) * 0.16 : 0.26 + Math.sin(t * 1.6) * 0.07;
      }
    }
    if (ring.current) ring.current.rotation.z = t * 0.6;
    const orbColor = unlocked ? "#4ade80" : "#FFB86B";
    [orbL, orbR].forEach((o) => {
      if (!o.current) return;
      const m = o.current.material as THREE.MeshStandardMaterial;
      m.color.set(orbColor);
      m.emissive.set(orbColor);
      const s = 1 + Math.sin(t * 3) * 0.12;
      o.current.scale.setScalar(s);
    });
  });

  const W = 5.6;
  const H = 5.2;

  return (
    <group position={[0, 0, -x / PX]}>
      {/* pillars */}
      {[-W / 2, W / 2].map((px, i) => (
        <group key={i} position={[px, 0, 0]}>
          <mesh position={[0, H / 2, 0]} castShadow>
            <boxGeometry args={[0.6, H, 0.6]} />
            <meshStandardMaterial color="#1E293B" roughness={0.55} metalness={0.35} />
          </mesh>
          <mesh position={[0, H / 2, 0.32]}>
            <boxGeometry args={[0.1, H * 0.84, 0.05]} />
            <meshStandardMaterial color="#FFB86B" emissive="#FFB86B" emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
          <mesh ref={i === 0 ? orbL : orbR} position={[0, H + 0.3, 0]}>
            <sphereGeometry args={[0.2, 14, 12]} />
            <meshStandardMaterial color="#FFB86B" emissive="#FFB86B" emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
          <pointLight position={[0, H + 0.4, 0.6]} color="#FFB86B" intensity={8} distance={9} decay={2} />
          {/* base */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.95, 0.24, 0.95]} />
            <meshStandardMaterial color="#0F172A" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* top beam + banner */}
      <mesh position={[0, H, 0]} castShadow>
        <boxGeometry args={[W + 0.7, 0.45, 0.55]} />
        <meshStandardMaterial color="#0F172A" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0, H, 0.3]}>
        <planeGeometry args={[3.4 * banner.aspect * 0.3, 3.4 * 0.3]} />
        <meshBasicMaterial map={banner.tex} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      {/* energy field */}
      <mesh ref={energy} position={[0, H / 2 - 0.15, 0]}>
        <planeGeometry args={[W - 0.55, H - 0.4, 1, 8]} />
        <meshBasicMaterial color="#FFB86B" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* rotating floor ring */}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[W / 2 - 0.5, W / 2 + 0.25, 48, 1, 0, Math.PI * 1.5]} />
        <meshBasicMaterial color="#FFB86B" transparent opacity={unlocked ? 0.12 : 0.55} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* prompt */}
      {waiting && (
        <mesh position={[0, H + 1.15, 0]}>
          <planeGeometry args={[3.1 * prompt.aspect * 0.26, 3.1 * 0.26]} />
          <meshBasicMaterial map={prompt.tex} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

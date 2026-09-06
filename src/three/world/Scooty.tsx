import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { Sim } from "../../game/simulation";

/**
 * An Activa-style scooty — the hero rides this to college.
 * Spinning wheels, suspension bob, glowing headlight, twin mirrors.
 */

const BODY = "#C94F3D";      // classic Activa red
const BODY_D = "#9E3428";    // deeper red for shadows
const PANEL = "#E8E2D6";     // cream panels
const SEAT = "#23272E";      // black saddle
const RUBBER = "#1A1D22";
const CHROME = "#B8BEC8";
const GLOW = "#FFE7B0";

export function Scooty({ sim, accent }: { sim: MutableRefObject<Sim>; accent: string }) {
  const wheelF = useRef<THREE.Group>(null);
  const wheelR = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  useFrame(() => {
    const roll = sim.current.gait * 1.4; // fast spin — it's riding
    if (wheelF.current) wheelF.current.rotation.x = roll;
    if (wheelR.current) wheelR.current.rotation.x = roll;
    if (body.current) {
      // suspension bob, in rhythm with the hero's saddle bob
      body.current.position.y = Math.abs(Math.sin(sim.current.gait)) * 0.012;
    }
  });

  const wheel = (
    <group>
      {/* tire */}
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.155, 0.05, 12, 22]} />
        <meshStandardMaterial color={RUBBER} roughness={0.9} />
      </mesh>
      {/* hub */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.045, 14]} />
        <meshStandardMaterial color={CHROME} metalness={0.75} roughness={0.3} />
      </mesh>
      {/* axle */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.14, 8]} />
        <meshStandardMaterial color="#4A4E57" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );

  return (
    <group position={[0, 0, 0.03]}>
      <group ref={body}>
        {/* ---------- UNDERBODY ---------- */}
        {/* floorboard */}
        <mesh position={[0, 0.2, 0.06]} castShadow>
          <boxGeometry args={[0.3, 0.05, 0.62]} />
          <meshStandardMaterial color={PANEL} roughness={0.7} />
        </mesh>
        {/* center tunnel / body spine */}
        <mesh position={[0, 0.38, -0.1]} castShadow>
          <boxGeometry args={[0.26, 0.34, 0.55]} />
          <meshStandardMaterial color={BODY} roughness={0.45} />
        </mesh>
        {/* seat base + saddle */}
        <mesh position={[0, 0.6, -0.16]} castShadow>
          <boxGeometry args={[0.3, 0.12, 0.5]} />
          <meshStandardMaterial color={BODY_D} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.68, -0.16]} castShadow>
          <boxGeometry args={[0.28, 0.06, 0.46]} />
          <meshStandardMaterial color={SEAT} roughness={0.85} />
        </mesh>
        {/* rear body / tail */}
        <mesh position={[0, 0.52, -0.48]} castShadow>
          <boxGeometry args={[0.32, 0.32, 0.34]} />
          <meshStandardMaterial color={BODY} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.74, -0.5]}>
          <boxGeometry args={[0.24, 0.12, 0.3]} />
          <meshStandardMaterial color={PANEL} roughness={0.6} />
        </mesh>
        {/* tail light */}
        <mesh position={[0, 0.55, -0.66]}>
          <boxGeometry args={[0.18, 0.14, 0.03]} />
          <meshStandardMaterial color="#C42B2B" emissive="#E04040" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        {/* rear rack */}
        {[-0.09, 0.09].map((x) => (
          <mesh key={x} position={[x, 0.8, -0.46]}>
            <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
            <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0.86, -0.46]}>
          <boxGeometry args={[0.3, 0.02, 0.24]} />
          <meshStandardMaterial color={CHROME} metalness={0.7} roughness={0.35} />
        </mesh>

        {/* ---------- FRONT ---------- */}
        {/* leg shield */}
        <mesh position={[0, 0.46, 0.34]} rotation={[-0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.3, 0.52, 0.06]} />
          <meshStandardMaterial color={BODY} roughness={0.45} />
        </mesh>
        {/* front apron panel */}
        <mesh position={[0, 0.66, 0.38]} rotation={[-0.05, 0, 0]}>
          <boxGeometry args={[0.26, 0.16, 0.05]} />
          <meshStandardMaterial color={PANEL} roughness={0.55} />
        </mesh>
        {/* headlight */}
        <mesh position={[0, 0.68, 0.42]}>
          <boxGeometry args={[0.16, 0.1, 0.04]} />
          <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.72, 0.55]} color="#FFE7B0" intensity={3.5} distance={6} decay={2} />
        {/* front fender */}
        <mesh position={[0, 0.3, 0.42]} rotation={[0.5, 0, 0]} castShadow>
          <boxGeometry args={[0.22, 0.06, 0.3]} />
          <meshStandardMaterial color={BODY_D} roughness={0.5} />
        </mesh>
        {/* handle column */}
        <mesh position={[0, 0.85, 0.34]} rotation={[-0.25, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 0.34, 10]} />
          <meshStandardMaterial color={BODY_D} roughness={0.45} />
        </mesh>
        {/* handlebar */}
        <mesh position={[0, 1.0, 0.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.42, 10]} />
          <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.25} />
        </mesh>
        {/* grips */}
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 1.0, 0.3]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
            <meshStandardMaterial color={SEAT} roughness={0.85} />
          </mesh>
        ))}
        {/* brake levers */}
        {[-0.17, 0.17].map((x) => (
          <mesh key={x} position={[x, 1.03, 0.36]} rotation={[0, 0, x > 0 ? 0.5 : -0.5]}>
            <boxGeometry args={[0.02, 0.02, 0.1]} />
            <meshStandardMaterial color={CHROME} metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
        {/* mirrors */}
        {[-0.16, 0.16].map((x) => (
          <group key={x} position={[x, 1.12, 0.32]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]}>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.14, 6]} />
              <meshStandardMaterial color="#3A3E45" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.15, 0]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}>
              <boxGeometry args={[0.09, 0.06, 0.015]} />
              <meshStandardMaterial color="#3A3E45" metalness={0.5} roughness={0.4} />
            </mesh>
          </group>
        ))}
        {/* indicators */}
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.52, -0.62]}>
            <boxGeometry args={[0.05, 0.05, 0.03]} />
            <meshStandardMaterial color="#F2B04A" emissive="#F2A83A" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        ))}

        {/* accent stripe along the body */}
        <mesh position={[0, 0.42, -0.24]}>
          <boxGeometry args={[0.27, 0.03, 0.4]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* ---------- WHEELS ---------- */}
      <group ref={wheelF} position={[0, 0.155, 0.42]}>
        {wheel}
      </group>
      <group ref={wheelR} position={[0, 0.155, -0.42]}>
        {wheel}
      </group>

      {/* soft ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[0.7, 1.15]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.24} depthWrite={false} />
      </mesh>
    </group>
  );
}

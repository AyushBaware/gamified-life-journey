import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { makeStripeTexture, makeLabelTexture } from "../textures";
import { PX } from "../../game/constants";

/**
 * FATHER'S FRUIT SHOP — the reward after the 10th Boards.
 * Not an obstacle: a warm, glowing street stall with striped awning,
 * string lights, crates of fruit, and Dad waving from behind the counter.
 * `active` turns on the welcome (lights up, dad waves, sign glows).
 */

const FRUITS = ["#F97316", "#EF4444", "#FACC15", "#84CC16", "#8B5CF6", "#22C55E"];

function Dad({ active }: { active: boolean }) {
  const arm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_s, dt) => {
    t.current += dt;
    if (arm.current) {
      const target = active ? -2.6 + Math.sin(t.current * 7) * 0.35 : -0.2;
      arm.current.rotation.x = THREE.MathUtils.damp(arm.current.rotation.x, target, 6, dt);
      arm.current.rotation.z = THREE.MathUtils.damp(arm.current.rotation.z, active ? -0.3 : 0, 6, dt);
    }
    if (head.current) {
      head.current.rotation.z = active ? Math.sin(t.current * 3) * 0.08 : 0;
    }
  });
  return (
    <group position={[0.55, 0.98, -0.15]}>
      {/* body + apron */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.34, 8, 14]} />
        <meshStandardMaterial color="#E9E2D2" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 0.1]}>
        <boxGeometry args={[0.26, 0.42, 0.08]} />
        <meshStandardMaterial color="#7A4FB0" roughness={0.8} />
      </mesh>
      {/* resting arm */}
      <group position={[-0.24, 0.42, 0]}>
        <mesh position={[0, -0.14, 0]} rotation={[0.3, 0, 0.15]} castShadow>
          <capsuleGeometry args={[0.06, 0.22, 6, 10]} />
          <meshStandardMaterial color="#E9E2D2" roughness={0.8} />
        </mesh>
      </group>
      {/* waving arm */}
      <group ref={arm} position={[0.24, 0.42, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.24, 6, 10]} />
          <meshStandardMaterial color="#E9E2D2" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#D19A72" roughness={0.6} />
        </mesh>
      </group>
      {/* head */}
      <group ref={head} position={[0, 0.72, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.185, 20, 16]} />
          <meshStandardMaterial color="#D19A72" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.08, -0.02]}>
          <sphereGeometry args={[0.19, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#1B1207" roughness={0.95} />
        </mesh>
        {/* moustache — like father, like teacher (but kinder eyes) */}
        <mesh position={[0, -0.06, 0.165]}>
          <boxGeometry args={[0.13, 0.038, 0.035]} />
          <meshStandardMaterial color="#1B1207" roughness={0.95} />
        </mesh>
        <mesh position={[-0.065, 0.02, 0.16]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#120B06" />
        </mesh>
        <mesh position={[0.065, 0.02, 0.16]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#120B06" />
        </mesh>
        {/* warm smile */}
        <mesh position={[0, -0.105, 0.155]} rotation={[0.1, 0, Math.PI]}>
          <torusGeometry args={[0.045, 0.011, 8, 14, Math.PI]} />
          <meshStandardMaterial color="#7A3A30" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

export function Shop({ x, active }: { x: number; active: boolean }) {
  const bulbs = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const t = useRef(0);

  const stripe = useMemo(() => {
    const tex = makeStripeTexture();
    tex.repeat.set(3, 1);
    return tex;
  }, []);
  const sign = useMemo(
    () => makeLabelTexture("FATHER'S FRUIT SHOP", { font: "700 44px 'Fredoka', sans-serif", color: "#FFF7E6", bg: "rgba(122,58,20,0.92)", border: "rgba(255,214,140,0.8)" }),
    [],
  );

  useFrame((_s, dt) => {
    t.current += dt;
    if (bulbs.current) {
      bulbs.current.children.forEach((b, i) => {
        const m = (b as THREE.Mesh).material as THREE.MeshStandardMaterial;
        const tw = 0.75 + Math.sin(t.current * 2.4 + i * 1.7) * 0.25;
        m.emissiveIntensity = active ? 2.6 * tw : 1.1 * tw;
      });
    }
    if (glow.current) glow.current.intensity = THREE.MathUtils.damp(glow.current.intensity, active ? 16 : 6, 4, dt);
  });

  return (
    <group position={[2.9, 0, -x / PX]} rotation={[0, -0.5, 0]}>
      {/* posts */}
      {[-1.6, 1.6].map((px, i) => (
        <mesh key={i} position={[px, 1.35, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 2.7, 10]} />
          <meshStandardMaterial color="#6E4522" roughness={0.85} />
        </mesh>
      ))}
      {/* striped awning */}
      <mesh position={[0, 2.78, 0.55]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[3.9, 0.06, 1.5]} />
        <meshStandardMaterial map={stripe} roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.95, -0.25]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[3.9, 0.06, 0.9]} />
        <meshStandardMaterial map={stripe} roughness={0.75} />
      </mesh>
      {/* awning scallops */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-1.75 + i * 0.5, 2.62, 1.22]} rotation={[0.42, 0, 0]}>
          <sphereGeometry args={[0.24, 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color={i % 2 ? "#F6EFE3" : "#D94F3D"} roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* hanging sign */}
      <group position={[0, 3.35, 0.7]}>
        {[-0.9, 0.9].map((cx, i) => (
          <mesh key={i} position={[cx, 0.22, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.45, 6]} />
            <meshStandardMaterial color="#3F2E1E" />
          </mesh>
        ))}
        <mesh castShadow>
          <planeGeometry args={[2.9 * sign.aspect * 0.24, 2.9 * 0.24]} />
          <meshBasicMaterial map={sign.tex} transparent toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      {/* counter */}
      <mesh position={[0, 0.5, 0.35]} castShadow>
        <boxGeometry args={[3.3, 1.0, 0.85]} />
        <meshStandardMaterial color="#7A4A22" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.03, 0.35]} castShadow>
        <boxGeometry args={[3.45, 0.09, 0.95]} />
        <meshStandardMaterial color="#8A5A30" roughness={0.7} />
      </mesh>
      {/* back shelf */}
      <mesh position={[0, 1.15, -0.75]} castShadow>
        <boxGeometry args={[3.3, 2.3, 0.16]} />
        <meshStandardMaterial color="#5E3A1C" roughness={0.9} />
      </mesh>
      {[1.5, 2.0].map((sy, i) => (
        <mesh key={i} position={[0, sy, -0.6]}>
          <boxGeometry args={[3.1, 0.06, 0.3]} />
          <meshStandardMaterial color="#8A5A30" roughness={0.8} />
        </mesh>
      ))}
      {/* jars on shelves */}
      {[-1.1, -0.4, 0.35, 1.05].map((jx, i) => (
        <mesh key={i} position={[jx, 1.68, -0.6]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.3, 10]} />
          <meshStandardMaterial color={["#C2543A", "#3E6FB0", "#4E8A5A", "#D9A441"][i]} roughness={0.4} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* crates of fruit on the counter */}
      {[-1.05, 0, 1.05].map((cx, ci) => (
        <group key={ci} position={[cx, 1.22, 0.35]}>
          <mesh castShadow>
            <boxGeometry args={[0.85, 0.32, 0.62]} />
            <meshStandardMaterial color="#8A5A30" roughness={0.9} />
          </mesh>
          {Array.from({ length: 6 }).map((_, j) => (
            <mesh key={j} position={[-0.26 + (j % 3) * 0.26, 0.22, -0.14 + Math.floor(j / 3) * 0.28]} castShadow>
              <sphereGeometry args={[0.115, 12, 10]} />
              <meshStandardMaterial color={FRUITS[(ci * 6 + j) % FRUITS.length]} roughness={0.45} />
            </mesh>
          ))}
        </group>
      ))}
      {/* floor baskets */}
      {[-1.9, 1.9].map((bx, i) => (
        <group key={i} position={[bx, 0, 0.9]}>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.26, 0.44, 12]} />
            <meshStandardMaterial color="#9C6B3A" roughness={0.95} />
          </mesh>
          {Array.from({ length: 5 }).map((_, j) => {
            const a = (j / 5) * Math.PI * 2;
            return (
              <mesh key={j} position={[Math.cos(a) * 0.15, 0.48, Math.sin(a) * 0.15]} castShadow>
                <sphereGeometry args={[0.11, 10, 10]} />
                <meshStandardMaterial color={FRUITS[(i * 5 + j + 2) % FRUITS.length]} roughness={0.45} />
              </mesh>
            );
          })}
        </group>
      ))}
      {/* string lights along the awning edge */}
      <group ref={bulbs}>
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} position={[-1.8 + i * 0.36, 2.5 - Math.sin((i / 10) * Math.PI) * 0.14, 1.28]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#FFE3AE" emissive="#FFC97A" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* warm glow */}
      <pointLight ref={glow} position={[0, 2.1, 1.1]} color="#FFB86B" intensity={6} distance={11} decay={2} />
      <pointLight position={[0, 1.2, 1.4]} color="#FFD9A0" intensity={4} distance={6} decay={2} />
      {/* welcome mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 1.5]}>
        <planeGeometry args={[2.2, 1]} />
        <meshStandardMaterial color="#A33B2E" roughness={0.95} />
      </mesh>
      {/* dad */}
      <Dad active={active} />
    </group>
  );
}

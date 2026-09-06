import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { seededRandom } from "../textures";

/**
 * Ambient college students — walkers heading to class, a pair chatting,
 * one with a book stack. They live in the scrolling world, so the campus
 * feels alive. Never on the road; they stay on the grass shoulders.
 */

const OUTFITS = [
  { shirt: "#7A9CC6", shirtD: "#5C7BA6", pants: "#3A4A66", skin: "#E8B48C", pack: "#C2543A" },
  { shirt: "#C97A8A", shirtD: "#A85E70", pants: "#4A3A58", skin: "#D19A72", pack: "#2E5E6E" },
  { shirt: "#8AB47A", shirtD: "#6C9460", pants: "#3E4A3A", skin: "#F0C29A", pack: "#7A4FB0" },
  { shirt: "#D9A441", shirtD: "#B3852F", pants: "#5A4A2E", skin: "#E8B48C", pack: "#3E6FB0" },
  { shirt: "#9A9AD9", shirtD: "#7777B8", pants: "#2E3A56", skin: "#D19A72", pack: "#C9673A" },
];

function WalkingStudent({ x, z, speed, phase, colors, reduced }: { x: number; z: number; speed: number; phase: number; colors: (typeof OUTFITS)[number]; reduced: boolean }) {
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime * speed + phase;
    const s = Math.sin(t);
    if (legL.current) legL.current.rotation.x = s * 0.55;
    if (legR.current) legR.current.rotation.x = -s * 0.55;
    if (armL.current) armL.current.rotation.x = -s * 0.4;
    if (armR.current) armR.current.rotation.x = s * 0.4;
    if (body.current) {
      body.current.position.y = Math.abs(Math.cos(t)) * 0.05;
      body.current.rotation.z = Math.sin(t * 0.5) * 0.03;
    }
    if (head.current) head.current.rotation.y = Math.sin(t * 0.35) * 0.15;
  });

  return (
    <group position={[x, 0, -z]} rotation={[0, 0.12, 0]}>
      <group ref={body}>
        {/* legs */}
        <group ref={legL} position={[-0.09, 0.62, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.2, 6, 10]} />
            <meshStandardMaterial color={colors.pants} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.33, 0.03]} castShadow>
            <boxGeometry args={[0.11, 0.07, 0.2]} />
            <meshStandardMaterial color="#F2F4F6" roughness={0.5} />
          </mesh>
        </group>
        <group ref={legR} position={[0.09, 0.62, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.2, 6, 10]} />
            <meshStandardMaterial color={colors.pants} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.33, 0.03]} castShadow>
            <boxGeometry args={[0.11, 0.07, 0.2]} />
            <meshStandardMaterial color="#F2F4F6" roughness={0.5} />
          </mesh>
        </group>
        {/* torso */}
        <mesh position={[0, 0.88, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.26, 8, 14]} />
          <meshStandardMaterial color={colors.shirt} roughness={0.75} />
        </mesh>
        {/* collar */}
        <mesh position={[0, 1.06, 0.02]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.1, 0.03, 8, 14]} />
          <meshStandardMaterial color={colors.shirtD} roughness={0.8} />
        </mesh>
        {/* backpack */}
        <mesh position={[0, 0.92, -0.16]} castShadow>
          <boxGeometry args={[0.2, 0.26, 0.1]} />
          <meshStandardMaterial color={colors.pack} roughness={0.8} />
        </mesh>
        {/* arms */}
        <group ref={armL} position={[-0.19, 1.06, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.16, 6, 10]} />
            <meshStandardMaterial color={colors.shirtD} roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.24, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={colors.skin} roughness={0.6} />
          </mesh>
        </group>
        <group ref={armR} position={[0.19, 1.06, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.16, 6, 10]} />
            <meshStandardMaterial color={colors.shirtD} roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.24, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={colors.skin} roughness={0.6} />
          </mesh>
        </group>
        {/* head */}
        <group ref={head} position={[0, 1.3, 0.01]}>
          <mesh castShadow>
            <sphereGeometry args={[0.15, 16, 12]} />
            <meshStandardMaterial color={colors.skin} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.045, -0.02]}>
            <sphereGeometry args={[0.155, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color="#1B1207" roughness={0.95} />
          </mesh>
          {/* tiny eyes */}
          <mesh position={[-0.05, 0.01, 0.135]}>
            <sphereGeometry args={[0.014, 6, 6]} />
            <meshBasicMaterial color="#120B06" />
          </mesh>
          <mesh position={[0.05, 0.01, 0.135]}>
            <sphereGeometry args={[0.014, 6, 6]} />
            <meshBasicMaterial color="#120B06" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function ChattingPair({ x, z, colors, colors2 }: { x: number; z: number; colors: (typeof OUTFITS)[number]; colors2: (typeof OUTFITS)[number] }) {
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (a.current) {
      a.current.position.y = Math.abs(Math.sin(t * 1.6)) * 0.02;
      a.current.rotation.z = Math.sin(t * 0.9) * 0.04;
    }
    if (b.current) {
      b.current.position.y = Math.abs(Math.sin(t * 1.6 + 0.8)) * 0.02;
      b.current.rotation.z = Math.sin(t * 0.9 + 1.5) * 0.05;
    }
  });
  return (
    <group position={[x, 0, -z]}>
      {/* student A — faces B */}
      <group ref={a} position={[-0.4, 0, 0]} rotation={[0, -1.35, 0]}>
        <StaticBody colors={colors} gesture />
      </group>
      {/* student B — faces A, smiling nod */}
      <group ref={b} position={[0.4, 0, 0]} rotation={[0, 1.35, 0]}>
        <StaticBody colors={colors2} gesture />
      </group>
    </group>
  );
}

function StaticBody({ colors, gesture }: { colors: (typeof OUTFITS)[number]; gesture?: boolean }) {
  const armR = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (armR.current && gesture) armR.current.rotation.x = -1.4 + Math.sin(clock.elapsedTime * 1.8) * 0.25;
  });
  return (
    <group>
      {/* legs */}
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.4, 6, 10]} />
          <meshStandardMaterial color={colors.pants} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 0.88, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.26, 8, 14]} />
        <meshStandardMaterial color={colors.shirt} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.92, -0.16]} castShadow>
        <boxGeometry args={[0.2, 0.26, 0.1]} />
        <meshStandardMaterial color={colors.pack} roughness={0.8} />
      </mesh>
      {/* left arm resting */}
      <mesh position={[-0.19, 1.02, 0]} castShadow>
        <capsuleGeometry args={[0.05, 0.16, 6, 10]} />
        <meshStandardMaterial color={colors.shirtD} roughness={0.75} />
      </mesh>
      {/* right arm raised (gesturing) */}
      <group ref={armR} position={[0.19, 1.06, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.16, 6, 10]} />
          <meshStandardMaterial color={colors.shirtD} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.24, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={colors.skin} roughness={0.6} />
        </mesh>
      </group>
      <mesh position={[0, 1.3, 0.01]} castShadow>
        <sphereGeometry args={[0.15, 16, 12]} />
        <meshStandardMaterial color={colors.skin} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.045, -0.02]}>
        <sphereGeometry args={[0.155, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#1B1207" roughness={0.95} />
      </mesh>
    </group>
  );
}

function BookCarrier({ x, z, colors }: { x: number; z: number; colors: (typeof OUTFITS)[number] }) {
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (body.current) body.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 4 + z)) * 0.03;
  });
  return (
    <group position={[x, 0, -z]} rotation={[0, -0.15, 0]}>
      <group ref={body}>
        {[-0.09, 0.09].map((lx) => (
          <mesh key={lx} position={[lx, 0.3, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.4, 6, 10]} />
            <meshStandardMaterial color={colors.pants} roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.88, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.26, 8, 14]} />
          <meshStandardMaterial color={colors.shirt} roughness={0.75} />
        </mesh>
        {/* books hugged in the left arm */}
        <group position={[-0.2, 0.95, 0.12]} rotation={[0.3, 0, 0.4]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 0.05 + i * 0.075, 0]}>
              <boxGeometry args={[0.16, 0.06, 0.22]} />
              <meshStandardMaterial color={["#3E6FB0", "#C2543A", "#4E8A5A", "#D9A441"][i]} roughness={0.7} />
            </mesh>
          ))}
        </group>
        {/* right arm swings */}
        <mesh position={[0.19, 0.98, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.16, 6, 10]} />
          <meshStandardMaterial color={colors.shirtD} roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.3, 0.01]} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshStandardMaterial color={colors.skin} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.045, -0.02]}>
          <sphereGeometry args={[0.155, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#1B1207" roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

export function Students({ reduced = false }: { reduced?: boolean }) {
  const layout = useMemo(() => {
    const rand = seededRandom(23);
    const walkers: { x: number; z: number; speed: number; phase: number; colors: number }[] = [];
    for (let i = 0; i < 4; i++) {
      walkers.push({
        x: (i % 2 ? 1 : -1) * (4.7 + rand() * 2.2),
        z: 10 + i * 14 + rand() * 6,
        speed: 0.9 + rand() * 0.5,
        phase: rand() * 6,
        colors: i % OUTFITS.length,
      });
    }
    return { walkers };
  }, []);

  return (
    <group>
      {layout.walkers.map((w, i) => (
        <WalkingStudent key={i} x={w.x} z={w.z} speed={w.speed} phase={w.phase} colors={OUTFITS[w.colors]} reduced={reduced} />
      ))}
      {/* a pair chatting near the gate */}
      <ChattingPair x={5.8} z={30} colors={OUTFITS[1]} colors2={OUTFITS[3]} />
      {/* one carrying a stack of books */}
      <BookCarrier x={-5.6} z={46} colors={OUTFITS[4]} />
      {/* one hurrying late */}
      <WalkingStudent x={5.4} z={58} speed={1.7} phase={2.4} colors={OUTFITS[2]} reduced={reduced} />
    </group>
  );
}

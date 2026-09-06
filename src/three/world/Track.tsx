import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeGrassTexture, makeLabelTexture, makePavingTexture } from "../textures";
import { PX } from "../../game/constants";
import { WindGrass } from "./Foliage";

/**
 * The street: a paved running lane with curbs, grass shoulders, and
 * world-locked street furniture (lamps, trees, planters, benches).
 * All of it lives in the scrolling group, so it simply glides past.
 * length is in logical px.
 */

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Lamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 3.8, 8]} />
        <meshStandardMaterial color="#232B3A" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[x > 0 ? -0.35 : 0.35, 3.72, 0]} rotation={[0, 0, x > 0 ? 0.25 : -0.25]}>
        <boxGeometry args={[0.85, 0.09, 0.09]} />
        <meshStandardMaterial color="#232B3A" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[x > 0 ? -0.7 : 0.7, 3.62, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#FFE3AE" emissive="#FFC97A" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh position={[x > 0 ? -0.7 : 0.7, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 20]} />
        <meshBasicMaterial color="#F5CF91" transparent opacity={0.07} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Tree({ x, z, s = 1, reduced }: { x: number; z: number; s?: number; reduced: boolean }) {
  const crown = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!crown.current || reduced) return;
    crown.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + z * 0.16) * 0.025;
    crown.current.rotation.x = Math.cos(clock.elapsedTime * 0.65 + x) * 0.015;
  });
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.5, 8]} />
        <meshStandardMaterial color="#4A3320" roughness={0.95} />
      </mesh>
      <group ref={crown} position={[0, 1.25, 0]}>
        <mesh position={[0.2, 0.3, 0]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.055, 0.11, 1, 8]} />
          <meshStandardMaterial color="#655039" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.95, 0]} scale={[1.1, 0.9, 0.95]} castShadow>
          <icosahedronGeometry args={[0.95, 2]} />
          <meshStandardMaterial color="#526B36" roughness={0.95} />
        </mesh>
        <mesh position={[0.62, 0.47, 0.3]} scale={[1, 0.85, 1.15]} castShadow>
          <icosahedronGeometry args={[0.66, 2]} />
          <meshStandardMaterial color="#657C42" roughness={0.95} />
        </mesh>
        <mesh position={[-0.6, 0.57, -0.2]} castShadow>
          <icosahedronGeometry args={[0.62, 2]} />
          <meshStandardMaterial color="#405D36" roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

function Planter({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.28, 0.44, 12]} />
        <meshStandardMaterial color="#8A4B2D" roughness={0.85} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.16, 0.55, Math.sin(a) * 0.16]} castShadow>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color={i % 2 ? "#D94F7A" : "#F2B04A"} roughness={0.8} flatShading />
          </mesh>
        );
      })}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#2E7D4F" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function Bench({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, x > 0 ? -0.25 : 0.25, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.45]} />
        <meshStandardMaterial color="#6B4A2B" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.72, -0.2]} rotation={[0.18, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.5, 0.06]} />
        <meshStandardMaterial color="#6B4A2B" roughness={0.85} />
      </mesh>
      {[-0.6, 0.6].map((lx, i) => (
        <mesh key={i} position={[lx, 0.2, 0]}>
          <boxGeometry args={[0.08, 0.42, 0.4]} />
          <meshStandardMaterial color="#3F2E1E" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function RoadSection({ start, end, texture }: { start: number; end: number; texture: THREE.Texture }) {
  const map = useMemo(() => {
    const clone = texture.clone();
    clone.repeat.set(2.4, (end - start) / 3);
    clone.offset.y = start / 3;
    return clone;
  }, [texture, start, end]);
  useEffect(() => () => map.dispose(), [map]);
  const middle = -(start + end) / 2;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, middle]} receiveShadow>
        <planeGeometry args={[6.8, end - start]} />
        <meshStandardMaterial map={map} roughness={0.94} />
      </mesh>
      {[-3.5, 3.5].map((x) => (
        <mesh key={x} position={[x, 0.035, middle]} receiveShadow castShadow>
          <boxGeometry args={[0.22, 0.1, end - start]} />
          <meshStandardMaterial color="#B3B0A3" roughness={0.95} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.009, middle]}>
        <planeGeometry args={[0.065, end - start]} />
        <meshBasicMaterial color="#E4C58F" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SchoolBuilding() {
  const sign = useMemo(() => makeLabelTexture("JP ENGLISH HIGH SCHOOL", {
    font: "600 36px sans-serif", bg: "#344D52", color: "#F5EAD2", border: "#B3BDB1", radius: 2,
  }), []);
  useEffect(() => () => sign.tex.dispose(), [sign]);
  return (
    <group position={[-11.6, 0, -32]} rotation={[0, 0.2, 0]}>
      <mesh position={[0, 2.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[9, 5, 3.8]} />
        <meshStandardMaterial color="#D6C5A5" roughness={0.95} />
      </mesh>
      <mesh position={[0, 5.35, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.95, 1, 1]} castShadow>
        <coneGeometry args={[3.4, 1.35, 4]} />
        <meshStandardMaterial color="#926C50" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.62, 1.95]}>
        <boxGeometry args={[9.2, 0.12, 0.14]} />
        <meshStandardMaterial color="#EEE0C0" roughness={0.85} />
      </mesh>
      {[1.1, 3.8].flatMap((y, row) => [-3.6, -2.15, -0.7, 0.7, 2.15, 3.6].map((x, col) => (
        <group key={`${row}-${col}`} position={[x, y, 1.93]}>
          <mesh>
            <boxGeometry args={[0.98, 1.28, 0.12]} />
            <meshStandardMaterial color="#EEE2C6" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.015, 0.07]}>
            <planeGeometry args={[0.78, 1.06]} />
            <meshStandardMaterial color={col % 3 === 0 ? "#A69B79" : "#5D7374"} roughness={0.28} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.035, 1.1, 0.035]} />
            <meshStandardMaterial color="#DDD2B9" />
          </mesh>
        </group>
      )))}
      <mesh position={[0, 2.78, 2.4]}>
        <planeGeometry args={[4.1, 0.54]} />
        <meshBasicMaterial map={sign.tex} transparent depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.1, 3.6]} receiveShadow>
        <boxGeometry args={[8.5, 0.2, 3.5]} />
        <meshStandardMaterial color="#B0A78E" roughness={0.95} />
      </mesh>
    </group>
  );
}

export function Track({ length, pool, reduced = false }: { length: number; pool?: { start: number; end: number }; reduced?: boolean }) {
  const paving = useMemo(() => {
    const t = makePavingTexture();
    t.repeat.set(2.4, 1);
    return t;
  }, []);
  const grass = useMemo(() => {
    const t = makeGrassTexture();
    t.repeat.set(6, (length / PX + 160) / 3);
    return t;
  }, [length]);
  useEffect(() => () => { paving.dispose(); }, [paving]);
  useEffect(() => () => { grass.dispose(); }, [grass]);

  const props = useMemo(() => {
    const rand = mulberry32(11);
    const lamps: number[] = [];
    const trees: { x: number; z: number; s: number }[] = [];
    const planters: number[] = [];
    const benches: number[] = [];
    const worldLen = length / PX;
    for (let z = 6; z < worldLen + 30; z += 9 + rand() * 5) {
      lamps.push(z);
      if (rand() > 0.35) trees.push({ x: -(5.2 + rand() * 4), z: z + 3 + rand() * 3, s: 0.8 + rand() * 0.7 });
      if (rand() > 0.55) trees.push({ x: 5.4 + rand() * 4, z: z + 5 + rand() * 3, s: 0.8 + rand() * 0.7 });
      if (rand() > 0.6) planters.push(z + 2);
      if (rand() > 0.78) benches.push(z + 4);
    }
    return { lamps, trees, planters, benches };
  }, [length]);

  const worldLen = length / PX;
  const roadSections = pool ? [[-60, pool.start / PX], [pool.end / PX, worldLen + 70]] : [[-60, worldLen + 70]];

  return (
    <group>
      {/* base earth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -worldLen / 2]} receiveShadow>
        <planeGeometry args={[140, worldLen + 160]} />
        <meshStandardMaterial color="#4B4B35" roughness={1} />
      </mesh>
      {/* grass shoulders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.5, -0.025, -worldLen / 2]} receiveShadow>
        <planeGeometry args={[10, worldLen + 160]} />
        <meshStandardMaterial map={grass} color="#D5D3BD" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.5, -0.025, -worldLen / 2]} receiveShadow>
        <planeGeometry args={[10, worldLen + 160]} />
        <meshStandardMaterial map={grass} color="#D5D3BD" roughness={1} />
      </mesh>
      {/* Leave a real opening for the pool; the road continues beyond its exit. */}
      {roadSections.map(([start, end]) => <RoadSection key={start} start={start} end={end} texture={paving} />)}
      <WindGrass length={worldLen} reduced={reduced} />
      <SchoolBuilding />

      {/* street furniture — alternate sides */}
      {props.lamps.map((z, i) => (
        <Lamp key={`l${i}`} x={i % 2 ? 4.4 : -4.4} z={-z} />
      ))}
      {props.trees.map((tr, i) => (
        <Tree key={`t${i}`} x={tr.x} z={-tr.z} s={tr.s} reduced={reduced} />
      ))}
      {props.planters.map((z, i) => (
        <Planter key={`p${i}`} x={i % 2 ? 4.1 : -4.1} z={-z} />
      ))}
      {props.benches.map((z, i) => (
        <Bench key={`b${i}`} x={i % 2 ? 4.3 : -4.3} z={-z} />
      ))}
    </group>
  );
}

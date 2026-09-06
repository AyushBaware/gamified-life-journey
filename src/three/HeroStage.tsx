import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Hero } from "./characters/Hero";
import { Teacher } from "./characters/Teacher";
import type { HeroMode } from "../game/types";

/**
 * Character showcase — the start & finale screens.
 * The hero stands on a lit pedestal under golden-hour light, alive with
 * idle micro-motion; the teacher lurks in the shadows behind him.
 * Camera drifts in a slow orbit so the character reads fully 3D.
 */

function OrbitCam({ slow = false }: { slow?: boolean }) {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime * (slow ? 0.12 : 0.22);
    camera.position.x = Math.sin(t) * 2.1;
    camera.position.z = 4.6 + Math.cos(t) * 0.8;
    camera.position.y = 1.7 + Math.sin(t * 0.7) * 0.15;
    camera.lookAt(0, 1.05, 0);
  });
  return null;
}

function Dust({ count = 26 }: { count?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      const t = clock.elapsedTime * 0.25 + i * 1.7;
      c.position.y = 0.2 + ((t * 0.6 + i * 0.37) % 3);
      (c as THREE.Mesh).scale.setScalar(0.5 + Math.sin(t * 2) * 0.3);
    });
  });
  return (
    <group ref={ref}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        const r = 1.6 + (i % 5) * 0.5;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.5, Math.sin(a) * r]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshBasicMaterial color="#FFD9A0" transparent opacity={0.55} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export function HeroStage({ mode = "idle", showTeacher = true }: { mode?: HeroMode; showTeacher?: boolean }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [0, 1.7, 5], fov: 40 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.15;
      }}
    >
      <ambientLight intensity={0.4} color="#FFE9CF" />
      <hemisphereLight args={["#6B4A6A", "#141A2A", 0.5]} />
      {/* key spot on the hero */}
      <spotLight position={[2.5, 5.5, 3]} angle={0.5} penumbra={0.7} intensity={90} color="#FFD9A0" castShadow shadow-mapSize={[1024, 1024]} />
      {/* rim light from behind */}
      <directionalLight position={[-3, 3, -4]} intensity={1.1} color="#8B5CF6" />
      <pointLight position={[0, 0.4, 2.4]} intensity={6} color="#FFB86B" distance={7} decay={2} />

      <OrbitCam slow={mode === "happy"} />

      {/* pedestal */}
      <mesh position={[0, -0.14, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.28, 40]} />
        <meshStandardMaterial color="#1A2236" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.28, 1.42, 48]} />
        <meshBasicMaterial color="#FFB86B" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.9, 2.05, 0.3, 40]} />
        <meshStandardMaterial color="#10162A" roughness={0.7} />
      </mesh>

      <group position={[0, 0.02, 0]}>
        <Hero mode={mode} mood={mode === "happy" ? "happy" : "neutral"} />
      </group>

      {/* the teacher lurks behind — a warning of what's coming */}
      {showTeacher && (
        <group position={[-1.7, -0.44, -3.4]} rotation={[0, 0.5, 0]} scale={1.05}>
          <Teacher mode="idle" />
        </group>
      )}

      <Dust />

      {/* floor fade */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.46, 0]}>
        <circleGeometry args={[14, 40]} />
        <meshBasicMaterial color="#0B0F19" />
      </mesh>
    </Canvas>
  );
}


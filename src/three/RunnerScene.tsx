import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";
import type { LevelScript } from "../game/types";
import type { Sim } from "../game/engine";
import { POOL_EXIT_DURATION, PX, RUNNER_YAW } from "../game/constants";
import { Hero } from "./characters/Hero";
import { Teacher } from "./characters/Teacher";
import { Backdrop } from "./world/Backdrop";
import { Track } from "./world/Track";
import { Obstacle } from "./world/Obstacles";
import { Gate } from "./world/Gate";
import { Pool } from "./world/Pool";
import { Shop } from "./world/Shop";
import { Particles, type ParticleAPI } from "./Particles";
import { makeBlobTexture } from "./textures";

interface Props {
  script: LevelScript;
  sim: MutableRefObject<Sim>;
  particles: MutableRefObject<ParticleAPI | null>;
  reduced: boolean;
  onReady: () => void;
}

/** Fake soft shadow blob under the hero (cheap + always aligned).
 *  While swimming it rides the water surface as a dark ripple patch. */
function HeroShadowBlob({ sim }: { sim: MutableRefObject<Sim> }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => makeBlobTexture(), []);
  useFrame(() => {
    if (!ref.current) return;
    const s = sim.current;
    const swimming = s.phase === "swim";
    const k = Math.max(0.35, 1 - s.y / (PX * 3.4));
    ref.current.scale.setScalar(swimming ? 1.15 : k);
    ref.current.position.y = swimming ? -0.085 : 0.025;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = swimming ? 0.32 : 0.5 * k + 0.1;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

/** Camera follows the action: bob while running, glide wide for the pool,
 *  dolly right for the shop visit, shake on impacts. */
function CameraRig({ sim, reduced }: { sim: MutableRefObject<Sim>; reduced: boolean }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 1.3, -6));
  useFrame((_s, dt) => {
    const s = sim.current;
    let tx = 0, ty = 2.95, tz = 6.3;
    let lx = 0, ly = 1.25, lz = -6;
    switch (s.phase) {
      case "swim":
      case "dive":
      case "exit":
        tx = 2.6; ty = 2.6; tz = 5.4; lx = -0.6; ly = 0.5; lz = -7;
        break;
      case "shopvisit":
      case "complete":
        tx = -2.6; ty = 2.1; tz = 4.6; lx = 2.4; ly = 1.5; lz = -2.2;
        break;
      case "gate":
      case "gateburst":
      case "card":
        tx = 0.4; ty = 2.7; tz = 6.6; lx = 0; ly = 1.6; lz = -7;
        break;
      case "caught":
        tx = -1.4; ty = 2.0; tz = 4.4; lx = 0.2; ly = 1.3; lz = -1.5;
        break;
      default:
        break;
    }
    // run bob
    const bob = !reduced && (s.phase === "running" || s.phase === "walk") ? Math.abs(Math.sin(s.gait)) * 0.06 : 0;
    const shk = reduced ? 0 : s.shake * 0.22;
    const ox = (Math.random() - 0.5) * shk;
    const oy = (Math.random() - 0.5) * shk;

    const l = Math.min(1, dt * 4.2);
    camera.position.x += (tx + ox - camera.position.x) * l;
    camera.position.y += (ty + bob + oy - camera.position.y) * l;
    camera.position.z += (tz - camera.position.z) * l;
    look.current.x += (lx - look.current.x) * l;
    look.current.y += (ly - look.current.y) * l;
    look.current.z += (lz - look.current.z) * l;
    camera.lookAt(look.current);
  });
  return null;
}

/** Keeps world-locked content scrolling past the fixed hero */
function WorldScroller({ sim, children }: { sim: MutableRefObject<Sim>; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (g.current) g.current.position.z = sim.current.distance / PX;
  });
  return <group ref={g}>{children}</group>;
}

/** Hero + teacher wrappers reading the sim each frame */
function HeroRig({ sim, reduced }: { sim: MutableRefObject<Sim>; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_state, dt) => {
    if (!g.current) return;
    const s = sim.current;
    let y = s.y / PX;
    if (s.phase === "swim") y = -0.33;
    if (s.phase === "exit") y = THREE.MathUtils.lerp(-0.33, 0, Math.min(1, s.phaseT / POOL_EXIT_DURATION));
    g.current.position.y = y;
    const visiting = s.phase === "shopvisit" || s.phase === "complete";
    g.current.position.x = THREE.MathUtils.damp(g.current.position.x, visiting ? 1.1 : 0, 5, dt);
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, visiting ? Math.PI * 0.58 : RUNNER_YAW, 6, dt);
  });
  return (
    <group ref={g} rotation={[0, RUNNER_YAW, 0]}>
      <Hero stateRef={sim} reduced={reduced} />
    </group>
  );
}

function TeacherRig({ sim, script }: { sim: MutableRefObject<Sim>; script: LevelScript }) {
  const g = useRef<THREE.Group>(null);
  const pool = script.events.find((event) => event.kind === "swim");
  useFrame((_state, dt) => {
    if (!g.current) return;
    const s = sim.current;
    g.current.position.z = (s.distance - s.teacherX) / PX;
    const detouring = pool?.kind === "swim" && s.teacherX > pool.start - 56 && s.teacherX < pool.end + 30;
    const catching = s.phase === "caught" || s.phase === "hit" || s.phase === "scripted";
    g.current.position.x = THREE.MathUtils.damp(g.current.position.x, detouring ? 4.1 : catching ? -0.28 : -0.9, 5, dt);
  });
  return (
    <group ref={g} rotation={[0, RUNNER_YAW, 0]} position={[-0.9, 0, 5]}>
      <Teacher stateRef={sim} />
    </group>
  );
}

function useSimValue<T extends string | boolean | number>(read: () => T): T {
  const [value, setValue] = useState(read);
  const previous = useRef(value);
  useFrame(() => {
    const next = read();
    if (next !== previous.current) { previous.current = next; setValue(next); }
  });
  return value;
}

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

export function RunnerScene({ script, sim, particles, reduced, onReady }: Props) {
  const swim = script.events.find((e) => e.kind === "swim");
  const gate = script.events.find((e) => e.kind === "gate");
  const shop = script.events.find((e) => e.kind === "shop");
  const hurdles = script.events.filter((e) => e.kind === "hurdle");

  return (
    <div className="absolute inset-0" style={{ zIndex: 0 }}>
      <Canvas
        shadows
        dpr={[1, 1.7]}
        camera={{ position: [0, 2.95, 6.3], fov: 46, near: 0.1, far: 320 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl, scene }) => {
          gl.toneMappingExposure = 1.02;
          scene.background = new THREE.Color("#C1B5A5");
          scene.fog = new THREE.Fog(new THREE.Color("#C1B5A5"), 35, 115);
        }}
      >
        {/* golden hour light */}
        <ambientLight intensity={0.5} color="#FFE9CF" />
        <hemisphereLight args={["#BCD2DF", "#48553B", 0.7]} />
        <directionalLight
          position={[7, 11, -9]}
          intensity={1.7}
          color="#FFE0B3"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-9}
          shadow-camera-right={9}
          shadow-camera-top={12}
          shadow-camera-bottom={-8}
          shadow-camera-near={1}
          shadow-camera-far={40}
          shadow-normalBias={0.035}
          shadow-bias={-0.00015}
        />
        <directionalLight position={[-8, 5, 6]} intensity={0.45} color="#BFD5E7" />

        <CameraRig sim={sim} reduced={reduced} />
        <Backdrop reduced={reduced} />

        <WorldScroller sim={sim}>
          <Track length={script.length} pool={swim?.kind === "swim" ? swim : undefined} reduced={reduced} />
          {hurdles.map((ev) =>
            ev.kind === "hurdle" ? <ObstacleWithStatus key={ev.id} sim={sim} ev={ev} /> : null,
          )}
          {swim && swim.kind === "swim" && <Pool start={swim.start} end={swim.end} />}
          {gate && gate.kind === "gate" && <GateWithStatus sim={sim} x={gate.x} label={gate.label} id={gate.id} />}
          {shop && shop.kind === "shop" && <ShopWithStatus sim={sim} x={shop.x} id={shop.id} />}
          <Particles apiRef={particles} reduced={reduced} />
        </WorldScroller>

        <HeroRig sim={sim} reduced={reduced} />
        <HeroShadowBlob sim={sim} />
        <TeacherRig sim={sim} script={script} />
        <SceneReady onReady={onReady} />
      </Canvas>
    </div>
  );
}

/* thin status bridges — read the sim each frame so meshes react live */
function ObstacleWithStatus({ sim, ev }: { sim: MutableRefObject<Sim>; ev: Extract<LevelScript["events"][number], { kind: "hurdle" }> }) {
  const status = useSimValue(() => sim.current.statuses.get(ev.id) ?? "pending");
  return <Obstacle ev={ev} status={status} />;
}
function GateWithStatus({ sim, x, label, id }: { sim: MutableRefObject<Sim>; x: number; label: string; id: string }) {
  const status = useSimValue(() => sim.current.statuses.get(id) ?? "pending");
  return <Gate x={x} label={label} status={status} />;
}
function ShopWithStatus({ sim, x, id }: { sim: MutableRefObject<Sim>; x: number; id: string }) {
  const active = useSimValue(() => sim.current.awarded.has(id));
  return <Shop x={x} active={active} />;
}

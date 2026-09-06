import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeLabelTexture } from "../textures";
import { PX } from "../../game/constants";
import { SKILLS, type ObjectStatus, type SkillId } from "../../game/types";

/**
 * A skill orb — the thing he learns, floating on the path like a power-up.
 * A faceted glowing core, an orbiting ring, a soft light beam to the ground,
 * a floating name tag, and a "pulled into the player" collect animation
 * that shrinks + rises while the beam snaps off.
 */
export function SkillOrb({ x, skill, status }: { x: number; skill: SkillId; status: ObjectStatus }) {
  const def = SKILLS[skill];
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const tag = useRef<THREE.Mesh>(null);
  const collectedAt = useRef<number | null>(null);
  const collected = status === "collected";

  const label = useMemo(
    () => makeLabelTexture(def.label, { font: "700 36px 'Fredoka', sans-serif", color: "#0B0F19", bg: def.glow, border: "rgba(255,255,255,0.7)", radius: 20 }),
    [def.label, def.glow],
  );
  useEffect(() => () => label.tex.dispose(), [label]);

  const short = useMemo(
    () => makeLabelTexture(def.short, { font: "800 44px 'Space Grotesk', sans-serif", color: "#FFFFFF", bg: "rgba(0,0,0,0)", border: "rgba(0,0,0,0)", pad: 10, radius: 0 }),
    [def.short],
  );
  useEffect(() => () => short.tex.dispose(), [short]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (!root.current) return;

    if (collected && collectedAt.current === null) collectedAt.current = t;
    const since = collectedAt.current === null ? 0 : t - collectedAt.current;
    const k = collected ? Math.max(0, 1 - since / 0.55) : 1; // collect fade

    // float & spin
    const bob = Math.sin(t * 2.2 + x) * 0.12;
    root.current.position.y = 1.55 + bob + (collected ? since * 2.4 : 0);
    root.current.scale.setScalar(collected ? k * (1 + since * 0.6) : 1);
    if (core.current) {
      core.current.rotation.y = t * 1.4;
      core.current.rotation.x = Math.sin(t * 0.8) * 0.3;
    }
    if (shell.current) {
      shell.current.rotation.y = -t * 0.9;
      shell.current.rotation.z = t * 0.5;
      (shell.current.material as THREE.MeshBasicMaterial).opacity = (0.28 + Math.sin(t * 3) * 0.08) * k;
    }
    if (ring.current) ring.current.rotation.z = t * 1.8;
    if (ring2.current) ring2.current.rotation.x = t * 1.2;
    if (beam.current) {
      const m = beam.current.material as THREE.MeshBasicMaterial;
      m.opacity = collected ? 0 : 0.16 + Math.sin(t * 3 + x) * 0.05;
    }
    if (light.current) light.current.intensity = THREE.MathUtils.damp(light.current.intensity, collected ? 0 : 9 + Math.sin(t * 4) * 2, 6, dt);
    if (tag.current) {
      tag.current.position.y = 0.95 + Math.sin(t * 2.2 + x + 1) * 0.03;
      (tag.current.material as THREE.MeshBasicMaterial).opacity = k;
    }
  });

  if (collected && collectedAt.current !== null) {
    // fully faded — nothing to draw
  }

  return (
    <group position={[0, 0, -x / PX]}>
      {/* light beam down to the ground — "come get me" */}
      <mesh ref={beam} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.06, 0.34, 1.6, 16, 1, true]} />
        <meshBasicMaterial color={def.glow} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* landing pad ring on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.3, 0.42, 32]} />
        <meshBasicMaterial color={def.glow} transparent opacity={collected ? 0 : 0.5} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>

      <group ref={root} position={[0, 1.55, 0]}>
        {/* faceted core */}
        <mesh ref={core} castShadow>
          <icosahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={1.4} roughness={0.25} metalness={0.35} flatShading toneMapped={false} />
        </mesh>
        {/* short code on the core */}
        <mesh position={[0, 0, 0.26]}>
          <planeGeometry args={[0.5 * short.aspect * 0.22, 0.5 * 0.22]} />
          <meshBasicMaterial map={short.tex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        {/* translucent shell */}
        <mesh ref={shell}>
          <icosahedronGeometry args={[0.36, 1]} />
          <meshBasicMaterial color={def.glow} transparent opacity={0.3} wireframe depthWrite={false} toneMapped={false} />
        </mesh>
        {/* orbiting rings */}
        <mesh ref={ring}>
          <torusGeometry args={[0.46, 0.018, 8, 48]} />
          <meshBasicMaterial color={def.glow} toneMapped={false} />
        </mesh>
        <mesh ref={ring2} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.012, 8, 48]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55} toneMapped={false} />
        </mesh>
        {/* glow light */}
        <pointLight ref={light} color={def.glow} intensity={9} distance={5} decay={2} />
        {/* floating name tag */}
        <mesh ref={tag} position={[0, 0.95, 0]}>
          <planeGeometry args={[1.5 * label.aspect * 0.28, 1.5 * 0.28]} />
          <meshBasicMaterial map={label.tex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

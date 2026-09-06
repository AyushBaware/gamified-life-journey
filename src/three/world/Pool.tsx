import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makePoolTileTexture, makeLabelTexture } from "../textures";
import { PX } from "../../game/constants";

/**
 * The swimming-pool set piece. The hero dives in at `start`, swims the
 * length while the water waves + his splashes play, and hops out at `end`.
 * Lane ropes, chrome ladders, a diving board, tiled basin, deck + umbrella.
 */

function Water({ length }: { length: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#188A94") },
      uShallow: { value: new THREE.Color("#7AC3CC") },
      uFog: { value: new THREE.Color("#C1B5A5") },
    }),
    [],
  );
  useFrame(({ clock }) => {
    if (mat.current) (mat.current.uniforms.uTime as { value: number }).value = clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -length / 2]}>
      <planeGeometry args={[5.4, length, 24, Math.max(8, Math.floor(length * 3))]} />
      <shaderMaterial
        ref={mat}
        transparent
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            vUv = uv;
            vec3 p = position;
            float a = p.x * 2.3 + uTime * 1.1;
            float b = p.y * 1.1 - uTime * 1.3;
            float c = (p.x + p.y) * 1.4 + uTime * 0.7;
            float w = sin(a) * 0.018 + sin(b) * 0.025 + sin(c) * 0.012;
            p.z += w;
            vWave = w;
            vec3 normal = normalize(vec3(-cos(a) * 0.0414 - cos(c) * 0.0168, -cos(b) * 0.0275 - cos(c) * 0.0168, 1.0));
            vNormal = normalize(mat3(modelMatrix) * normal);
            vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform vec3 uFog;
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            float f = smoothstep(-0.06, 0.06, vWave);
            vec3 col = mix(uDeep, uShallow, f);
            vec3 view = normalize(cameraPosition - vWorld);
            vec3 normal = normalize(vNormal);
            float fresnel = pow(1.0 - max(dot(view, normal), 0.0), 3.0);
            float shine = pow(max(dot(reflect(-normalize(vec3(0.5, 0.8, -0.4)), normal), view), 0.0), 72.0);
            col = mix(col, vec3(0.72, 0.75, 0.68), fresnel * 0.35);
            col += vec3(1.0, 0.87, 0.64) * shine * 0.65;
            float g = sin(vUv.x * 46.0 + uTime) * sin(vUv.y * 34.0 - uTime * 0.8);
            col += vec3(1.0) * smoothstep(0.82, 1.0, g) * 0.09;
            float edge = smoothstep(0.0, 0.015, vUv.x) * (1.0 - smoothstep(0.985, 1.0, vUv.x))
                       * smoothstep(0.0, 0.006, vUv.y) * (1.0 - smoothstep(0.994, 1.0, vUv.y));
            col = mix(vec3(0.93, 0.99, 1.0), col, edge);
            col = mix(col, uFog, smoothstep(35.0, 115.0, length(cameraPosition - vWorld)));
            gl_FragColor = vec4(col, 0.93);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}

function LaneRope({ x, length }: { x: number; length: number }) {
  const count = Math.floor(length / 0.42);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      dummy.position.set(0, 0, -i * 0.42 - 0.3);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, color.set(i % 2 ? "#E23B3B" : "#F6EFE3"));
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [count]);
  return (
    <group position={[x, -0.06, 0]}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
    </group>
  );
}

function Ladder({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {[-0.16, 0.16].map((ox, i) => (
        <mesh key={i} position={[ox, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.1, 8]} />
          <meshStandardMaterial color="#D7DDE4" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {[0.35, 0.6, 0.85].map((ry, i) => (
        <mesh key={i} position={[0, ry, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 0.32, 8]} />
          <meshStandardMaterial color="#D7DDE4" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Umbrella({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.2, 8]} />
        <meshStandardMaterial color="#C9A26B" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[1.25, 0.55, 10]} />
        <meshStandardMaterial color="#D94F3D" roughness={0.75} flatShading />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#F6EFE3" />
      </mesh>
      {/* lounger */}
      <group position={[0.9, 0, 0.4]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.6, 0.08, 1.5]} />
          <meshStandardMaterial color="#F6EFE3" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, -0.6]} rotation={[-0.6, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.08, 0.7]} />
          <meshStandardMaterial color="#2DD4BF" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

export function Pool({ start, end }: { start: number; end: number }) {
  const length = (end - start) / PX;
  const z0 = -start / PX;
  const tiles = useMemo(() => {
    const t = makePoolTileTexture();
    t.repeat.set(6, length);
    return t;
  }, [length]);
  const sign = useMemo(
    () => makeLabelTexture("🏊 SCHOOL POOL", { font: "700 40px 'Fredoka', sans-serif", color: "#083344", bg: "rgba(165,243,252,0.95)", border: "rgba(255,255,255,0.7)" }),
    [],
  );
  useEffect(() => () => tiles.dispose(), [tiles]);
  useEffect(() => () => sign.tex.dispose(), [sign]);

  return (
    <group position={[0, 0, z0]}>
      {/* Four deck edges leave the water visible instead of covering it with a slab. */}
      {[-3.7, 3.7].map((x) => <mesh key={x} position={[x, -0.02, -length / 2]} receiveShadow>
        <boxGeometry args={[2, 0.12, length + 2.4]} />
        <meshStandardMaterial color="#E8DFC9" roughness={0.9} />
      </mesh>)}
      {[0.6, -length - 0.6].map((z) => <mesh key={z} position={[0, -0.02, z]} receiveShadow>
        <boxGeometry args={[5.4, 0.12, 1.2]} />
        <meshStandardMaterial color="#E8DFC9" roughness={0.9} />
      </mesh>)}
      {[-2.78, 2.78].map((x) => <mesh key={x} position={[x, -0.59, -length / 2]}>
        <boxGeometry args={[0.16, 1.25, length]} />
        <meshStandardMaterial map={tiles} color="#B2DDE0" roughness={0.65} />
      </mesh>)}
      {[0.08, -length - 0.08].map((z) => <mesh key={z} position={[0, -0.59, z]}>
        <boxGeometry args={[5.6, 1.25, 0.16]} />
        <meshStandardMaterial map={tiles} color="#B2DDE0" roughness={0.65} />
      </mesh>)}
      <mesh position={[0, -1.23, -length / 2]}>
        <boxGeometry args={[5.4, 0.1, length]} />
        <meshStandardMaterial map={tiles} color="#8FDBEC" roughness={0.6} />
      </mesh>
      {/* water — slightly below deck level */}
      <Water length={length} />
      {/* lane ropes */}
      <LaneRope x={-1.6} length={length} />
      <LaneRope x={1.6} length={length} />
      {/* ladders */}
      <Ladder x={-2.55} z={-1.2} />
      <Ladder x={2.55} z={-length + 1.2} />
      {/* diving board at the entry */}
      <group position={[0, 0, 0.9]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.7, 0.58, 0.9]} />
          <meshStandardMaterial color="#DDE5EC" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.75, -0.55]} castShadow>
          <boxGeometry args={[0.55, 0.07, 1.5]} />
          <meshStandardMaterial color="#F2B04A" roughness={0.5} />
        </mesh>
      </group>
      {/* umbrella + lounger on the side */}
      <Umbrella x={4.1} z={-length * 0.5} />
      {/* palms */}
      {[[-4.2, -2], [4.3, -length + 2]].map(([px, pz], i) => (
        <group key={i} position={[px, 0, pz]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.16, 1.9, 8]} />
            <meshStandardMaterial color="#6E4A26" roughness={0.95} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <mesh key={k} position={[0, 1.95, 0]} rotation={[0.5, (k / 6) * Math.PI * 2, 0.7]} castShadow>
              <coneGeometry args={[0.16, 1.5, 5]} />
              <meshStandardMaterial color="#2E8B57" roughness={0.9} flatShading />
            </mesh>
          ))}
        </group>
      ))}
      {/* pool sign */}
      <group position={[3.4, 0, 0.4]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.7, 8]} />
          <meshStandardMaterial color="#8A5A30" />
        </mesh>
        <mesh position={[0, 1.75, 0]}>
          <planeGeometry args={[2.1 * sign.aspect * 0.32, 2.1 * 0.32]} />
          <meshBasicMaterial map={sign.tex} transparent toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      {/* sparkle light over the water */}
      <pointLight position={[0, 2.4, -length / 2]} color="#7DD3FC" intensity={10} distance={14} decay={2} />
    </group>
  );
}

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { seededRandom } from "../textures";

export function WindGrass({ length, reduced = false }: { length: number; reduced?: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const count = reduced ? 650 : 1500;
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFog: { value: new THREE.Color("#C1B5A5") } }), []);
  const blade = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([
      -0.035, 0, 0, 0.035, 0, 0, 0.012, 0.3, 0,
      -0.035, 0, 0, 0.012, 0.3, 0, -0.03, 0.21, 0,
    ], 3));
    return geometry;
  }, []);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const rand = seededRandom(149);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      dummy.position.set(side * (3.8 + rand() * 7.5), -0.015, 15 - rand() * (length + 50));
      dummy.rotation.set(0, rand() * Math.PI, (rand() - 0.5) * 0.25);
      dummy.scale.set(0.7 + rand(), 0.55 + rand() * 1.5, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [count, length]);

  useFrame(({ clock }) => {
    if (material.current && !reduced) material.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <instancedMesh ref={mesh} args={[blade, undefined, count]}>
      <shaderMaterial
        ref={material} side={THREE.DoubleSide} uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying float vHeight;
          varying float vDepth;
          varying float vShade;
          void main() {
            vec3 p = position;
            vec3 origin = instanceMatrix[3].xyz;
            float wind = sin(uTime * 1.15 + origin.z * 0.22 + origin.x * 0.5);
            p.x += wind * p.y * p.y * 0.7;
            p.z += cos(uTime * 0.8 + origin.z * 0.14) * p.y * p.y * 0.45;
            vHeight = position.y / 0.3;
            vShade = fract(sin(origin.x * 17.3 + origin.z * 2.91) * 4152.9);
            vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          uniform vec3 uFog;
          varying float vHeight;
          varying float vDepth;
          varying float vShade;
          void main() {
            vec3 base = mix(vec3(0.12, 0.22, 0.09), vec3(0.2, 0.3, 0.12), vShade);
            vec3 tip = mix(vec3(0.39, 0.49, 0.21), vec3(0.56, 0.55, 0.29), vShade);
            vec3 col = mix(base, tip, vHeight);
            col = mix(col, uFog, smoothstep(35.0, 115.0, vDepth));
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </instancedMesh>
  );
}

export function DriftingLeaves({ reduced = false }: { reduced?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => {
    const rand = seededRandom(44);
    return Array.from({ length: 18 }, () => ({ phase: rand() * 20, x: 4.2 + rand() * 4.5, z: -5 - rand() * 25, speed: 0.3 + rand() * 0.25 }));
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const time = reduced ? 0 : clock.elapsedTime;
    seeds.forEach((seed, i) => {
      const t = time * seed.speed + seed.phase;
      const side = i % 2 ? 1 : -1;
      dummy.position.set(side * (seed.x + Math.sin(t) * 0.5), 3.8 - (t % 3.7), seed.z + Math.cos(t * 0.6) * 1.5);
      dummy.rotation.set(t * 0.5, t * 0.7, Math.sin(t * 1.5) * 0.7);
      dummy.scale.set(0.045, 0.09, 0.02);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, seeds.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 4]} />
      <meshStandardMaterial color="#BFA25B" roughness={0.85} />
    </instancedMesh>
  );
}
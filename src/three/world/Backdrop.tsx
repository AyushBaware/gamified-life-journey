import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeBlobTexture, makeCloudTexture, makeSkylineTexture } from "../textures";
import { DriftingLeaves } from "./Foliage";
import type { ChapterTheme } from "../../game/types";

const DEFAULT_THEME: ChapterTheme = {
  accent: "#FFB86B",
  accent2: "#F59E0B",
  skyTop: "#426581",
  skyMid: "#B0AAA6",
  horizon: "#EFC69A",
  fog: "#C1B5A5",
};

function SkyDome({ top, mid, horizon }: { top: string; mid: string; horizon: string }) {
  return (
    <mesh>
      <sphereGeometry args={[160, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={{
          uTop: { value: new THREE.Color(top) },
          uMid: { value: new THREE.Color(mid) },
          uHorizon: { value: new THREE.Color(horizon) },
        }}
        vertexShader={`
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon;
          varying vec3 vPos;
          void main() {
            float h = normalize(vPos).y;
            vec3 c = mix(uHorizon, uMid, smoothstep(0.02, 0.28, h));
            c = mix(c, uTop, smoothstep(0.24, 0.75, h));
            gl_FragColor = vec4(c, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
  );
}

function Cloud({ position, scale = 1, speed, reduced }: { position: [number, number, number]; scale?: number; speed: number; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(makeCloudTexture, []);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    ref.current.position.x = position[0] + Math.sin(clock.elapsedTime * 0.025 + speed) * 9;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.08 + speed) * 0.15;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <sprite scale={[10, 4.5, 1]}>
        <spriteMaterial map={tex} transparent opacity={0.85} depthWrite={false} fog={false} />
      </sprite>
    </group>
  );
}

function SkylineStrip({ z, tint, windowColor, opacity, height }: { z: number; tint: string; windowColor: string; opacity: number; height: number }) {
  const tex = useMemo(() => makeSkylineTexture(tint, windowColor), [tint, windowColor]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={[0, height / 2 - 1, z]}>
      <planeGeometry args={[260, height]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

export function Backdrop({ theme = DEFAULT_THEME, reduced = false }: { theme?: ChapterTheme; reduced?: boolean }) {
  const halo = useMemo(() => makeBlobTexture("255,204,137"), []);
  useEffect(() => () => halo.dispose(), [halo]);
  return (
    <group>
      <SkyDome top={theme.skyTop} mid={theme.skyMid} horizon={theme.horizon} />
      {/* low sun / moon disc */}
      <mesh position={[26, 9, -110]}>
        <circleGeometry args={[3.6, 40]} />
        <meshBasicMaterial color={theme.horizon} toneMapped={false} fog={false} />
      </mesh>
      <sprite position={[26, 9, -109.8]} scale={[37, 37, 1]}>
        <spriteMaterial map={halo} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </sprite>
      {/* rolling hills follow the chapter palette */}
      <Hills z={-137} height={14} color={theme.skyTop} />
      <Hills z={-117} height={8} color={theme.skyMid} />
      {/* parallax skylines */}
      <SkylineStrip z={-104} tint={theme.skyTop} windowColor={theme.accent2} opacity={0.5} height={13} />
      <SkylineStrip z={-88} tint={theme.skyMid} windowColor={theme.accent} opacity={0.55} height={9} />
      {/* clouds */}
      <Cloud position={[-18, 16, -70]} scale={2.4} speed={0.5} reduced={reduced} />
      <Cloud position={[14, 20, -95]} scale={3.1} speed={0.35} reduced={reduced} />
      <Cloud position={[34, 13, -55]} scale={1.9} speed={0.6} reduced={reduced} />
      <Cloud position={[-36, 22, -110]} scale={3.6} speed={0.28} reduced={reduced} />
      <Cloud position={[2, 25, -120]} scale={2.8} speed={0.22} reduced={reduced} />
      {/* birds */}
      {[0, 1, 2].map((i) => (
        <Birds key={i} offset={i * 2.4} y={10 + i * 2.5} z={-55 - i * 14} reduced={reduced} />
      ))}
      <DriftingLeaves reduced={reduced} />
    </group>
  );
}

function Birds({ offset, y, z, reduced }: { offset: number; y: number; z: number; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    const t = clock.elapsedTime * 0.5 + offset;
    ref.current.position.x = Math.sin(t * 0.4) * 24;
    ref.current.position.y = y + Math.sin(t * 1.3) * 0.8;
    ref.current.children.forEach((bird, i) => {
      const flap = Math.sin(clock.elapsedTime * 4 + offset + i * 0.8) * 0.45;
      bird.children[0].rotation.z = flap + 0.1;
      bird.children[1].rotation.z = -flap - 0.1;
    });
  });
  return (
    <group ref={ref} position={[0, y, z]}>
      {[0, 1.6, -1.4].map((dx, i) => (
        <group key={i} position={[dx, i * 0.5, i * -1.2]} rotation={[0, 0.2, 0]}>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * 0.19, 0, 0]} scale={[0.35, 0.025, 0.095]}>
                <sphereGeometry args={[1, 6, 4]} />
                <meshBasicMaterial color="#414D47" fog={false} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function Hills({ z, height, color }: { z: number; height: number; color: string }) {
  const geometry = useMemo(() => {
    const points: number[] = [];
    const top = (x: number) => 2 + height * (0.5 + Math.sin(x * 0.032 + z) * 0.25 + Math.sin(x * 0.082) * 0.12);
    for (let x = -170; x < 170; x += 4) {
      points.push(x, -8, 0, x + 4, -8, 0, x + 4, top(x + 4), 0);
      points.push(x, -8, 0, x + 4, top(x + 4), 0, x, top(x), 0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [height, z]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh position={[0, 0, z]} geometry={geometry}><meshBasicMaterial color={color} fog={false} /></mesh>;
}

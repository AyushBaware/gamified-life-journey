import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { PX } from "../game/constants";

/**
 * One instanced particle system for the whole game — bursts, confetti,
 * water splashes, dust, sparkles. Lives inside the scrolling group, so
 * spawn coordinates are world-locked logical px.
 */

export interface ParticleAPI {
  /** radial sparkle burst at (px, py world, pz px) */
  burst: (xPx: number, y: number, zPx: number, color: string, count?: number, speed?: number) => void;
  confetti: (xPx: number, y: number, zPx: number, colors: string[], count?: number) => void;
  splash: (xPx: number, y: number, zPx: number, count?: number) => void;
  dust: (xPx: number, zPx: number, count?: number) => void;
  clear: () => void;
}

interface P {
  p: THREE.Vector3;
  v: THREE.Vector3;
  life: number;
  ttl: number;
  c: THREE.Color;
  s: number;
  g: number;
  drag: number;
}

const MAX = 320;

export function Particles({ apiRef, reduced }: { apiRef: MutableRefObject<ParticleAPI | null>; reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const parts = useRef<P[]>([]);
  const dummy = useRef(new THREE.Object3D());
  const mul = reduced ? 0.3 : 1;

  useLayoutEffect(() => {
    const push = (p: P) => {
      parts.current.push(p);
      if (parts.current.length > MAX) parts.current.splice(0, parts.current.length - MAX);
    };
    const api: ParticleAPI = {
      clear: () => { parts.current = []; if (mesh.current) mesh.current.count = 0; },
      burst: (xPx, y, zPx, color, count = 26, speed = 4.5) => {
        const c = new THREE.Color(color);
        const n = Math.max(3, Math.round(count * mul));
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = speed * (0.4 + Math.random() * 0.8);
          push({
            p: new THREE.Vector3(xPx / PX, y, -zPx / PX),
            v: new THREE.Vector3(Math.cos(a) * s, Math.abs(Math.sin(a)) * s * 0.8 + 1.2, Math.sin(a) * s * 0.35),
            life: 0,
            ttl: 0.6 + Math.random() * 0.5,
            c,
            s: 0.08 + Math.random() * 0.07,
            g: 7,
            drag: 1.6,
          });
        }
      },
      confetti: (xPx, y, zPx, colors, count = 70) => {
        const n = Math.max(6, Math.round(count * mul));
        for (let i = 0; i < n; i++) {
          push({
            p: new THREE.Vector3(xPx / PX + (Math.random() - 0.5) * 2.4, y + Math.random() * 1.2, -zPx / PX + (Math.random() - 0.5) * 1.6),
            v: new THREE.Vector3((Math.random() - 0.5) * 3.4, 1 + Math.random() * 2.4, (Math.random() - 0.5) * 2),
            life: 0,
            ttl: 1.8 + Math.random() * 1.2,
            c: new THREE.Color(colors[i % colors.length]),
            s: 0.1 + Math.random() * 0.08,
            g: 3.4,
            drag: 1.2,
          });
        }
      },
      splash: (xPx, y, zPx, count = 14) => {
        const n = Math.max(3, Math.round(count * mul));
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const s = 1.6 + Math.random() * 2.4;
          push({
            p: new THREE.Vector3(xPx / PX + (Math.random() - 0.5) * 0.4, y, -zPx / PX + (Math.random() - 0.5) * 0.4),
            v: new THREE.Vector3(Math.cos(a) * s * 0.5, 2 + Math.random() * 2.6, Math.sin(a) * s * 0.5),
            life: 0,
            ttl: 0.45 + Math.random() * 0.35,
            c: new THREE.Color(Math.random() > 0.4 ? "#CFF6FF" : "#7DD3FC"),
            s: 0.05 + Math.random() * 0.06,
            g: 11,
            drag: 0.8,
          });
        }
      },
      dust: (xPx, zPx, count = 8) => {
        const n = Math.max(2, Math.round(count * mul));
        for (let i = 0; i < n; i++) {
          push({
            p: new THREE.Vector3(xPx / PX + (Math.random() - 0.5) * 0.5, 0.06, -zPx / PX + (Math.random() - 0.5) * 0.3),
            v: new THREE.Vector3((Math.random() - 0.5) * 1.4, 0.5 + Math.random() * 0.9, (Math.random() - 0.5) * 0.8),
            life: 0,
            ttl: 0.35 + Math.random() * 0.25,
            c: new THREE.Color("#D8CFC0"),
            s: 0.06 + Math.random() * 0.05,
            g: 1.4,
            drag: 2.4,
          });
        }
      },
    };
    apiRef.current = api;
    if (mesh.current) {
      mesh.current.count = 0;
      mesh.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
    return () => {
      if (apiRef.current === api) apiRef.current = null;
      parts.current = [];
    };
  }, [apiRef, mul]);

  useFrame((_s, dt) => {
    const arr = parts.current;
    for (let i = arr.length - 1; i >= 0; i--) {
      const q = arr[i];
      q.life += dt;
      if (q.life >= q.ttl) {
        arr.splice(i, 1);
        continue;
      }
      q.v.y -= q.g * dt;
      q.v.multiplyScalar(1 - q.drag * dt);
      q.p.addScaledVector(q.v, dt);
      if (q.p.y < 0.03 && q.v.y < 0) {
        q.p.y = 0.03;
        q.v.y *= -0.35;
      }
    }
    const m = mesh.current;
    if (!m) return;
    m.count = arr.length;
    for (let i = 0; i < arr.length; i++) {
      const q = arr[i];
      if (q) {
        const k = 1 - q.life / q.ttl;
        dummy.current.position.copy(q.p);
        dummy.current.scale.setScalar(Math.max(0.001, q.s * (0.35 + 0.65 * k)));
        dummy.current.rotation.set(q.life * 5, q.life * 4.2, q.life * 2);
        dummy.current.updateMatrix();
        m.setMatrixAt(i, dummy.current.matrix);
        m.setColorAt(i, q.c);
      } else {
        dummy.current.position.set(0, -200, 0);
        dummy.current.scale.setScalar(0.0001);
        dummy.current.updateMatrix();
        m.setMatrixAt(i, dummy.current.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX]} count={0} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
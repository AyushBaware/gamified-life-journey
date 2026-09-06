import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { makeLabelTexture, makeStripeTexture } from "../textures";

/**
 * Roadside life — what you'd actually pass on the way to college in Nagpur:
 * a cricket stadium with floodlights, a food court with vendors and a
 * steaming chai stall, a small temple, a bus stop with a waiting passenger,
 * an auto-rickshaw, a cow wandering near the road, and billboards.
 */

/* ---------- Cricket Stadium ---------- */
function CricketStadium({ x, z, accent }: { x: number; z: number; accent: string }) {
  const sign = useMemo(() => makeLabelTexture("VCA CRICKET GROUND", { font: "700 34px 'Fredoka', sans-serif", bg: "#1F3A2A", color: "#E7F0E8", border: accent, radius: 3 }), [accent]);
  useEffect(() => () => sign.tex.dispose(), [sign]);
  const lights = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!lights.current) return;
    lights.current.children.forEach((l, i) => {
      const m = (l as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 2.2 + Math.sin(clock.elapsedTime * 2 + i) * 0.4;
    });
  });
  return (
    <group position={[x, 0, -z]} rotation={[0, x > 0 ? -0.25 : 0.25, 0]}>
      {/* stand — a curved tiered bowl */}
      {[0, 1, 2].map((tier) => (
        <mesh key={tier} position={[0, 1.2 + tier * 1.5, 0]} castShadow>
          <cylinderGeometry args={[12 - tier * 1.3, 12.6 - tier * 1.3, 1.5, 40, 1, false, Math.PI * 0.55, Math.PI * 0.9]} />
          <meshStandardMaterial color={tier % 2 ? "#3F6B4B" : "#4B7C58"} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* seat blocks (colored bands) */}
      <mesh position={[0, 3.1, 0]}>
        <cylinderGeometry args={[9.6, 10.2, 0.5, 40, 1, false, Math.PI * 0.55, Math.PI * 0.9]} />
        <meshStandardMaterial color={accent} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* pitch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 4.5]}>
        <circleGeometry args={[8.5, 40]} />
        <meshStandardMaterial color="#3D7A3B" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 4.5]}>
        <planeGeometry args={[0.9, 4.2]} />
        <meshStandardMaterial color="#C9B68A" roughness={1} />
      </mesh>
      {/* stumps */}
      {[2.4, -2.4].map((zz) => (
        <group key={zz} position={[0, 0.25, 4.5 + zz]}>
          {[-0.08, 0, 0.08].map((sx) => (
            <mesh key={sx} position={[sx, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
              <meshStandardMaterial color="#F2E8D0" />
            </mesh>
          ))}
        </group>
      ))}
      {/* floodlight towers */}
      {[-9, 9].map((lx) => (
        <group key={lx} position={[lx, 0, -1]}>
          <mesh position={[0, 5, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.2, 10, 8]} />
            <meshStandardMaterial color="#6B7280" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, 10.2, 0.2]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[2.2, 1.2, 0.2]} />
            <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.5} />
          </mesh>
          <group ref={lights}>
            {[-0.7, 0, 0.7].map((bx) => (
              <mesh key={bx} position={[bx, 10.2, 0.32]} rotation={[0.35, 0, 0]}>
                <boxGeometry args={[0.5, 0.35, 0.06]} />
                <meshStandardMaterial color="#FFF7D6" emissive="#FFF2C4" emissiveIntensity={2.4} toneMapped={false} />
              </mesh>
            ))}
          </group>
          <pointLight position={[0, 9.6, 1.5]} color="#FFF2C4" intensity={16} distance={20} decay={2} />
        </group>
      ))}
      {/* scoreboard + name */}
      <mesh position={[0, 5.6, -10.6]}>
        <boxGeometry args={[6, 2.4, 0.3]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
      <mesh position={[0, 5.6, -10.4]}>
        <planeGeometry args={[5.2 * sign.aspect * 0.34, 5.2 * 0.34]} />
        <meshBasicMaterial map={sign.tex} transparent depthWrite={false} />
      </mesh>
      {/* flags on the rim */}
      {[-6, -3, 0, 3, 6].map((fx, i) => (
        <group key={fx} position={[fx, 5.8, -9.8]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1, 6]} />
            <meshStandardMaterial color="#9CA3AF" />
          </mesh>
          <mesh position={[0.25, 0.85, 0]}>
            <boxGeometry args={[0.5, 0.3, 0.03]} />
            <meshStandardMaterial color={["#F97316", "#FFFFFF", "#22C55E", "#FFFFFF", "#F97316"][i]} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- Food Court ---------- */
function FoodCourt({ x, z, accent }: { x: number; z: number; accent: string }) {
  const sign = useMemo(() => makeLabelTexture("FOOD COURT", { font: "700 40px 'Fredoka', sans-serif", bg: "#7A2E1F", color: "#FFF2E0", border: "#FFD9A0", radius: 6 }), []);
  useEffect(() => () => sign.tex.dispose(), [sign]);
  const stripes = useMemo(() => { const t = makeStripeTexture("#E4572E", "#FFF3E0"); t.repeat.set(3, 1); return t; }, []);
  const stripes2 = useMemo(() => { const t = makeStripeTexture("#2E8BE4", "#FFF3E0"); t.repeat.set(3, 1); return t; }, []);
  const stripes3 = useMemo(() => { const t = makeStripeTexture("#3DA35D", "#FFF3E0"); t.repeat.set(3, 1); return t; }, []);
  useEffect(() => () => { stripes.dispose(); stripes2.dispose(); stripes3.dispose(); }, [stripes, stripes2, stripes3]);
  const steam = useRef<THREE.Group>(null);
  const bulbs = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (steam.current) {
      steam.current.children.forEach((p, i) => {
        const k = ((t * 0.4 + i * 0.33) % 1);
        p.position.y = 1.55 + k * 1.1;
        p.position.x = 1.9 + Math.sin(t * 2 + i) * 0.08;
        (p as THREE.Mesh).scale.setScalar(0.06 + k * 0.14);
        ((p as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = (1 - k) * 0.5;
      });
    }
    if (bulbs.current) {
      bulbs.current.children.forEach((b, i) => {
        ((b as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4 + Math.sin(t * 3 + i * 1.3) * 0.5;
      });
    }
  });

  const stall = (px: number, tex: THREE.Texture, color: string, label: string) => (
    <group position={[px, 0, 0]}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * 0.95, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.07, 2.5, 8]} />
          <meshStandardMaterial color="#6E4522" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 2.55, 0.3]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[2.3, 0.05, 1.3]} />
        <meshStandardMaterial map={tex} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.5, 0.1]} castShadow>
        <boxGeometry args={[2.1, 1, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.04, 0.1]}>
        <boxGeometry args={[2.2, 0.08, 0.9]} />
        <meshStandardMaterial color="#8A5A30" roughness={0.7} />
      </mesh>
      {/* food items on the counter */}
      {[-0.6, 0, 0.6].map((fx, i) => (
        <mesh key={fx} position={[fx, 1.18, 0.1]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.14, 12]} />
          <meshStandardMaterial color={["#E4A24C", "#C94F3D", "#F2D06B"][i]} roughness={0.5} />
        </mesh>
      ))}
      {/* vendor */}
      <group position={[0, 0, -0.55]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.16, 0.6, 6, 12]} />
          <meshStandardMaterial color="#E9E2D2" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.12, 0]} castShadow>
          <sphereGeometry args={[0.16, 14, 12]} />
          <meshStandardMaterial color="#D19A72" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.24, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.08, 12]} />
          <meshStandardMaterial color="#F8FAFC" />
        </mesh>
      </group>
      {/* stall name */}
      <StallLabel text={label} y={1.9} />
    </group>
  );

  return (
    <group position={[x, 0, -z]} rotation={[0, x > 0 ? -0.35 : 0.35, 0]}>
      {/* patio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 1.5]} receiveShadow>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color="#B9AE95" roughness={1} />
      </mesh>
      {stall(-2.6, stripes, "#B3382A", "Samosa · Vada Pav")}
      {stall(0, stripes2, "#264F86", "Chinese Corner")}
      {stall(2.6, stripes3, "#2E7A48", "Juice · Lassi")}
      {/* chai stall with steam */}
      <group position={[1.9, 0, 2.6]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.9, 0.9, 0.6]} />
          <meshStandardMaterial color="#4B3320" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.18, 0.2, 0.28, 12]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.2, 0.18, 0.06, 12]} />
          <meshStandardMaterial color="#6B7280" metalness={0.6} />
        </mesh>
        {/* tea cups */}
        {[-0.3, -0.15, 0.15, 0.3].map((cx) => (
          <mesh key={cx} position={[cx, 0.96, 0.22]}>
            <cylinderGeometry args={[0.04, 0.03, 0.08, 8]} />
            <meshStandardMaterial color="#F8FAFC" />
          </mesh>
        ))}
        <group ref={steam}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 1.6, 0]}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color="#FFFFFF" transparent opacity={0.4} depthWrite={false} />
            </mesh>
          ))}
        </group>
        <StallLabel text="Chai ☕" y={1.7} />
      </group>
      {/* tables with umbrellas */}
      {[[-3.2, 3.4], [-0.6, 3.6]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.06, 16]} />
            <meshStandardMaterial color="#8A5A30" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.72, 8]} />
            <meshStandardMaterial color="#4B5563" metalness={0.5} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
            <meshStandardMaterial color="#9CA3AF" />
          </mesh>
          <mesh position={[0, 2.25, 0]} castShadow>
            <coneGeometry args={[0.95, 0.4, 10]} />
            <meshStandardMaterial color={i ? "#E4572E" : accent} roughness={0.75} flatShading />
          </mesh>
          {[0, 1].map((c) => (
            <mesh key={c} position={[c ? 0.55 : -0.55, 0.28, 0]}>
              <boxGeometry args={[0.3, 0.06, 0.3]} />
              <meshStandardMaterial color="#F8FAFC" />
            </mesh>
          ))}
        </group>
      ))}
      {/* string lights */}
      <group ref={bulbs}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} position={[-4.2 + i * 0.65, 2.9 - Math.sin((i / 13) * Math.PI) * 0.25, 1.2]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#FFE3AE" emissive="#FFC97A" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 2.4, 1.6]} color="#FFB86B" intensity={8} distance={12} decay={2} />
      {/* big sign */}
      <mesh position={[0, 3.6, -0.4]}>
        <planeGeometry args={[4 * sign.aspect * 0.28, 4 * 0.28]} />
        <meshBasicMaterial map={sign.tex} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

function StallLabel({ text, y }: { text: string; y: number }) {
  const t = useMemo(() => makeLabelTexture(text, { font: "600 28px 'Space Grotesk', sans-serif", bg: "rgba(11,15,25,0.8)", color: "#FFF2E0", border: "rgba(255,217,160,0.6)", pad: 14, radius: 10 }), [text]);
  useEffect(() => () => t.tex.dispose(), [t]);
  return (
    <mesh position={[0, y, 0.7]}>
      <planeGeometry args={[1.4 * t.aspect * 0.28, 1.4 * 0.28]} />
      <meshBasicMaterial map={t.tex} transparent depthWrite={false} />
    </mesh>
  );
}

/* ---------- Temple ---------- */
function Temple({ x, z }: { x: number; z: number }) {
  const bell = useRef<THREE.Group>(null);
  const flag = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (bell.current) bell.current.rotation.z = Math.sin(clock.elapsedTime * 1.4) * 0.12;
    if (flag.current) flag.current.rotation.y = Math.sin(clock.elapsedTime * 2.6) * 0.25;
  });
  return (
    <group position={[x, 0, -z]} rotation={[0, x > 0 ? -0.3 : 0.3, 0]}>
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[5, 0.4, 5]} />
        <meshStandardMaterial color="#D8CDB2" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[3, 2.8, 3]} />
        <meshStandardMaterial color="#E8D4A8" roughness={0.9} />
      </mesh>
      {/* pillars */}
      {[[-1.3, 1.3], [1.3, 1.3]].map(([px, pz]) => (
        <mesh key={`${px}${pz}`} position={[px, 1.8, pz]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 2.8, 10]} />
          <meshStandardMaterial color="#F0E2C0" roughness={0.85} />
        </mesh>
      ))}
      {/* shikhara — stacked tapering tiers */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 3.4 + i * 0.6, 0]} castShadow>
          <boxGeometry args={[2.6 - i * 0.45, 0.6, 2.6 - i * 0.45]} />
          <meshStandardMaterial color={i % 2 ? "#D97B3A" : "#E39A55"} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 6.6, 0]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color="#D9B44A" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 7.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
        <meshStandardMaterial color="#9CA3AF" />
      </mesh>
      <mesh ref={flag} position={[0.3, 7.8, 0]}>
        <planeGeometry args={[0.6, 0.35]} />
        <meshStandardMaterial color="#F97316" side={THREE.DoubleSide} />
      </mesh>
      {/* door + bell */}
      <mesh position={[0, 1.3, 1.52]}>
        <boxGeometry args={[1, 2.2, 0.08]} />
        <meshStandardMaterial color="#6B3F1E" roughness={0.8} />
      </mesh>
      <group ref={bell} position={[0, 3.0, 1.7]}>
        <mesh>
          <cylinderGeometry args={[0.01, 0.01, 0.5, 6]} />
          <meshStandardMaterial color="#9CA3AF" />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <coneGeometry args={[0.16, 0.28, 12]} />
          <meshStandardMaterial color="#D9B44A" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>
      {/* diya lamps on the steps */}
      {[-1.5, -0.5, 0.5, 1.5].map((dx) => (
        <group key={dx} position={[dx, 0.42, 2.3]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.06, 0.06, 10]} />
            <meshStandardMaterial color="#B45309" />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#FFE7B0" emissive="#FFB347" emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 1.6, 2.2]} color="#FFB347" intensity={6} distance={7} decay={2} />
    </group>
  );
}

/* ---------- Bus Stop ---------- */
function BusStop({ x, z, accent }: { x: number; z: number; accent: string }) {
  const sign = useMemo(() => makeLabelTexture("BUS STOP", { font: "700 30px 'Space Grotesk', sans-serif", bg: "#1F2937", color: "#F9FAFB", border: accent, radius: 4 }), [accent]);
  useEffect(() => () => sign.tex.dispose(), [sign]);
  const passenger = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (passenger.current) passenger.current.rotation.y = 0.4 + Math.sin(clock.elapsedTime * 0.7) * 0.25; // looking up the road
  });
  return (
    <group position={[x, 0, -z]} rotation={[0, x > 0 ? -0.1 : 0.1, 0]}>
      {[-1.4, 1.4].map((px) => (
        <mesh key={px} position={[px, 1.3, -0.4]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.6, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 2.62, -0.2]} castShadow>
        <boxGeometry args={[3.4, 0.08, 1.4]} />
        <meshStandardMaterial color={accent} roughness={0.6} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 1.5, -0.95]}>
        <boxGeometry args={[3.2, 2.1, 0.04]} />
        <meshStandardMaterial color="#9CC3D5" roughness={0.1} metalness={0.2} transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0.5, -0.5]} castShadow>
        <boxGeometry args={[2.6, 0.08, 0.45]} />
        <meshStandardMaterial color="#6B4A2B" roughness={0.85} />
      </mesh>
      {/* waiting passenger, seated */}
      <group ref={passenger} position={[-0.7, 0.54, -0.5]}>
        <mesh position={[0, 0.34, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.3, 6, 12]} />
          <meshStandardMaterial color="#7A4FB0" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow>
          <sphereGeometry args={[0.15, 14, 12]} />
          <meshStandardMaterial color="#E8B48C" roughness={0.6} />
        </mesh>
        {[-0.08, 0.08].map((lx) => (
          <mesh key={lx} position={[lx, 0.05, 0.22]} rotation={[1.3, 0, 0]}>
            <capsuleGeometry args={[0.055, 0.32, 6, 10]} />
            <meshStandardMaterial color="#2A3A5C" />
          </mesh>
        ))}
      </group>
      <mesh position={[1.4, 3.1, -0.4]}>
        <planeGeometry args={[1.5 * sign.aspect * 0.3, 1.5 * 0.3]} />
        <meshBasicMaterial map={sign.tex} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ---------- Auto-rickshaw ---------- */
function AutoRickshaw({ x, z }: { x: number; z: number }) {
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (body.current) body.current.position.y = Math.sin(clock.elapsedTime * 9) * 0.01; // engine idle shake
  });
  return (
    <group position={[x, 0, -z]} rotation={[0, x > 0 ? -0.6 : 0.6, 0]}>
      <group ref={body}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[1.1, 0.9, 1.7]} />
          <meshStandardMaterial color="#111827" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[1.14, 0.12, 1.75]} />
          <meshStandardMaterial color="#111827" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.9, 0.1]}>
          <boxGeometry args={[1.12, 0.5, 1.4]} />
          <meshStandardMaterial color="#F2C230" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.9, 0.86]}>
          <boxGeometry args={[0.95, 0.42, 0.04]} />
          <meshStandardMaterial color="#9CC3D5" roughness={0.1} metalness={0.2} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0.55, 0.9]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color="#FFE7B0" emissive="#FFE7B0" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        {/* wheels */}
        {[[0, 0.95], [-0.5, -0.6], [0.5, -0.6]].map(([wx, wz], i) => (
          <mesh key={i} position={[wx, 0.25, wz]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.2, 0.06, 10, 18]} />
            <meshStandardMaterial color="#1F2937" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- Cow — a Nagpur road classic ---------- */
function Cow({ x, z }: { x: number; z: number }) {
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (head.current) {
      head.current.rotation.x = 0.4 + Math.sin(t * 0.6) * 0.3; // grazing nod
      head.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    }
    if (tail.current) tail.current.rotation.z = Math.sin(t * 3) * 0.5; // swatting
  });
  return (
    <group position={[x, 0, -z]} rotation={[0, x > 0 ? 1.9 : -1.9, 0]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.36, 0.9, 8, 14]} />
        <meshStandardMaterial color="#F3EEE6" roughness={0.9} />
      </mesh>
      {/* patches */}
      {[[0.2, 0.95, 0.3], [-0.25, 0.8, -0.2]].map(([px, py, pz], i) => (
        <mesh key={i} position={[px, py, pz]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.9} />
        </mesh>
      ))}
      {/* legs */}
      {[[-0.2, 0.55], [0.2, 0.55], [-0.2, -0.55], [0.2, -0.55]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.3, lz]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.6, 8]} />
          <meshStandardMaterial color="#E8E0D2" roughness={0.9} />
        </mesh>
      ))}
      {/* head + horns */}
      <group ref={head} position={[0, 1.0, 0.95]}>
        <mesh castShadow>
          <boxGeometry args={[0.32, 0.36, 0.5]} />
          <meshStandardMaterial color="#F3EEE6" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.1, 0.27]}>
          <boxGeometry args={[0.28, 0.16, 0.08]} />
          <meshStandardMaterial color="#D9A98A" roughness={0.8} />
        </mesh>
        {[-0.14, 0.14].map((hx) => (
          <mesh key={hx} position={[hx, 0.26, -0.05]} rotation={[0, 0, hx > 0 ? -0.5 : 0.5]}>
            <coneGeometry args={[0.04, 0.3, 8]} />
            <meshStandardMaterial color="#C9B38A" roughness={0.7} />
          </mesh>
        ))}
        {[-0.1, 0.1].map((ex) => (
          <mesh key={ex} position={[ex, 0.04, 0.26]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#1F1710" />
          </mesh>
        ))}
        {[-0.2, 0.2].map((ex) => (
          <mesh key={ex} position={[ex, 0.1, 0]} rotation={[0, 0, ex > 0 ? -1 : 1]}>
            <boxGeometry args={[0.16, 0.08, 0.04]} />
            <meshStandardMaterial color="#E8E0D2" />
          </mesh>
        ))}
      </group>
      <mesh ref={tail} position={[0, 1.1, -0.95]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.03, 0.6, 6]} />
        <meshStandardMaterial color="#D9C9B2" />
      </mesh>
    </group>
  );
}

/* ---------- Billboard ---------- */
function Billboard({ x, z, text, color }: { x: number; z: number; text: string; color: string }) {
  const t = useMemo(() => makeLabelTexture(text, { font: "700 40px 'Fredoka', sans-serif", bg: color, color: "#FFFFFF", border: "rgba(255,255,255,0.5)", radius: 6, pad: 40 }), [text, color]);
  useEffect(() => () => t.tex.dispose(), [t]);
  return (
    <group position={[x, 0, -z]} rotation={[0, x > 0 ? -0.45 : 0.45, 0]}>
      {[-1.2, 1.2].map((px) => (
        <mesh key={px} position={[px, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 4.4, 8]} />
          <meshStandardMaterial color="#4B5563" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 4.8, 0]} castShadow>
        <boxGeometry args={[4.4, 1.8, 0.12]} />
        <meshStandardMaterial color="#1F2937" roughness={0.6} />
      </mesh>
      <mesh position={[0, 4.8, 0.08]}>
        <planeGeometry args={[4.1 * t.aspect * 0.32, 4.1 * 0.32]} />
        <meshBasicMaterial map={t.tex} transparent depthWrite={false} />
      </mesh>
      <pointLight position={[0, 5.9, 0.9]} color="#FFFFFF" intensity={5} distance={5} decay={2} />
    </group>
  );
}

/* ---------- The whole roadside, laid out per chapter ---------- */
export function Roadside({ variant, accent }: { variant: "school" | "twelfth" | "college"; accent: string }) {
  if (variant === "school") {
    return (
      <group>
        <Temple x={-14} z={70} />
        <BusStop x={9} z={95} accent={accent} />
        <Cow x={-7.2} z={120} />
        <Billboard x={12} z={150} text="Nagpur Oranges 🍊" color="#F97316" />
        <AutoRickshaw x={8.5} z={168} />
      </group>
    );
  }
  // 12th & college share the college route; the campus is at z≈52
  return (
    <group>
      <FoodCourt x={11} z={20} accent={accent} />
      <BusStop x={-9.5} z={34} accent={accent} />
      <AutoRickshaw x={-8.6} z={42} />
      <CricketStadium x={-24} z={110} accent={accent} />
      <Cow x={7.4} z={74} />
      <Temple x={13} z={92} />
      <Billboard x={-12} z={128} text="Learn to Code 💻" color="#2E5E6E" />
      <FoodCourt x={-12} z={150} accent={accent} />
      <Billboard x={11.5} z={175} text={variant === "college" ? "Placements 2025 🎓" : "Board Exams — All the best!"} color={variant === "college" ? "#7A4FB0" : "#0EA5E9"} />
      <Cow x={-7.6} z={196} />
      <BusStop x={9} z={215} accent={accent} />
    </group>
  );
}

"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// Body colours per stop — black → ember → wild green.
// (Tweak these to match a reference palette.)
const BODY_COLORS = ["#202020", "#e8641e", "#2f8f5b"];
const GOLD = "#d8a64a";
const COPPER = "#d98c5f";

const smoothstep = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

// Map raw scroll progress (0..1) to a continuous stop value (0..2) with
// eased travels and flat holds at each of the 3 stops.
function sceneFloat(p: number) {
  if (p < 0.16) return 0;
  if (p < 0.4) return smoothstep((p - 0.16) / 0.24);
  if (p < 0.6) return 1;
  if (p < 0.84) return 1 + smoothstep((p - 0.6) / 0.24);
  return 2;
}

const lerpArr = (sf: number, arr: number[]) => {
  const seg = sf <= 1 ? 0 : 1;
  const t = sf <= 1 ? sf : sf - 1;
  return arr[seg] * (1 - t) + arr[seg + 1] * t;
};

const POS_X = [1.45, -1.45, 1.45];
const POS_Y = [1.0, 0, -1.0];
const TILT_Z = [-0.1, 0.08, -0.08];

function useGrilleTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 360;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0c0c0c";
    ctx.fillRect(0, 0, c.width, c.height);
    // diamond mesh
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    const step = 14;
    for (let x = -c.height; x < c.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + c.height, c.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + c.height, 0);
      ctx.lineTo(x, c.height);
      ctx.stroke();
    }
    // brand wordmark
    ctx.fillStyle = COPPER;
    ctx.font = "italic 600 78px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Leisure", c.width / 2, c.height / 2 + 6);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    return tex;
  }, []);
}

function Speaker({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  const grille = useGrilleTexture();

  const colorObjs = useMemo(
    () => BODY_COLORS.map((c) => new THREE.Color(c)),
    []
  );
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!group.current) return;
    const sf = sceneFloat(progress.current);
    const t = state.clock.elapsedTime;
    group.current.position.x = lerpArr(sf, POS_X);
    group.current.position.y = lerpArr(sf, POS_Y) + Math.sin(t * 0.8) * 0.05;
    // One full revolve per travel → lands front-facing at every stop.
    // A gentle sway keeps it alive without turning away while held.
    group.current.rotation.y = sf * Math.PI * 2 + Math.sin(t * 0.6) * 0.12;
    group.current.rotation.x = Math.sin(t * 0.5) * 0.04;
    group.current.rotation.z = lerpArr(sf, TILT_Z);

    // colour interpolation across stops
    const seg = sf <= 1 ? 0 : 1;
    const ct = sf <= 1 ? sf : sf - 1;
    tmp.copy(colorObjs[seg]).lerp(colorObjs[seg + 1], ct);
    bodyMat.current?.color.copy(tmp);
  });

  return (
    <group ref={group} scale={0.74}>
      {/* body */}
      <RoundedBox args={[3.5, 2.5, 2.1]} radius={0.16} smoothness={5}>
        <meshStandardMaterial
          ref={bodyMat}
          color={BODY_COLORS[0]}
          roughness={0.5}
          metalness={0.18}
        />
      </RoundedBox>

      {/* gold trim frame */}
      <RoundedBox args={[3.05, 2.05, 0.06]} radius={0.07} position={[0, 0, 1.0]}>
        <meshStandardMaterial color={GOLD} roughness={0.28} metalness={0.9} />
      </RoundedBox>

      {/* front grille */}
      <RoundedBox args={[2.85, 1.85, 0.08]} radius={0.05} position={[0, 0, 1.05]}>
        <meshStandardMaterial map={grille} roughness={0.75} metalness={0.15} />
      </RoundedBox>

      {/* top control knobs */}
      {[-0.9, -0.3, 0.3, 0.9].map((x) => (
        <mesh key={x} position={[x, 1.32, 0.55]}>
          <cylinderGeometry args={[0.11, 0.11, 0.16, 28]} />
          <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.85} />
        </mesh>
      ))}

      {/* leather handle */}
      <mesh position={[0, 1.3, 0.15]}>
        <torusGeometry args={[0.85, 0.07, 18, 48, Math.PI]} />
        <meshStandardMaterial color="#171311" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* feet */}
      {[
        [-1.35, -1.3, 0.7],
        [1.35, -1.3, 0.7],
        [-1.35, -1.3, -0.7],
        [1.35, -1.3, -0.7],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.13, 0.13, 0.14, 20]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.7} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export default function Speaker3D({
  progress,
}: {
  progress: MutableRefObject<number>;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.2, 12], fov: 30 }}
    >
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#fff6e0", "#101010", 0.5]} />
      <directionalLight position={[5, 6, 6]} intensity={2.4} castShadow />
      <directionalLight position={[-6, 2, 3]} intensity={0.9} color="#ffd9a0" />
      <pointLight position={[0, -3, 5]} intensity={0.7} color="#fff2c0" />
      <Speaker progress={progress} />
    </Canvas>
  );
}

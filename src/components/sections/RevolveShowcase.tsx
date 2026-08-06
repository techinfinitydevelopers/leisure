"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Scene = {
  tag: string;
  title: string;
  body: string;
  textSide: "left" | "right";
  vy: string;
  x: number; // xPercent
  y: number; // yPercent
  tilt: number; // rotationZ deg
  bodyColor: string | null; // null = the model's original GLB colour
  glow: string;
};

const SCENES: Scene[] = [
  {
    tag: "01 — Engineered Sound",
    title: "Crafted to move you",
    body: "Hand-tuned drivers and a sealed acoustic chamber push sound that's warm, weighted, and unmistakably alive — from the first note to the last.",
    textSide: "left",
    vy: "44%",
    x: 46,
    y: -12,
    tilt: -5,
    bodyColor: null,
    glow: "rgba(251,237,43,0.18)",
  },
  {
    tag: "02 — Sunset Ember",
    title: "Turn it, own it",
    body: "Grab the strap and go. Every angle catches the light differently — pick the finish that sounds like you and take it anywhere.",
    textSide: "right",
    vy: "52%",
    x: -46,
    y: 4,
    tilt: 4,
    bodyColor: "#D94112",
    glow: "rgba(255,138,42,0.22)",
  },
  {
    tag: "03 — Wild Green",
    title: "Made to roam",
    body: "Rugged, weather-ready, and rated for days off the charger. Follow the moment — beach, balcony, or somewhere off the map.",
    textSide: "left",
    vy: "56%",
    x: 46,
    y: 16,
    tilt: -4,
    bodyColor: "#1C1D0F",
    glow: "rgba(74,222,128,0.16)",
  },
];

// Verified via a rotation scan against this exact GLB + camera setup —
// 0 is dead-front (grille square to the camera, "Leisure" wordmark
// readable straight-on). The product page's offset didn't carry over
// correctly here (different camera/scale), so this is independently tuned.
const BASE_RY = 0;
// One full turn across the whole scroll range.
const ROTATION_RANGE = Math.PI * 2;
// +30% over the previous 1.3 — the model itself fills more of the same
// frustum (see camera below), rather than upscaling via CSS.
const MODEL_SCALE = 1.7;
// Name of the outer body/shell material in the GLB (verified via material
// scan — everything else, strap/logo/grille/trim, stays untouched).
const BODY_MATERIAL_NAME = "leather_red_02.001";

type ReadyPayload = { material: THREE.MeshStandardMaterial; group: THREE.Group };

function LegendModel({ onReady }: { onReady: (payload: ReadyPayload) => void }) {
  const { scene } = useGLTF("/products/legend/legend-model.glb");
  const groupRef = useRef<THREE.Group>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (readyRef.current) return;
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    root.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const holder = new THREE.Group();
    holder.scale.setScalar(maxDim > 0 ? MODEL_SCALE / maxDim : 1);
    holder.add(root);

    let bodyMaterial: THREE.MeshStandardMaterial | null = null;
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        if (m.name === BODY_MATERIAL_NAME && m instanceof THREE.MeshStandardMaterial) {
          bodyMaterial = m;
        }
      }
    });

    if (groupRef.current && bodyMaterial) {
      groupRef.current.add(holder);
      readyRef.current = true;
      onReady({ material: bodyMaterial, group: groupRef.current });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return <group ref={groupRef} />;
}

useGLTF.preload("/products/legend/legend-model.glb");

export default function RevolveShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spinner = useRef<HTMLDivElement>(null);
  const texts = useRef<HTMLDivElement[]>([]);
  const glow = useRef<HTMLDivElement>(null);

  const modelGroupRef = useRef<THREE.Group | null>(null);
  const bodyMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const baseColorRef = useRef<THREE.Color | null>(null);
  const [ready, setReady] = useState(false);

  const handleModelReady = useCallback(({ material, group }: ReadyPayload) => {
    bodyMaterialRef.current = material;
    modelGroupRef.current = group;
    baseColorRef.current = material.color.clone();
    setReady(true);
  }, []);

  useGSAP(
    () => {
      if (!root.current || !stage.current || !ready) return;
      const modelGroup = modelGroupRef.current;
      const bodyMaterial = bodyMaterialRef.current;
      const baseColor = baseColorRef.current;
      if (!modelGroup || !bodyMaterial || !baseColor) return;

      // Initial state — original GLB colour, front-facing.
      gsap.set(spinner.current, {
        xPercent: SCENES[0].x,
        yPercent: SCENES[0].y,
        rotationZ: SCENES[0].tilt,
      });
      gsap.set(glow.current, { backgroundColor: SCENES[0].glow });
      gsap.set(modelGroup.rotation, { y: BASE_RY });
      bodyMaterial.color.copy(baseColor);
      texts.current.forEach((el, i) =>
        gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 24 })
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // The spin lives INSIDE this same scrubbed timeline (one full turn per
      // travel, via relative "+=" so it keeps accumulating) — it only
      // rotates during the travel segments below and holds perfectly still
      // (landing back at BASE_RY, i.e. front-facing) through every hold,
      // including the final one at the very end of the section. Linear ease
      // on purpose — a spin reads as smooth at constant angular speed;
      // power2.inOut's slow-fast-slow curve made it feel like it was
      // "catching"/stuttering rather than turning fluidly.
      const travel = (from: number, to: number, at: string) => {
        const target = SCENES[to].bodyColor
          ? new THREE.Color(SCENES[to].bodyColor as string)
          : baseColor;

        tl
          .to(
            spinner.current,
            {
              xPercent: SCENES[to].x,
              yPercent: SCENES[to].y,
              rotationZ: SCENES[to].tilt,
              ease: "power2.inOut",
              duration: 1.6,
            },
            at
          )
          .to(glow.current, { backgroundColor: SCENES[to].glow, duration: 1.8 }, at)
          .to(
            modelGroup.rotation,
            { y: `+=${ROTATION_RANGE}`, ease: "none", duration: 1.6 },
            at
          )
          .to(
            bodyMaterial.color,
            { r: target.r, g: target.g, b: target.b, ease: "power1.inOut", duration: 1.6 },
            at
          )
          .to(
            texts.current[from],
            { autoAlpha: 0, y: -24, ease: "power1.in", duration: 0.9 },
            at
          )
          .fromTo(
            texts.current[to],
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, ease: "power2.out", duration: 1 },
            at + "+=1.8"
          );
      };

      tl.addLabel("s0").to({}, { duration: 1.2 });
      tl.addLabel("t1");
      travel(0, 1, "t1");
      tl.to({}, { duration: 1.5 }, ">");
      tl.addLabel("t2");
      travel(1, 2, "t2");
      tl.to({}, { duration: 3 }, ">");

      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section
      ref={root}
      className="relative h-[420vh] w-full bg-black"
      aria-label="Speaker showcase"
    >
      <div ref={stage} className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Ambient backdrop */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_55%_45%_at_50%_18%,rgba(251,237,43,0.05),transparent_60%)]" />
        {/* Colour-shifting glow behind the speaker */}
        <div
          ref={glow}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[54vh] max-h-[500px] w-[54vh] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        />

        {/* Section eyebrow */}
        <div className="absolute left-1/2 top-9 z-10 -translate-x-1/2 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-gold/70">
            One Speaker · Infinite Moments
          </p>
        </div>

        {/* Real LEGEND 3D model — live-rotated on scroll, recoloured per stop
            via a single body material colour tween. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            ref={spinner}
            className="relative aspect-square w-[72vw] max-w-[560px] sm:w-[52vw] md:w-[46vw]"
            style={{
              isolation: "isolate",
              willChange: "transform",
              WebkitMaskImage:
                "radial-gradient(circle at 50% 50%, #000 50%, transparent 74%)",
              maskImage:
                "radial-gradient(circle at 50% 50%, #000 50%, transparent 74%)",
            }}
          >
            <Canvas
              className="absolute inset-0 h-full w-full"
              camera={{ position: [0, 0, 3.4], fov: 35 }}
              gl={{ antialias: true, alpha: true }}
              onCreated={({ gl }) => gl.setClearColor(new THREE.Color("#000000"), 0)}
            >
              <ambientLight intensity={1.9} />
              <directionalLight position={[3, 5, 4]} intensity={2.8} />
              <directionalLight position={[-3, -2, 2]} intensity={1} />
              <directionalLight position={[0, 1.5, -3]} intensity={1.4} />
              <pointLight position={[0, 0, 3]} intensity={0.6} />
              <LegendModel onReady={handleModelReady} />
            </Canvas>
          </div>
        </div>

        {/* Write-ups (one visible per stop) */}
        {SCENES.map((s, i) => (
          <div
            key={s.tag}
            ref={(el) => {
              if (el) texts.current[i] = el;
            }}
            style={{ top: s.vy }}
            className={`pointer-events-none absolute z-10 w-[80%] max-w-sm -translate-y-1/2 ${
              s.textSide === "left"
                ? "left-[6%] text-left md:left-[8%]"
                : "right-[6%] text-right md:right-[8%]"
            }`}
          >
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold">
              {s.tag}
            </p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-offwhite sm:text-5xl">
              {s.title}
            </h2>
            <p
              className={`mt-5 text-base leading-relaxed text-offwhite/65 ${
                s.textSide === "right" ? "ml-auto" : ""
              }`}
            >
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

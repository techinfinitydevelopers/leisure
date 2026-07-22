"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scroll } from "@/lib/scrollStore";
import { sampleTrack } from "@/lib/keyframes";
import type { ProductExperience } from "@/lib/product-experience";

type Props = {
  product: ProductExperience;
  onReady?: () => void;
};

const TARGET_H = 1.7; // normalized model height in world units (smaller = smaller on screen)
// Base heading so the model's branded front faces the camera at rest. If it
// starts side/back-on, tweak by ±Math.PI/2 (90°) or Math.PI (180°). Track `ry`
// rotates ON TOP of this.
const BASE_RY = -Math.PI / 2 + 0.42;
const SPREAD = 1.3; // how far (world units) parts fly apart at full explode
const EXPLODE_S = 0.95; // steady scale while the model is centered & exploded
const SPIN_S = 0.85; // model scale during the spin stage (smaller so caption reads)
const FACE_K = 5.2; // how hard the model turns based on which side it's roaming
const FACE_MAX = 1.5; // max heading (rad) at the far left/right
const SPREAD_JITTER = 0.6; // ± variation in how far each part travels
const TUMBLE = 0.9; // max per-part rotation (rad) at full explode
const MAX_STAGGER = 0.35; // parts start separating across this slice of the ramp

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
// deterministic pseudo-random in [0,1) from an integer seed (stable per part)
const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Part = {
  mesh: THREE.Object3D;
  base: THREE.Vector3;
  dir: THREE.Vector3; // outward travel (1 world unit) in parent-local space
  spread: number; // per-part distance multiplier
  phase: number; // 0..MAX_STAGGER — when this part starts leaving
  axis: THREE.Vector3; // tumble axis
  amt: number; // tumble amount (rad)
  baseRot: THREE.Euler; // rest rotation to add tumble onto
};

export default function ProductModel({ product, onReady }: Props) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const { scene } = useGLTF(product.model!);

  // Clone, center at origin, scale to a consistent height, and precompute each
  // part's outward explode direction (in its parent's local space).
  const { holder, parts } = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    // Normalise by the LARGEST dimension so a wide speaker + a tall one both
    // fit within TARGET_H on screen. Previously we used size.y only, which
    // made squat/wide models scale huge because their height was small.
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = (maxDim > 0 ? TARGET_H / maxDim : 1) * (product.modelScale ?? 1);

    const holder = new THREE.Group();
    root.position.sub(center); // center the model on the origin
    holder.scale.setScalar(scale);
    holder.rotation.y = BASE_RY;
    holder.add(root);
    holder.updateWorldMatrix(true, true);

    const parts: Part[] = [];
    const worldCenter = new THREE.Vector3(); // holder sits at origin -> model center is 0
    let i = 0;
    holder.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.parent) return;
      const seed = i++;
      const worldPos = mesh.getWorldPosition(new THREE.Vector3());
      const dirWorld = worldPos.clone().sub(worldCenter);
      if (dirWorld.lengthSq() < 1e-6) {
        // part sits on the model axis (e.g. the core body) — give it a stable
        // pseudo-random outward direction so everything separates.
        dirWorld.set(rand(seed) - 0.5, rand(seed + 7) - 0.5, rand(seed + 13) - 0.5);
      }
      dirWorld.normalize();
      const parent = mesh.parent;
      const pA = parent.worldToLocal(worldPos.clone());
      const pB = parent.worldToLocal(worldPos.clone().add(dirWorld));
      const dir = pB.sub(pA); // 1 world unit of outward travel, in parent-local units
      const axis = new THREE.Vector3(
        rand(seed + 1) - 0.5,
        rand(seed + 2) - 0.5,
        rand(seed + 3) - 0.5,
      ).normalize();
      parts.push({
        mesh,
        base: mesh.position.clone(),
        dir,
        spread: 1 + (rand(seed + 4) - 0.5) * 2 * SPREAD_JITTER,
        phase: rand(seed + 5) * MAX_STAGGER,
        axis,
        amt: (0.4 + rand(seed + 6)) * TUMBLE,
        baseRot: mesh.rotation.clone(),
      });
    });

    return { holder, parts };
  }, [scene, product.modelScale]);

  // Collect materials once so we can drive opacity (reveal + parallax hide).
  // Keep the authored transparency (only 3 blend mats) so the model renders
  // SOLID when fully visible — permanently-transparent mats sort wrong and make
  // the model look see-through / like the back is missing.
  const materials = useMemo(() => {
    const set = new Set<THREE.Material>();
    holder.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (Array.isArray(m)) m.forEach((mm) => set.add(mm));
      else if (m) set.add(m);
    });
    for (const m of set) m.userData.baseTransparent = m.transparent;
    return [...set];
  }, [holder]);
  const fadingRef = useRef<boolean | null>(null);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const fadeRef = useRef(0);
  const hideRef = useRef(0);
  const sideRef = useRef(0);
  const exRef = useRef(0);
  const focusRef = useRef(0);
  const holdRef = useRef(0);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = scroll.progress;
    const k = sampleTrack(p, product.track);

    const z = scroll.zoom;
    const sp = scroll.spin;
    // ease the exploded-view + feature-focus amounts up front so the roam
    // branch can use them. Both center the model; centerAmt = whichever wins.
    exRef.current = THREE.MathUtils.lerp(exRef.current, scroll.explode, 0.12);
    focusRef.current = THREE.MathUtils.lerp(focusRef.current, scroll.focus, 0.1);
    const ex = exRef.current; // 0 assembled -> 1 fully exploded (dormant)
    const focus = focusRef.current; // 0 -> 1 into the guided feature tour
    // intro: hidden at the very top (hero shows a still image), reveals + slides
    // down as the user starts scrolling
    const intro = THREE.MathUtils.clamp((p - 0.008) / 0.05, 0, 1);
    // opacity gate: reveal on the first scroll with a SMALL, subtle fade — the
    // product stays visible throughout (floors at ~0.6, not fully transparent)
    const revealGate =
      p <= 0.008 ? 0 : 0.6 + 0.4 * THREE.MathUtils.clamp((p - 0.008) / 0.03, 0, 1);
    // face based on WHICH SIDE the model is on: roaming left -> turn front
    // toward the centre/content (3/4 view), mirrored on the right.
    const roamFaceRY = THREE.MathUtils.clamp(-k.x * FACE_K, -FACE_MAX, FACE_MAX);

    if (sp > 0.001) {
      // pinned spin: center and rotate a full turn on Y (real 3D)
      const rotY = sp * Math.PI * 2;
      g.position.x = THREE.MathUtils.lerp(g.position.x, 0, 0.12);
      // sit a little below centre so the "SEE IT FROM ALL SIDES" title clears it
      g.position.y = THREE.MathUtils.lerp(g.position.y, -viewport.height * 0.15, 0.12);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 0.12);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0, 0.12);
      g.rotation.y = rotY;
      const s = THREE.MathUtils.lerp(g.scale.x, SPIN_S, 0.12);
      g.scale.setScalar(s);
    } else {
      // roam + zoom/dolly + slide-aside (mirrors ProductPlane)
      const SIDE_X = -0.62;
      const SIDE_S = 0.78;
      sideRef.current = THREE.MathUtils.lerp(
        sideRef.current,
        scroll.sideCount > 0 ? 1 : 0,
        0.09,
      );
      const sa = sideRef.current;
      const baseX = THREE.MathUtils.lerp(k.x, SIDE_X, sa);
      const baseS = THREE.MathUtils.lerp(k.s, SIDE_S, sa);
      // During the feature tour (focus), ease the model to that stop's X
      // position (can be left/centre/right), orientation and a steady scale;
      // otherwise follow the horizontal roam track.
      const roamX = baseX * viewport.width * (1 - z);
      // section hold: park at a fixed X while a section requests it (e.g. Overview → right)
      holdRef.current = THREE.MathUtils.lerp(
        holdRef.current,
        scroll.holdCount > 0 ? 1 : 0,
        0.08,
      );
      const hold = holdRef.current;
      const heldX = THREE.MathUtils.lerp(roamX, scroll.holdX * viewport.width, hold);
      // focus (feature tour) overrides everything
      const targetX = THREE.MathUtils.lerp(
        heldX,
        scroll.focusX * viewport.width,
        focus,
      );
      const roamY = k.y * viewport.height * (1 - z);
      const heldY = THREE.MathUtils.lerp(roamY, scroll.holdY * viewport.height, hold);
      // intro slide: start a little higher and drop into place as it reveals
      const targetY =
        THREE.MathUtils.lerp(heldY, 0, focus) + (1 - intro) * viewport.height * 0.12;
      const targetRZ =
        (k.rz + scroll.velocity * 0.0006) * (1 - z) * (1 - focus) * (1 - hold);
      // heading: face roam direction -> held heading -> focus heading
      const heldRY = THREE.MathUtils.lerp(roamFaceRY * (1 - z), scroll.holdRY, hold);
      const roamRY = THREE.MathUtils.lerp(heldRY, scroll.focusRY, focus);
      // on reveal (intro < 1) present a steady right-side view with a touch of
      // front, then ease into the roam heading as the model settles in
      const targetRY = THREE.MathUtils.lerp(-1.15, roamRY, intro);
      const heldRX = THREE.MathUtils.lerp(0, scroll.holdRX, hold);
      const targetRX = THREE.MathUtils.lerp(heldRX, scroll.focusRX, focus);
      // scale: shrink while held, dolly with zoom, steady when focused
      const heldBaseS = THREE.MathUtils.lerp(baseS, baseS * scroll.holdS, hold);
      const targetS = THREE.MathUtils.lerp(heldBaseS + z * 3.2, EXPLODE_S, focus);
      g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, 0.08);
      g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 0.08);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetRZ, 0.08);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRY, 0.08);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetRX, 0.08);
      const s = THREE.MathUtils.lerp(g.scale.x, targetS, 0.08);
      g.scale.setScalar(s);
    }

    // exploded view: each part staggers out along its direction, travels a
    // per-part distance, and tumbles — then reverses to reassemble.
    for (const pt of parts) {
      const eff = clamp01((ex - pt.phase) / (1 - pt.phase)); // per-part 0..1
      pt.mesh.position
        .copy(pt.base)
        .addScaledVector(pt.dir, eff * SPREAD * pt.spread);
      const a = eff * pt.amt;
      pt.mesh.rotation.set(
        pt.baseRot.x + pt.axis.x * a,
        pt.baseRot.y + pt.axis.y * a,
        pt.baseRot.z + pt.axis.z * a,
      );
    }

    // opacity: reveal in once, fade out during parallax breaks
    scroll.planeReveal = THREE.MathUtils.lerp(scroll.planeReveal, 1, 0.06);
    fadeRef.current = THREE.MathUtils.lerp(fadeRef.current, 1, 0.14);
    hideRef.current = THREE.MathUtils.lerp(hideRef.current, scroll.productHide, 0.1);
    const opacity =
      k.o * scroll.planeReveal * fadeRef.current * (1 - hideRef.current) * revealGate;
    // Only go transparent while actually fading; otherwise render opaque/solid
    // (flip the flag on state change, not every frame, to avoid recompiles).
    const fading = opacity < 0.985;
    if (fading !== fadingRef.current) {
      fadingRef.current = fading;
      // when fully visible, force EVERYTHING opaque (incl. the GLB's blend mats)
      // so the model reads solid — no see-through back
      for (const m of materials) {
        m.transparent = fading;
        // keep depth writes ON even while fading so the front always occludes
        // the back — the model blends against the bg, not against itself
        m.depthWrite = true;
        if (m instanceof THREE.MeshStandardMaterial) m.alphaTest = 0;
        m.needsUpdate = true;
      }
    }
    for (const m of materials) m.opacity = opacity;
  });

  return (
    <group ref={group} scale={0}>
      <primitive object={holder} />
    </group>
  );
}

// Preload so the model starts fetching as soon as the module is imported.
if (typeof window !== "undefined") {
  useGLTF.preload("/products/drift/drift-model.glb");
}

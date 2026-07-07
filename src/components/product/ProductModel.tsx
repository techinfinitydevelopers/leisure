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
    const scale = size.y > 0 ? TARGET_H / size.y : 1;

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
  }, [scene]);

  // Collect materials once so we can drive opacity (reveal + parallax hide).
  const materials = useMemo(() => {
    const set = new Set<THREE.Material>();
    holder.traverse((o) => {
      const m = (o as THREE.Mesh).material;
      if (Array.isArray(m)) m.forEach((mm) => set.add(mm));
      else if (m) set.add(m);
    });
    for (const m of set) m.transparent = true;
    return [...set];
  }, [holder]);

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

    if (sp > 0.001) {
      // pinned spin: center and rotate a full turn on Y (real 3D)
      const rotY = sp * Math.PI * 2;
      g.position.x = THREE.MathUtils.lerp(g.position.x, 0, 0.12);
      g.position.y = THREE.MathUtils.lerp(g.position.y, 0, 0.12);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 0.12);
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0, 0.12);
      g.rotation.y = rotY;
      const s = THREE.MathUtils.lerp(g.scale.x, k.s + 0.35, 0.12);
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
      const targetY = THREE.MathUtils.lerp(heldY, 0, focus);
      const targetRZ =
        (k.rz + scroll.velocity * 0.0006) * (1 - z) * (1 - focus) * (1 - hold);
      // heading: roam -> held heading -> focus heading
      const heldRY = THREE.MathUtils.lerp(k.ry * (1 - z), scroll.holdRY, hold);
      const targetRY = THREE.MathUtils.lerp(heldRY, scroll.focusRY, focus);
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
    const opacity = k.o * scroll.planeReveal * fadeRef.current * (1 - hideRef.current);
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

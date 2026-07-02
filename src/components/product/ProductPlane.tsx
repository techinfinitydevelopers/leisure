"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { scroll } from "@/lib/scrollStore";
import { sampleTrack } from "@/lib/keyframes";
import type { ProductExperience } from "@/lib/product-experience";

type Props = {
  product: ProductExperience;
  onReady?: () => void;
  colorIndex?: number;
  viewIndex?: number;
};

export default function ProductPlane({
  product,
  onReady,
  colorIndex = 0,
  viewIndex = 0,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const { viewport } = useThree();

  const H = product.perspective?.planeH ?? 3; // plane height in world units

  // Flat list of every variant image + a [colorIndex][viewIndex] -> flat index lookup.
  const URLS = useMemo(() => product.colors.flatMap((c) => c.images), [product]);
  const URL_INDEX = useMemo(() => {
    const map: number[][] = [];
    let n = 0;
    for (const c of product.colors) {
      const row: number[] = [];
      for (let v = 0; v < c.images.length; v++) row.push(n++);
      map.push(row);
    }
    return map;
  }, [product]);

  // Load all variant textures up front (drei returns an array for an array input).
  const textures = useTexture(URLS, (texs) => {
    const list = Array.isArray(texs) ? texs : [texs];
    for (const tex of list) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.needsUpdate = true;
    }
    onReady?.();
  });
  const texList = useMemo(
    () => (Array.isArray(textures) ? textures : [textures]) as THREE.Texture[],
    [textures],
  );

  // Active flat index resolved DECLARATIVELY from props.
  const activeIdx = useMemo(() => {
    const ci = Math.min(Math.max(colorIndex, 0), URL_INDEX.length - 1);
    const row = URL_INDEX[ci];
    const vi = Math.min(Math.max(viewIndex, 0), row.length - 1);
    return row[vi];
  }, [colorIndex, viewIndex, URL_INDEX]);

  const activeTex = texList[activeIdx] || texList[0];
  const activeUrl = URLS[activeIdx];
  const activeImg = activeTex?.image as
    | { width?: number; height?: number }
    | undefined;
  const aspect =
    activeImg && activeImg.width && activeImg.height
      ? activeImg.width / activeImg.height
      : 0.85;
  const W = H * aspect;

  // Kick a quick cross-fade whenever the active image changes.
  const prevIdx = useRef(activeIdx);
  const fadeRef = useRef(1);
  const hideRef = useRef(0); // smoothed productHide (parallax break fade-out)
  const sideRef = useRef(0); // smoothed slide-to-side amount (0 = follow track, 1 = parked at side)
  if (prevIdx.current !== activeIdx) {
    prevIdx.current = activeIdx;
    fadeRef.current = 0;
  }

  // front/back textures of the active color (for the flip-spin)
  const ciClamp = Math.min(Math.max(colorIndex, 0), URL_INDEX.length - 1);
  const colorRow = URL_INDEX[ciClamp];
  const frontTex = texList[colorRow[0]];
  const backTex = texList[colorRow[Math.min(1, colorRow.length - 1)]];

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const p = scroll.progress;
    const k = sampleTrack(p, product.track);

    const z = scroll.zoom; // dolly-in close-up
    const sp = scroll.spin; // pinned 360 flip spin
    let desiredTex = activeTex;
    let faceSign = 1;

    if (sp > 0.001) {
      // ---- pinned flip spin: center, rotate Y a full turn, swap front/back ----
      const rotY = sp * Math.PI * 2;
      g.position.x = THREE.MathUtils.lerp(g.position.x, 0, 0.12);
      g.position.y = THREE.MathUtils.lerp(g.position.y, 0, 0.12);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0, 0.12);
      g.rotation.y = rotY;
      const facingFront = Math.cos(rotY) >= 0;
      desiredTex = facingFront ? frontTex : backTex;
      faceSign = facingFront ? 1 : -1; // un-mirror the back face
      const s = THREE.MathUtils.lerp(Math.abs(g.scale.x), k.s + 0.35, 0.12);
      g.scale.set(s * faceSign, s, s);
    } else {
      // ---- roam + zoom/dolly ----
      // Slide-to-side: while sections request it (scroll.sideCount>0) the plane
      // stays VISIBLE but eases out toward the left edge, smaller.
      const SIDE_X = -0.62; // far-left park position (·vw)
      const SIDE_S = 0.78; // scale while parked at the side
      sideRef.current = THREE.MathUtils.lerp(
        sideRef.current,
        scroll.sideCount > 0 ? 1 : 0,
        0.09,
      );
      const sa = sideRef.current;
      const baseX = THREE.MathUtils.lerp(k.x, SIDE_X, sa);
      const baseS = THREE.MathUtils.lerp(k.s, SIDE_S, sa);
      const targetX = baseX * viewport.width * (1 - z);
      const targetY = k.y * viewport.height * (1 - z);
      const targetRZ = (k.rz + scroll.velocity * 0.0006) * (1 - z);
      const targetRY = k.ry * (1 - z);
      const targetS = baseS + z * 3.2;
      g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, 0.08);
      g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 0.08);
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetRZ, 0.08);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRY, 0.08);
      const s = THREE.MathUtils.lerp(Math.abs(g.scale.x), targetS, 0.08);
      g.scale.set(s, s, s);
    }

    if (mat.current) {
      if (mat.current.map !== desiredTex && desiredTex) {
        mat.current.map = desiredTex;
        mat.current.needsUpdate = true;
      }
      scroll.planeReveal = THREE.MathUtils.lerp(scroll.planeReveal, 1, 0.06);
      fadeRef.current = THREE.MathUtils.lerp(fadeRef.current, 1, 0.14);
      hideRef.current = THREE.MathUtils.lerp(hideRef.current, scroll.productHide, 0.1);
      mat.current.opacity =
        k.o * scroll.planeReveal * fadeRef.current * (1 - hideRef.current);
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[W, H]} key={activeUrl} />
        <meshBasicMaterial
          ref={mat}
          map={activeTex}
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

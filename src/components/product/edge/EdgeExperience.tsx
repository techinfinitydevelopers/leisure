"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { ProductExperience as ProductExperienceData } from "@/lib/product-experience";
import { ProductExperienceProvider } from "@/lib/product-experience-context";
import { useProductScroll } from "@/lib/useProductScroll";
import { scroll } from "@/lib/scrollStore";
import ProductModel from "../ProductModel";
import ProductPlane from "../ProductPlane";
import StickyBuyBar from "../StickyBuyBar";
import EdgeHero from "./EdgeHero";
import {
  EdgeStatRibbon,
  EdgeSpin,
  EdgeFeatureTour,
  EdgeColoursStack,
  EdgeAnatomy,
  EdgeDeepDiveMag,
  EdgeSpecsMarquee,
  EdgeBoxStrip,
  EdgeFAQGrid,
  EdgeCtaBand,
} from "./EdgeSections";
import "./edge-experience.css";

// Bespoke experience for EDGE. Uses the shared WebGL layer + ProductModel so
// the GLB + scroll transforms behave exactly like DRIFT/DOMINATOR — but with
// EDGE-specific choreography (from product-experience.ts) and a totally
// different section layout (cinema/editorial vibe).
export default function EdgeExperience({
  product,
  productId,
}: {
  product: ProductExperienceData;
  productId: number;
}) {
  const [colorIndex, setColorIndex] = useState(0);
  const [viewIndex, setViewIndex] = useState(0);

  useProductScroll();

  useEffect(() => {
    scroll.colorIndex = colorIndex;
    scroll.viewIndex = viewIndex;
  }, [colorIndex, viewIndex]);

  const handleColor = (i: number) => {
    setColorIndex(i);
    setViewIndex(0);
  };

  const scrollToBuy = () => {
    document.getElementById("buy")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ProductExperienceProvider value={product}>
      <div className="edge-xp">
        <div className="webgl-wrap" aria-hidden="true">
          <Canvas
            className="webgl"
            camera={{ position: [0, 0, 6], fov: 40 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => gl.setClearColor(new THREE.Color("#000000"), 0)}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 6, 5]} intensity={1.5} />
            <directionalLight position={[-5, 2, -3]} intensity={0.5} />
            <Suspense fallback={null}>
              {product.model ? (
                <ProductModel product={product} />
              ) : (
                <ProductPlane
                  product={product}
                  colorIndex={colorIndex}
                  viewIndex={viewIndex}
                />
              )}
            </Suspense>
          </Canvas>
        </div>

        <main>
          <EdgeHero productId={productId} colorIndex={colorIndex} onColor={handleColor} />
          <EdgeStatRibbon />
          <EdgeSpin />
          <EdgeFeatureTour />
          <EdgeColoursStack onColor={handleColor} />
          <EdgeAnatomy />
          <EdgeDeepDiveMag />
          <EdgeSpecsMarquee />
          <EdgeBoxStrip />
          <EdgeFAQGrid />
          <EdgeCtaBand onBuy={scrollToBuy} />
        </main>

        <StickyBuyBar productId={productId} colorIndex={colorIndex} />
      </div>
    </ProductExperienceProvider>
  );
}

"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ProductExperience as ProductExperienceData } from "@/lib/product-experience";
import { ProductExperienceProvider } from "@/lib/product-experience-context";
import { useProductScroll } from "@/lib/useProductScroll";
import { scroll } from "@/lib/scrollStore";
import ProductPlane from "./ProductPlane";
import ProductModel from "./ProductModel";
import Hero from "./Hero";
import SpinStage from "./SpinStage";
import FeatureSequence from "./FeatureSequence";
import LandingStage from "./LandingStage";
import Overview from "./Overview";
import ParallaxBreak from "./ParallaxBreak";
import FeatureGrid from "./FeatureGrid";
import SequenceReveal from "./SequenceReveal";
import SpecsSection from "./SpecsSection";
import SpecRail from "./SpecRail";
import SpecExplorer from "./SpecExplorer";
import LifestyleLoop from "./LifestyleLoop";
import FeatureDeepDive from "./FeatureDeepDive";
import TechnicalDetails from "./TechnicalDetails";
import BoxContents from "./BoxContents";
import FAQ from "./FAQ";
import StickyBuyBar from "./StickyBuyBar";
import "./product-experience.css";

export default function ProductExperience({
  product,
  productId,
}: {
  product: ProductExperienceData;
  productId: number;
}) {
  const [colorIndex, setColorIndex] = useState(0);
  const [viewIndex, setViewIndex] = useState(0);

  useProductScroll();

  // Keep the shared WebGL store in sync with the selected variant.
  useEffect(() => {
    scroll.colorIndex = colorIndex;
    scroll.viewIndex = viewIndex;
  }, [colorIndex, viewIndex]);

  // LifestyleLoop is part of the "made for the move" beat — gate it on products
  // that have deep-dive content so leaner pages skip it.
  const hasDeepDives = !!product.deepDives?.length;

  // Stable identity (not a fresh closure every render) — ProductModel/
  // ProductPlane re-fire their "ready" effect whenever this prop reference
  // changes, so an inline arrow here would re-trigger ScrollTrigger.refresh()
  // on every colorIndex/viewIndex change, not just on first mount. A refresh
  // mid-transition can perturb the model's rotation lerp for a moment,
  // reading as a wrong-facing flash right after switching color.
  const handleModelReady = useCallback(() => {
    setTimeout(() => ScrollTrigger.refresh(), 300);
  }, []);

  // color change resets the angle back to front
  const handleColor = (i: number) => {
    setColorIndex(i);
    setViewIndex(0);
  };

  const specLayout = product.perspective?.specLayout;

  return (
    <ProductExperienceProvider value={product}>
      <div className="leisure-xp">
        <div className="webgl-wrap" aria-hidden="true">
          <Canvas
            className="webgl"
            camera={{ position: [0, 0, 6], fov: 40 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) =>
              gl.setClearColor(new THREE.Color("#000000"), 0)
            }
          >
            {/* Lights (used by the 3D model's PBR materials; the image plane
                uses an unlit basic material and ignores them). */}
            <ambientLight intensity={0.8} />
            <directionalLight position={[4, 6, 5]} intensity={1.6} />
            <directionalLight position={[-5, 2, -3]} intensity={0.6} />
            <Suspense fallback={null}>
              {product.model ? (
                <ProductModel
                  product={product}
                  colorIndex={colorIndex}
                  onReady={handleModelReady}
                />
              ) : product.skipPlaneAnimation ? null : (
                <ProductPlane
                  product={product}
                  onReady={handleModelReady}
                  colorIndex={colorIndex}
                  viewIndex={viewIndex}
                />
              )}
            </Suspense>
          </Canvas>
        </div>

        <main className="content">
          <Hero
            colorIndex={colorIndex}
            viewIndex={viewIndex}
            onColor={handleColor}
            onView={setViewIndex}
            productId={productId}
          />
          {/* 3D model choreography: guided feature tour (rotate through angles
              with text) → spin → then roam through the rest of the page. */}
          {product.featureStops?.length ? <FeatureSequence /> : null}
          <SpinStage />
          <Overview />
          <ParallaxBreak />
          <FeatureGrid />
          {/* Scroll-scrubbed frame sequence, immediately before the specs */}
          <SequenceReveal />
          {specLayout === "explorer" ? (
            <SpecExplorer />
          ) : specLayout === "rail" ? (
            <SpecRail />
          ) : (
            <SpecsSection />
          )}
          {hasDeepDives && <LifestyleLoop />}
          <FeatureDeepDive />
          <TechnicalDetails />
          <BoxContents />
          <FAQ />
          {product.landingStage && <LandingStage />}
        </main>

        <StickyBuyBar productId={productId} colorIndex={colorIndex} />
      </div>
    </ProductExperienceProvider>
  );
}

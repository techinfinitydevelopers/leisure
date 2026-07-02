"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scroll } from "./scrollStore";

gsap.registerPlugin(ScrollTrigger);

// Creates a single Lenis instance scoped to the product experience, drives it
// from GSAP's ticker, and keeps ScrollTrigger + the WebGL scroll store in sync.
// Mount once from the ProductExperience client root. Ported from the DRIFT
// prototype's useSmoothScroll.
export function useProductScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", (e: { scroll: number; limit: number; velocity: number }) => {
      scroll.progress = e.limit > 0 ? e.scroll / e.limit : 0;
      scroll.velocity = e.velocity || 0;
      ScrollTrigger.update();
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onMove = (e: PointerEvent) => {
      scroll.mx = (e.clientX / window.innerWidth) * 2 - 1;
      scroll.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);

    const ro = setTimeout(() => ScrollTrigger.refresh(), 300);
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(ro);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}

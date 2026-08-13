"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
// Plain-JS component from the React Bits registry (JS-CSS variant).
import LiquidEther from "@/components/ui/LiquidEther/LiquidEther";

/**
 * Hero overlay that sits ON TOP of the scroll-scrubbed video's sticky stage.
 * Background is React Bits' <LiquidEther /> (WebGL fluid sim that reacts to
 * the cursor). LandingExperience fades this whole overlay out on scroll,
 * revealing the video underneath — so it's positioned absolutely, not as a
 * standalone full-height section.
 */
export default function LiquidEtherHero() {
  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-black">
      <div className="absolute inset-0">
        <LiquidEther
          colors={["#000000", "#FFFFFF", "#FBED2B"]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Brand overlay — pointer-events-none so the fluid stays cursor-reactive. */}
      <div className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <Image
          src="/brand/leisure-wordmark.png"
          alt="Leisure"
          width={1024}
          height={377}
          priority
          className="h-10 w-auto opacity-0 [animation:fade-up_0.9s_ease-out_forwards] sm:h-16"
        />
        <h1 className="mt-2 font-globe text-4xl font-bold tracking-tight text-offwhite opacity-0 [animation:fade-up_0.9s_ease-out_0.15s_forwards] sm:text-6xl">
          Elegance You Can Hear
        </h1>
        <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-offwhite/60 opacity-0 [animation:fade-up_0.9s_ease-out_0.3s_forwards] sm:text-base">
          Wherever your journey takes you, Leisure delivers powerful sound that
          keeps every moment alive.
        </p>
        {/* Micro-label, not brand copy — deliberately smaller/dimmer than the
            subline so it reads as a UI cue alongside the chevron below. */}
        <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-offwhite/40 opacity-0 [animation:fade-up_0.9s_ease-out_0.45s_forwards]">
          Scroll to begin
        </p>

        <div className="absolute bottom-10 opacity-0 [animation:fade-in_1s_ease-out_0.9s_forwards]">
          <ChevronDown className="h-6 w-6 animate-bounce text-gold/60" />
        </div>
      </div>

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

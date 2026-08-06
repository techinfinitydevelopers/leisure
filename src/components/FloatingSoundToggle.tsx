"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import SoundToggle from "@/components/SoundToggle";
import { useAudio } from "@/context/AudioContext";
import { useBuyBarVisible } from "@/lib/uiStore";

// Global sticky sound control. Sits in the normal bottom-right corner, and
// lifts up (smoothly) while the product StickyBuyBar is on screen so the two
// never overlap.
export default function FloatingSoundToggle() {
  const lifted = useBuyBarVisible();
  const pathname = usePathname();
  const { muted, playing } = useAudio();
  // Nudge toward the toggle on the video hero (home only) whenever no sound is
  // actually reaching the user — whether that's because autoplay-with-sound is
  // still blocked (the default state: unmuted but silent until a gesture) or
  // because it's muted. It retires only once sound is genuinely audible.
  const showHint = pathname === "/" && !(playing && !muted);

  return (
    <div
      className={`fixed right-5 z-[100] transition-[bottom] duration-300 ease-out ${
        lifted ? "bottom-24" : "bottom-5"
      }`}
    >
      {showHint && (
        <div
          className="pointer-events-none absolute right-1 bottom-full mb-2 flex flex-col items-end"
          style={{ animation: "hint-pulse 2.6s ease-in-out infinite" }}
        >
          <span className="mb-1 whitespace-nowrap text-[10px] font-light uppercase tracking-[0.18em] text-gold/80">
            Hear it for yourself
          </span>
          {/* Supplied glowing curly-arrow asset (public/icons/hint-arrow.png),
              cropped tight to its own content. Its arrowhead tip sits at
              ~96.3%/96.9% of the image's width/height, so mr-[26px] shifts
              the near-flush tip left onto the button's center (verified
              against the live DOM — see build log). */}
          <Image
            src="/icons/hint-arrow.png"
            alt=""
            width={52}
            height={57}
            className="mr-[26px] opacity-90"
            style={{ animation: "hint-bob 1.8s ease-in-out infinite" }}
          />
        </div>
      )}
      <SoundToggle />
    </div>
  );
}

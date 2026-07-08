"use client";

import SoundToggle from "@/components/SoundToggle";
import { useBuyBarVisible } from "@/lib/uiStore";

// Global sticky sound control. Sits in the normal bottom-right corner, and
// lifts up (smoothly) while the product StickyBuyBar is on screen so the two
// never overlap.
export default function FloatingSoundToggle() {
  const lifted = useBuyBarVisible();
  return (
    <div
      className={`fixed right-5 z-[100] transition-[bottom] duration-300 ease-out ${
        lifted ? "bottom-24" : "bottom-5"
      }`}
    >
      <SoundToggle />
    </div>
  );
}

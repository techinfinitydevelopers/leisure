"use client";

import { useSyncExternalStore } from "react";

// Tiny cross-tree store for UI chrome flags. Lets the product StickyBuyBar tell
// the global floating sound toggle to lift out of the way (and back) — without
// a shared React provider around both.

let buyBarVisible = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setBuyBarVisible(v: boolean) {
  if (buyBarVisible === v) return;
  buyBarVisible = v;
  emit();
}

export function useBuyBarVisible() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => buyBarVisible,
    () => false,
  );
}

// Lightweight mutable store shared between the DOM (Lenis) layer and the WebGL
// layer. Mutated imperatively each frame so the R3F useFrame loop can read it
// without triggering React re-renders. Ported from the DRIFT prototype.
export type ScrollStore = {
  progress: number; // 0..1 over the whole product experience
  velocity: number;
  mx: number; // normalized mouse x (-1..1)
  my: number; // normalized mouse y (-1..1)
  colorIndex: number; // selected color variant
  viewIndex: number; // selected angle/view within the active color (0 = front)
  planeReveal: number; // 0..1, eased to 1 once texture is ready (gates the plane)
  productHide: number; // 0..1, set by full-bleed parallax breaks to fade the roaming plane out
  zoom: number; // 0..1, set by a ZoomStage — dollies the plane toward the viewer
  spin: number; // 0..1, set by a SpinStage — pins the plane and rotates a full turn
  explode: number; // 0..1, set by an ExplodeStage — separates the 3D model's parts (exploded view)
  focus: number; // 0..1, set by the feature sequence — centers the model for the guided tour
  focusRX: number; // target X-tilt (rad) for the model during the feature sequence
  focusRY: number; // target Y-heading (rad) for the model during the feature sequence
  focusX: number; // target X position (viewport fraction) during the feature sequence
  holdCount: number; // >0 when a section wants the model parked (Overview etc.)
  holdX: number; // target X (viewport fraction) while holdCount > 0
  holdY: number; // target Y (viewport fraction) while held (0 = centre, negative = lower)
  holdRY: number; // target Y-heading (rad) while held
  holdRX: number; // target X-tilt (rad) while held
  holdS: number; // scale multiplier while held (1 = unchanged, <1 = smaller)
  sideCount: number; // >0 when sections want the plane to SLIDE aside (stays visible)
};

export const scroll: ScrollStore = {
  progress: 0,
  velocity: 0,
  mx: 0,
  my: 0,
  colorIndex: 0,
  viewIndex: 0,
  planeReveal: 0,
  productHide: 0,
  zoom: 0,
  spin: 0,
  explode: 0,
  focus: 0,
  focusRX: 0,
  focusRY: 0,
  focusX: 0,
  holdCount: 0,
  holdX: 0,
  holdY: 0,
  holdRY: 0,
  holdRX: 0,
  holdS: 1,
  sideCount: 0,
};

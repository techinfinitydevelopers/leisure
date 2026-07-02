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
  sideCount: 0,
};

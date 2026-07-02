// Declarative timeline sampler for the roaming product plane. Each stop holds
// normalized channel values; x/y are multiplied by viewport in ProductPlane so
// motion is responsive. sampleTrack(p) eased-lerps every channel between the two
// stops bracketing progress p. Ported from the DRIFT prototype.

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// smootherstep easing for buttery transitions between stops
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

// channels: x (·vw), y (·vh), rz (rotZ rad), ry (rotY rad), s (scale), o (opacity)
export type TrackStop = {
  at: number;
  x: number;
  y: number;
  rz: number;
  ry: number;
  s: number;
  o: number;
};

export type Sampled = Omit<TrackStop, "at">;

const KEYS = ["x", "y", "rz", "ry", "s", "o"] as const;

// DRIFT track kept here as a safe default; per-product tracks live in
// src/lib/product-experience.ts and are passed into sampleTrack(p, track).
export const TRACK: TrackStop[] = [
  { at: 0.0, x: -0.26, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
  { at: 0.08, x: -0.26, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
  { at: 0.2, x: 0.0, y: 0.06, rz: 0.05, ry: 0.15, s: 1.15, o: 1 },
  { at: 0.4, x: -0.3, y: 0.0, rz: -0.1, ry: 0.45, s: 1.05, o: 1 },
  { at: 0.6, x: 0.3, y: -0.05, rz: 0.1, ry: -0.45, s: 1.05, o: 1 },
  { at: 0.78, x: 0.0, y: 0.0, rz: 0.0, ry: 0.2, s: 1.25, o: 1 },
  { at: 0.9, x: -0.28, y: 0.04, rz: -0.06, ry: 0.3, s: 0.95, o: 1 },
  { at: 1.0, x: 0.28, y: 0.0, rz: 0.0, ry: 0.0, s: 1.0, o: 1 },
];

function pick(s: TrackStop): Sampled {
  return { x: s.x, y: s.y, rz: s.rz, ry: s.ry, s: s.s, o: s.o };
}

// Returns { x, y, rz, ry, s, o } sampled (eased) at progress p (0..1) for the
// given track (defaults to the DRIFT TRACK).
export function sampleTrack(p: number, track: TrackStop[] = TRACK): Sampled {
  const stops = track;
  if (p <= stops[0].at) return pick(stops[0]);
  if (p >= stops[stops.length - 1].at) return pick(stops[stops.length - 1]);

  let i = 0;
  while (i < stops.length - 1 && p > stops[i + 1].at) i++;
  const a = stops[i];
  const b = stops[i + 1];
  const span = b.at - a.at || 1;
  const t = ease((p - a.at) / span);

  const out = {} as Sampled;
  for (const k of KEYS) out[k] = lerp(a[k], b[k], t);
  return out;
}

import type Lenis from "lenis";

type LenisOptions = NonNullable<ConstructorParameters<typeof Lenis>[0]>;

/**
 * The one definition of how scrolling feels across the whole site.
 *
 * The homepage and the product pages each construct their own Lenis instance
 * (they attach different scroll listeners — the product pages also feed the
 * WebGL store) but they must share these numbers. They previously did not:
 * the homepage ran duration 1.4 / wheelMultiplier 0.85 and the product pages
 * duration 1.15 / wheelMultiplier 1, so navigating between them changed both
 * the inertia length and the wheel sensitivity mid-session.
 *
 * `lerp` rather than `duration` + `easing`, deliberately: duration mode starts
 * a fresh tween on every wheel event, so flicking several notches becomes a
 * series of restarted easings whose velocity jumps at each restart — that
 * discontinuity is what read as "not smooth". lerp is a frame-rate-independent
 * exponential approach to the target, so continuous input yields continuous
 * motion. 0.09 settles in ~0.8s, close to the old duration but without the
 * restart artefact.
 */
export const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.09,
  smoothWheel: true,
};

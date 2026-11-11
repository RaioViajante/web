// The one reduced-motion check every package module and app script reads, so
// motion and sound agree on what the visitor asked for. Browser only: call it
// from effects, event handlers and client scripts, never during render.

/** The media query that means "reduce motion". */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** The live query, for code that reacts when the preference changes. */
export function reducedMotionQuery(): MediaQueryList {
  return window.matchMedia(REDUCED_MOTION_QUERY);
}

/** Whether the visitor asks for reduced motion right now. */
export function prefersReducedMotion(): boolean {
  return reducedMotionQuery().matches;
}

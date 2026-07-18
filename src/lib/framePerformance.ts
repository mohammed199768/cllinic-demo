/**
 * Small, dependency-free performance helpers for the clinic-tour canvas engine.
 * All are SSR-safe.
 */

export const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Device pixel ratio capped for performance. Retina canvases at true DPR (2-3)
 * quadruple the pixels drawn each frame; 1.5 is visually indistinguishable for
 * a full-bleed photo but far cheaper to paint.
 */
export const getCappedDpr = (max = 1.5): number => {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, max);
};

type IdleHandle = number;

interface IdleWindow {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
}

/** requestIdleCallback with a setTimeout fallback (Safari / SSR). */
export const requestIdle = (cb: () => void, timeout = 400): IdleHandle => {
  if (typeof window === "undefined") return 0;
  const w = window as unknown as IdleWindow;
  if (typeof w.requestIdleCallback === "function") {
    return w.requestIdleCallback(cb, { timeout });
  }
  return window.setTimeout(cb, 1);
};

export const cancelIdle = (handle: IdleHandle): void => {
  if (typeof window === "undefined") return;
  const w = window as unknown as IdleWindow;
  if (typeof w.cancelIdleCallback === "function") {
    w.cancelIdleCallback(handle);
  } else {
    window.clearTimeout(handle);
  }
};

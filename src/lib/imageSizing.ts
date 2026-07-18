/**
 * Canvas cover/contain geometry — mirrors CSS `object-fit` + `object-position`
 * so the imperative canvas draw matches what a designer expects.
 */

export type ObjectFit = "cover" | "contain";

export interface DrawRect {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Parse an "object-position" string (e.g. "50% 40%") to 0..1 fractions. */
export const parseObjectPosition = (
  value = "50% 50%",
): { x: number; y: number } => {
  const parts = value.trim().split(/\s+/);
  const toFraction = (token: string | undefined, fallback: number): number => {
    if (!token) return fallback;
    if (token.endsWith("%")) return clamp01(parseFloat(token) / 100);
    if (token === "left" || token === "top") return 0;
    if (token === "right" || token === "bottom") return 1;
    if (token === "center") return 0.5;
    const n = parseFloat(token);
    return Number.isFinite(n) ? clamp01(n) : fallback;
  };
  return { x: toFraction(parts[0], 0.5), y: toFraction(parts[1], 0.5) };
};

/**
 * Compute the destination rectangle to draw an image of intrinsic size
 * (imgW x imgH) into a (canvasW x canvasH) buffer.
 */
export const computeDrawRect = (
  canvasW: number,
  canvasH: number,
  imgW: number,
  imgH: number,
  fit: ObjectFit = "cover",
  position = "50% 50%",
): DrawRect => {
  if (imgW <= 0 || imgH <= 0) return { dx: 0, dy: 0, dw: canvasW, dh: canvasH };
  const scale =
    fit === "cover"
      ? Math.max(canvasW / imgW, canvasH / imgH)
      : Math.min(canvasW / imgW, canvasH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const { x, y } = parseObjectPosition(position);
  return {
    dx: (canvasW - dw) * x,
    dy: (canvasH - dh) * y,
    dw,
    dh,
  };
};

import { requestIdle, cancelIdle } from "@/lib/framePerformance";

/**
 * FrameCache owns the HTMLImageElement objects for one clinic-tour sequence.
 *
 * Performance rules it enforces:
 *   - Image objects are created ONCE and reused (never inside the scroll loop).
 *   - Priority frames load eagerly; the rest decode during idle time.
 *   - `nearestLoaded` lets the canvas always paint something while frames stream
 *     in, so scrubbing never shows a blank gap.
 *
 * Browser-only; instantiate it inside a client effect.
 */
export class FrameCache {
  private readonly urls: string[];
  private readonly images: Array<HTMLImageElement | null>;
  private readonly loaded: boolean[];
  private readonly started: boolean[];
  private idleHandles: number[] = [];
  private destroyed = false;

  constructor(urls: string[]) {
    this.urls = urls;
    this.images = urls.map(() => null);
    this.loaded = urls.map(() => false);
    this.started = urls.map(() => false);
  }

  get length(): number {
    return this.urls.length;
  }

  isLoaded(index: number): boolean {
    return this.loaded[index] === true;
  }

  get(index: number): HTMLImageElement | null {
    return this.loaded[index] ? this.images[index] ?? null : null;
  }

  /** Index of the nearest already-decoded frame, or -1 if none yet. */
  nearestLoaded(index: number): number {
    if (this.loaded[index]) return index;
    for (let step = 1; step < this.urls.length; step++) {
      const lo = index - step;
      const hi = index + step;
      if (lo >= 0 && this.loaded[lo]) return lo;
      if (hi < this.urls.length && this.loaded[hi]) return hi;
    }
    return -1;
  }

  /** Start decoding a single frame (idempotent). */
  loadFrame(index: number, onLoad?: () => void): void {
    if (this.destroyed) return;
    if (index < 0 || index >= this.urls.length) return;
    if (this.started[index]) {
      if (this.loaded[index] && onLoad) onLoad();
      return;
    }
    this.started[index] = true;
    const url = this.urls[index];
    if (!url) return;
    const img = new Image();
    img.decoding = "async";
    this.images[index] = img;
    const done = () => {
      if (this.destroyed) return;
      this.loaded[index] = true;
      onLoad?.();
    };
    img.onload = done;
    img.onerror = () => {
      // Leave as not-loaded; nearestLoaded() will skip it.
      this.started[index] = false;
    };
    img.src = url;
    if (img.complete && img.naturalWidth > 0) done();
  }

  /** Eagerly load the first `count` frames (the visible-on-enter set). */
  preloadPriority(count: number, onFirst?: () => void): void {
    const n = Math.min(count, this.urls.length);
    for (let i = 0; i < n; i++) {
      this.loadFrame(i, i === 0 ? onFirst : undefined);
    }
  }

  /** Decode the remaining frames during idle time, in order. */
  preloadRemaining(onProgress?: () => void): void {
    const step = (i: number) => {
      if (this.destroyed || i >= this.urls.length) return;
      if (!this.started[i]) {
        this.loadFrame(i, onProgress);
      }
      const handle = requestIdle(() => step(i + 1));
      this.idleHandles.push(handle);
    };
    const handle = requestIdle(() => step(0));
    this.idleHandles.push(handle);
  }

  destroy(): void {
    this.destroyed = true;
    this.idleHandles.forEach(cancelIdle);
    this.idleHandles = [];
    for (let i = 0; i < this.images.length; i++) {
      const img = this.images[i];
      if (img) {
        img.onload = null;
        img.onerror = null;
      }
      this.images[i] = null;
    }
  }
}

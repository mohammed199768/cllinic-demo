"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type RefObject } from "react";
import { FrameCache } from "@/lib/frameLoader";
import { computeDrawRect, type ObjectFit } from "@/lib/imageSizing";
import { clamp, getCappedDpr } from "@/lib/framePerformance";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export interface FrameSequenceProps {
  frames: string[];
  /** The tall scroll-tracked section that drives the scrub. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Optional element whose scaleX is driven by scroll progress (0..1). */
  progressRef?: RefObject<HTMLElement | null>;
  /** Called every scroll tick with progress 0..1 (pure JS; no React state here). */
  onProgress?: (progress: number) => void;
  /** Reduced-motion still image needs a real alt for the fallback. */
  stillAlt?: string;
  className?: string;
  priorityFrameCount?: number;
  objectFit?: ObjectFit;
  objectPosition?: string;
}

/**
 * Imperative canvas frame player for the clinic tour.
 *   - No React state per scroll tick (refs + one rAF draw).
 *   - Image objects created once by FrameCache; none created in the loop.
 *   - DPR capped at 1.5. First frames eager, the rest idle-loaded.
 *   - Nearest-loaded fallback so scrubbing never blanks.
 *   - Reduced-motion → a single static image, no engine.
 */
export function FrameSequence({
  frames,
  triggerRef,
  progressRef,
  onProgress,
  stillAlt = "",
  className,
  priorityFrameCount = 4,
  objectFit = "cover",
  objectPosition = "50% 50%",
}: FrameSequenceProps) {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const trigger = triggerRef.current;
    if (!canvas || !trigger || frames.length === 0) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    gsap.registerPlugin(ScrollTrigger);

    const cache = new FrameCache(frames);
    const state = { target: 0, rendered: -1 };
    let rafId = 0;
    let rafPending = false;

    const sizeCanvas = () => {
      const dpr = getCappedDpr(1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        state.rendered = -1;
      }
    };

    const draw = (index: number) => {
      const use = cache.nearestLoaded(index);
      if (use < 0 || use === state.rendered) return;
      const img = cache.get(use);
      if (!img || img.naturalWidth === 0) return;
      const { dx, dy, dw, dh } = computeDrawRect(
        canvas.width,
        canvas.height,
        img.naturalWidth,
        img.naturalHeight,
        objectFit,
        objectPosition,
      );
      ctx.drawImage(img, dx, dy, dw, dh);
      state.rendered = use;
    };

    const scheduleDraw = () => {
      if (rafPending) return;
      rafPending = true;
      rafId = requestAnimationFrame(() => {
        rafPending = false;
        draw(state.target);
      });
    };

    const setProgress = (p: number) => {
      onProgress?.(p);
      if (progressRef?.current) progressRef.current.style.transform = `scaleX(${p})`;
      const idx = clamp(Math.round(p * (frames.length - 1)), 0, frames.length - 1);
      if (idx === state.target) return;
      state.target = idx;
      scheduleDraw();
    };

    cache.preloadPriority(priorityFrameCount, () => {
      sizeCanvas();
      draw(state.target);
    });
    cache.preloadRemaining(scheduleDraw);

    const st = ScrollTrigger.create({
      trigger,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => setProgress(self.progress),
    });

    const ro = new ResizeObserver(() => {
      sizeCanvas();
      draw(state.target);
    });
    ro.observe(canvas);

    sizeCanvas();
    draw(0);

    return () => {
      st.kill();
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      cache.destroy();
    };
  }, [
    reducedMotion,
    frames,
    triggerRef,
    progressRef,
    onProgress,
    priorityFrameCount,
    objectFit,
    objectPosition,
  ]);

  if (reducedMotion) {
    const stillIndex = Math.floor(frames.length / 2);
    const stillSrc = frames[stillIndex] ?? frames[0];
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={stillSrc}
        alt={stillAlt}
        className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
        style={{ objectPosition }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 block h-full w-full ${className ?? ""}`}
    />
  );
}

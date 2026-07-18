"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * True when the user asked the OS to reduce motion. Components use this to swap
 * scroll-driven animation for a stable still image.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

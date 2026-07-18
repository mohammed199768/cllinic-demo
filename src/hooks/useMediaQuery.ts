"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe matchMedia hook. Returns `false` on the server and on the first
 * client render, then syncs to the real value in an effect — so server and
 * client markup match and there is no hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

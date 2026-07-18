"use client";
import { useEffect, useRef } from "react";

/**
 * Reveals a section as if it emerges from the hero's pulse: a soft center
 * clip-path circle opens while the block fades and rises. Falls back to plain
 * rendering for reduced motion or when ScrollTrigger isn't available.
 */
export default function GsapReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      const gsap = gsapMod.default ?? gsapMod;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const revealState = { v: 0 };
        gsap.set(el, { autoAlpha: 0, y: 80, clipPath: "circle(0% at 50% 45%)", willChange: "transform, opacity" });
        gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        })
          .to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0)
          .to(revealState, {
            v: 150,
            duration: 0.9,
            ease: "power2.out",
            onUpdate: () => { el.style.clipPath = `circle(${revealState.v}% at 50% 45%)`; },
            onComplete: () => { el.style.clipPath = "none"; el.style.willChange = "auto"; },
          }, 0);
      }, el);
    })();

    return () => { cancelled = true; if (ctx) ctx.revert(); };
  }, []);

  return <div ref={ref} className={className}>{children}</div>;
}

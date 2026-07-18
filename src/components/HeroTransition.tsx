"use client";
import { useEffect, useRef } from "react";
import Hero from "./Hero";

/**
 * Cinematic, scroll-driven bridge between the Hero and the next section.
 * - Pins the hero on desktop and scrubs a GSAP timeline:
 *   hero content exits → frame compresses + brightens → a clinical heart/pulse
 *   line draws and expands → fades as the next section reveals.
 * - Reduced motion OR small screens: no pin/scrub. The hero stays fully visible
 *   and usable; the pulse layer is hidden. Nothing is required for the page to work.
 */
export default function HeroTransition() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pulsePathRef = useRef<SVGPathElement>(null);
  const heartPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (reduce || !isDesktop) return; // fallback: plain hero, no pin

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
        // prepare SVG line draw
        const pulse = pulsePathRef.current;
        const heart = heartPathRef.current;
        if (pulse) {
          const len = pulse.getTotalLength();
          gsap.set(pulse, { strokeDasharray: len, strokeDashoffset: len });
        }
        if (heart) {
          const len = heart.getTotalLength();
          gsap.set(heart, { strokeDasharray: len, strokeDashoffset: len });
        }
        gsap.set(".js-hero-frame", { willChange: "transform" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: "+=120%",
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
          },
        });

        // (1) hero content exits — calm, slightly staggered
        tl.to(".js-hero-badge", { autoAlpha: 0, y: -24, duration: 0.18, ease: "power2.in" }, 0.0)
          .to(".js-hero-title", { autoAlpha: 0, y: 18, scale: 0.96, duration: 0.22, ease: "power2.in" }, 0.04)
          .to(".js-hero-sub", { autoAlpha: 0, y: 16, duration: 0.2 }, 0.08)
          .to(".js-hero-cta", { autoAlpha: 0, y: 26, duration: 0.2 }, 0.1)
          .to(".js-hero-pills", { autoAlpha: 0, y: 16, duration: 0.18 }, 0.12)
          .to(".js-hero-card", { autoAlpha: 0, x: 40, duration: 0.2, ease: "power2.in" }, 0.06)
          .to(".js-hero-cutout", { autoAlpha: 0, y: 40, duration: 0.2, ease: "power2.in" }, 0.06);

        // (2) frame compresses + brightens
        tl.to(".js-hero-frame", { scale: 0.945, borderRadius: "2.75rem", duration: 0.5, ease: "power2.inOut" }, 0.18)
          .to(".js-hero-overlay", { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, 0.24);

        // (3) heart / pulse bridge
        tl.to(".js-pulse-layer", { autoAlpha: 1, duration: 0.12 }, 0.3)
          .to(".js-glow", { autoAlpha: 0.85, scale: 1, duration: 0.25 }, 0.34);
        if (pulse) tl.to(pulse, { strokeDashoffset: 0, duration: 0.3, ease: "power1.inOut" }, 0.33);
        if (heart) tl.to(heart, { strokeDashoffset: 0, duration: 0.28, ease: "power1.out" }, 0.42);
        tl.to(".js-pulse-group", { scale: 1.12, duration: 0.22, ease: "power2.out" }, 0.62)
          .to(".js-pulse-layer", { autoAlpha: 0, duration: 0.18, ease: "power1.in" }, 0.82)
          .to(".js-hero-frame", { autoAlpha: 0.0, duration: 0.18 }, 0.84);
      }, wrap);

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative overflow-x-clip">
      <Hero />

      {/* heart / pulse bridge layer */}
      <div className="js-pulse-layer pointer-events-none absolute inset-0 z-30 flex items-center justify-center opacity-0">
        <div
          className="js-glow absolute h-[42vmin] w-[42vmin] rounded-full opacity-0"
          style={{ background: "radial-gradient(circle, rgba(54,183,210,0.35), rgba(52,112,228,0.12) 45%, transparent 70%)" }}
          aria-hidden
        />
        <svg viewBox="0 0 200 160" className="js-pulse-group relative w-[44vmin] max-w-[460px]" aria-hidden>
          {/* subtle heart outline */}
          <path
            ref={heartPathRef}
            d="M100 138 C56 104, 30 80, 30 56 A30 30 0 0 1 100 40 A30 30 0 0 1 170 56 C170 80, 144 104, 100 138 Z"
            fill="none"
            stroke="#3470e4"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* clinical pulse line */}
          <path
            ref={pulsePathRef}
            d="M18 86 H66 l10 -34 l13 64 l11 -46 l8 22 H182"
            fill="none"
            stroke="#1d99b6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

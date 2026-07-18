"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

const LOCK_MS = 950;
const WHEEL_THRESHOLD = 18;
const SWIPE_THRESHOLD = 50;
const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "textarea",
  "select",
  "video",
  "audio",
  "iframe",
  '[role="dialog"]',
  '[role="menu"]',
  '[contenteditable="true"]',
].join(",");

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
}

function canScrollVertically(target: EventTarget | null, boundary: HTMLElement, deltaY: number) {
  let element = target instanceof Element ? target : null;

  while (element && boundary.contains(element)) {
    if (element instanceof HTMLElement) {
      const { overflowY } = window.getComputedStyle(element);
      const isScrollable =
        /(auto|scroll|overlay)/.test(overflowY) && element.scrollHeight > element.clientHeight + 1;

      if (isScrollable) {
        const atTop = element.scrollTop <= 0;
        const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
        if ((deltaY > 0 && !atBottom) || (deltaY < 0 && !atTop)) return true;
      }
    }

    if (element === boundary) break;
    element = element.parentElement;
  }

  return false;
}

/**
 * Full-page section pager (homepage only, lg desktop and above).
 * One wheel notch / swipe / arrow key advances exactly one full section.
 * Body scroll is locked while mounted; cleaned up on unmount.
 * Panels translate via CSS transform; section content animates in on its own
 * (each section uses an IntersectionObserver reveal that fires as it slides in).
 */
export default function HomeSectionPager({ panels }: { panels: React.ReactNode[] }) {
  const count = panels.length;
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const lockedRef = useRef(false);
  const unlockTimerRef = useRef<number | null>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchStartY = useRef<number | null>(null);

  const broadcast = useCallback((i: number) => {
    document.documentElement.setAttribute("data-home-section", String(i));
    window.dispatchEvent(new CustomEvent("home-section", { detail: i }));
  }, []);

  const lockPager = useCallback(() => {
    lockedRef.current = true;
    if (unlockTimerRef.current !== null) window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = window.setTimeout(() => {
      lockedRef.current = false;
      unlockTimerRef.current = null;
    }, LOCK_MS);
  }, []);

  const go = useCallback(
    (dir: number) => {
      const prev = activeRef.current;
      const next = Math.min(count - 1, Math.max(0, prev + dir));
      if (next === prev) return false;

      activeRef.current = next;
      lockPager();
      setActive(next);
      broadcast(next);
      return true;
    },
    [count, broadcast, lockPager]
  );

  const goTo = useCallback(
    (i: number) => {
      const prev = activeRef.current;
      const next = Math.min(count - 1, Math.max(0, i));
      if (next === prev) return false;

      activeRef.current = next;
      lockPager();
      setActive(next);
      broadcast(next);
      return true;
    },
    [count, broadcast, lockPager]
  );

  // lock body scroll + init broadcast
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    broadcast(0);
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      document.documentElement.removeAttribute("data-home-section");
      if (unlockTimerRef.current !== null) window.clearTimeout(unlockTimerRef.current);
    };
  }, [broadcast]);

  // React delegates wheel events passively. This scoped native listener is the
  // one interaction that needs to cancel a wheel when the pager consumes it.
  useEffect(() => {
    const pager = pagerRef.current;
    if (!pager) return;

    const onWheel = (e: WheelEvent) => {
      const dy = e.deltaY;
      if (
        e.defaultPrevented
        || e.ctrlKey
        || Math.abs(dy) < WHEEL_THRESHOLD
        || Math.abs(e.deltaX) > Math.abs(dy)
        || isInteractiveTarget(e.target)
        || lockedRef.current
      ) return;

      const panel = panelRefs.current[activeRef.current];
      if (!panel || canScrollVertically(e.target, panel, dy)) return;

      if (go(dy > 0 ? 1 : -1) && e.cancelable) e.preventDefault();
    };

    pager.addEventListener("wheel", onWheel, { passive: false });
    return () => pager.removeEventListener("wheel", onWheel);
  }, [go]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (isInteractiveTarget(e.target)) {
      touchStartY.current = null;
      return;
    }
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    const panel = panelRefs.current[activeRef.current];
    if (panel && canScrollVertically(e.target, panel, dy)) return;
    if (Math.abs(dy) < SWIPE_THRESHOLD || lockedRef.current) return;
    go(dy > 0 ? 1 : -1);
  };

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isInteractiveTarget(e.target)) return;
      if (["ArrowDown", "PageDown"].includes(e.key) && go(1)) e.preventDefault();
      else if (["ArrowUp", "PageUp"].includes(e.key) && go(-1)) e.preventDefault();
      else if (e.key === "Home" && goTo(0)) e.preventDefault();
      else if (e.key === "End" && goTo(count - 1)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, goTo, count]);

  return (
    <div
      ref={pagerRef}
      className="relative overflow-hidden"
      style={{ height: "calc(100svh - 4rem)" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="will-change-transform"
        style={{
          transform: `translate3d(0, calc(-${active} * (100svh - 4rem)), 0)`,
          transition: "transform 900ms cubic-bezier(0.76,0,0.24,1)",
        }}
      >
        {panels.map((panel, i) => (
          <div
            key={i}
            ref={(el) => { panelRefs.current[i] = el; }}
            data-active={i === active}
            className="w-full overflow-y-auto no-scrollbar"
            style={{ height: "calc(100svh - 4rem)" }}
          >
            {panel}
          </div>
        ))}
      </div>

      {/* section dots */}
      <div className="pointer-events-none absolute top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2.5 ltr:right-4 rtl:left-4 lg:flex">
        {panels.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Section ${i + 1}`}
            className={`pointer-events-auto h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              i === active ? "scale-125 bg-brand-600" : "bg-navy-300/60 hover:bg-navy-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

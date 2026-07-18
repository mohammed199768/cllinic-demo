"use client";

import { useCallback, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { walkthroughFrames, walkthroughPlan } from "@/data/framePlan";
import { FrameSequence } from "./FrameSequence";

type Bi = { ar: string; en: string };

/** Threshold-based stages (progress 0..1) — text updates only when crossing. */
const STAGES: { at: number; eyebrow: Bi; title: Bi; text: Bi }[] = [
  {
    at: 0,
    eyebrow: { ar: "المرحلة ١", en: "Stage 1" },
    title: { ar: "الاستقبال", en: "Reception" },
    text: {
      ar: "بداية هادئة وواضحة لزيارتك.",
      en: "A calm and clear beginning to your visit.",
    },
  },
  {
    at: 0.3,
    eyebrow: { ar: "المرحلة ٢", en: "Stage 2" },
    title: { ar: "الممر", en: "Corridor" },
    text: {
      ar: "مسار منظم يقودك إلى مناطق الرعاية.",
      en: "An organized path leading to the care areas.",
    },
  },
  {
    at: 0.65,
    eyebrow: { ar: "المرحلة ٣", en: "Stage 3" },
    title: { ar: "منطقة العلاج", en: "Treatment Area" },
    text: {
      ar: "مساحات مجهزة لراحة المراجعين وتنظيم الرعاية.",
      en: "Equipped spaces designed for organized patient care.",
    },
  },
];

function stageForProgress(p: number): number {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (p >= STAGES[i].at) return i;
  }
  return 0;
}

export default function ClinicTour() {
  const { lang } = useLang();
  const L = (b: Bi) => (lang === "ar" ? b.ar : b.en);
  const reduced = usePrefersReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(0);
  const [activeStage, setActiveStage] = useState(0);

  const onProgress = useCallback((p: number) => {
    const s = stageForProgress(p);
    if (s !== stageRef.current) {
      stageRef.current = s;
      setActiveStage(s);
    }
  }, []);

  const heading = (
    <div className="container-x max-w-content pb-8 pt-4 text-center sm:pb-10">
      <p className="eyebrow mx-auto mb-3 w-fit">
        {L({ ar: "جولة تفاعلية", en: "Interactive tour" })}
      </p>
      <h2 className="text-h2 font-extrabold tracking-tight text-navy-900">
        {L({
          ar: "جولة داخل عيادة تجريبية",
          en: "A Walk Through a Demo Clinic",
        })}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lead text-navy-500">
        {L({
          ar: "من الاستقبال إلى مناطق العلاج، تعرّف على المكان خطوة بخطوة وبإيقاع تتحكم به أنت.",
          en: "From reception to the treatment areas, explore the center step by step at your own pace.",
        })}
      </p>
    </div>
  );

  // Reduced motion: static image + the three stages as normal readable content.
  if (reduced) {
    const still = walkthroughFrames[Math.floor(walkthroughFrames.length / 2)];
    return (
      <section id="clinic-tour" aria-label={L({ ar: "جولة داخل المركز", en: "Walk through the center" })} className="scroll-mt-24 py-14">
        {heading}
        <div className="container-x max-w-content">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-navy-100 bg-navy-950 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={still}
              alt={L({ ar: "لقطة من داخل عيادة تجريبية", en: "A view inside a demonstration clinic" })}
              className="h-full w-full object-cover"
            />
          </div>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {STAGES.map((s, i) => (
              <li key={i} className="card p-5">
                <p className="eyebrow mb-2">{L(s.eyebrow)}</p>
                <h3 className="text-h3 font-bold text-navy-900">{L(s.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{L(s.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section id="clinic-tour" aria-label={L({ ar: "جولة داخل المركز", en: "Walk through the center" })} className="scroll-mt-24 pt-4">
      {heading}
      <div
        ref={trackRef}
        style={{ ["--track" as string]: walkthroughPlan.scrollHeight }}
        className="relative h-[var(--track)]"
      >
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-navy-950">
          <FrameSequence
            frames={walkthroughFrames}
            triggerRef={trackRef}
            progressRef={progressRef}
            onProgress={onProgress}
            priorityFrameCount={walkthroughPlan.priorityFrameCount}
            stillAlt={L({ ar: "لقطة من داخل عيادة تجريبية", en: "A view inside a demonstration clinic" })}
            objectPosition="50% 45%"
          />

          {/* Static legibility scrim (not animated) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-navy-950/80 via-navy-950/30 to-transparent" />

          {/* Stage captions — cross-fade on threshold, opacity/transform only */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="container-x relative max-w-content pb-10">
              <div className="relative h-[104px]">
                {STAGES.map((s, i) => (
                  <div
                    key={i}
                    aria-hidden={i !== activeStage}
                    className="absolute bottom-0 max-w-md rounded-2xl bg-white/92 p-4 shadow-card backdrop-blur-sm transition-all duration-500 ltr:left-0 rtl:right-0"
                    style={{
                      opacity: i === activeStage ? 1 : 0,
                      transform: i === activeStage ? "translateY(0)" : "translateY(12px)",
                    }}
                  >
                    <p className="text-xs font-bold text-brand-600">{L(s.eyebrow)}</p>
                    <p className="mt-0.5 text-lg font-extrabold text-navy-900">{L(s.title)}</p>
                    <p className="mt-1 text-sm text-navy-600">{L(s.text)}</p>
                  </div>
                ))}
              </div>

              {/* Restrained step dots */}
              <div className="mt-4 flex items-center gap-1.5">
                {STAGES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeStage ? "w-6 bg-white" : "w-1.5 bg-white/45"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thin progress line (transform-only) */}
            <div className="h-[3px] w-full bg-white/20">
              <div
                ref={progressRef}
                className="h-full origin-left scale-x-0 bg-brand-500 rtl:origin-right"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

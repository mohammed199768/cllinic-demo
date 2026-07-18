"use client";
import { useLang } from "@/lib/i18n";
import Icon from "./Icon";

/* Premium spatial medical composition: central monitor card with ECG,
   orbiting demo-product nodes (appointments, visit options, information, contact). No emoji. */
export default function HeroVisual({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const nodes = [
    { icon: "clock", ar: "طلب موعد", en: "Appointment request", pos: "top-3 ltr:right-2 rtl:left-2", tone: "brand" },
    { icon: "home", ar: "خيارات الزيارة", en: "Visit options", pos: "top-24 ltr:left-0 rtl:right-0", tone: "brand" },
    { icon: "vial", ar: "معلومات عامة", en: "General information", pos: "bottom-20 ltr:right-0 rtl:left-0", tone: "cyan" },
    { icon: "shield", ar: "تأكيد مباشر", en: "Direct confirmation", pos: "bottom-4 ltr:left-6 rtl:right-6", tone: "mint" },
  ] as const;
  const tones: Record<string, string> = {
    rose: "text-rose-600 bg-rose-50 ring-rose-100",
    brand: "text-brand-600 bg-brand-50 ring-brand-100",
    cyan: "text-cyan-600 bg-cyan-50 ring-cyan-100",
    mint: "text-mint-500 bg-mint-50 ring-mint-100",
  };

  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[440px] ${className}`}>
      {/* orbit rings */}
      <svg viewBox="0 0 440 440" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="aura" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#5a93f7" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#5a93f7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ecg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#36b7d2" />
            <stop offset="100%" stopColor="#3470e4" />
          </linearGradient>
        </defs>
        <circle cx="220" cy="200" r="200" fill="url(#aura)" />
        <g className="animate-spinSlow" style={{ transformOrigin: "220px 200px" }}>
          <circle cx="220" cy="200" r="186" fill="none" stroke="#c6d3e6" strokeWidth="1" strokeDasharray="2 8" />
        </g>
        <circle cx="220" cy="200" r="150" fill="none" stroke="#d9e8ff" strokeWidth="1.5" />
        <circle cx="220" cy="200" r="110" fill="none" stroke="#e4eaf3" strokeWidth="1.5" />
      </svg>

      {/* central monitor card */}
      <div className="absolute left-1/2 top-[42%] w-52 -translate-x-1/2 -translate-y-1/2 animate-floatySlow">
        <div className="card-clinical rounded-3xl p-5 shadow-glow">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-navy-500">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-400 animate-pulseSoft" />
              {lang === "ar" ? "مراقبة حيوية" : "Vitals"}
            </span>
            <Icon name="activity" className="h-4 w-4 text-brand-500" />
          </div>
          <svg viewBox="0 0 180 56" className="mt-3 w-full">
            <path d="M0 30 H40 l8 -20 l10 40 l8 -28 l9 16 H180" fill="none" stroke="url(#ecg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-brand-50 px-2.5 py-1.5">
              <p className="text-[10px] font-semibold text-navy-400">{lang === "ar" ? "النبض" : "Pulse"}</p>
              <p className="text-sm font-extrabold text-navy-800">72<span className="text-[10px] font-medium text-navy-400"> bpm</span></p>
            </div>
            <div className="rounded-xl bg-cyan-50 px-2.5 py-1.5">
              <p className="text-[10px] font-semibold text-navy-400">SpO₂</p>
              <p className="text-sm font-extrabold text-navy-800">98<span className="text-[10px] font-medium text-navy-400"> %</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* orbiting nodes */}
      {nodes.map((n, i) => (
        <div key={i} className={`absolute ${n.pos} animate-floaty`} style={{ animationDelay: `${i * 0.7}s` }}>
          <div className="glass flex items-center gap-2 rounded-2xl px-3 py-2 shadow-soft">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${tones[n.tone]}`}>
              <Icon name={n.icon} className="h-4 w-4" />
            </span>
            <span className="pe-1 text-xs font-bold text-navy-700">{lang === "ar" ? n.ar : n.en}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

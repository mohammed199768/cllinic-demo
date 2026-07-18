"use client";
import { useEffect, useState } from "react";
import { CLINIC } from "@/lib/clinic";
import { useLang } from "@/lib/i18n";

/** Editorial splash: counts 0→100 over 2s, then fades out and unmounts. */
export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const { lang } = useLang();
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("our-clinic-splash") === "1";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || seen) {
      setCount(100);
      const t = setTimeout(onComplete, seen ? 0 : 250);
      return () => clearTimeout(t);
    }
    sessionStorage.setItem("our-clinic-splash", "1");
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= 100) {
        clearInterval(id);
        setTimeout(() => setExiting(true), 200);
        setTimeout(onComplete, 900);
      }
    }, 20);
    return () => clearInterval(id);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col justify-between bg-[#f3f7fb] transition-opacity duration-700 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden
    >
      <div className="flex items-start justify-between p-6 md:p-10">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-navy-700">
          {lang === "ar" ? CLINIC.name.ar : CLINIC.name.en}
        </span>
        <span className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulseSoft" />
      </div>
      <div className="flex items-end justify-start p-6 md:p-10">
        <span className="font-extrabold leading-none tabular-nums text-navy-900 text-7xl md:text-9xl">
          {count}
        </span>
        <span className="mb-2 ms-2 text-2xl font-bold text-navy-300 md:mb-3">%</span>
      </div>
    </div>
  );
}

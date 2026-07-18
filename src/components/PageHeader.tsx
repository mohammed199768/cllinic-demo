"use client";
import { useLang } from "@/lib/i18n";
import Icon from "./Icon";

export default function PageHeader({
  ar, en, subAr, subEn, icon, emoji, playful = false,
}: {
  ar: string; en: string; subAr?: string; subEn?: string;
  icon?: string; emoji?: string; playful?: boolean;
}) {
  const { lang } = useLang();
  return (
    <div className={`relative overflow-hidden border-b ${playful ? "border-cyan-100 bg-gradient-to-b from-cyan-50/60 to-transparent" : "border-navy-100/60 bg-white/40"}`}>
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="container-x relative py-14 text-center sm:py-20">
        {playful && emoji ? (
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-soft">{emoji}</div>
        ) : icon ? (
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-cyan-300 shadow-soft">
            <Icon name={icon} className="h-7 w-7" />
          </div>
        ) : null}
        <h1 className="text-h1 font-extrabold text-navy-900">{lang === "ar" ? ar : en}</h1>
        {(subAr || subEn) && <p className="mx-auto mt-4 max-w-2xl text-lead text-navy-500">{lang === "ar" ? subAr : subEn}</p>}
      </div>
    </div>
  );
}

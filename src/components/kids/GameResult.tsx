"use client";
import React from "react";
import { useLang } from "@/lib/i18n";
import KidsRewardFlow from "@/components/KidsRewardFlow";
import { GlassCard } from "./KidsGameShell";

export type LevelBar = { ar: string; en: string; value: number; color?: string };

/**
 * Shared result screen for kids games. Shows a celebratory headline, a safe
 * result label, optional skill-level bars, then the reward-card flow.
 */
export default function GameResult({
  gameName,
  headlineAr = "نتيجة التحدي",
  headlineEn = "Challenge Result",
  levelAr,
  levelEn,
  score,
  bars,
  onReset,
  children,
}: {
  gameName: { ar: string; en: string };
  headlineAr?: string;
  headlineEn?: string;
  levelAr: string;
  levelEn: string;
  score?: string;
  bars?: LevelBar[];
  onReset?: () => void;
  children?: React.ReactNode;
}) {
  const { t, lang } = useLang();
  return (
    <div className="mx-auto max-w-md space-y-5">
      <GlassCard className="text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
          {t(headlineAr, headlineEn)}
        </p>
        <h2 className="mt-2 text-3xl font-extrabold text-navy-900">
          {lang === "ar" ? levelAr : levelEn}
        </h2>
        {score && <p className="mt-1 text-lg font-semibold text-navy-500">{score}</p>}

        {bars && bars.length > 0 && (
          <div className="mt-5 space-y-3 text-start">
            {bars.map((b, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-sm font-semibold text-navy-700">
                  <span>{lang === "ar" ? b.ar : b.en}</span>
                  <span>{Math.round(b.value)}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy-100">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${Math.max(0, Math.min(100, b.value))}%`,
                      background: b.color ?? "linear-gradient(90deg,#36b7d2,#3470e4)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {children}
      </GlassCard>

      <KidsRewardFlow
        gameName={gameName}
        score={score}
        levelLabel={lang === "ar" ? levelAr : levelEn}
        onReset={onReset}
      />
    </div>
  );
}

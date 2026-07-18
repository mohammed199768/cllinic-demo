"use client";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsGameHeader from "@/components/kids/KidsGameHeader";
import GameProgress from "@/components/kids/GameProgress";
import GameOptionButton from "@/components/kids/GameOptionButton";
import GameResult from "@/components/kids/GameResult";
import KidsObject from "@/components/kids/KidsObject";
import { GAME_OBJECTS } from "@/data/kidsGameObjects";
import { PATTERN_ROUNDS } from "@/data/kidsPatternPuzzle";

export default function PatternPuzzleView() {
  const { t, lang } = useLang();
  const rounds = PATTERN_ROUNDS;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const r = rounds[i];
  const reset = () => {
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === r.answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 < rounds.length) {
        setI(i + 1);
        setPicked(null);
      } else setDone(true);
    }, 950);
  };

  const pct = (score / rounds.length) * 100;
  const level =
    pct >= 85
      ? { ar: "نجم الأنماط", en: "Pattern Star" }
      : pct >= 55
      ? { ar: "مفكر ذكي", en: "Smart Thinker" }
      : { ar: "مستكشف صغير", en: "Little Explorer" };

  return (
    <KidsGameShell>
      <KidsGameHeader
        ar="لعبة الأنماط"
        en="Pattern Puzzle"
        subAr="انظر إلى التسلسل واختر ما يأتي بعده."
        subEn="Look at the sequence and choose what comes next."
        object="leaf"
      />

      {done ? (
        <GameResult
          gameName={{ ar: "لعبة الأنماط", en: "Pattern Puzzle" }}
          headlineAr="نتيجة اللعبة"
          headlineEn="Game Result"
          levelAr={level.ar}
          levelEn={level.en}
          score={`${score}/${rounds.length}`}
          onReset={reset}
        />
      ) : (
        <div className="mx-auto max-w-md">
          <GameProgress current={i + 1} total={rounds.length} />
          <GlassCard>
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-navy-100 bg-brand-50/60 p-3">
              {r.sequence.map((s, idx) => (
                <KidsObject key={idx} id={s} size={40} />
              ))}
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-brand-300 text-2xl font-extrabold text-brand-500">
                ?
              </span>
            </div>
            <h2 className="text-center text-lg font-bold text-navy-900">
              {t("ما الذي يأتي بعد علامة السؤال؟", "What comes after the question mark?")}
            </h2>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {r.options.map((obj, idx) => {
                const state =
                  picked === null
                    ? "idle"
                    : idx === r.answer
                    ? "correct"
                    : picked === idx
                    ? "wrong"
                    : "muted";
                return (
                  <GameOptionButton
                    key={idx}
                    state={state}
                    onClick={() => choose(idx)}
                    disabled={picked !== null}
                    ariaLabel={lang === "ar" ? GAME_OBJECTS[obj].label.ar : GAME_OBJECTS[obj].label.en}
                  >
                    <KidsObject id={obj} size={44} />
                  </GameOptionButton>
                );
              })}
            </div>
            {picked !== null && (
              <p className="mt-4 text-center text-sm font-semibold text-navy-600">
                {picked === r.answer
                  ? t("رائع! 🌟", "Awesome! 🌟")
                  : t("لا بأس، لنكمل!", "That's okay, let's continue!")}
              </p>
            )}
          </GlassCard>
        </div>
      )}
    </KidsGameShell>
  );
}

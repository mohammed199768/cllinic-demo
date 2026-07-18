"use client";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsGameHeader from "@/components/kids/KidsGameHeader";
import GameProgress from "@/components/kids/GameProgress";
import GameOptionButton from "@/components/kids/GameOptionButton";
import GameResult from "@/components/kids/GameResult";
import data from "@/data/kidsGames.json";

export default function HealthyQuizView() {
  const { lang, t } = useLang();
  const qs = data.quiz.questions;
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const answer = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === qs[i].answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 < qs.length) {
        setI(i + 1);
        setPicked(null);
      } else setDone(true);
    }, 900);
  };
  const reset = () => {
    setI(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  };

  const pct = (score / qs.length) * 100;
  const level =
    pct >= 80
      ? { ar: "بطل الصحة", en: "Health Hero" }
      : pct >= 50
      ? { ar: "صديق الصحة", en: "Health Friend" }
      : { ar: "مستكشف صغير", en: "Little Explorer" };

  return (
    <KidsGameShell>
      <KidsGameHeader
        ar="صح أم خطأ الصحي"
        en="Healthy True or False"
        subAr="أجب عن الأسئلة وكن بطل الصحة!"
        subEn="Answer the questions and be a health hero!"
        object="apple"
      />
      {done ? (
        <GameResult
          gameName={{ ar: "صح أم خطأ الصحي", en: "Healthy True or False" }}
          headlineAr="نتيجة اللعبة"
          headlineEn="Game Result"
          levelAr={level.ar}
          levelEn={level.en}
          score={`${score}/${qs.length}`}
          onReset={reset}
        />
      ) : (
        <div className="mx-auto max-w-md">
          <GameProgress current={i + 1} total={qs.length} labelAr="سؤال" labelEn="Question" />
          <GlassCard>
            <h2 className="text-center text-xl font-bold text-navy-900">
              {lang === "ar" ? qs[i].q.ar : qs[i].q.en}
            </h2>
            <div className="mt-5 space-y-3">
              {qs[i].options.map((o, idx) => {
                const isAns = idx === qs[i].answer;
                const state =
                  picked === null
                    ? "idle"
                    : isAns
                    ? "correct"
                    : picked === idx
                    ? "wrong"
                    : "muted";
                return (
                  <GameOptionButton
                    key={idx}
                    state={state}
                    onClick={() => answer(idx)}
                    disabled={picked !== null}
                    className="w-full !justify-start text-start"
                  >
                    {lang === "ar" ? o.ar : o.en}
                  </GameOptionButton>
                );
              })}
            </div>
            {picked !== null && (
              <p className="mt-4 text-center text-sm font-semibold text-navy-600">
                {picked === qs[i].answer ? t("إجابة صحيحة! 🌟", "Correct! 🌟") : t("محاولة جيدة!", "Good try!")}
              </p>
            )}
          </GlassCard>
        </div>
      )}
    </KidsGameShell>
  );
}

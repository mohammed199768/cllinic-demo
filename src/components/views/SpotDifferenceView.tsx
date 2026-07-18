"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsGameHeader from "@/components/kids/KidsGameHeader";
import GameProgress from "@/components/kids/GameProgress";
import GameResult from "@/components/kids/GameResult";
import KidsObject from "@/components/kids/KidsObject";
import { ALL_OBJECT_IDS, type ObjectId } from "@/data/kidsGameObjects";

const ROUNDS = 6;
const GRID = 6; // objects per panel

type Round = { left: ObjectId[]; right: ObjectId[]; diff: number };

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

function makeRound(): Round {
  const left: ObjectId[] = [];
  for (let i = 0; i < GRID; i++) left.push(pick(ALL_OBJECT_IDS));
  const right = [...left];
  const diff = Math.floor(Math.random() * GRID);
  let replacement = pick(ALL_OBJECT_IDS);
  while (replacement === left[diff]) replacement = pick(ALL_OBJECT_IDS);
  right[diff] = replacement;
  return { left, right, diff };
}

export default function SpotDifferenceView() {
  const { t } = useLang();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const build = () => {
    setRounds(Array.from({ length: ROUNDS }, makeRound));
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };
  useEffect(() => {
    build();
  }, []);

  if (rounds.length === 0) {
    return (
      <KidsGameShell>
        <KidsGameHeader ar="أين الاختلاف؟" en="Spot the Difference" object="soap" />
      </KidsGameShell>
    );
  }

  const r = rounds[i];

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === r.diff) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 < rounds.length) {
        setI(i + 1);
        setPicked(null);
      } else setDone(true);
    }, 1000);
  };

  const pct = (score / ROUNDS) * 100;
  const level =
    pct >= 85
      ? { ar: "بطل الملاحظة", en: "Observation Hero" }
      : pct >= 50
      ? { ar: "عين حادة", en: "Sharp Eye" }
      : { ar: "مستكشف صغير", en: "Little Explorer" };

  return (
    <KidsGameShell>
      <KidsGameHeader
        ar="أين الاختلاف؟"
        en="Spot the Difference"
        subAr="انقر على العنصر المختلف في اللوحة الثانية."
        subEn="Tap the one object that is different in the second panel."
        object="soap"
      />

      {done ? (
        <GameResult
          gameName={{ ar: "أين الاختلاف؟", en: "Spot the Difference" }}
          headlineAr="نتيجة اللعبة"
          headlineEn="Game Result"
          levelAr={level.ar}
          levelEn={level.en}
          score={`${score}/${ROUNDS}`}
          onReset={build}
        />
      ) : (
        <div className="mx-auto max-w-2xl">
          <GameProgress current={i + 1} total={ROUNDS} />
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassCard className="!p-4">
              <p className="mb-3 text-center text-sm font-bold text-brand-600">{t("اللوحة الأولى", "Panel one")}</p>
              <div className="grid grid-cols-3 gap-3">
                {r.left.map((o, idx) => (
                  <div key={idx} className="flex aspect-square items-center justify-center rounded-2xl bg-brand-50/70">
                    <KidsObject id={o} size={40} />
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="!p-4">
              <p className="mb-3 text-center text-sm font-bold text-brand-600">{t("اللوحة الثانية", "Panel two")}</p>
              <div className="grid grid-cols-3 gap-3">
                {r.right.map((o, idx) => {
                  const reveal = picked !== null && idx === r.diff;
                  const wrong = picked === idx && idx !== r.diff;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => choose(idx)}
                      disabled={picked !== null}
                      aria-label={t("اختر العنصر", "Choose object")}
                      className={`flex aspect-square items-center justify-center rounded-2xl border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                        reveal
                          ? "border-mint-400 bg-mint-50"
                          : wrong
                          ? "border-amber-300 bg-amber-50"
                          : "border-transparent bg-brand-50/70 hover:border-brand-300 hover:bg-brand-50"
                      }`}
                    >
                      <KidsObject id={o} size={40} />
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>
          {picked !== null && (
            <p className="mt-4 text-center text-sm font-semibold text-navy-600">
              {picked === r.diff
                ? t("عين حادة! 🌟", "Sharp eye! 🌟")
                : t("هذا هو المختلف — لنكمل!", "That was the different one — let's continue!")}
            </p>
          )}
        </div>
      )}
    </KidsGameShell>
  );
}

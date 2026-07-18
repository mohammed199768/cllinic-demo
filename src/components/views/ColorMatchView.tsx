"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsGameHeader from "@/components/kids/KidsGameHeader";
import GameProgress from "@/components/kids/GameProgress";
import GameResult from "@/components/kids/GameResult";
import KidsObject from "@/components/kids/KidsObject";
import { GAME_COLORS, type ColorId, type ObjectId } from "@/data/kidsGameObjects";

const ROUNDS = 8;

const OBJECT_COLOR: { obj: ObjectId; color: ColorId }[] = [
  { obj: "water", color: "blue" },
  { obj: "soap", color: "blue" },
  { obj: "apple", color: "red" },
  { obj: "heart", color: "pink" },
  { obj: "leaf", color: "green" },
  { obj: "moon", color: "yellow" },
  { obj: "sun", color: "yellow" },
  { obj: "star", color: "yellow" },
  { obj: "banana", color: "yellow" },
];

const COLOR_IDS = Object.keys(GAME_COLORS) as ColorId[];

function buildRounds() {
  const out: { obj: ObjectId; color: ColorId }[] = [];
  let last = "";
  for (let i = 0; i < ROUNDS; i++) {
    let pick = OBJECT_COLOR[Math.floor(Math.random() * OBJECT_COLOR.length)];
    while (pick.obj === last) pick = OBJECT_COLOR[Math.floor(Math.random() * OBJECT_COLOR.length)];
    last = pick.obj;
    out.push(pick);
  }
  return out;
}

export default function ColorMatchView() {
  const { t, lang } = useLang();
  const [rounds, setRounds] = useState<{ obj: ObjectId; color: ColorId }[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<ColorId | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const build = () => {
    setRounds(buildRounds());
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
        <KidsGameHeader ar="مطابقة الألوان" en="Color Match" object="carrot" />
      </KidsGameShell>
    );
  }

  const r = rounds[i];

  const choose = (color: ColorId) => {
    if (picked !== null) return;
    setPicked(color);
    if (color === r.color) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 < rounds.length) {
        setI(i + 1);
        setPicked(null);
      } else setDone(true);
    }, 900);
  };

  const pct = (score / ROUNDS) * 100;
  const level =
    pct >= 85
      ? { ar: "بطل الألوان", en: "Color Hero" }
      : pct >= 50
      ? { ar: "متعلّم ذكي", en: "Smart Learner" }
      : { ar: "مستكشف صغير", en: "Little Explorer" };

  return (
    <KidsGameShell>
      <KidsGameHeader
        ar="مطابقة الألوان"
        en="Color Match"
        subAr="انظر إلى العنصر، ثم اختر اللون المناسب له."
        subEn="Look at the object, then choose its matching color."
        object="carrot"
      />

      {done ? (
        <GameResult
          gameName={{ ar: "مطابقة الألوان", en: "Color Match" }}
          headlineAr="نتيجة اللعبة"
          headlineEn="Game Result"
          levelAr={level.ar}
          levelEn={level.en}
          score={`${score}/${ROUNDS}`}
          onReset={build}
        />
      ) : (
        <div className="mx-auto max-w-md">
          <GameProgress current={i + 1} total={ROUNDS} />
          <GlassCard>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-navy-100 bg-brand-50/70">
                <KidsObject id={r.obj} size={72} />
              </div>
              <p className="text-lg font-bold text-navy-900">{t("ما لون هذا العنصر؟", "What color is this object?")}</p>
            </div>
            <div className="mt-6 grid grid-cols-5 gap-2.5">
              {COLOR_IDS.map((cid) => {
                const isAnswer = cid === r.color;
                const state =
                  picked === null
                    ? "ring-navy-200"
                    : isAnswer
                    ? "ring-4 ring-mint-400 scale-105"
                    : picked === cid
                    ? "ring-4 ring-amber-300 opacity-80"
                    : "opacity-50 ring-navy-100";
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => choose(cid)}
                    disabled={picked !== null}
                    aria-label={lang === "ar" ? GAME_COLORS[cid].label.ar : GAME_COLORS[cid].label.en}
                    className={`aspect-square rounded-2xl ring-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-400 ${state}`}
                    style={{ backgroundColor: GAME_COLORS[cid].hex }}
                  />
                );
              })}
            </div>
            {picked !== null && (
              <p className="mt-4 text-center text-sm font-semibold text-navy-600">
                {picked === r.color ? t("مطابقة صحيحة! 🌟", "Correct match! 🌟") : t("لا بأس، لنكمل!", "That's okay, let's continue!")}
              </p>
            )}
          </GlassCard>
        </div>
      )}
    </KidsGameShell>
  );
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsGameHeader from "@/components/kids/KidsGameHeader";
import GameProgress from "@/components/kids/GameProgress";
import GameResult from "@/components/kids/GameResult";
import KidsObject from "@/components/kids/KidsObject";
import { GAME_OBJECTS, ALL_OBJECT_IDS, type ObjectId } from "@/data/kidsGameObjects";

const ROUNDS = 5;
const CELLS = 12;
const CHALLENGE_SECONDS = 25;

type Cell = { obj: ObjectId; isTarget: boolean };
type RoundData = { target: ObjectId; cells: Cell[]; targetCount: number };

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

function makeRound(): RoundData {
  const target = pick(ALL_OBJECT_IDS);
  const distractors = ALL_OBJECT_IDS.filter((o) => o !== target);
  const targetCount = 3 + Math.floor(Math.random() * 2); // 3–4
  const cells: Cell[] = [];
  for (let i = 0; i < targetCount; i++) cells.push({ obj: target, isTarget: true });
  while (cells.length < CELLS) cells.push({ obj: pick(distractors), isTarget: false });
  // shuffle
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return { target, cells, targetCount };
}

export default function FocusLabView() {
  const { t, lang } = useLang();
  const [phase, setPhase] = useState<"ready" | "play" | "done">("ready");
  const [challenge, setChallenge] = useState(false);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [i, setI] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const [missTap, setMissTap] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(CHALLENGE_SECONDS);
  const tick = useRef<number | null>(null);

  const start = () => {
    setRounds(Array.from({ length: ROUNDS }, makeRound));
    setI(0);
    setFound([]);
    setScore(0);
    setSeconds(CHALLENGE_SECONDS);
    setPhase("play");
  };

  const nextRound = useCallback(() => {
    setFound([]);
    setSeconds(CHALLENGE_SECONDS);
    setI((prev) => {
      if (prev + 1 < ROUNDS) return prev + 1;
      setPhase("done");
      return prev;
    });
  }, []);

  // calm countdown only in challenge mode — never punishes, just advances
  useEffect(() => {
    if (phase !== "play" || !challenge) return;
    tick.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(tick.current!);
          nextRound();
          return CHALLENGE_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [phase, challenge, i, nextRound]);

  const r = rounds[i];

  const tap = (idx: number) => {
    if (!r || found.includes(idx)) return;
    if (r.cells[idx].isTarget) {
      const nf = [...found, idx];
      setFound(nf);
      if (nf.length === r.targetCount) {
        setScore((s) => s + 1);
        window.setTimeout(nextRound, 700);
      }
    } else {
      setMissTap(idx);
      window.setTimeout(() => setMissTap(null), 350);
    }
  };

  const pct = (score / ROUNDS) * 100;
  const level =
    pct >= 85
      ? { ar: "بطل التركيز", en: "Focus Hero" }
      : pct >= 50
      ? { ar: "منتبه ذكي", en: "Sharp Focus" }
      : { ar: "مستكشف صغير", en: "Little Explorer" };

  return (
    <KidsGameShell>
      <KidsGameHeader
        ar="مختبر التركيز"
        en="Focus Lab"
        subAr="انقر العناصر المطلوبة فقط، وتجاهل البقية."
        subEn="Tap only the requested objects, and ignore the rest."
        object="water"
      />

      {phase === "ready" && (
        <div className="mx-auto max-w-md">
          <GlassCard className="text-center">
            <h2 className="text-xl font-extrabold text-navy-900">{t("اختر طريقة اللعب", "Choose how to play")}</h2>
            <label className="mt-5 flex items-center justify-center gap-3 text-navy-700">
              <input
                type="checkbox"
                checked={challenge}
                onChange={(e) => setChallenge(e.target.checked)}
                className="h-5 w-5 rounded border-navy-300 accent-brand-500"
              />
              <span className="font-semibold">
                {t("وضع التحدي (عدّاد هادئ)", "Challenge mode (calm timer)")}
              </span>
            </label>
            <p className="mt-2 text-xs text-navy-400">
              {t("الوضع العادي بلا وقت إطلاقًا.", "Normal mode has no timer at all.")}
            </p>
            <button onClick={start} className="btn-primary mt-6 w-full">
              {t("ابدأ", "Start")}
            </button>
          </GlassCard>
        </div>
      )}

      {phase === "play" && r && (
        <div className="mx-auto max-w-md">
          <GameProgress current={i + 1} total={ROUNDS} />
          <GlassCard>
            <div className="mb-4 flex flex-col items-center gap-2 text-center">
              <p className="text-lg font-bold text-navy-900">
                {t("انقر على:", "Tap the:")}{" "}
                <span className="text-brand-600">
                  {lang === "ar" ? GAME_OBJECTS[r.target].label.ar : GAME_OBJECTS[r.target].label.en}
                </span>
              </p>
              <KidsObject id={r.target} size={40} />
              {challenge && (
                <p className="text-sm font-semibold text-navy-500" aria-live="polite">
                  ⏳ {seconds}s
                </p>
              )}
              <p className="text-xs text-navy-400">
                {found.length}/{r.targetCount}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {r.cells.map((c, idx) => {
                const isFound = found.includes(idx);
                const isMiss = missTap === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => tap(idx)}
                    disabled={isFound}
                    aria-label={lang === "ar" ? GAME_OBJECTS[c.obj].label.ar : GAME_OBJECTS[c.obj].label.en}
                    className={`flex aspect-square items-center justify-center rounded-2xl border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                      isFound
                        ? "border-mint-400 bg-mint-50"
                        : isMiss
                        ? "border-amber-300 bg-amber-50"
                        : "border-navy-100 bg-white hover:border-brand-300 hover:bg-brand-50"
                    }`}
                  >
                    <KidsObject id={c.obj} size={30} glow={false} />
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {phase === "done" && (
        <GameResult
          gameName={{ ar: "مختبر التركيز", en: "Focus Lab" }}
          headlineAr="نتيجة اللعبة"
          headlineEn="Game Result"
          levelAr={level.ar}
          levelEn={level.en}
          score={`${score}/${ROUNDS}`}
          onReset={() => setPhase("ready")}
        />
      )}
    </KidsGameShell>
  );
}

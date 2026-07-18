"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsGameHeader from "@/components/kids/KidsGameHeader";
import GameProgress from "@/components/kids/GameProgress";
import GameResult from "@/components/kids/GameResult";
import KidsObject from "@/components/kids/KidsObject";
import Icon from "@/components/Icon";
import { GAME_OBJECTS, type ObjectId } from "@/data/kidsGameObjects";

const POOL: ObjectId[] = ["water", "heart", "star", "moon", "apple", "tooth", "shield"];
const LENGTHS = [3, 4, 5, 6];

type Phase = "ready" | "show" | "recall" | "done";

function randSeq(len: number): ObjectId[] {
  return Array.from({ length: len }, () => POOL[Math.floor(Math.random() * POOL.length)]);
}

export default function ShapeSequenceView() {
  const { t, lang } = useLang();
  const [round, setRound] = useState(0);
  const [seq, setSeq] = useState<ObjectId[]>([]);
  const [input, setInput] = useState<ObjectId[]>([]);
  const [phase, setPhase] = useState<Phase>("ready");
  const [feedback, setFeedback] = useState<"" | "ok" | "no">("");
  const [score, setScore] = useState(0);
  const timer = useRef<number | null>(null);

  const startRound = useCallback((r: number) => {
    const s = randSeq(LENGTHS[r]);
    setSeq(s);
    setInput([]);
    setFeedback("");
    setPhase("show");
  }, []);

  useEffect(() => {
    if (phase !== "show") return;
    const ms = 900 + seq.length * 700;
    timer.current = window.setTimeout(() => setPhase("recall"), ms);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [phase, seq.length]);

  const reset = () => {
    setRound(0);
    setScore(0);
    startRound(0);
  };

  const tap = (obj: ObjectId) => {
    if (phase !== "recall" || feedback) return;
    const next = [...input, obj];
    setInput(next);
    const idx = next.length - 1;
    if (next[idx] !== seq[idx]) {
      setFeedback("no");
      window.setTimeout(() => startRound(round), 1100);
      return;
    }
    if (next.length === seq.length) {
      setFeedback("ok");
      setScore((s) => s + 1);
      window.setTimeout(() => {
        if (round + 1 < LENGTHS.length) {
          setRound(round + 1);
          startRound(round + 1);
        } else setPhase("done");
      }, 1000);
    }
  };

  const pct = (score / LENGTHS.length) * 100;
  const level =
    pct >= 85
      ? { ar: "بطل الذاكرة", en: "Memory Hero" }
      : pct >= 50
      ? { ar: "مفكر ذكي", en: "Smart Thinker" }
      : { ar: "مستكشف صغير", en: "Little Explorer" };

  return (
    <KidsGameShell>
      <KidsGameHeader
        ar="تسلسل الأشكال"
        en="Shape Sequence"
        subAr="شاهد الترتيب، ثم كرّره بنفس التسلسل."
        subEn="Watch the order, then repeat it in the same sequence."
        object="moon"
      />

      {phase === "ready" && (
        <div className="mx-auto max-w-md">
          <GlassCard className="text-center">
            <h2 className="text-xl font-extrabold text-navy-900">{t("هل أنت مستعد؟", "Ready?")}</h2>
            <p className="mt-2 text-navy-600">
              {t(
                "سيظهر تسلسل من الأشكال لبضع لحظات، ثم تكرّره بالترتيب نفسه.",
                "A sequence of shapes appears for a few moments, then you repeat it in the same order."
              )}
            </p>
            <button onClick={reset} className="btn-primary mt-6 w-full">
              <Icon name="play" className="h-5 w-5" /> {t("ابدأ", "Start")}
            </button>
          </GlassCard>
        </div>
      )}

      {(phase === "show" || phase === "recall") && (
        <div className="mx-auto max-w-md">
          <GameProgress current={round + 1} total={LENGTHS.length} />
          <GlassCard>
            <p className="mb-4 text-center text-sm font-bold text-brand-600">
              {phase === "show" ? t("احفظ الترتيب…", "Memorize the order…") : t("الآن كرّر الترتيب", "Now repeat the order")}
            </p>

            <div className="flex min-h-[64px] flex-wrap items-center justify-center gap-2 rounded-2xl border border-navy-100 bg-brand-50/60 p-3">
              {phase === "show" ? (
                seq.map((s, idx) => <KidsObject key={idx} id={s} size={44} />)
              ) : input.length ? (
                input.map((s, idx) => <KidsObject key={idx} id={s} size={36} />)
              ) : (
                <span className="text-sm text-navy-400">{t("انقر الأشكال بالترتيب", "Tap the shapes in order")}</span>
              )}
            </div>

            {phase === "recall" && (
              <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {POOL.map((obj) => (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => tap(obj)}
                    disabled={!!feedback}
                    aria-label={lang === "ar" ? GAME_OBJECTS[obj].label.ar : GAME_OBJECTS[obj].label.en}
                    className="flex aspect-square items-center justify-center rounded-2xl border-2 border-navy-100 bg-white transition hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50"
                  >
                    <KidsObject id={obj} size={32} />
                  </button>
                ))}
              </div>
            )}

            {feedback && (
              <p className="mt-4 text-center text-sm font-semibold text-navy-600">
                {feedback === "ok" ? t("ممتاز! 🌟", "Excellent! 🌟") : t("قريب جدًا — لنجرّب مرة أخرى.", "So close — let's try again.")}
              </p>
            )}
          </GlassCard>
        </div>
      )}

      {phase === "done" && (
        <GameResult
          gameName={{ ar: "تسلسل الأشكال", en: "Shape Sequence" }}
          headlineAr="نتيجة اللعبة"
          headlineEn="Game Result"
          levelAr={level.ar}
          levelEn={level.en}
          score={`${score}/${LENGTHS.length}`}
          onReset={reset}
        />
      )}
    </KidsGameShell>
  );
}

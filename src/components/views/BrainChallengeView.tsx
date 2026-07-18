"use client";
import { useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsGameHeader from "@/components/kids/KidsGameHeader";
import GameProgress from "@/components/kids/GameProgress";
import GameOptionButton from "@/components/kids/GameOptionButton";
import GameResult, { type LevelBar } from "@/components/kids/GameResult";
import KidsObject from "@/components/kids/KidsObject";
import Icon from "@/components/Icon";
import {
  BRAIN_CHALLENGE,
  BC_CATEGORIES,
  BC_SKILL_MAP,
  bcResultLabel,
  type BCQuestion,
  type BCCategory,
} from "@/data/kidsBrainChallenge";

type Phase = "intro" | "play" | "done";

export default function BrainChallengeView() {
  const { t, lang } = useLang();
  const qs = BRAIN_CHALLENGE;
  const [phase, setPhase] = useState<Phase>("intro");
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState<Record<BCCategory, number>>(emptyCounts());
  const [totalCorrect, setTotalCorrect] = useState(0);

  const reset = () => {
    setI(0);
    setPicked(null);
    setCorrect(emptyCounts());
    setTotalCorrect(0);
    setPhase("play");
  };

  const q = qs[i];

  const answer = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const ok = idx === q.answer;
    if (ok) {
      setCorrect((c) => ({ ...c, [q.category]: c[q.category] + 1 }));
      setTotalCorrect((n) => n + 1);
    }
    setTimeout(() => {
      if (i + 1 < qs.length) {
        setI(i + 1);
        setPicked(null);
      } else {
        setPhase("done");
      }
    }, 950);
  };

  const totals = useMemo(() => categoryTotals(qs), [qs]);

  return (
    <KidsGameShell>
      <KidsGameHeader
        ar="تحدي الذكاء المرح"
        en="Fun Brain Challenge"
        subAr="جولات مرحة تدرّب الذاكرة والتركيز والمنطق."
        subEn="Playful rounds that train memory, focus and logic."
        object="shield"
      />

      {phase === "intro" && (
        <div className="mx-auto max-w-md space-y-5">
          <GlassCard>
            <h2 className="text-xl font-extrabold text-navy-900">{t("كيف نلعب؟", "How to play")}</h2>
            <p className="mt-2 text-navy-600">
              {t(
                "ستظهر أسئلة قصيرة من خمس فئات. اختر الإجابة التي تراها مناسبة — لا يوجد وقت ولا ضغط.",
                "Short questions appear from five categories. Pick the answer you think fits — no timer, no pressure."
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(BC_CATEGORIES) as BCCategory[]).map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700"
                >
                  {lang === "ar" ? BC_CATEGORIES[c].ar : BC_CATEGORIES[c].en}
                </span>
              ))}
            </div>
            <button onClick={reset} className="btn-primary mt-6 w-full">
              <Icon name="play" className="h-5 w-5" /> {t("ابدأ التحدي", "Start the challenge")}
            </button>
          </GlassCard>
          <Disclaimer />
        </div>
      )}

      {phase === "play" && (
        <div className="mx-auto max-w-md">
          <GameProgress current={i + 1} total={qs.length} />
          <div className="mb-3 text-center">
            <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700">
              {lang === "ar" ? BC_CATEGORIES[q.category].ar : BC_CATEGORIES[q.category].en}
            </span>
          </div>
          <GlassCard>
            {q.sequence && <SequenceRow q={q} />}
            <h2 className="text-center text-xl font-bold text-navy-900">
              {lang === "ar" ? q.prompt.ar : q.prompt.en}
            </h2>
            <div className={`mt-5 grid gap-3 ${q.options.length > 2 ? "grid-cols-3" : "grid-cols-2"}`}>
              {q.options.map((o, idx) => {
                const state =
                  picked === null
                    ? "idle"
                    : idx === q.answer
                    ? "correct"
                    : picked === idx
                    ? "wrong"
                    : "muted";
                const label = o.label ? (lang === "ar" ? o.label.ar : o.label.en) : undefined;
                return (
                  <GameOptionButton
                    key={idx}
                    state={state}
                    onClick={() => answer(idx)}
                    disabled={picked !== null}
                    ariaLabel={label}
                  >
                    {o.object ? <KidsObject id={o.object} size={44} /> : label}
                  </GameOptionButton>
                );
              })}
            </div>
            {picked !== null && (
              <p className="mt-4 text-center text-sm font-semibold text-navy-600">
                {picked === q.answer
                  ? t("أحسنت! إجابة صحيحة 🌟", "Great! Correct answer 🌟")
                  : t("محاولة جيدة، لنكمل!", "Good try, let's keep going!")}
              </p>
            )}
          </GlassCard>
        </div>
      )}

      {phase === "done" && (
        <DoneScreen correct={correct} totals={totals} totalCorrect={totalCorrect} onReset={reset} />
      )}
    </KidsGameShell>
  );
}

function DoneScreen({
  correct,
  totals,
  totalCorrect,
  onReset,
}: {
  correct: Record<BCCategory, number>;
  totals: Record<BCCategory, number>;
  totalCorrect: number;
  onReset: () => void;
}) {
  const all = (Object.keys(totals) as BCCategory[]).reduce((s, c) => s + totals[c], 0);
  const pct = all ? (totalCorrect / all) * 100 : 0;
  const label = bcResultLabel(pct);

  const level = (cats: BCCategory[]) => {
    let c = 0;
    let tot = 0;
    cats.forEach((cat) => {
      c += correct[cat];
      tot += totals[cat];
    });
    return tot ? (c / tot) * 100 : 0;
  };

  const bars: LevelBar[] = [
    { ar: "مستوى الذاكرة", en: "Memory Level", value: level(BC_SKILL_MAP.memoryLevel), color: "linear-gradient(90deg,#ff7eb3,#b4a8ff)" },
    { ar: "مستوى التركيز", en: "Focus Level", value: level(BC_SKILL_MAP.focusLevel), color: "linear-gradient(90deg,#36b7d2,#3470e4)" },
    { ar: "مستوى المنطق", en: "Logic Level", value: level(BC_SKILL_MAP.logicLevel), color: "linear-gradient(90deg,#239268,#ffd56b)" },
  ];

  return (
    <div className="space-y-5">
      <GameResult
        gameName={{ ar: "تحدي الذكاء المرح", en: "Fun Brain Challenge" }}
        headlineAr="نتيجة التحدي"
        headlineEn="Challenge Result"
        levelAr={label.ar}
        levelEn={label.en}
        score={`${totalCorrect}/${all}`}
        bars={bars}
        onReset={onReset}
      />
      <div className="mx-auto max-w-md">
        <Disclaimer />
      </div>
    </div>
  );
}

function SequenceRow({ q }: { q: BCQuestion }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-navy-100 bg-brand-50/60 p-3">
      {q.sequence!.map((s, idx) =>
        s === "?" ? (
          <span
            key={idx}
            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-brand-300 text-2xl font-extrabold text-brand-500"
          >
            ?
          </span>
        ) : (
          <KidsObject key={idx} id={s} size={40} />
        )
      )}
    </div>
  );
}

function Disclaimer() {
  const { t } = useLang();
  return (
    <p className="rounded-2xl border border-navy-100 bg-white/70 p-4 text-center text-xs leading-relaxed text-navy-500">
      {t(
        "هذا التحدي ترفيهي وتعليمي، ولا يُعد تقييمًا نفسيًا أو قياسًا رسميًا للذكاء.",
        "This challenge is for fun and learning only. It is not a psychological assessment or an official IQ test."
      )}
    </p>
  );
}

function emptyCounts(): Record<BCCategory, number> {
  return { memory: 0, patterns: 0, logic: 0, attention: 0, shapes: 0 };
}

function categoryTotals(qs: BCQuestion[]): Record<BCCategory, number> {
  const out = emptyCounts();
  qs.forEach((q) => {
    out[q.category] += 1;
  });
  return out;
}

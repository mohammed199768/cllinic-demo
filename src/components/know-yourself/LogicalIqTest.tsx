"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import {
  IQ_ASSESSMENT,
  IQ_FLAT_QUESTIONS,
  IQ_TOTAL_QUESTIONS,
  IQ_LEVEL_COUNT,
  IQ_ESTIMATED_MINUTES,
} from "@/data/logicalIqTest";
import { scoreLogicalIq } from "@/lib/logicalIqScoring";
import Icon from "@/components/Icon";
import IqProgress from "./IqProgress";
import IqQuestionCard from "./IqQuestionCard";
import IqResultCard from "./IqResultCard";

type Phase = "intro" | "test" | "result";

export default function LogicalIqTest() {
  const { lang, t } = useLang();
  const [phase, setPhase] = useState<Phase>("intro");
  const [name, setName] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(IQ_TOTAL_QUESTIONS).fill(null)
  );

  const flat = IQ_FLAT_QUESTIONS[current];
  const question = flat.question;
  const selected = answers[current];

  // index of this question within its level (1-based) + level question count
  const levelQuestions = IQ_ASSESSMENT.find((l) => l.id === flat.levelId)?.questions ?? [];
  const indexInLevel =
    levelQuestions.findIndex((q) => q.id === question.id) + 1;

  const result = useMemo(() => scoreLogicalIq(answers), [answers]);

  const select = (index: number) =>
    setAnswers((prev) => {
      const nextA = [...prev];
      nextA[current] = index;
      return nextA;
    });

  const start = () => {
    setAnswers(Array(IQ_TOTAL_QUESTIONS).fill(null));
    setCurrent(0);
    setPhase("test");
  };
  const next = () => {
    if (current < IQ_TOTAL_QUESTIONS - 1) setCurrent((c) => c + 1);
    else setPhase("result");
  };
  const back = () => current > 0 && setCurrent((c) => c - 1);
  const retake = () => {
    setAnswers(Array(IQ_TOTAL_QUESTIONS).fill(null));
    setCurrent(0);
    setPhase("intro");
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#FBF8F2] text-[#10203A]">
      {/* very light geometric motif */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:linear-gradient(#10203A0a_1px,transparent_1px),linear-gradient(90deg,#10203A0a_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent_75%)]" />

      <div className="container-x relative py-12 sm:py-16">
        <Link
          href="/know-yourself"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#5F6B7A] transition hover:text-[#2563EB]"
        >
          <Icon name="chevron" className="h-4 w-4 rotate-180 rtl:rotate-0" />
          {t("اعرف نفسك", "Know Yourself")}
        </Link>

        <div className="mx-auto max-w-3xl">
          {phase === "intro" && <IntroScreen name={name} setName={setName} onStart={start} />}

          {phase === "test" && (
            <div className="rounded-3xl border border-[#E6DED2] bg-white p-5 shadow-[0_18px_50px_-30px_rgba(16,32,58,0.35)] sm:p-8">
              {/* level header */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                    {t(`المستوى ${flat.levelId}`, `Level ${flat.levelId}`)}
                    {" · "}
                    {lang === "ar" ? flat.levelNameAr : flat.levelNameEn}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#5F6B7A]">
                    {t(
                      `السؤال ${indexInLevel} من ${levelQuestions.length} في هذا المستوى`,
                      `Question ${indexInLevel} of ${levelQuestions.length} in this level`
                    )}
                  </p>
                </div>
                {/* level pips */}
                <div className="flex items-center gap-1.5">
                  {IQ_ASSESSMENT.map((l) => (
                    <span
                      key={l.id}
                      title={lang === "ar" ? l.nameAr : l.nameEn}
                      className={`h-2 rounded-full transition-all ${
                        l.id === flat.levelId
                          ? "w-6 bg-[#2563EB]"
                          : l.id < flat.levelId
                          ? "w-2 bg-[#0F766E]"
                          : "w-2 bg-[#E6DED2]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <IqProgress current={current + 1} total={IQ_TOTAL_QUESTIONS} />

              <div className="mt-7">
                <IqQuestionCard question={question} selected={selected} onSelect={select} />
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={back}
                  disabled={current === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E6DED2] bg-white px-5 py-2.5 text-sm font-semibold text-[#10203A] transition hover:border-[#2563EB]/40 hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="chevron" className="h-4 w-4 rotate-180 rtl:rotate-0" />
                  {t("السابق", "Back")}
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={selected === null}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.7)] transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {current === IQ_TOTAL_QUESTIONS - 1
                    ? t("عرض النتيجة", "View Result")
                    : t("التالي", "Next")}
                  <Icon name="chevron" className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>

              <p className="mt-6 text-center text-[0.7rem] leading-relaxed text-[#9AA4B2]">
                {t(
                  "هذا الاختبار ترفيهي وتعليمي، ولا يُعد اختبار ذكاء رسميًا أو تقييمًا نفسيًا معتمدًا.",
                  "This assessment is for educational and recreational use only. It is not an official IQ test or a certified psychological evaluation."
                )}
              </p>
            </div>
          )}

          {phase === "result" && (
            <div className="rounded-3xl border border-[#E6DED2] bg-white p-6 shadow-[0_18px_50px_-30px_rgba(16,32,58,0.35)] sm:p-9">
              <IqResultCard result={result} name={name} onRetake={retake} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntroScreen({
  name,
  setName,
  onStart,
}: {
  name: string;
  setName: (v: string) => void;
  onStart: () => void;
}) {
  const { lang, t } = useLang();

  const meta = [
    { icon: "clock", label: t("الوقت التقريبي", "Estimated time"), value: t(`${IQ_ESTIMATED_MINUTES} دقائق`, `${IQ_ESTIMATED_MINUTES} min`) },
    { icon: "activity", label: t("عدد المستويات", "Levels"), value: `${IQ_LEVEL_COUNT}` },
    { icon: "check", label: t("عدد الأسئلة", "Questions"), value: `${IQ_TOTAL_QUESTIONS}` },
    { icon: "user", label: t("الفئة العمرية", "Suitable for"), value: t("16 سنة فأكثر", "Ages 16+") },
  ];

  const steps = [
    {
      ar: "ادرس المصفوفة",
      en: "Study the matrix",
      dAr: "انظر إلى شبكة 3×3 ولاحظ القاعدة في الصفوف والأعمدة.",
      dEn: "Look at the 3×3 grid and notice the rule across rows and columns.",
    },
    {
      ar: "حدّد الخانة الناقصة",
      en: "Find the missing cell",
      dAr: "فكّر فيما يجب أن يملأ الخانة الفارغة لإكمال النمط.",
      dEn: "Work out what belongs in the empty square to complete the pattern.",
    },
    {
      ar: "اختر إجابتك",
      en: "Choose your answer",
      dAr: "اختر الشكل الأقرب من الخيارات أسفل المصفوفة.",
      dEn: "Pick the closest option from the choices below the matrix.",
    },
  ];

  return (
    <div className="rounded-3xl border border-[#E6DED2] bg-white p-7 shadow-[0_18px_50px_-30px_rgba(16,32,58,0.35)] sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563EB]">
        {t("اختبار الذكاء المنطقي", "Logical Intelligence Test")}
      </p>
      <h1 className="mt-3 text-h2 font-extrabold text-[#10203A]">
        {t("اختبار الذكاء المنطقي", "Logical Intelligence Test")}
      </h1>
      <p className="mt-2 text-xs font-medium tracking-wide text-[#5F6B7A]">
        {t(
          "مستوحى من اختبارات الأنماط والمصفوفات",
          "Inspired by pattern and matrix reasoning tests"
        )}
      </p>

      <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#5F6B7A]">
        {t(
          "اختبار تعليمي ترفيهي مستوحى من اختبارات الأنماط والمصفوفات، يساعدك على ملاحظة طريقة تفكيرك في المنطق البصري. خذ وقتك، واختر الإجابة الأقرب للنمط.",
          "An educational and recreational assessment inspired by pattern and matrix reasoning, designed to help you observe your visual logic style. Take your time and choose the option that best completes the pattern."
        )}
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-4">
        {meta.map((m, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-[#E6DED2] bg-[#FBF8F2] p-3.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF4FF] text-[#2563EB]">
              <Icon name={m.icon} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.7rem] text-[#5F6B7A]">{m.label}</p>
              <p className="truncate text-sm font-bold text-[#10203A]">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* levels preview */}
      <div className="mt-7">
        <p className="mb-2 text-sm font-semibold text-[#10203A]">{t("المستويات", "Levels")}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {IQ_ASSESSMENT.map((l) => (
            <div key={l.id} className="flex items-start gap-3 rounded-2xl border border-[#E6DED2] bg-white p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10203A] text-[0.7rem] font-bold text-white">
                {l.id}
              </span>
              <div>
                <p className="text-sm font-bold text-[#10203A]">{lang === "ar" ? l.nameAr : l.nameEn}</p>
                <p className="text-xs text-[#5F6B7A]">{lang === "ar" ? l.descAr : l.descEn}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* optional name */}
      <div className="mt-7">
        <label htmlFor="iq-name" className="mb-2 block text-sm font-semibold text-[#10203A]">
          {t("الاسم (اختياري — يظهر على البطاقة فقط)", "Name (optional — shown on the result card only)")}
        </label>
        <input
          id="iq-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          placeholder={t("اكتب اسمك", "Enter your name")}
          className="w-full rounded-2xl border border-[#E6DED2] bg-[#FBF8F2] px-4 py-3 text-sm text-[#10203A] placeholder:text-[#9AA4B2] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>

      {/* how to play */}
      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border border-[#E6DED2] bg-[#FBF8F2] p-4">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF4FF] text-xs font-bold text-[#2563EB]">
              {i + 1}
            </span>
            <p className="mt-2 text-sm font-bold text-[#10203A]">{lang === "ar" ? s.ar : s.en}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#5F6B7A]">{lang === "ar" ? s.dAr : s.dEn}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] transition hover:bg-[#1d4ed8] sm:w-auto"
      >
        {t("ابدأ الاختبار", "Start Assessment")}
        <Icon name="chevron" className="h-4 w-4 rtl:rotate-180" />
      </button>

      <p className="mt-6 rounded-2xl border border-[#E6DED2] bg-[#FBF8F2] px-4 py-3 text-[0.72rem] leading-relaxed text-[#5F6B7A]">
        {t(
          "هذا الاختبار ترفيهي وتعليمي، ولا يُعد اختبار ذكاء رسميًا أو تقييمًا نفسيًا معتمدًا.",
          "This assessment is for educational and recreational use only. It is not an official IQ test or a certified psychological evaluation."
        )}
      </p>
    </div>
  );
}

/**
 * Safe, non-clinical scoring for the Logical Intelligence Test.
 *
 * No clinical IQ number, no percentile, no diagnostic label, no comparison to
 * other people. The raw score becomes a friendly percentage, a per-level
 * breakdown, and a motivational tier. All copy is encouraging.
 */

import { IQ_FLAT_QUESTIONS, IQ_ASSESSMENT } from "@/data/logicalIqTest";

export type IqBi = { ar: string; en: string };
export type IqLevelKey = "emerging" | "calm" | "logical" | "strategist";

export interface IqTier {
  key: IqLevelKey;
  min: number;
  max: number;
  label: IqBi;
  message: IqBi;
  /** short premium line used on the result card */
  cardLine: IqBi;
  visualLogicIndex: IqBi;
  focusLevel: IqBi;
  problemSolvingStyle: IqBi;
}

export const IQ_TIERS: IqTier[] = [
  {
    key: "emerging",
    min: 0,
    max: 40,
    label: { ar: "مراقب ناشئ", en: "Emerging Observer" },
    message: {
      ar: "لديك بداية جيدة في ملاحظة الأنماط. ركّز على مقارنة التفاصيل الصغيرة قبل اختيار الإجابة.",
      en: "You are building your pattern-recognition skills. Focus on comparing small details before choosing an answer.",
    },
    cardLine: { ar: "بداية واعدة في قراءة الأنماط", en: "A promising start in reading patterns" },
    visualLogicIndex: { ar: "في تطوّر", en: "Developing" },
    focusLevel: { ar: "متوسط", en: "Steady" },
    problemSolvingStyle: { ar: "مستكشف للتفاصيل", en: "Detail Explorer" },
  },
  {
    key: "calm",
    min: 41,
    max: 60,
    label: { ar: "محلل هادئ", en: "Calm Analyst" },
    message: {
      ar: "تتعامل مع الأسئلة بتوازن، وتحتاج فقط إلى مزيد من التركيز على العلاقات بين الأشكال.",
      en: "You approach questions with balance. A little more focus on shape relationships can improve your performance.",
    },
    cardLine: { ar: "توازن واضح في التحليل", en: "Clear balance in analysis" },
    visualLogicIndex: { ar: "متوسط", en: "Moderate" },
    focusLevel: { ar: "جيد", en: "Good" },
    problemSolvingStyle: { ar: "محلل متوازن", en: "Balanced Analyst" },
  },
  {
    key: "logical",
    min: 61,
    max: 80,
    label: { ar: "مفكر منطقي", en: "Logical Thinker" },
    message: {
      ar: "نتيجتك تشير إلى قدرة جيدة على تتبع الأنماط وربط التفاصيل بطريقة منظمة.",
      en: "Your result suggests strong ability to follow patterns and connect details in an organized way.",
    },
    cardLine: { ar: "قدرة منظمة على ربط الأنماط", en: "Organized ability to connect patterns" },
    visualLogicIndex: { ar: "عالٍ", en: "High" },
    focusLevel: { ar: "عالٍ", en: "High" },
    problemSolvingStyle: { ar: "مفكر منهجي", en: "Systematic Thinker" },
  },
  {
    key: "strategist",
    min: 81,
    max: 100,
    label: { ar: "استراتيجي الأنماط", en: "Pattern Strategist" },
    message: {
      ar: "أظهرت قدرة عالية على قراءة العلاقات البصرية وتحليل الأنماط بسرعة ووضوح.",
      en: "You showed strong ability to read visual relationships and analyze patterns with clarity.",
    },
    cardLine: { ar: "وضوح لافت في تحليل الأنماط", en: "Remarkable clarity in pattern analysis" },
    visualLogicIndex: { ar: "مرتفع جدًا", en: "Very High" },
    focusLevel: { ar: "ممتاز", en: "Excellent" },
    problemSolvingStyle: { ar: "استراتيجي الأنماط", en: "Pattern Strategist" },
  },
];

export interface IqLevelScore {
  levelId: number;
  nameAr: string;
  nameEn: string;
  correct: number;
  total: number;
  percent: number;
}

export interface IqResult {
  correct: number;
  total: number;
  percent: number;
  tier: IqTier;
  levels: IqLevelScore[];
}

function tierFor(percent: number): IqTier {
  return IQ_TIERS.find((t) => percent >= t.min && percent <= t.max) ?? IQ_TIERS[0];
}

/**
 * Score an answers array aligned to IQ_FLAT_QUESTIONS (answers[i] is the chosen
 * option index for the i-th question, or null if unanswered).
 */
export function scoreLogicalIq(answers: (number | null)[]): IqResult {
  const perLevel = new Map<number, IqLevelScore>();
  for (const lvl of IQ_ASSESSMENT) {
    perLevel.set(lvl.id, {
      levelId: lvl.id,
      nameAr: lvl.nameAr,
      nameEn: lvl.nameEn,
      correct: 0,
      total: lvl.questions.length,
      percent: 0,
    });
  }

  let correct = 0;
  IQ_FLAT_QUESTIONS.forEach((fq, i) => {
    const isCorrect = answers[i] === fq.question.correct;
    if (isCorrect) {
      correct += 1;
      const ls = perLevel.get(fq.levelId);
      if (ls) ls.correct += 1;
    }
  });

  const total = IQ_FLAT_QUESTIONS.length;
  const levels = Array.from(perLevel.values()).map((ls) => ({
    ...ls,
    percent: Math.round((ls.correct / Math.max(1, ls.total)) * 100),
  }));
  const percent = Math.round((correct / Math.max(1, total)) * 100);

  return { correct, total, percent, tier: tierFor(percent), levels };
}

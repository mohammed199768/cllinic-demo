import type { ObjectId, Bi } from "./kidsGameObjects";

export type BCCategory = "memory" | "patterns" | "logic" | "attention" | "shapes";

export const BC_CATEGORIES: Record<BCCategory, Bi> = {
  memory: { ar: "الذاكرة", en: "Memory" },
  patterns: { ar: "الأنماط", en: "Patterns" },
  logic: { ar: "المنطق", en: "Logic" },
  attention: { ar: "الانتباه", en: "Attention" },
  shapes: { ar: "الأشكال", en: "Shapes" },
};

export type BCOption = { label?: Bi; object?: ObjectId };

export type BCQuestion = {
  category: BCCategory;
  prompt: Bi;
  /** Optional object sequence shown above the question. */
  sequence?: (ObjectId | "?")[];
  options: BCOption[];
  answer: number; // index into options
};

/**
 * Adapted from the "next item in the sequence" idea in the reference quiz
 * (Assessment_test_quiz-App-main): question + multiple options with one
 * correct answer, a running score and a final result screen. Reworked into
 * original, self-contained, bilingual, child-safe content — no external
 * images and NO intelligence/IQ claims.
 */
export const BRAIN_CHALLENGE: BCQuestion[] = [
  // ---- Patterns ----
  {
    category: "patterns",
    prompt: { ar: "ما الذي يأتي بعد علامة السؤال؟", en: "What comes after the question mark?" },
    sequence: ["water", "apple", "water", "apple", "?"],
    options: [{ object: "water" }, { object: "apple" }, { object: "star" }],
    answer: 0,
  },
  {
    category: "patterns",
    prompt: { ar: "أكمل النمط.", en: "Complete the pattern." },
    sequence: ["star", "star", "moon", "star", "star", "?"],
    options: [{ object: "star" }, { object: "moon" }, { object: "heart" }],
    answer: 1,
  },
  {
    category: "patterns",
    prompt: { ar: "ما العنصر التالي؟", en: "Which object is next?" },
    sequence: ["leaf", "carrot", "leaf", "carrot", "leaf", "?"],
    options: [{ object: "leaf" }, { object: "carrot" }, { object: "apple" }],
    answer: 1,
  },
  // ---- Logic ----
  {
    category: "logic",
    prompt: {
      ar: "أي عنصر لا ينتمي إلى المجموعة الصحية للطعام؟",
      en: "Which object does not belong with the healthy foods?",
    },
    options: [{ object: "apple" }, { object: "carrot" }, { object: "moon" }],
    answer: 2,
  },
  {
    category: "logic",
    prompt: {
      ar: "نشرب الماء، فنشعر بالنشاط. ماذا يحمي جسمنا؟",
      en: "We drink water to feel active. What keeps our body protected?",
    },
    options: [{ object: "shield" }, { object: "banana" }, { object: "star" }],
    answer: 0,
  },
  {
    category: "logic",
    prompt: {
      ar: "إذا كان لكل قمر نجمة، فكم نجمة نحتاج لقمرين؟",
      en: "If each moon has one star, how many stars do two moons need?",
    },
    options: [
      { label: { ar: "نجمة واحدة", en: "One star" } },
      { label: { ar: "نجمتان", en: "Two stars" } },
      { label: { ar: "ثلاث نجوم", en: "Three stars" } },
    ],
    answer: 1,
  },
  // ---- Memory ----
  {
    category: "memory",
    prompt: {
      ar: "تذكّر: ماء، تفاحة، قلب. أيها كان في الوسط؟",
      en: "Remember: water, apple, heart. Which one was in the middle?",
    },
    options: [{ object: "water" }, { object: "apple" }, { object: "heart" }],
    answer: 1,
  },
  {
    category: "memory",
    prompt: {
      ar: "تذكّر: نجمة، قمر، شمس، ورقة. أيها كان الأخير؟",
      en: "Remember: star, moon, sun, leaf. Which one was last?",
    },
    options: [{ object: "sun" }, { object: "leaf" }, { object: "star" }],
    answer: 1,
  },
  {
    category: "memory",
    prompt: {
      ar: "تذكّر: درع، جزرة. أيهما ظهر أولاً؟",
      en: "Remember: shield, carrot. Which appeared first?",
    },
    options: [{ object: "shield" }, { object: "carrot" }],
    answer: 0,
  },
  // ---- Attention ----
  {
    category: "attention",
    prompt: {
      ar: "كم قطرة ماء ترى في الصف؟",
      en: "How many water drops do you see in the row?",
    },
    sequence: ["water", "apple", "water", "water", "leaf"],
    options: [
      { label: { ar: "قطرتان", en: "Two" } },
      { label: { ar: "ثلاث قطرات", en: "Three" } },
      { label: { ar: "أربع قطرات", en: "Four" } },
    ],
    answer: 1,
  },
  {
    category: "attention",
    prompt: { ar: "أي عنصر يظهر مرتين؟", en: "Which object appears twice?" },
    sequence: ["star", "moon", "star", "heart", "leaf"],
    options: [{ object: "star" }, { object: "heart" }, { object: "leaf" }],
    answer: 0,
  },
  {
    category: "attention",
    prompt: { ar: "أي عنصر مفقود من المجموعة الصحية؟", en: "Which healthy object is missing here?" },
    sequence: ["apple", "carrot", "leaf"],
    options: [{ object: "moon" }, { object: "banana" }, { object: "star" }],
    answer: 1,
  },
  // ---- Shapes ----
  {
    category: "shapes",
    prompt: { ar: "أي شكل له خمسة أطراف؟", en: "Which object has five points?" },
    options: [{ object: "star" }, { object: "moon" }, { object: "water" }],
    answer: 0,
  },
  {
    category: "shapes",
    prompt: { ar: "أي شكل مستدير بالكامل؟", en: "Which object is fully round?" },
    options: [{ object: "sun" }, { object: "shield" }, { object: "leaf" }],
    answer: 0,
  },
  {
    category: "shapes",
    prompt: { ar: "أي شكل يشبه الهلال؟", en: "Which object looks like a crescent?" },
    options: [{ object: "moon" }, { object: "heart" }, { object: "carrot" }],
    answer: 0,
  },
];

// Safe, non-clinical result labels (overall), chosen by score percentage.
export const BC_RESULT_LABELS: { min: number; ar: string; en: string }[] = [
  { min: 90, ar: "نجم المنطق", en: "Logic Star" },
  { min: 70, ar: "بطل التركيز", en: "Focus Hero" },
  { min: 45, ar: "مفكر ذكي", en: "Smart Thinker" },
  { min: 0, ar: "مستكشف صغير", en: "Little Explorer" },
];

export function bcResultLabel(pct: number): { ar: string; en: string } {
  return BC_RESULT_LABELS.find((l) => pct >= l.min) ?? BC_RESULT_LABELS[BC_RESULT_LABELS.length - 1];
}

// Maps the five categories onto the three displayed skill levels.
export const BC_SKILL_MAP: Record<"memoryLevel" | "focusLevel" | "logicLevel", BCCategory[]> = {
  memoryLevel: ["memory"],
  focusLevel: ["attention", "shapes"],
  logicLevel: ["logic", "patterns"],
};

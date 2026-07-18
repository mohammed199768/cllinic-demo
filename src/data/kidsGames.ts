import type { ObjectId, Bi } from "./kidsGameObjects";

export type KidsGame = {
  id: string;
  href: string;
  object: ObjectId;
  title: Bi;
  desc: Bi;
  age: Bi;
  skills: Bi[];
  featured?: boolean;
};

export const KIDS_GAMES: KidsGame[] = [
  {
    id: "brain-challenge",
    href: "/kids/brain-challenge",
    object: "star",
    title: { ar: "تحدي الذكاء المرح", en: "Fun Brain Challenge" },
    desc: {
      ar: "جولات مرحة للذاكرة والأنماط والمنطق والانتباه والأشكال.",
      en: "Playful rounds for memory, patterns, logic, attention and shapes.",
    },
    age: { ar: "6–12 سنة", en: "Ages 6–12" },
    skills: [
      { ar: "الذاكرة", en: "Memory" },
      { ar: "المنطق", en: "Logic" },
      { ar: "الانتباه", en: "Attention" },
    ],
    featured: true,
  },
  {
    id: "memory-game",
    href: "/kids/memory-game",
    object: "heart",
    title: { ar: "لعبة الذاكرة الصحية", en: "Healthy Memory Game" },
    desc: { ar: "طابق البطاقات الصحية المتشابهة.", en: "Match the matching healthy cards." },
    age: { ar: "4–9 سنوات", en: "Ages 4–9" },
    skills: [
      { ar: "الذاكرة", en: "Memory" },
      { ar: "التركيز", en: "Focus" },
    ],
  },
  {
    id: "healthy-quiz",
    href: "/kids/healthy-quiz",
    object: "apple",
    title: { ar: "صح أم خطأ الصحي", en: "Healthy True or False" },
    desc: { ar: "أسئلة ممتعة عن العادات الصحية.", en: "Fun questions about healthy habits." },
    age: { ar: "5–10 سنوات", en: "Ages 5–10" },
    skills: [
      { ar: "المعرفة الصحية", en: "Health knowledge" },
      { ar: "التفكير", en: "Thinking" },
    ],
  },
  {
    id: "habit-sort",
    href: "/kids/habit-sort",
    object: "shield",
    title: { ar: "رتّب العادة الصحية", en: "Healthy Habit Sort" },
    desc: { ar: "افرز العادات الصحية وغير الصحية.", en: "Sort healthy from unhealthy habits." },
    age: { ar: "5–10 سنوات", en: "Ages 5–10" },
    skills: [
      { ar: "التصنيف", en: "Sorting" },
      { ar: "الوعي الصحي", en: "Health awareness" },
    ],
  },
  {
    id: "pattern-puzzle",
    href: "/kids/pattern-puzzle",
    object: "leaf",
    title: { ar: "لعبة الأنماط", en: "Pattern Puzzle" },
    desc: { ar: "اكتشف ما يأتي بعد التسلسل.", en: "Discover what comes next in the sequence." },
    age: { ar: "5–11 سنة", en: "Ages 5–11" },
    skills: [
      { ar: "الأنماط", en: "Patterns" },
      { ar: "المنطق", en: "Logic" },
    ],
  },
  {
    id: "spot-difference",
    href: "/kids/spot-difference",
    object: "soap",
    title: { ar: "أين الاختلاف؟", en: "Spot the Difference" },
    desc: { ar: "ابحث عن الشيء المختلف بين اللوحتين.", en: "Find the one different object between two panels." },
    age: { ar: "5–11 سنة", en: "Ages 5–11" },
    skills: [
      { ar: "الملاحظة", en: "Observation" },
      { ar: "التركيز", en: "Focus" },
    ],
  },
  {
    id: "shape-sequence",
    href: "/kids/shape-sequence",
    object: "moon",
    title: { ar: "تسلسل الأشكال", en: "Shape Sequence" },
    desc: { ar: "تذكّر الترتيب ثم كرّره.", en: "Remember the order, then repeat it." },
    age: { ar: "6–12 سنة", en: "Ages 6–12" },
    skills: [
      { ar: "الذاكرة العاملة", en: "Working memory" },
      { ar: "التسلسل", en: "Sequencing" },
    ],
  },
  {
    id: "focus-lab",
    href: "/kids/focus-lab",
    object: "water",
    title: { ar: "مختبر التركيز", en: "Focus Lab" },
    desc: { ar: "انقر العناصر الصحيحة فقط.", en: "Tap only the correct objects." },
    age: { ar: "5–11 سنة", en: "Ages 5–11" },
    skills: [
      { ar: "الانتباه", en: "Attention" },
      { ar: "الفلترة البصرية", en: "Visual filtering" },
    ],
  },
  {
    id: "healthy-maze",
    href: "/kids/healthy-maze",
    object: "tooth",
    title: { ar: "المتاهة الصحية", en: "Healthy Maze" },
    desc: { ar: "أرشد صديقنا إلى العادة الصحية.", en: "Guide our friend to the healthy habit." },
    age: { ar: "6–12 سنة", en: "Ages 6–12" },
    skills: [
      { ar: "التخطيط", en: "Planning" },
      { ar: "التفكير المكاني", en: "Spatial thinking" },
    ],
  },
  {
    id: "color-match",
    href: "/kids/color-match",
    object: "carrot",
    title: { ar: "مطابقة الألوان", en: "Color Match" },
    desc: { ar: "طابق كل عنصر صحي بلونه.", en: "Match each healthy object to its color." },
    age: { ar: "4–9 سنوات", en: "Ages 4–9" },
    skills: [
      { ar: "التصنيف", en: "Classification" },
      { ar: "التعلّم المبكر", en: "Early learning" },
    ],
  },
];

export const FEATURED_GAME = KIDS_GAMES.find((g) => g.featured)!;

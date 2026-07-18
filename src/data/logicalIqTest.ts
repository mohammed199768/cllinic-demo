/**
 * Logical Intelligence Test — deterministic multi-level generator.
 *
 * Adapted from the open-source "rpm-iq-exam" project (a Vite/React app that
 * procedurally generated Raven-style 3x3 matrix puzzles). That project used
 * Math.random for shape selection and option shuffling, reported a fake clinical
 * "IQ" number, and exposed 6 gamer-style levels (Beginner … AI) where the top
 * levels were largely fallbacks to lower generators plus one non-derivable
 * hyper-complex puzzle each.
 *
 * Here we KEEP the useful rule logic (size / rotation / tone / shape-sequence /
 * addition / double-rule / inverse-size / three-variable progressions) but:
 *   - drive every generator with a SEEDED PRNG so output is deterministic and
 *     reproducible (the same assessment every session — answers never drift),
 *   - construct each correct answer from the SAME rule used to build the matrix,
 *     so every question is logically solvable (we dropped the repo's
 *     non-derivable "Hell/Celestial/AI" fallback puzzles — see NOTE below),
 *   - consolidate into 4 mature, premium levels with clear difficulty.
 *
 * NOTE on dropped levels: repo levels 5–6 (and most of 4) re-called lower
 * generators or built multi-shape "answers" with no human-derivable rule, so
 * they are not useful assessment content. Their genuinely useful mechanics
 * (multi-attribute progressions, multi-shape relations) are preserved here in
 * Levels 3–4.
 *
 * IMPORTANT: recreational / educational visual-logic assessment. NOT an official
 * IQ test and NOT a psychological evaluation.
 */

export type IqShapeType =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "cross"
  | "star";

export type IqSize = "small" | "medium" | "large";

/** Theme-neutral tones rendered on white cells (deep-navy / blue / outline). */
export type IqTone = "solid" | "accent" | "outline";

export interface IqShape {
  type: IqShapeType;
  size: IqSize;
  tone: IqTone;
  rotation?: number;
  /** position inside the cell, 0..1 (defaults to centre) */
  x?: number;
  y?: number;
}

export interface IqPattern {
  shapes: IqShape[];
}

export interface IqQuestion {
  id: string;
  /** flat 3x3 grid (length 9); the last cell is always null (the missing one) */
  matrix: (IqPattern | null)[];
  options: IqPattern[];
  /** index into options of the correct answer */
  correct: number;
}

export interface IqLevel {
  id: number;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  questions: IqQuestion[];
}

/* ------------------------------------------------------------------ */
/* seeded PRNG (mulberry32) — deterministic, reproducible             */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rng = () => number;
const pick = <T,>(arr: readonly T[], rng: Rng): T => arr[Math.floor(rng() * arr.length)];

const SHAPES: IqShapeType[] = ["circle", "square", "triangle", "diamond", "cross", "star"];
const SIZES: IqSize[] = ["small", "medium", "large"];
const TONES: IqTone[] = ["outline", "accent", "solid"];

const sh = (
  type: IqShapeType,
  size: IqSize,
  tone: IqTone,
  rotation = 0,
  x = 0.5,
  y = 0.5
): IqShape => ({ type, size, tone, rotation, x, y });
const P = (...shapes: IqShape[]): IqPattern => ({ shapes });

/** Build a puzzle from a matrix, the correct pattern and distractors. */
interface RawPuzzle {
  matrix: (IqPattern | null)[];
  correct: IqPattern;
  distractors: IqPattern[];
}

function finalize(id: string, raw: RawPuzzle, rng: Rng): IqQuestion {
  const opts = [raw.correct, ...raw.distractors];
  // deterministic Fisher–Yates over indices, tracking where 0 (correct) lands
  const order = opts.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const options = order.map((i) => opts[i]);
  const correct = order.indexOf(0);
  return { id, matrix: raw.matrix, options, correct };
}

/* helpers for "next value in a cyclic list" used to build distractors */
const other = <T,>(arr: readonly T[], current: T, step = 1): T => {
  const i = arr.indexOf(current);
  return arr[(i + step + arr.length) % arr.length];
};

/* ------------------------------------------------------------------ */
/* rule generators (each builds matrix + correct from the SAME rule)  */
/* ------------------------------------------------------------------ */

// Latin square on a single attribute keyed to (row+col)
function genSize(rng: Rng): RawPuzzle {
  const type = pick(SHAPES.slice(0, 4), rng);
  const tone = pick(TONES, rng);
  const cell = (r: number, c: number) => P(sh(type, SIZES[(r + c) % 3], tone));
  const matrix: (IqPattern | null)[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) matrix.push(r === 2 && c === 2 ? null : cell(r, c));
  const correct = cell(2, 2); // SIZES[1] = medium
  return {
    matrix,
    correct,
    distractors: [
      P(sh(type, SIZES[0], tone)),
      P(sh(type, SIZES[2], tone)),
      P(sh(other(SHAPES, type), SIZES[1], tone)),
    ],
  };
}

function genRotation(rng: Rng): RawPuzzle {
  const type = pick(["triangle", "diamond", "star", "cross"] as IqShapeType[], rng);
  const tone = pick(["solid", "accent"] as IqTone[], rng);
  const rot = (r: number, c: number) => ((r + c) % 4) * 90;
  const cell = (r: number, c: number) => P(sh(type, "medium", tone, rot(r, c)));
  const matrix: (IqPattern | null)[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) matrix.push(r === 2 && c === 2 ? null : cell(r, c));
  const correct = cell(2, 2); // 0deg
  return {
    matrix,
    correct,
    distractors: [
      P(sh(type, "medium", tone, 90)),
      P(sh(type, "medium", tone, 180)),
      P(sh(type, "medium", tone, 270)),
    ],
  };
}

function genTone(rng: Rng): RawPuzzle {
  const type = pick(SHAPES.slice(0, 4), rng);
  const cell = (r: number, c: number) => P(sh(type, "medium", TONES[(r + c) % 3]));
  const matrix: (IqPattern | null)[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) matrix.push(r === 2 && c === 2 ? null : cell(r, c));
  const correct = cell(2, 2); // TONES[1] = accent
  return {
    matrix,
    correct,
    distractors: [
      P(sh(type, "medium", TONES[0])),
      P(sh(type, "medium", TONES[2])),
      P(sh(other(SHAPES, type), "medium", TONES[1])),
    ],
  };
}

function genShapeSeq(rng: Rng): RawPuzzle {
  // pick three distinct shapes
  const pool = [...SHAPES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const trio = pool.slice(0, 3);
  const tone = pick(["solid", "accent"] as IqTone[], rng);
  const cell = (r: number, c: number) => P(sh(trio[(r + c) % 3], "medium", tone));
  const matrix: (IqPattern | null)[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) matrix.push(r === 2 && c === 2 ? null : cell(r, c));
  const correct = cell(2, 2); // trio[1]
  return {
    matrix,
    correct,
    distractors: [P(sh(trio[0], "medium", tone)), P(sh(trio[2], "medium", tone)), P(sh(pool[3], "medium", tone))],
  };
}

// addition: third column = first + second (overlaid left/right)
function genAddition(rng: Rng, union = 2): RawPuzzle {
  const pool = [...SHAPES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const tone1: IqTone = "accent";
  const tone2: IqTone = "solid";
  const leftAt = (s: IqShapeType) => sh(s, "small", tone1, 0, 0.32, 0.5);
  const rightAt = (s: IqShapeType) => sh(s, "small", tone2, 0, 0.68, 0.5);
  // rows use rotating shape pairs
  const rows = union === 3 ? [
    [pool[0], pool[1], pool[2]],
    [pool[1], pool[2], pool[3]],
    [pool[2], pool[3], pool[4]],
  ] : [
    [pool[0], pool[1]],
    [pool[1], pool[2]],
    [pool[2], pool[3]],
  ];
  const matrix: (IqPattern | null)[] = [];
  for (let r = 0; r < 3; r++) {
    const row = rows[r];
    matrix.push(P(leftAt(row[0])));
    matrix.push(P(rightAt(row[1])));
    if (r === 2) matrix.push(null);
    else matrix.push(P(leftAt(row[0]), rightAt(row[1]), ...(union === 3 ? [sh(row[2], "small", tone1, 0, 0.5, 0.78)] : [])));
  }
  const last = rows[2];
  const correct = P(leftAt(last[0]), rightAt(last[1]), ...(union === 3 ? [sh(last[2], "small", tone1, 0, 0.5, 0.78)] : []));
  return {
    matrix,
    correct,
    distractors: [
      P(leftAt(last[0])),
      P(rightAt(last[1])),
      P(leftAt(last[1]), rightAt(last[0])),
    ],
  };
}

// double rule: size cycles + rotation increments, keyed to (row+col)
function genSizeRotation(rng: Rng): RawPuzzle {
  const type = pick(["diamond", "star", "triangle", "square"] as IqShapeType[], rng);
  const tone = pick(["accent", "solid"] as IqTone[], rng);
  const cell = (r: number, c: number) => sh(type, SIZES[(r + c) % 3], tone, ((r + c) % 4) * 45);
  const matrix: (IqPattern | null)[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) matrix.push(r === 2 && c === 2 ? null : P(cell(r, c)));
  const correct = P(cell(2, 2)); // medium, 180
  return {
    matrix,
    correct,
    distractors: [
      P(sh(type, SIZES[2], tone, 180)),
      P(sh(type, SIZES[1], tone, 135)),
      P(sh(type, SIZES[0], tone, 180)),
    ],
  };
}

// two shapes, inverse size: A grows, B shrinks with (row+col)
function genInverseSize(rng: Rng): RawPuzzle {
  const a = pick(["circle", "star"] as IqShapeType[], rng);
  const b = pick(["square", "diamond"] as IqShapeType[], rng);
  const A = (s: IqSize) => sh(a, s, "accent", 0, 0.33, 0.5);
  const B = (s: IqSize) => sh(b, s, "solid", 0, 0.7, 0.5);
  const cell = (r: number, c: number) => P(A(SIZES[(r + c) % 3]), B(SIZES[2 - ((r + c) % 3)]));
  const matrix: (IqPattern | null)[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) matrix.push(r === 2 && c === 2 ? null : cell(r, c));
  const correct = cell(2, 2); // both medium
  return {
    matrix,
    correct,
    distractors: [
      P(A("large"), B("large")),
      P(A("small"), B("small")),
      P(A("medium"), B("large")),
    ],
  };
}

// shape + tone paired, both keyed to (row+col)
function genToneShape(rng: Rng): RawPuzzle {
  const pool = [...SHAPES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const trio = pool.slice(0, 3);
  const cell = (r: number, c: number) => P(sh(trio[(r + c) % 3], "medium", TONES[(r + c) % 3]));
  const matrix: (IqPattern | null)[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) matrix.push(r === 2 && c === 2 ? null : cell(r, c));
  const correct = cell(2, 2); // trio[1], accent
  return {
    matrix,
    correct,
    distractors: [
      P(sh(trio[1], "medium", "solid")),
      P(sh(trio[0], "medium", "accent")),
      P(sh(trio[2], "medium", "outline")),
    ],
  };
}

// three variables together: size + tone + rotation, keyed to (row+col)
function genThreeVar(rng: Rng): RawPuzzle {
  const type = pick(["cross", "diamond", "star", "triangle"] as IqShapeType[], rng);
  const cell = (r: number, c: number) =>
    sh(type, SIZES[(r + c) % 3], TONES[(r + c) % 3], ((r + c) % 4) * 45);
  const matrix: (IqPattern | null)[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) matrix.push(r === 2 && c === 2 ? null : P(cell(r, c)));
  const correct = P(cell(2, 2)); // medium, accent, 180
  return {
    matrix,
    correct,
    distractors: [
      P(sh(type, "large", "accent", 180)),
      P(sh(type, "medium", "solid", 180)),
      P(sh(type, "medium", "accent", 135)),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* level composition                                                  */
/* ------------------------------------------------------------------ */
type Gen = (rng: Rng) => RawPuzzle;

interface LevelSpec {
  id: number;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  gens: Gen[];
}

const LEVEL_SPECS: LevelSpec[] = [
  {
    id: 1,
    nameAr: "ملاحظة الأنماط",
    nameEn: "Pattern Observation",
    descAr: "أنماط بسيطة بتحويل واحد واضح.",
    descEn: "Simple patterns with a single clear transformation.",
    gens: [genSize, genRotation, genTone, genShapeSeq, (r) => genAddition(r, 2)],
  },
  {
    id: 2,
    nameAr: "العلاقات البصرية",
    nameEn: "Visual Relationships",
    descAr: "قاعدتان معًا وعلاقات بين عدة أشكال.",
    descEn: "Two rules at once and relations between several shapes.",
    gens: [genSizeRotation, genInverseSize, genToneShape, (r) => genAddition(r, 2)],
  },
  {
    id: 3,
    nameAr: "المنطق المتقدم",
    nameEn: "Advanced Logic",
    descAr: "ثلاثة متغيرات تتغير في وقت واحد.",
    descEn: "Three variables changing at the same time.",
    gens: [genThreeVar, genSizeRotation, genInverseSize, genToneShape],
  },
  {
    id: 4,
    nameAr: "تحدي المصفوفات",
    nameEn: "Matrix Challenge",
    descAr: "تركيبات أكثر كثافة وجمع عناصر متعددة.",
    descEn: "Denser combinations and multi-element addition.",
    gens: [genThreeVar, (r) => genAddition(r, 3), genInverseSize],
  },
];

/**
 * Build the full deterministic assessment. Seeds are fixed, so the questions and
 * their answers are identical on every render and every session (reproducible).
 */
export function buildAssessment(): IqLevel[] {
  return LEVEL_SPECS.map((spec, li) => ({
    id: spec.id,
    nameAr: spec.nameAr,
    nameEn: spec.nameEn,
    descAr: spec.descAr,
    descEn: spec.descEn,
    questions: spec.gens.map((gen, qi) => {
      const seed = (li + 1) * 1000 + qi * 37 + 11;
      const rng = mulberry32(seed);
      return finalize(`l${spec.id}-q${qi + 1}`, gen(rng), rng);
    }),
  }));
}

export const IQ_ASSESSMENT: IqLevel[] = buildAssessment();
export const IQ_LEVEL_COUNT = IQ_ASSESSMENT.length;
export const IQ_TOTAL_QUESTIONS = IQ_ASSESSMENT.reduce((n, l) => n + l.questions.length, 0);
/** Estimated completion time in minutes (display only). */
export const IQ_ESTIMATED_MINUTES = 8;

/** Flattened question list with level metadata, in display order. */
export interface IqFlatQuestion {
  question: IqQuestion;
  levelId: number;
  levelNameAr: string;
  levelNameEn: string;
  /** 1-based index within the whole assessment */
  globalIndex: number;
}

export const IQ_FLAT_QUESTIONS: IqFlatQuestion[] = (() => {
  const out: IqFlatQuestion[] = [];
  let g = 0;
  for (const lvl of IQ_ASSESSMENT) {
    for (const q of lvl.questions) {
      g += 1;
      out.push({
        question: q,
        levelId: lvl.id,
        levelNameAr: lvl.nameAr,
        levelNameEn: lvl.nameEn,
        globalIndex: g,
      });
    }
  }
  return out;
})();

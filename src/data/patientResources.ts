/**
 * Typed template system for the printable Resource Library.
 *
 * Every resource is described by data and rendered by a single shared
 * component (`PrintableResource`). Table-style resources supply `columns` +
 * `rows`; form-style resources supply `fields`. This avoids ten near-identical
 * page components. All copy is bilingual and educational only.
 */

import type { Bilingual } from "@/types/health";

export type ResourceCategory =
  | "blood-pressure"
  | "blood-glucose"
  | "medications"
  | "visit"
  | "summary"
  | "card"
  | "labs"
  | "planner";

export interface ResourceColumn {
  header: Bilingual;
  /** Optional flex hint for wider columns (e.g. notes). */
  wide?: boolean;
}

export interface ResourceField {
  label: Bilingual;
  /** Number of blank writing lines to render under the label. Default 1. */
  lines?: number;
}

export interface PatientResource {
  slug: string;
  category: ResourceCategory;
  icon: string;
  title: Bilingual;
  description: Bilingual;
  intendedUse: Bilingual;
  /** Version + date label, e.g. "v1.0 · 2026". */
  version: string;
  instructions?: Bilingual;
  /** Table layout. */
  columns?: ResourceColumn[];
  rows?: number;
  /** Form layout. */
  fields?: ResourceField[];
  disclaimer: Bilingual;
}

const LOG_DISCLAIMER: Bilingual = {
  ar: "نموذج لتنظيم البيانات فقط. سجّل الأرقام كما ظهرت على جهازك دون تفسير، وشاركها مع طبيبك.",
  en: "An organization template only. Record numbers as shown on your device without interpretation, and share them with your doctor.",
};

const GENERAL_DISCLAIMER: Bilingual = {
  ar: "هذا النموذج لأغراض التنظيم والتثقيف العام ولا يُعد سجلًا طبيًا رسميًا أو تشخيصًا.",
  en: "This template is for organization and general education and is not an official medical record or diagnosis.",
};

const C = (ar: string, en: string, wide = false): ResourceColumn => ({
  header: { ar, en },
  wide,
});
const F = (ar: string, en: string, lines = 1): ResourceField => ({
  label: { ar, en },
  lines,
});

export const PATIENT_RESOURCES: PatientResource[] = [
  {
    slug: "blood-pressure-7-day",
    category: "blood-pressure",
    icon: "heart-pulse",
    title: { ar: "سجل ضغط الدم — 7 أيام", en: "7-Day Blood Pressure Log" },
    description: {
      ar: "جدول أسبوعي لتدوين قراءات الضغط صباحًا ومساءً.",
      en: "A weekly table to note morning and evening blood-pressure readings.",
    },
    intendedUse: {
      ar: "اطبعه واستخدمه لتدوين القراءات في الأوقات التي اتفقت عليها مع طبيبك.",
      en: "Print it and record readings at the times agreed with your clinician.",
    },
    version: "v1.0 · 2026",
    columns: [
      C("اليوم/التاريخ", "Day / Date"),
      C("الوقت", "Time"),
      C("الانقباضي", "Systolic"),
      C("الانبساطي", "Diastolic"),
      C("النبض", "Pulse"),
      C("ملاحظات", "Notes", true),
    ],
    rows: 14,
    disclaimer: LOG_DISCLAIMER,
  },
  {
    slug: "blood-pressure-30-day",
    category: "blood-pressure",
    icon: "heart-pulse",
    title: { ar: "سجل ضغط الدم — 30 يومًا", en: "30-Day Blood Pressure Log" },
    description: {
      ar: "جدول شهري لمتابعة قراءات الضغط على مدى شهر كامل.",
      en: "A monthly table to follow blood-pressure readings across a full month.",
    },
    intendedUse: {
      ar: "مناسب للمتابعة طويلة قبل موعد المراجعة.",
      en: "Suited for longer tracking before a follow-up appointment.",
    },
    version: "v1.0 · 2026",
    columns: [
      C("التاريخ", "Date"),
      C("الوقت", "Time"),
      C("الانقباضي", "Systolic"),
      C("الانبساطي", "Diastolic"),
      C("النبض", "Pulse"),
      C("ملاحظات", "Notes", true),
    ],
    rows: 30,
    disclaimer: LOG_DISCLAIMER,
  },
  {
    slug: "blood-glucose-7-day",
    category: "blood-glucose",
    icon: "droplet",
    title: { ar: "سجل سكر الدم — 7 أيام", en: "7-Day Blood Glucose Log" },
    description: {
      ar: "جدول أسبوعي لتدوين قياسات السكر وعلاقتها بالوجبات.",
      en: "A weekly table to note glucose readings and their meal context.",
    },
    intendedUse: {
      ar: "دوّن القيمة والوحدة وسياق الوجبة في كل مرة.",
      en: "Record the value, unit, and meal context each time.",
    },
    version: "v1.0 · 2026",
    columns: [
      C("التاريخ", "Date"),
      C("الوقت", "Time"),
      C("القيمة", "Reading"),
      C("الوحدة", "Unit"),
      C("سياق الوجبة", "Meal context"),
      C("ملاحظات", "Notes", true),
    ],
    rows: 14,
    disclaimer: LOG_DISCLAIMER,
  },
  {
    slug: "blood-glucose-30-day",
    category: "blood-glucose",
    icon: "droplet",
    title: { ar: "سجل سكر الدم — 30 يومًا", en: "30-Day Blood Glucose Log" },
    description: {
      ar: "جدول شهري لمتابعة قياسات السكر على مدى شهر.",
      en: "A monthly table to follow glucose readings across a month.",
    },
    intendedUse: {
      ar: "مناسب للمتابعة المنتظمة قبل الزيارة.",
      en: "Suited for regular tracking before your visit.",
    },
    version: "v1.0 · 2026",
    columns: [
      C("التاريخ", "Date"),
      C("الوقت", "Time"),
      C("القيمة", "Reading"),
      C("الوحدة", "Unit"),
      C("سياق الوجبة", "Meal context"),
      C("ملاحظات", "Notes", true),
    ],
    rows: 30,
    disclaimer: LOG_DISCLAIMER,
  },
  {
    slug: "medication-list",
    category: "medications",
    icon: "pill",
    title: { ar: "قائمة الأدوية", en: "Medication List" },
    description: {
      ar: "قائمة منظمة بأدويتك وجرعاتها ومواعيدها.",
      en: "An organized list of your medications, doses, and schedules.",
    },
    intendedUse: {
      ar: "احملها معك في كل زيارة أو عند مراجعة الصيدلية.",
      en: "Carry it to every visit or when reviewing at the pharmacy.",
    },
    version: "v1.0 · 2026",
    columns: [
      C("الدواء", "Medication", true),
      C("الجرعة", "Dose"),
      C("عدد المرات", "Frequency"),
      C("الأوقات", "Times"),
      C("الغرض", "Purpose", true),
    ],
    rows: 12,
    disclaimer: GENERAL_DISCLAIMER,
  },
  {
    slug: "appointment-preparation",
    category: "visit",
    icon: "clipboard",
    title: { ar: "ورقة التحضير للموعد", en: "Appointment Preparation Worksheet" },
    description: {
      ar: "أسئلة توجيهية تساعدك على ترتيب أفكارك قبل الزيارة.",
      en: "Guiding prompts to help you organize your thoughts before a visit.",
    },
    intendedUse: {
      ar: "املأها في البيت بهدوء قبل يوم الموعد.",
      en: "Fill it in calmly at home before appointment day.",
    },
    version: "v1.0 · 2026",
    fields: [
      F("ما أكثر ما ترغب بمناقشته؟", "What would you most like to discuss?", 2),
      F("الأعراض أو التغيّرات التي لاحظتها", "Symptoms or changes you've noticed", 3),
      F("متى بدأت؟", "When did they begin?", 1),
      F("أسئلتك للطبيب", "Your questions for the clinician", 3),
      F("أدوية تريد مراجعتها", "Medications to review", 2),
      F("تقارير أو فحوصات تحضرها معك", "Reports or tests to bring", 2),
      F("ما الذي يجعل الزيارة مفيدة لك؟", "What would make this visit useful?", 2),
    ],
    disclaimer: GENERAL_DISCLAIMER,
  },
  {
    slug: "weekly-chronic-care-planner",
    category: "planner",
    icon: "activity",
    title: { ar: "مخطط الرعاية المزمنة الأسبوعي", en: "Weekly Chronic-Care Planner" },
    description: {
      ar: "نظرة أسبوعية لتنظيم الأدوية والقياسات والملاحظات اليومية.",
      en: "A weekly view to organize medications, measurements, and daily notes.",
    },
    intendedUse: {
      ar: "استخدمه لتدوين جدولك وملاحظاتك اليومية في مكان واحد.",
      en: "Use it to note your schedule and daily observations in one place.",
    },
    version: "v1.0 · 2026",
    columns: [
      C("اليوم", "Day"),
      C("الأدوية", "Medications", true),
      C("القياسات", "Measurements", true),
      C("ملاحظات", "Notes", true),
    ],
    rows: 7,
    disclaimer: GENERAL_DISCLAIMER,
  },
  {
    slug: "doctor-visit-summary",
    category: "summary",
    icon: "file-text",
    title: { ar: "ملخص زيارة الطبيب", en: "Doctor Visit Summary" },
    description: {
      ar: "صفحة واحدة تجمع معلوماتك الأساسية لتأخذها إلى الطبيب.",
      en: "A one-page sheet gathering your key information to take to the doctor.",
    },
    intendedUse: {
      ar: "بديل مطبوع فارغ لملخص الطبيب الرقمي داخل الأداة.",
      en: "A blank printable alternative to the in-tool digital doctor summary.",
    },
    version: "v1.0 · 2026",
    fields: [
      F("الاسم (اختياري)", "Name (optional)", 1),
      F("تاريخ الميلاد (اختياري)", "Date of birth (optional)", 1),
      F("الأمراض المزمنة", "Chronic conditions", 2),
      F("الحساسية", "Allergies", 1),
      F("الأدوية الحالية", "Current medications", 3),
      F("أكثر ما يهمك اليوم", "Your main concern today", 2),
      F("أسئلتك", "Your questions", 3),
    ],
    disclaimer: GENERAL_DISCLAIMER,
  },
  {
    slug: "personal-medical-card",
    category: "card",
    icon: "shield",
    title: { ar: "بطاقة معلوماتي الطبية", en: "Personal Medical Information Card" },
    description: {
      ar: "بطاقة مختصرة بمعلوماتك الأساسية لحملها في محفظتك.",
      en: "A compact card of your essentials to keep in your wallet.",
    },
    intendedUse: {
      ar: "املأها واقصصها واحملها معك للطوارئ.",
      en: "Fill it in, cut it out, and carry it for emergencies.",
    },
    version: "v1.0 · 2026",
    fields: [
      F("الاسم", "Name", 1),
      F("فصيلة الدم (إن عُرفت)", "Blood type (if known)", 1),
      F("الأمراض المزمنة", "Chronic conditions", 1),
      F("الحساسية", "Allergies", 1),
      F("الأدوية الحالية", "Current medications", 2),
      F("جهة اتصال للطوارئ", "Emergency contact", 1),
    ],
    disclaimer: GENERAL_DISCLAIMER,
  },
  {
    slug: "lab-results-organizer",
    category: "labs",
    icon: "vial",
    title: { ar: "منظّم نتائج المختبر", en: "Laboratory Results Organizer" },
    description: {
      ar: "جدول لترتيب نتائج فحوصاتك حسب التاريخ.",
      en: "A table to arrange your test results by date.",
    },
    intendedUse: {
      ar: "انسخ القيم من تقاريرك؛ النطاق المرجعي مطبوع على تقرير المختبر.",
      en: "Copy values from your reports; the reference range is printed on your lab report.",
    },
    version: "v1.0 · 2026",
    columns: [
      C("التاريخ", "Date"),
      C("الفحص", "Test", true),
      C("النتيجة", "Result"),
      C("الوحدة", "Unit"),
      C("النطاق المرجعي", "Reference range"),
      C("ملاحظات", "Notes", true),
    ],
    rows: 16,
    disclaimer: GENERAL_DISCLAIMER,
  },
];

export function getResource(slug: string): PatientResource | undefined {
  return PATIENT_RESOURCES.find((r) => r.slug === slug);
}

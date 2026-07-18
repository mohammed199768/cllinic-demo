/**
 * Single source of truth for the Health Companion's localized copy.
 * All bilingual strings live here so no wording is duplicated across
 * components. Copy is operational/educational only — it contains no clinical
 * thresholds, diagnoses, or treatment advice.
 */

import type { Bilingual } from "@/types/health";

export const HEALTH_ROUTES = {
  hub: "/health-journey",
  bloodPressure: "/health-journey/blood-pressure",
  bloodGlucose: "/health-journey/blood-glucose",
  medications: "/health-journey/medications",
  visit: "/health-journey/visit-preparation",
  report: "/health-journey/report",
  downloads: "/health-journey/downloads",
} as const;

export const PRODUCT = {
  name: { ar: "رفيق صحتك", en: "Your Health Companion" } as Bilingual,
  label: {
    ar: "رحلتك الصحية مع عيادتنا",
    en: "Your Health Journey with OurClinic",
  } as Bilingual,
  brandMessage: {
    ar: "لأن صحتك لا تبدأ وتنتهي عند باب العيادة.",
    en: "Because your health does not begin and end at the clinic door.",
  } as Bilingual,
  navLabel: { ar: "رفيق صحتك", en: "Health Companion" } as Bilingual,
  navCta: {
    ar: "أدوات تساعدك بين زيارة وأخرى",
    en: "Tools that support you between visits",
  } as Bilingual,
};

export const HERO = {
  eyebrow: {
    ar: "مساحة مصممة لما بعد الزيارة",
    en: "Care beyond the clinic visit",
  } as Bilingual,
  headline: PRODUCT.brandMessage,
  description: {
    ar: "رفيق صحتك يمنحك أدوات بسيطة تساعدك على متابعة قياساتك، تنظيم أدويتك، والاستعداد لزيارتك القادمة دون إنشاء حساب أو إرسال بياناتك إلى أي جهة.",
    en: "Your Health Companion gives you simple tools to track measurements, organize medications, and prepare for your next visit without creating an account or sending your data anywhere.",
  } as Bilingual,
  primaryCta: {
    ar: "ابدأ رحلتك الصحية",
    en: "Start Your Health Journey",
  } as Bilingual,
  secondaryCta: {
    ar: "كيف نحمي خصوصيتك؟",
    en: "How is my privacy protected?",
  } as Bilingual,
};

export const JOURNEY_STEPS: Bilingual[] = [
  { ar: "الترحيب", en: "Welcome" },
  { ar: "اختر ما تحتاجه اليوم", en: "Choose what you need" },
  { ar: "افتح الأداة المناسبة", en: "Open the right tool" },
  { ar: "أكملها على مهلك", en: "Complete it at your pace" },
  { ar: "راجع معلوماتك", en: "Review your information" },
  { ar: "اطبع أو نزّل ملخصًا", en: "Print or download a summary" },
  { ar: "شاركها مع طبيبك", en: "Share it with your doctor" },
];

export interface Gateway {
  slug: string;
  href: string;
  icon: string;
  title: Bilingual;
  description: Bilingual;
}

export const GATEWAYS: Gateway[] = [
  {
    slug: "blood-pressure",
    href: HEALTH_ROUTES.bloodPressure,
    icon: "heart-pulse",
    title: { ar: "سجل ضغط الدم", en: "Blood Pressure Log" },
    description: {
      ar: "تابع قراءاتك في سجل واضح يمكنك طباعته وأخذه معك إلى الطبيب.",
      en: "Keep your readings in a clear record you can print and take to your doctor.",
    },
  },
  {
    slug: "blood-glucose",
    href: HEALTH_ROUTES.bloodGlucose,
    icon: "droplet",
    title: { ar: "سجل سكر الدم", en: "Blood Glucose Log" },
    description: {
      ar: "رتّب قياسات السكر حسب الوقت وعلاقتها بالوجبات دون تفسير أو تشخيص آلي.",
      en: "Organize glucose readings by time and meal context without automated diagnosis.",
    },
  },
  {
    slug: "medications",
    href: HEALTH_ROUTES.medications,
    icon: "pill",
    title: { ar: "أدويتي", en: "My Medications" },
    description: {
      ar: "احتفظ بقائمة مرتبة بأسماء أدويتك، جرعاتها، ومواعيدها.",
      en: "Keep an organized list of your medication names, doses, and schedules.",
    },
  },
  {
    slug: "visit-preparation",
    href: HEALTH_ROUTES.visit,
    icon: "clipboard",
    title: { ar: "استعد لزيارتك", en: "Prepare for Your Visit" },
    description: {
      ar: "اجمع أسئلتك، الأعراض التي تريد مناقشتها، والملفات التي لا تريد نسيانها.",
      en: "Collect your questions, concerns, and important details before the appointment.",
    },
  },
  {
    slug: "report",
    href: HEALTH_ROUTES.report,
    icon: "file-text",
    title: { ar: "ملخص للطبيب", en: "Doctor Summary" },
    description: {
      ar: "اجمع المعلومات التي اخترتها في صفحة واحدة واضحة وقابلة للطباعة.",
      en: "Bring selected information together in one clear, printable page.",
    },
  },
  {
    slug: "downloads",
    href: HEALTH_ROUTES.downloads,
    icon: "download",
    title: { ar: "مكتبة النماذج", en: "Resource Library" },
    description: {
      ar: "نزّل سجلات وخططًا جاهزة للطباعة والاستخدام اليومي.",
      en: "Download practical logs and planners for everyday use.",
    },
  },
];

/** The global education/safety disclaimer shown across the experience. */
export const GLOBAL_DISCLAIMER: Bilingual = {
  ar: "هذه الأدوات لأغراض التنظيم والتثقيف العام، ولا تقدم تشخيصًا أو خطة علاج ولا تُغني عن مراجعة الطبيب. لا تغيّر دواءك أو جرعته بناءً على هذه الأدوات.",
  en: "These tools are for organization and general education. They do not provide a diagnosis or treatment plan and do not replace medical consultation. Do not change medication or dosage based on these tools.",
};

/** Footer line printed on every generated summary/resource. */
export const SUMMARY_FOOTER: Bilingual = {
  ar: "أُعدّ هذا الملخص من البيانات التي أدخلها المستخدم، ولا يُعد سجلًا طبيًا رسميًا أو تشخيصًا.",
  en: "This summary was created from information entered by the user and is not an official medical record or diagnosis.",
};

export const PRIVACY = {
  headline: {
    ar: "بياناتك تبقى على جهازك",
    en: "Your data stays on your device",
  } as Bilingual,
  copy: {
    ar: "لا تحتاج إلى إنشاء حساب. القياسات والملاحظات التي تضيفها تُحفظ محليًا في هذا المتصفح، ولا تُرسل إلى عيادتنا أو أي خدمة خارجية.",
    en: "No account is required. Measurements and notes are stored locally in this browser and are not sent to OurClinic or any external service.",
  } as Bilingual,
  points: [
    {
      icon: "shield",
      title: { ar: "تخزين محلي", en: "Local storage" },
      body: {
        ar: "تُحفظ بياناتك في متصفح هذا الجهاز فقط باستخدام تخزين المتصفح المحلي، ولا تغادره.",
        en: "Your data is saved only in this device's browser using local browser storage, and never leaves it.",
      },
    },
    {
      icon: "activity",
      title: { ar: "إذا مُسحت بيانات المتصفح", en: "If browser data is cleared" },
      body: {
        ar: "حذف بيانات المتصفح أو استخدام وضع التصفح الخاص قد يمسح ما حفظته. احتفظ بنسخة احتياطية إن أردت الاستمرارية.",
        en: "Clearing browser data or using private browsing may erase what you saved. Keep a backup if you want continuity.",
      },
    },
    {
      icon: "download",
      title: { ar: "نسخة احتياطية", en: "Export a backup" },
      body: {
        ar: "يمكنك تنزيل نسخة JSON من بياناتك في أي وقت واستعادتها لاحقًا على نفس الجهاز أو جهاز آخر.",
        en: "You can download a JSON copy of your data anytime and restore it later on this or another device.",
      },
    },
    {
      icon: "trash",
      title: { ar: "حذف كامل", en: "Delete everything" },
      body: {
        ar: "زر واحد يمسح كل ما حفظته الأداة على هذا الجهاز، بعد تأكيد صريح منك.",
        en: "A single button erases everything the tool saved on this device, after an explicit confirmation.",
      },
    },
    {
      icon: "users",
      title: { ar: "الأجهزة المشتركة", en: "Shared devices" },
      body: {
        ar: "إذا كنت تستخدم جهازًا مشتركًا، تذكّر أن من يستخدم نفس المتصفح قد يرى بياناتك. احذفها بعد الانتهاء أو استخدم جهازك الخاص.",
        en: "On a shared device, anyone using the same browser may see your data. Delete it when done, or use your own device.",
      },
    },
    {
      icon: "lock",
      title: { ar: "بلا مزاعم أمنية", en: "No security claims" },
      body: {
        ar: "لا نطبّق تشفيرًا خاصًا ولا ندّعي أي امتثال تنظيمي. الحماية الأساسية هي أن البيانات لا تُرسل إلى أي خادم.",
        en: "We apply no special encryption and make no regulatory-compliance claims. The core protection is that data is never sent to any server.",
      },
    },
  ],
};

/** Per-tool helper + "what this tool cannot do" copy (operational, not clinical). */
export interface ToolGuide {
  helper: Bilingual;
  howTo: Bilingual[];
  limits: Bilingual[];
}

export const TOOL_GUIDES: Record<
  "bloodPressure" | "bloodGlucose" | "medications" | "visit" | "report",
  ToolGuide
> = {
  bloodPressure: {
    helper: {
      ar: "سجّل القياس كما ظهر على الجهاز. هذه الأداة ترتّب القراءات ولا تفسّرها طبيًا.",
      en: "Record the measurement exactly as displayed by your device. This tool organizes readings and does not interpret them medically.",
    },
    howTo: [
      {
        ar: "أدخل تاريخ ووقت القياس، ثم الرقم العلوي (الانقباضي) والرقم السفلي (الانبساطي).",
        en: "Enter the date and time, then the top (systolic) and bottom (diastolic) numbers.",
      },
      {
        ar: "أضف النبض والذراع ووضعية الجلوس إن رغبت، فهي حقول اختيارية.",
        en: "Optionally add pulse, arm, and body position — these fields are not required.",
      },
      {
        ar: "استخدم الطباعة أو التصدير لأخذ سجلك معك إلى الطبيب.",
        en: "Use print or export to take your record with you to the doctor.",
      },
    ],
    limits: [
      {
        ar: "لا تصنّف الأداة قراءاتك ولا تقول إنها طبيعية أو مرتفعة أو خطيرة.",
        en: "The tool does not classify your readings or call them normal, high, or dangerous.",
      },
      {
        ar: "المتوسطات المعروضة هي عمليات حسابية فقط وليست رأيًا طبيًا.",
        en: "The averages shown are arithmetic only, not a medical opinion.",
      },
    ],
  },
  bloodGlucose: {
    helper: {
      ar: "رتّب قياساتك بحسب الوقت وعلاقتها بالوجبات، ثم شارك السجل مع طبيبك عند الحاجة.",
      en: "Organize your readings by time and meal context, then share the record with your clinician when needed.",
    },
    howTo: [
      {
        ar: "اختر الوحدة التي يعرضها جهازك (mg/dL أو mmol/L) وأدخل القيمة كما ظهرت.",
        en: "Choose the unit your device shows (mg/dL or mmol/L) and enter the value as displayed.",
      },
      {
        ar: "حدّد سياق القياس: صائم، قبل الأكل، بعد الأكل، قبل النوم، أو غير ذلك.",
        en: "Select the context: fasting, before meal, after meal, bedtime, or other.",
      },
      {
        ar: "تبقى الوحدة محفوظة مع كل قراءة ولا تُحوَّل تلقائيًا.",
        en: "The unit is stored with each reading and is not converted automatically.",
      },
    ],
    limits: [
      {
        ar: "لا تصنّف الأداة القياس ولا تقترح طعامًا أو أنسولينًا أو تعديل دواء.",
        en: "The tool does not classify readings or suggest food, insulin, or medication changes.",
      },
      {
        ar: "عند اختلاف الوحدات في القراءات المحددة، لا تُحسب المتوسطات لتجنّب أرقام مضللة.",
        en: "When selected readings mix units, averages are not computed to avoid misleading numbers.",
      },
    ],
  },
  medications: {
    helper: {
      ar: "قائمة واحدة تساعدك على تذكّر ما تتناوله ومشاركته بوضوح أثناء الزيارة.",
      en: "One clear list to help you remember what you take and discuss it during your visit.",
    },
    howTo: [
      {
        ar: "أضف اسم الدواء، والجرعة، والوحدة، وعدد المرات، وأوقات التناول.",
        en: "Add the medication name, dose, unit, frequency, and times of day.",
      },
      {
        ar: "يمكنك تعطيل دواء توقفت عنه بدل حذفه للاحتفاظ بالسجل.",
        en: "You can deactivate a medication you stopped instead of deleting it, to keep the record.",
      },
    ],
    limits: [
      {
        ar: "الأداة للتوثيق فقط: لا توصي بدواء ولا بجرعة ولا تفحص التداخلات الدوائية.",
        en: "This tool is for documentation only: it does not recommend medicines or doses, or check interactions.",
      },
    ],
  },
  visit: {
    helper: {
      ar: "اكتب بهدوء ما يهمك مناقشته. تُحفظ إجاباتك محليًا ويمكنك تعديلها أو طباعتها لاحقًا.",
      en: "Calmly note what matters to you. Your answers save locally and can be edited or printed later.",
    },
    howTo: [
      {
        ar: "أجب عمّا تستطيع؛ كل الحقول اختيارية ولا حاجة لأي رقم وطني أو معلومات حساسة.",
        en: "Answer what you can; every field is optional and no national ID or sensitive information is needed.",
      },
      {
        ar: "حوّل إجاباتك إلى ملخص للطبيب بضغطة واحدة عند الانتهاء.",
        en: "Turn your answers into a doctor summary with one click when you're done.",
      },
    ],
    limits: [
      {
        ar: "هذه ورقة تحضير شخصية وليست استمارة طبية رسمية.",
        en: "This is a personal preparation sheet, not an official medical form.",
      },
    ],
  },
  report: {
    helper: {
      ar: "اختر الأقسام التي تريد تضمينها، ثم اطبع الصفحة أو احفظها PDF من نافذة الطباعة.",
      en: "Choose the sections to include, then print the page or save it as PDF from the print dialog.",
    },
    howTo: [
      {
        ar: "فعّل ما تريد إظهاره: الاسم، القياسات، الأدوية، وإجابات التحضير.",
        en: "Toggle what to show: name, measurements, medications, and preparation answers.",
      },
      {
        ar: "تُجمع كل المعلومات من هذا الجهاز فقط، ولا يُرسل أي شيء عند الطباعة.",
        en: "Everything is gathered from this device only, and nothing is sent when you print.",
      },
    ],
    limits: [
      {
        ar: "لا يحتوي الملخص على رمز QR لبيانات طبية ولا يُرفع إلى أي جهة.",
        en: "The summary contains no QR code with medical data and is never uploaded anywhere.",
      },
    ],
  },
};

"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import {
  IQ_TOTAL_QUESTIONS,
  IQ_LEVEL_COUNT,
  IQ_ESTIMATED_MINUTES,
} from "@/data/logicalIqTest";

type Assessment = {
  href: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  ctaAr: string;
  ctaEn: string;
};

const ASSESSMENTS: Assessment[] = [
  {
    href: "/know-yourself/iq-test",
    titleAr: "اختبار الذكاء المنطقي",
    titleEn: "Logical Intelligence Test",
    descAr:
      "اختبار بصري يعتمد على الأنماط والمصفوفات، يساعدك تلاحظ طريقة تفكيرك في حل المشكلات.",
    descEn:
      "A visual assessment based on patterns and matrices, designed to help you notice how you approach problem solving.",
    ctaAr: "ابدأ الاختبار",
    ctaEn: "Start Assessment",
  },
];

export default function KnowYourselfHub() {
  const { lang, t } = useLang();

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#FBF8F2] text-[#10203A]">
      {/* very light matrix motif */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.55] [background-image:linear-gradient(#10203A0a_1px,transparent_1px),linear-gradient(90deg,#10203A0a_1px,transparent_1px)] [background-size:62px_62px] [mask-image:radial-gradient(ellipse_72%_55%_at_50%_0%,black,transparent_72%)]" />

      <section className="container-x relative pt-16 pb-10 text-center sm:pt-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB]">
          {t("مساحة الاكتشاف الذاتي", "Self-Discovery Space")}
        </p>
        <h1 className="mt-4 text-display font-extrabold tracking-tight text-[#10203A]">
          {t("اعرف نفسك", "Know Yourself")}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lead text-[#5F6B7A]">
          {t(
            "مساحة تفاعلية تساعدك تكتشف طريقة تفكيرك وتركيزك من خلال اختبارات خفيفة وواضحة.",
            "An interactive space to explore how you think and focus through clear, lightweight assessments."
          )}
        </p>
      </section>

      <section className="container-x relative pb-8">
        <div className="mx-auto grid max-w-4xl gap-5">
          {ASSESSMENTS.map((a) => (
            <article
              key={a.href}
              className="group relative overflow-hidden rounded-3xl border border-[#E6DED2] bg-white p-7 shadow-[0_18px_50px_-30px_rgba(16,32,58,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/40 hover:shadow-[0_24px_60px_-30px_rgba(16,32,58,0.4)] sm:p-9"
            >
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#E6DED2] bg-[#EFF4FF] text-[#2563EB]">
                  <Icon name="activity" className="h-8 w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-h3 font-bold text-[#10203A]">
                    {lang === "ar" ? a.titleAr : a.titleEn}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#5F6B7A]">
                    {lang === "ar" ? a.descAr : a.descEn}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip icon="clock" text={t(`${IQ_ESTIMATED_MINUTES} دقائق`, `${IQ_ESTIMATED_MINUTES} min`)} />
                    <Chip icon="award" text={t(`${IQ_LEVEL_COUNT} مستويات`, `${IQ_LEVEL_COUNT} levels`)} />
                    <Chip icon="check" text={t(`${IQ_TOTAL_QUESTIONS} أسئلة`, `${IQ_TOTAL_QUESTIONS} questions`)} />
                    <Chip icon="user" text={t("16 سنة فأكثر", "Ages 16+")} />
                  </div>
                </div>
                <div className="shrink-0">
                  <Link
                    href={a.href}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] transition hover:bg-[#1d4ed8] sm:w-auto"
                  >
                    {lang === "ar" ? a.ctaAr : a.ctaEn}
                    <Icon name="chevron" className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {/* quiet placeholder for future assessments */}
          <div className="rounded-3xl border border-dashed border-[#E6DED2] bg-[#F3EFE7]/60 p-6 text-center">
            <p className="text-sm font-medium text-[#5F6B7A]">
              {t("اختبارات إضافية قريبًا.", "More assessments coming soon.")}
            </p>
          </div>
        </div>
      </section>

      <section className="container-x relative pb-20">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#E6DED2] bg-[#F3EFE7]/70 px-5 py-4 text-center">
          <p className="text-sm leading-relaxed text-[#5F6B7A]">
            {t(
              "هذه الاختبارات للتثقيف والمتعة فقط، ولا تغني عن أي تقييم متخصص عند الحاجة.",
              "These assessments are for learning and exploration only and do not replace professional evaluation when needed."
            )}
          </p>
        </div>
      </section>
    </div>
  );
}

function Chip({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E6DED2] bg-[#FBF8F2] px-3 py-1 text-xs font-medium text-[#5F6B7A]">
      <Icon name={icon} className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

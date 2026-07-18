"use client";

import { useLang } from "@/lib/i18n";
import { IqResult } from "@/lib/logicalIqScoring";
import Icon from "@/components/Icon";
import IqCertificateCard from "./IqCertificateCard";

export default function IqResultCard({
  result,
  name,
  onRetake,
}: {
  result: IqResult;
  name: string;
  onRetake: () => void;
}) {
  const { lang, t } = useLang();
  const dateLabel = new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const metrics = [
    {
      icon: "activity",
      label: t("مؤشر المنطق البصري", "Visual Logic Index"),
      value: lang === "ar" ? result.tier.visualLogicIndex.ar : result.tier.visualLogicIndex.en,
    },
    {
      icon: "shield",
      label: t("مستوى التركيز", "Focus Level"),
      value: lang === "ar" ? result.tier.focusLevel.ar : result.tier.focusLevel.en,
    },
    {
      icon: "brain",
      label: t("نمط حل المشكلات", "Problem-Solving Style"),
      value:
        lang === "ar" ? result.tier.problemSolvingStyle.ar : result.tier.problemSolvingStyle.en,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563EB]">
          {t("نتيجة الاختبار", "Assessment Result")}
        </p>
        <h2 className="mt-3 text-h2 font-extrabold text-[#10203A]">
          {lang === "ar" ? result.tier.label.ar : result.tier.label.en}
        </h2>

        {/* score ring */}
        <div className="relative mx-auto mt-6 grid h-40 w-40 place-items-center">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#ECE5D8" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#2563EB"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - result.percent / 100)}
              style={{ transition: "stroke-dashoffset 0.9s ease" }}
            />
          </svg>
          <div className="absolute text-center">
            <span className="block text-4xl font-extrabold text-[#10203A]">{result.percent}%</span>
            <span className="text-xs text-[#5F6B7A]">
              {result.correct}/{result.total} {t("صحيحة", "correct")}
            </span>
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-[#5F6B7A]">
          {lang === "ar" ? result.tier.message.ar : result.tier.message.en}
        </p>
      </div>

      {/* metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-2xl border border-[#E6DED2] bg-[#FBF8F2] p-4 text-center">
            <span className="mx-auto mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF4FF] text-[#2563EB]">
              <Icon name={m.icon} className="h-4 w-4" />
            </span>
            <p className="text-xs font-medium text-[#5F6B7A]">{m.label}</p>
            <p className="mt-1 text-sm font-bold text-[#10203A]">{m.value}</p>
          </div>
        ))}
      </div>

      {/* level performance */}
      <div>
        <p className="mb-3 text-sm font-bold text-[#10203A]">{t("أداء المستويات", "Level Performance")}</p>
        <div className="space-y-2.5">
          {result.levels.map((lv) => (
            <div key={lv.levelId} className="rounded-2xl border border-[#E6DED2] bg-white p-3.5">
              <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-[#10203A]">
                  {t(`المستوى ${lv.levelId}`, `Level ${lv.levelId}`)} ·{" "}
                  {lang === "ar" ? lv.nameAr : lv.nameEn}
                </span>
                <span className="shrink-0 font-bold text-[#2563EB]">
                  {lv.correct}/{lv.total}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ECE5D8]">
                <div
                  className="h-full rounded-full bg-[#0F766E]"
                  style={{ width: `${lv.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* certificate */}
      <div className="pt-2">
        <IqCertificateCard name={name} result={result} dateLabel={dateLabel} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onRetake}
          className="inline-flex items-center gap-2 rounded-full border border-[#E6DED2] bg-white px-5 py-2.5 text-sm font-semibold text-[#10203A] transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
        >
          <Icon name="arrow" className="h-4 w-4" />
          {t("أعد الاختبار", "Retake Assessment")}
        </button>
        <p className="max-w-md text-center text-[0.7rem] leading-relaxed text-[#9AA4B2]">
          {t(
            "هذا الاختبار ترفيهي وتعليمي، ولا يُعد اختبار ذكاء رسميًا أو تقييمًا نفسيًا معتمدًا.",
            "This assessment is for educational and recreational use only. It is not an official IQ test or a certified psychological evaluation."
          )}
        </p>
      </div>
    </div>
  );
}

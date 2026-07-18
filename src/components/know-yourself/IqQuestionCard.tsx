"use client";

import { IqQuestion } from "@/data/logicalIqTest";
import { useLang } from "@/lib/i18n";
import IqPattern from "./IqPattern";

export default function IqQuestionCard({
  question,
  selected,
  onSelect,
}: {
  question: IqQuestion;
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const { t } = useLang();

  return (
    <div className="space-y-7">
      {/* Matrix */}
      <div>
        <h2 className="mb-4 text-center text-base font-semibold text-[#10203A]">
          {t("اختر الشكل الذي يكمل النمط", "Choose the shape that completes the pattern")}
        </h2>
        <div className="mx-auto grid w-full max-w-[19rem] grid-cols-3 gap-2.5 sm:max-w-[21rem] sm:gap-3">
          {question.matrix.map((cell, i) => (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-xl border p-1.5 ${
                cell === null
                  ? "border-2 border-dashed border-[#2563EB]/40 bg-[#F3EFE7]"
                  : "border-[#E6DED2] bg-white"
              }`}
            >
              {cell ? (
                <IqPattern pattern={cell} />
              ) : (
                <span className="text-2xl font-bold text-[#2563EB]/60">؟</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <h3 className="mb-3 text-center text-sm font-semibold text-[#5F6B7A]">
          {t("اختر الإجابة الأقرب", "Choose the best answer")}
        </h3>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
          {question.options.map((option, i) => {
            const active = selected === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={active}
                className={`group relative flex aspect-square items-center justify-center rounded-xl border p-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF8F2] ${
                  active
                    ? "border-[#2563EB] bg-[#EFF4FF] ring-2 ring-[#2563EB]/30"
                    : "border-[#E6DED2] bg-white hover:-translate-y-0.5 hover:border-[#2563EB]/50 hover:shadow-[0_8px_24px_-12px_rgba(16,32,58,0.25)]"
                }`}
              >
                <span
                  className={`absolute top-1.5 text-[0.65rem] font-bold ltr:left-2 rtl:right-2 ${
                    active ? "text-[#2563EB]" : "text-[#9AA4B2]"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <IqPattern pattern={option} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

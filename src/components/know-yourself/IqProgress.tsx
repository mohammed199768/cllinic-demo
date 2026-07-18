"use client";

import { useLang } from "@/lib/i18n";

export default function IqProgress({
  current,
  total,
}: {
  current: number; // 1-based index of current question
  total: number;
}) {
  const { t } = useLang();
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#5F6B7A]">
        <span>
          {t("سؤال", "Question")}{" "}
          <span className="text-[#10203A]">
            {current} / {total}
          </span>
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[#ECE5D8]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#2563EB] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

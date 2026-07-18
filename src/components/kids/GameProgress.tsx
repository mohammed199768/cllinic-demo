"use client";
import { useLang } from "@/lib/i18n";

/** Accessible progress bar + round counter for kids games. */
export default function GameProgress({
  current,
  total,
  labelAr = "جولة",
  labelEn = "Round",
}: {
  current: number; // 1-based
  total: number;
  labelAr?: string;
  labelEn?: string;
}) {
  const { t } = useLang();
  const pct = Math.max(0, Math.min(100, (current / total) * 100));
  return (
    <div className="mx-auto mb-6 max-w-md">
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-navy-600">
        <span>
          {t(labelAr, labelEn)} {current}/{total}
        </span>
      </div>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-navy-100"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={t(labelAr, labelEn)}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-brand-500 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

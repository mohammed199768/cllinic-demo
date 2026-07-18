"use client";

import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";

export interface TrendStat {
  label: string;
  value: string;
  hint?: string;
}

/**
 * Displays plain arithmetic summaries of the selected readings. A standing note
 * makes clear these are mathematical summaries, not clinical interpretations —
 * no value is ever labelled normal, high, low, safe, or dangerous.
 */
export default function TrendSummary({
  stats,
  note,
}: {
  stats: TrendStat[];
  note?: string;
}) {
  const { t } = useLang();

  return (
    <section
      aria-label={t("ملخص حسابي", "Arithmetic summary")}
      className="rounded-3xl border border-navy-100 bg-white p-6 shadow-xs"
    >
      <div className="flex items-center gap-2">
        <Icon name="activity" className="h-5 w-5 text-brand-500" />
        <h2 className="text-h3 font-bold text-navy-900">
          {t("ملخص حسابي", "Arithmetic summary")}
        </h2>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-navy-500">
        {t(
          "هذه أرقام حسابية للقراءات المحددة فقط، وليست تفسيرًا طبيًا.",
          "These are arithmetic figures for the selected readings only, not a medical interpretation.",
        )}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-navy-100 bg-cloud/60 p-4">
            <dt className="text-xs font-semibold text-navy-500">{s.label}</dt>
            <dd className="mt-1 text-xl font-extrabold tracking-tight text-navy-900">
              {s.value}
            </dd>
            {s.hint && <p className="mt-0.5 text-[11px] text-navy-400">{s.hint}</p>}
          </div>
        ))}
      </dl>

      {note && (
        <p className="mt-4 rounded-xl bg-cloud px-3 py-2 text-xs leading-relaxed text-navy-500">
          {note}
        </p>
      )}
    </section>
  );
}

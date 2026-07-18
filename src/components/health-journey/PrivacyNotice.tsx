"use client";

import Icon from "@/components/Icon";
import { useLang } from "@/lib/i18n";
import { PRIVACY } from "@/data/healthJourneyContent";
import type { Bilingual } from "@/types/health";

export default function PrivacyNotice({ detailed = false }: { detailed?: boolean }) {
  const { lang } = useLang();
  const L = (value: Bilingual) => (lang === "ar" ? value.ar : value.en);

  return (
    <section id="privacy" className="scroll-mt-24 rounded-4xl border border-brand-100 bg-brand-50/70 p-6 shadow-soft sm:p-8">
      <div className="flex items-start gap-4">
        <span className="icon-pad h-12 w-12 shrink-0 bg-white">
          <Icon name="shield" className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-h2 font-extrabold text-navy-900">{L(PRIVACY.headline)}</h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-navy-600">{L(PRIVACY.copy)}</p>
        </div>
      </div>
      {detailed && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRIVACY.points.map((point) => (
            <article key={point.title.en} className="rounded-2xl border border-white bg-white/80 p-4">
              <Icon name={point.icon} className="h-5 w-5 text-brand-600" />
              <h3 className="mt-3 font-bold text-navy-900">{L(point.title)}</h3>
              <p className="mt-1 text-sm leading-relaxed text-navy-600">{L(point.body)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import {
  GLOBAL_DISCLAIMER,
  HEALTH_ROUTES,
  PRIVACY,
  PRODUCT,
  type ToolGuide,
} from "@/data/healthJourneyContent";
import type { Bilingual } from "@/types/health";

/**
 * Shared layout for every tool page: a calm header with a back link to the
 * hub, the tool title + operational helper text, the tool body, and the global
 * education disclaimer. Keeps chrome consistent and DRY across tools.
 */
export default function HealthToolShell({
  icon,
  title,
  helper,
  children,
}: {
  icon: string;
  title: Bilingual;
  helper: Bilingual;
  children: React.ReactNode;
}) {
  const { lang, t } = useLang();
  const L = (b: Bilingual) => (lang === "ar" ? b.ar : b.en);

  return (
    <div className="min-h-screen">
      <div className="no-print relative overflow-hidden border-b border-navy-100/60 bg-white/50">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="container-x relative py-10 sm:py-12">
          <Link
            href={HEALTH_ROUTES.hub}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-navy-500 transition hover:text-brand-700"
          >
            <Icon name="chevron" className="h-4 w-4 rotate-180 rtl:rotate-0" />
            {L(PRODUCT.name)}
          </Link>
          <div className="mt-4 flex items-start gap-4">
            <span className="icon-pad h-14 w-14 shrink-0">
              <Icon name={icon} className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-h1 font-extrabold text-navy-900">{L(title)}</h1>
              <p className="mt-2 max-w-2xl text-navy-600">{L(helper)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x py-10 sm:py-12">{children}</div>

      <div className="no-print container-x pb-16">
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3">
          <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-xs leading-relaxed text-navy-700"><strong>{L(PRIVACY.headline)}.</strong> {L(PRIVACY.copy)}</p>
        </div>
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          {t(GLOBAL_DISCLAIMER.ar, GLOBAL_DISCLAIMER.en)}
        </p>
      </div>
    </div>
  );
}

/** Contextual "how to use / what it can't do" panel for a tool. */
export function ToolGuidePanel({ guide }: { guide: ToolGuide }) {
  const { lang, t } = useLang();
  const L = (b: Bilingual) => (lang === "ar" ? b.ar : b.en);

  return (
    <aside className="card-clinical h-fit rounded-3xl p-6">
      <h2 className="flex items-center gap-2 text-h3 font-bold text-navy-900">
        <Icon name="clipboard" className="h-5 w-5 text-brand-500" />
        {t("كيف تستخدم هذه الأداة", "How to use this tool")}
      </h2>
      <ol className="mt-4 space-y-3">
        {guide.howTo.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-navy-600">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
              {i + 1}
            </span>
            {L(step)}
          </li>
        ))}
      </ol>

      <h3 className="mt-6 flex items-center gap-2 text-sm font-bold text-navy-800">
        <Icon name="shield" className="h-4 w-4 text-navy-400" />
        {t("ما لا تقوم به الأداة", "What this tool does not do")}
      </h3>
      <ul className="mt-3 space-y-2">
        {guide.limits.map((limit, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-navy-500">
            <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-300" />
            {L(limit)}
          </li>
        ))}
      </ul>
    </aside>
  );
}

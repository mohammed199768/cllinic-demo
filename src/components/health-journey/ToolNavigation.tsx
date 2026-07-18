"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { useLang } from "@/lib/i18n";
import { GATEWAYS } from "@/data/healthJourneyContent";

export default function ToolNavigation({ current }: { current: string }) {
  const { lang, t } = useLang();
  const siblings = GATEWAYS.filter((item) => item.slug !== current).slice(0, 3);
  return (
    <nav aria-label={t("أدوات أخرى", "Other tools")} className="no-print mt-12 border-t border-navy-100 pt-8">
      <h2 className="text-h3 font-bold text-navy-900">{t("تابع رحلتك", "Continue your journey")}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {siblings.map((item) => (
          <Link key={item.slug} href={item.href} className="group flex min-h-16 items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 font-semibold text-navy-800 shadow-xs transition hover:border-brand-200 hover:text-brand-700">
            <span className="icon-pad h-10 w-10 shrink-0"><Icon name={item.icon} className="h-5 w-5" /></span>
            <span>{lang === "ar" ? item.title.ar : item.title.en}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

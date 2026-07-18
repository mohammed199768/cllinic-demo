"use client";

import BrandMark from "@/components/BrandMark";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/health-format";

export default function HealthPrintHeader({ title }: { title: string }) {
  const { lang, t } = useLang();
  return (
    <header className="mb-6 flex items-end justify-between gap-5 border-b-2 border-brand-600 pb-4">
      <div>
        <BrandMark subtitle />
        <h1 className="mt-4 text-2xl font-extrabold text-navy-900">{title}</h1>
      </div>
      <p className="text-end text-xs text-navy-500">
        {t("تاريخ الطباعة", "Print date")}<br />
        <span className="font-semibold text-navy-800">{formatDate(new Date().toISOString(), lang)}</span>
      </p>
    </header>
  );
}

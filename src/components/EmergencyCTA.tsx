"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Icon from "./Icon";

export default function EmergencyCTA({
  variant = "button",
  className = "",
}: {
  variant?: "button" | "banner";
  className?: string;
}) {
  const { t } = useLang();
  if (variant === "banner") {
    return (
      <div className={["card-elevated relative overflow-hidden p-1", className].filter(Boolean).join(" ")}>
        <div className="relative flex flex-col items-center gap-5 px-6 py-6 sm:flex-row sm:justify-between sm:px-8">
          <div className="flex items-center gap-4 text-center sm:text-start">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <Icon name="clock" className="h-6 w-6" />
            </span>
            <div>
              <p className="text-lg font-extrabold text-navy-900">{t("معلومات الرعاية العاجلة", "Urgent care information")}</p>
              <p className="text-sm text-navy-500">{t("تأكد من التوفر قبل الحضور، واتصل بالطوارئ المحلية عند الخطر.", "Confirm availability before visiting; call local emergency services when life is at risk.")}</p>
            </div>
          </div>
          <Link href="/emergency" className="btn-primary px-6 py-3">
            <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" /> {t("التفاصيل", "Details")}
          </Link>
        </div>
      </div>
    );
  }
  return (
    <Link href="/emergency" className={["btn-primary", className].filter(Boolean).join(" ")}>
      <Icon name="clock" className="h-4 w-4" />
      {t("معلومات الرعاية", "Care information")}
    </Link>
  );
}

"use client";
import { useLang } from "@/lib/i18n";

export default function DisclaimerNote({ compact = false }: { compact?: boolean }) {
  const { lang } = useLang();
  const ar =
    "هذا المحتوى لأغراض تثقيفية عامة ولا يُعدّ تشخيصاً أو بديلاً عن مراجعة الطبيب المختص.";
  const en =
    "This content is for general education only and is not a diagnosis or a substitute for seeing a qualified doctor.";
  return (
    <p
      className={`rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-amber-800 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      {lang === "ar" ? ar : en}
    </p>
  );
}

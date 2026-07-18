"use client";
import { useLang } from "@/lib/i18n";

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`inline-flex items-center rounded-full border border-brand-100 bg-white p-1 text-xs font-bold ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        onClick={() => setLang("ar")}
        className={`rounded-full px-3 py-1 transition ${
          lang === "ar" ? "bg-brand-600 text-white" : "text-brand-700"
        }`}
        aria-pressed={lang === "ar"}
      >
        ع
      </button>
      <button
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1 transition ${
          lang === "en" ? "bg-brand-600 text-white" : "text-brand-700"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}

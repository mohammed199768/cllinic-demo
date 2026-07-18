"use client";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { whatsappHref } from "@/lib/clinic";
import Icon from "./Icon";

type Bi = { ar: string; en: string };
type Tip = {
  id: string; category: string;
  title: Bi; hook: Bi; points: Bi[];
  whenToVisit: Bi; cta: Bi; disclaimer: Bi;
};

const CAT_LABEL: Record<string, Bi> = {
  children: { ar: "الأطفال", en: "Children" },
  diabetes: { ar: "السكري والضغط", en: "Diabetes & BP" },
  vitamins: { ar: "الفيتامينات", en: "Vitamins" },
  emergency: { ar: "الطوارئ", en: "Emergency" },
  home: { ar: "الزيارات المنزلية", en: "Home Visits" },
  lab: { ar: "الفحوصات", en: "Lab Tests" },
};

export default function MedicalTipCard({ tip }: { tip: Tip }) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const L = (b: Bi) => (lang === "ar" ? b.ar : b.en);
  const cat = CAT_LABEL[tip.category] ?? { ar: "نصيحة", en: "Tip" };

  return (
    <article className="group card-elevated flex flex-col p-6">
      <div className="flex items-center justify-between">
        <span className="chip">{L(cat)}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-navy-400">
          <Icon name="clock" className="h-3.5 w-3.5" /> {t("قراءة دقيقة", "1 min read")}
        </span>
      </div>
      <h3 className="mt-4 text-h3 font-bold text-navy-900">{L(tip.title)}</h3>
      <p className="mt-2 text-sm leading-relaxed text-navy-500">{L(tip.hook)}</p>

      {open && (
        <div className="mt-4 animate-fadeUp space-y-3 border-t border-navy-100 pt-4">
          <ul className="space-y-2">
            {tip.points.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-mint-500" />
                <span>{L(p)}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-navy-700">
            <span className="font-bold text-brand-700">{t("متى تزور المركز؟ ", "When to visit? ")}</span>
            {L(tip.whenToVisit)}
          </div>
          <p className="text-xs text-amber-700">{L(tip.disclaimer)}</p>
          <a href={whatsappHref(L(tip.title))} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full text-sm">
            <Icon name="whatsapp" className="h-4 w-4" /> {L(tip.cta)}
          </a>
        </div>
      )}

      <button onClick={() => setOpen((v) => !v)} className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-600">
        {open ? t("إخفاء", "Hide") : t("اقرأ المزيد", "Read more")}
        <Icon name="chevron" className={`h-4 w-4 transition ${open ? "rotate-90" : "rtl:rotate-180"}`} />
      </button>
    </article>
  );
}

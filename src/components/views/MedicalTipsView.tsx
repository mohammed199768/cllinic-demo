"use client";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import SectionShell from "@/components/SectionShell";
import MedicalTipCard from "@/components/MedicalTipCard";
import DisclaimerNote from "@/components/DisclaimerNote";
import tips from "@/data/medicalTips.json";
import { HealthCompanionBridge } from "@/components/health-journey/HealthCompanionBridge";

const CATS = [
  { id: "all", ar: "الكل", en: "All" },
  { id: "children", ar: "الأطفال", en: "Children" },
  { id: "diabetes", ar: "السكري والضغط", en: "Diabetes & BP" },
  { id: "vitamins", ar: "الفيتامينات", en: "Vitamins" },
  { id: "emergency", ar: "الطوارئ", en: "Emergency" },
  { id: "lab", ar: "الفحوصات", en: "Lab Tests" },
];

export default function MedicalTipsView() {
  const { lang } = useLang();
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? tips : tips.filter((t) => t.category === cat);
  return (
    <>
      <PageHeader ar="نصائح طبية" en="Medical Tips" subAr="معلومات تثقيفية مبسّطة تساعدك على العناية بنفسك وعائلتك." subEn="Simple educational tips to help you care for yourself and your family." icon="activity" />
      <SectionShell>
        <HealthCompanionBridge source="tips" />
        <div className="mb-7 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c.id ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
              {lang === "ar" ? c.ar : c.en}
            </button>
          ))}
        </div>
        <div className="mb-6"><DisclaimerNote /></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tip) => <MedicalTipCard key={tip.id} tip={tip} />)}
        </div>
      </SectionShell>
    </>
  );
}

"use client";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import SectionShell from "@/components/SectionShell";
import Icon from "@/components/Icon";
import faqs from "@/data/faqs.json";

export default function FaqView() {
  const { lang } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <PageHeader ar="الأسئلة الشائعة" en="Frequently Asked Questions" icon="message" />
      <SectionShell>
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 p-5 text-start">
                <span className="font-bold text-ink">{lang === "ar" ? f.q.ar : f.q.en}</span>
                <Icon name="arrow" className={`h-5 w-5 shrink-0 text-brand-500 transition ${open === i ? "rotate-90" : ""}`} />
              </button>
              {open === i && <div className="animate-fadeUp px-5 pb-5 text-sm leading-relaxed text-slate-600">{lang === "ar" ? f.a.ar : f.a.en}</div>}
            </div>
          ))}
        </div>
      </SectionShell>
    </>
  );
}

"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import SectionShell from "@/components/SectionShell";
import Icon from "@/components/Icon";
import stories from "@/data/bedtimeStories.json";

export default function BedtimeListView() {
  const { lang, t } = useLang();
  return (
    <>
      <PageHeader ar="حكايات المساء" en="Evening Stories" subAr="حكايات لطيفة تهدّئ صغارنا قبل النوم." subEn="Gentle tales to calm our little ones before sleep." emoji="🌙" playful />
      <SectionShell>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <Link key={s.slug} href={`/bedtime-stories/${s.slug}`} className="card overflow-hidden transition-transform hover:-translate-y-1">
              <div className="flex h-36 items-center justify-center text-6xl" style={{ background: s.color }}>{s.emoji}</div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-ink">{lang === "ar" ? s.title.ar : s.title.en}</h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span className="chip">{lang === "ar" ? s.mood.ar : s.mood.en}</span>
                  <span className="flex items-center gap-1"><Icon name="clock" className="h-3.5 w-3.5" /> {s.duration}</span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">{t("اقرأ الحكاية", "Read the story")} <Icon name="arrow" className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </SectionShell>
    </>
  );
}

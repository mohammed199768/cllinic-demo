"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import SectionShell from "@/components/SectionShell";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import StoryDialog from "@/components/daily-stories/StoryDialog";
import { DAILY_STORIES, getStory, type DailyStory } from "@/data/dailyStories";
import { CLINIC_PHOTOS } from "@/data/clinicMedia";
import { HealthCompanionBridge } from "@/components/health-journey/HealthCompanionBridge";

export default function DailyStoriesView() {
  const { lang, t } = useLang();
  const L = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Deep-linking via ?story=slug, managed with the History API (no full reload).
  useEffect(() => {
    const readSlug = () => {
      const s = new URLSearchParams(window.location.search).get("story");
      return s && getStory(s) ? s : null;
    };
    setActiveSlug(readSlug());
    const onPop = () => setActiveSlug(readSlug());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openStory = useCallback((slug: string) => {
    window.history.pushState({ story: slug }, "", `?story=${slug}`);
    setActiveSlug(slug);
  }, []);

  const closeStory = useCallback(() => {
    if (new URLSearchParams(window.location.search).get("story")) {
      window.history.pushState({}, "", window.location.pathname);
    }
    setActiveSlug(null);
  }, []);

  const featured = DAILY_STORIES.find((s) => s.featured) ?? DAILY_STORIES[0];
  const rest = DAILY_STORIES.filter((s) => s.slug !== featured.slug);
  const active = getStory(activeSlug);

  return (
    <>
      <PageHeader
        ar="قصص من تفاصيل يومنا"
        en="Stories from Everyday Care"
        subAr="حكايات إنسانية وتوعوية تذكّرنا أن العناية تبدأ أحيانًا من ملاحظة صغيرة."
        subEn="Human-centered educational stories that remind us how care can begin with one small observation."
        icon="quote"
      />

      <SectionShell>
        <HealthCompanionBridge source="stories" />
        {/* Featured story */}
        <Reveal>
          <button
            type="button"
            onClick={() => openStory(featured.slug)}
            className="group card-elevated grid w-full overflow-hidden text-start md:grid-cols-2"
          >
            <div className="relative aspect-[16/10] w-full md:aspect-auto md:h-full md:min-h-[280px]">
              <Image
                src={CLINIC_PHOTOS[featured.imageId].src}
                alt={L(CLINIC_PHOTOS[featured.imageId].alt)}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brand-700 backdrop-blur ltr:left-3 rtl:right-3">
                {t("قصة مميّزة", "Featured story")}
              </span>
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-9">
              <span className="text-xs font-bold uppercase tracking-wide text-brand-600">{L(featured.category)}</span>
              <h2 className="mt-2 text-h2 font-extrabold text-navy-900">{L(featured.title)}</h2>
              <p className="mt-3 text-navy-500">{L(featured.excerpt)}</p>
              <div className="mt-5 flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  {t("اقرأ القصة", "Read Story")} <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />
                </span>
                <span className="text-xs font-semibold text-navy-400">{L(featured.readingTime)}</span>
              </div>
            </div>
          </button>
        </Reveal>

        {/* Story grid */}
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((s: DailyStory, i) => (
            <Reveal key={s.slug} delay={(i % 3) as 0 | 1 | 2}>
              <button
                type="button"
                onClick={() => openStory(s.slug)}
                className="group card-elevated flex h-full w-full flex-col overflow-hidden text-start"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={CLINIC_PHOTOS[s.imageId].src}
                    alt={L(CLINIC_PHOTOS[s.imageId].alt)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brand-700 backdrop-blur ltr:left-3 rtl:right-3">
                    {L(s.category)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-h3 font-bold text-navy-900">{L(s.title)}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">{L(s.excerpt)}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                      {t("اقرأ القصة", "Read Story")} <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />
                    </span>
                    <span className="text-xs font-semibold text-navy-400">{L(s.readingTime)}</span>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-navy-400">
          {t(
            "مواقف توعوية مستوحاة من تفاصيل الحياة اليومية.",
            "Educational stories inspired by everyday situations.",
          )}
        </p>
      </SectionShell>

      {active && <StoryDialog story={active} onClose={closeStory} />}
    </>
  );
}

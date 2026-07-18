"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import FlipbookStory from "@/components/FlipbookStory";
import Icon from "@/components/Icon";

type Page = { ar: string; en: string; emoji: string; bg: string };
type Story = { slug: string; color: string; emoji: string; title: { ar: string; en: string }; mood: { ar: string; en: string }; duration: string; pages: Page[] };

export default function BedtimeReaderView({ story }: { story: Story }) {
  const { lang, t } = useLang();
  const [reading, setReading] = useState(false);
  const [music, setMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) { setMusic((m) => !m); return; }
    if (music) a.pause(); else a.play().catch(() => {});
    setMusic((m) => !m);
  };

  return (
    <div className="container-x py-10">
      <Link href="/bedtime-stories" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
        <Icon name="arrow" className="h-4 w-4 rotate-180" /> {t("كل الحكايات", "All stories")}
      </Link>

      {!reading ? (
        <div className="mx-auto max-w-md text-center">
          <div className="flex h-48 items-center justify-center rounded-[2rem] text-7xl shadow-card" style={{ background: story.color }}>{story.emoji}</div>
          <h1 className="mt-5 text-2xl font-extrabold text-ink">{lang === "ar" ? story.title.ar : story.title.en}</h1>
          <div className="mt-2 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span className="chip">{lang === "ar" ? story.mood.ar : story.mood.en}</span>
            <span className="flex items-center gap-1"><Icon name="clock" className="h-3.5 w-3.5" /> {story.duration}</span>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setReading(true)} className="btn-primary px-7"><Icon name="play" className="h-5 w-5" /> {t("اقرأ", "Read")}</button>
            <button onClick={toggleMusic} className="btn-ghost"><Icon name="music" className="h-5 w-5" /> {music ? t("إيقاف الموسيقى", "Pause music") : t("موسيقى هادئة", "Calm music")}</button>
          </div>
          <p className="mt-3 text-xs text-slate-400">{t("الموسيقى لا تعمل تلقائياً.", "Music does not autoplay.")}</p>
        </div>
      ) : (
        <div>
          <div className="mb-5 flex items-center justify-center gap-3">
            <button onClick={toggleMusic} className="btn-ghost text-sm"><Icon name="music" className="h-4 w-4" /> {music ? t("إيقاف", "Pause") : t("موسيقى", "Music")}</button>
          </div>
          <FlipbookStory pages={story.pages} />
          <p className="mt-5 text-center text-xs text-slate-400">{t("اسحب لتقليب الصفحات", "Swipe to flip pages")}</p>
        </div>
      )}
      {/* Optional ambient track placeholder — no autoplay */}
      <audio ref={audioRef} loop preload="none" />
    </div>
  );
}

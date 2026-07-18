"use client";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import { CLINIC_PHOTOS } from "@/data/clinicMedia";
import type { DailyStory, StoryBlock } from "@/data/dailyStories";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function StoryDialog({
  story,
  onClose,
}: {
  story: DailyStory;
  onClose: () => void;
}) {
  const { lang, t } = useLang();
  const L = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const photo = CLINIC_PHOTOS[story.imageId];
  const blocks = story.body[lang];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null,
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    const id = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
      previouslyFocused?.focus?.();
    };
  }, [handleKey]);

  const titleId = `story-title-${story.slug}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[900] flex items-stretch justify-center bg-navy-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-2xl flex-col bg-white shadow-float sm:h-auto sm:max-h-[88vh] sm:rounded-3xl"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-navy-100 bg-white/95 px-5 py-3.5 backdrop-blur sm:rounded-t-3xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-600">
            <Icon name="quote" className="h-4 w-4" />
            {L(story.category)}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("إغلاق", "Close")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 bg-white text-navy-700 transition hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="relative aspect-[16/9] w-full bg-navy-950">
            <Image
              src={photo.src}
              alt={L(photo.alt)}
              fill
              sizes="(max-width: 768px) 100vw, 42rem"
              className="object-cover"
            />
          </div>
          <article className="px-5 py-6 sm:px-8 sm:py-8">
            <h2 id={titleId} className="text-h2 font-extrabold text-navy-900">
              {L(story.title)}
            </h2>
            <p className="mt-2 text-xs font-semibold text-navy-400">{L(story.readingTime)}</p>

            <div className="mt-5 space-y-4 text-navy-600">
              {blocks.map((b: StoryBlock, i) =>
                b.kind === "sub" ? (
                  <h3 key={i} className="pt-1 text-h3 font-bold text-navy-900">
                    {b.text}
                  </h3>
                ) : b.kind === "takeaway" ? (
                  <div
                    key={i}
                    className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm font-medium leading-relaxed text-navy-700"
                  >
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">
                      {t("الخلاصة", "Takeaway")}
                    </p>
                    {b.text}
                  </div>
                ) : (
                  <p key={i} className="leading-relaxed">
                    {b.text}
                  </p>
                ),
              )}
            </div>

            {/* Calm, relevant ending */}
            <div className="mt-8 rounded-2xl border border-navy-100 bg-navy-50/60 p-5">
              <p className="font-bold text-navy-900">
                {t("هل تحتاج إلى استشارة أو موعد؟", "Do you need a consultation or an appointment?")}
              </p>
              <p className="mt-1 text-sm text-navy-500">
                {t(
                  "احجز موعدك وسيساعدك فريق المركز في الخطوة التالية.",
                  "Book your visit and the center's team will help you with the next step.",
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/booking" className="btn-primary text-sm">
                  {t("احجز موعدك", "Book your visit")}
                  <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <Link href="/contact" className="btn-ghost text-sm">
                  {t("تواصل معنا", "Contact us")}
                </Link>
              </div>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-navy-400">
              {t(
                "مواقف توعوية مستوحاة من تفاصيل الحياة اليومية، ولأغراض تثقيفية عامة فقط.",
                "Educational stories inspired by everyday situations, for general awareness only.",
              )}
            </p>
          </article>
        </div>
      </div>
    </div>,
    document.body,
  );
}

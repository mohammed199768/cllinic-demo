"use client";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import type { ClinicPhoto } from "@/data/clinicMedia";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export default function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: ClinicPhoto[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const { lang, t } = useLang();
  const L = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const photo = photos[index];

  const go = useCallback(
    (dir: number) => onIndexChange((index + dir + photos.length) % photos.length),
    [index, photos.length, onIndexChange],
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(lang === "ar" ? -1 : 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(lang === "ar" ? 1 : -1);
      } else if (e.key === "Tab") {
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
    [go, lang, onClose],
  );

  useEffect(() => {
    const prevFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    const id = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
      prevFocused?.focus?.();
    };
  }, [handleKey]);

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("معرض صور المركز", "Center photo gallery")}
      className="fixed inset-0 z-[900] flex flex-col items-center justify-center bg-navy-950/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t("إغلاق", "Close")}
        className="absolute top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ltr:right-4 rtl:left-4"
      >
        <Icon name="close" className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); go(-1); }}
        aria-label={t("السابق", "Previous")}
        className="absolute z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ltr:left-4 rtl:right-4"
      >
        <Icon name="chevron" className="h-6 w-6 rotate-180 rtl:rotate-0" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); go(1); }}
        aria-label={t("التالي", "Next")}
        className="absolute z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ltr:right-4 rtl:left-4"
      >
        <Icon name="chevron" className="h-6 w-6 rtl:rotate-180" />
      </button>

      <div className="relative flex max-h-[80vh] w-full max-w-3xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-[70vh] w-full">
          <Image
            src={photo.src}
            alt={L(photo.alt)}
            fill
            sizes="(max-width: 768px) 100vw, 48rem"
            className="object-contain"
          />
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-center text-sm text-white/90" onClick={(e) => e.stopPropagation()}>
        {L(photo.alt)}
        <span className="mt-1 block text-xs text-white/50">{index + 1} / {photos.length}</span>
      </p>
    </div>,
    document.body,
  );
}

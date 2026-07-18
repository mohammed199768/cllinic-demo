"use client";
import Image from "next/image";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import type { ClinicVideo as ClinicVideoData } from "@/data/clinicMedia";

/**
 * Single, reusable clinic video player.
 *   - `lazy` (homepage teaser): shows a poster + play button only; the <video>
 *     element and MP4 are created ONLY after the user activates it — the file is
 *     never fetched on initial page load.
 *   - default (Medical Minute / Videos): a native <video controls playsInline
 *     preload="metadata"> — no autoplay, no automatic sound.
 * The same MP4 is only ever mounted in one player at a time by the caller.
 */
export default function ClinicVideo({
  video,
  poster,
  lazy = false,
  priority = false,
  objectFit = "cover",
  className = "",
}: {
  video: ClinicVideoData;
  poster?: string;
  lazy?: boolean;
  priority?: boolean;
  objectFit?: "cover" | "contain";
  className?: string;
}) {
  const { lang, t } = useLang();
  const L = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en);
  const [active, setActive] = useState(false);
  const posterSrc = poster ?? video.poster;
  const fit = objectFit === "contain" ? "object-contain" : "object-cover";
  const showVideo = !lazy || active;

  return (
    <figure className={`relative overflow-hidden bg-navy-950 ${className}`}>
      {showVideo ? (
        <video
          src={video.src}
          poster={posterSrc}
          controls
          playsInline
          preload={lazy ? "auto" : "metadata"}
          autoPlay={lazy && active}
          aria-label={L(video.title)}
          className={`absolute inset-0 h-full w-full ${fit}`}
        >
          {L({
            ar: "متصفحك لا يدعم تشغيل الفيديو. هذه جولة بصرية قصيرة داخل عيادة تجريبية.",
            en: "Your browser does not support the video. This is a short visual tour of a demonstration clinic.",
          })}
        </video>
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={t("تشغيل الفيديو", "Play video")}
          className="group absolute inset-0 h-full w-full"
        >
          <Image
            src={posterSrc}
            alt={L(video.alt)}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            priority={priority}
            className="object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/20 to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-glow transition-transform duration-200 group-hover:scale-110">
              <Icon name="play" className="h-7 w-7 ltr:translate-x-0.5 rtl:-translate-x-0.5" />
            </span>
          </span>
        </button>
      )}
    </figure>
  );
}

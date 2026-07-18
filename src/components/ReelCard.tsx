"use client";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import Icon from "./Icon";

type Bi = { ar: string; en: string };
type Reel = { id: string; category: string; color: string; title: Bi; body: Bi };

export default function ReelCard({
  reel,
  image,
  onOpen,
}: {
  reel: Reel;
  image?: string;
  onOpen: () => void;
}) {
  const { lang } = useLang();
  const L = (b: Bi) => (lang === "ar" ? b.ar : b.en);
  return (
    <button
      onClick={onOpen}
      className="group relative aspect-[9/14] w-full overflow-hidden rounded-3xl text-start shadow-card"
      style={image ? undefined : { background: reel.color }}
    >
      {image && (
        <Image src={image} alt="" fill sizes="(max-width:640px) 45vw, 22vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
      <span className="absolute top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-700 ltr:left-3 rtl:right-3">
        <Icon name="play" className="h-4 w-4" />
      </span>
      <div className="absolute bottom-0 p-4 text-white">
        <h3 className="text-base font-bold drop-shadow">{L(reel.title)}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-white/90">{L(reel.body)}</p>
      </div>
    </button>
  );
}

"use client";
import Image from "next/image";
import { useLang } from "@/lib/i18n";

type Story = { id: string; title: { ar: string; en: string }; color: string };

export default function StoryCircle({
  story,
  image,
  onClick,
}: {
  story: Story;
  image?: string;
  onClick?: () => void;
}) {
  const { lang } = useLang();
  return (
    <button onClick={onClick} className="flex w-20 shrink-0 flex-col items-center gap-1.5">
      <span className="rounded-full bg-gradient-to-tr from-brand-400 to-mint-400 p-[3px]">
        <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white">
          {image ? (
            <Image src={image} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <span className="h-12 w-12 rounded-full" style={{ background: story.color }} />
          )}
        </span>
      </span>
      <span className="line-clamp-1 text-[11px] font-semibold text-slate-600">
        {lang === "ar" ? story.title.ar : story.title.en}
      </span>
    </button>
  );
}

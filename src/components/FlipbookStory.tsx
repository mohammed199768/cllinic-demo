"use client";
import { forwardRef } from "react";
import dynamic from "next/dynamic";
import { useLang } from "@/lib/i18n";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

type Page = { ar: string; en: string; emoji: string; bg: string };

const Sheet = forwardRef<HTMLDivElement, { page: Page; index: number; total: number }>(
  function Sheet({ page, index, total }, ref) {
    return (
      <div ref={ref} className="overflow-hidden" data-density="soft">
        <PageInner page={page} index={index} total={total} />
      </div>
    );
  }
);

function PageInner({ page, index, total }: { page: Page; index: number; total: number }) {
  const { lang } = useLang();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-7 text-center" style={{ background: page.bg }}>
      <div className="text-7xl">{page.emoji}</div>
      <p className="max-w-xs text-lg font-bold leading-relaxed text-ink">{lang === "ar" ? page.ar : page.en}</p>
      <span className="absolute bottom-4 text-xs font-semibold text-slate-400">{index + 1} / {total}</span>
    </div>
  );
}

export default function FlipbookStory({ pages }: { pages: Page[] }) {
  return (
    <div className="flex justify-center">
      {/* @ts-expect-error react-pageflip types are loose */}
      <HTMLFlipBook
        width={320}
        height={420}
        size="stretch"
        minWidth={260}
        maxWidth={520}
        minHeight={360}
        maxHeight={560}
        maxShadowOpacity={0.3}
        showCover={false}
        mobileScrollSupport
        className="rounded-3xl shadow-float"
      >
        {pages.map((p, i) => (
          <Sheet key={i} page={p} index={i} total={pages.length} />
        ))}
      </HTMLFlipBook>
    </div>
  );
}

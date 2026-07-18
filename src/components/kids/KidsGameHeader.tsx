"use client";
import { useLang } from "@/lib/i18n";
import KidsObject from "./KidsObject";
import type { ObjectId } from "@/data/kidsGameObjects";

/** Title block for a kids game, sitting on the light kids shell. */
export default function KidsGameHeader({
  ar,
  en,
  subAr,
  subEn,
  object,
}: {
  ar: string;
  en: string;
  subAr?: string;
  subEn?: string;
  object?: ObjectId;
}) {
  const { lang } = useLang();
  return (
    <header className="mb-8 text-center">
      {object && (
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-white bg-white/80 shadow-soft backdrop-blur">
          <KidsObject id={object} size={48} />
        </div>
      )}
      <h1 className="text-h1 font-extrabold text-navy-900">{lang === "ar" ? ar : en}</h1>
      {(subAr || subEn) && (
        <p className="mx-auto mt-3 max-w-xl text-lead text-navy-500">
          {lang === "ar" ? subAr : subEn}
        </p>
      )}
    </header>
  );
}

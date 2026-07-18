"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

type Bi = { ar: string; en: string };
type Game = { href: string; emoji: string; title: Bi; desc: Bi; color: string };

export default function KidsGameCard({ game }: { game: Game }) {
  const { lang, t } = useLang();
  const L = (b: Bi) => (lang === "ar" ? b.ar : b.en);
  return (
    <Link href={game.href} className="group block rounded-[2rem] p-6 shadow-card transition-transform duration-300 hover:-translate-y-1.5" style={{ background: game.color }}>
      <span className="text-5xl" aria-hidden>{game.emoji}</span>
      <h3 className="mt-3 text-xl font-extrabold text-ink">{L(game.title)}</h3>
      <p className="mt-1 text-sm text-slate-700">{L(game.desc)}</p>
      <span className="mt-4 inline-block rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold text-brand-700">
        {t("ابدأ اللعب", "Play")}
      </span>
    </Link>
  );
}

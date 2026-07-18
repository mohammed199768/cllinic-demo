"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsGameHeader from "@/components/kids/KidsGameHeader";
import GameResult from "@/components/kids/GameResult";
import KidsObject from "@/components/kids/KidsObject";
import type { ObjectId } from "@/data/kidsGameObjects";

const PAIRS: ObjectId[] = ["apple", "water", "tooth", "moon", "soap", "carrot"];

type Card = { key: string; id: ObjectId };

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function MemoryGameView() {
  const { t } = useLang();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<ObjectId[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const reset = () => {
    const deck = PAIRS.flatMap((id) => [
      { key: `${id}-a`, id },
      { key: `${id}-b`, id },
    ]);
    setCards(shuffle(deck));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWon(false);
  };
  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      setMoves((m) => m + 1);
      if (cards[a].id === cards[b].id) {
        setMatched((mm) => [...mm, cards[a].id]);
        setFlipped([]);
      } else {
        const tmo = setTimeout(() => setFlipped([]), 800);
        return () => clearTimeout(tmo);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.length && matched.length === PAIRS.length) {
      const tmo = setTimeout(() => setWon(true), 500);
      return () => clearTimeout(tmo);
    }
  }, [matched, cards.length]);

  const click = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(cards[i].id)) return;
    setFlipped((f) => [...f, i]);
  };

  const level =
    moves <= 10
      ? { ar: "بطل الذاكرة", en: "Memory Hero" }
      : moves <= 16
      ? { ar: "مفكر ذكي", en: "Smart Thinker" }
      : { ar: "مستكشف صغير", en: "Little Explorer" };

  return (
    <KidsGameShell>
      <KidsGameHeader
        ar="لعبة الذاكرة الصحية"
        en="Healthy Memory Game"
        subAr="طابق كل بطاقتين متشابهتين."
        subEn="Match each pair of cards."
        object="heart"
      />
      {won ? (
        <GameResult
          gameName={{ ar: "لعبة الذاكرة الصحية", en: "Healthy Memory Game" }}
          headlineAr="نتيجة اللعبة"
          headlineEn="Game Result"
          levelAr={level.ar}
          levelEn={level.en}
          score={`${moves} ${t("حركة", "moves")}`}
          onReset={reset}
        />
      ) : (
        <div className="mx-auto max-w-md">
          <p className="mb-4 text-center text-sm font-semibold text-navy-500">
            {t("الحركات", "Moves")}: {moves}
          </p>
          <GlassCard>
            <div className="grid grid-cols-4 gap-3">
              {cards.map((c, i) => {
                const show = flipped.includes(i) || matched.includes(c.id);
                return (
                  <button
                    key={c.key}
                    onClick={() => click(i)}
                    aria-label={show ? undefined : t("بطاقة مقلوبة", "Hidden card")}
                    className={`flex aspect-square items-center justify-center rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                      show ? "border-mint-400 bg-white" : "border-white bg-gradient-to-br from-brand-300 to-cyan-300 shadow-soft hover:from-brand-400 hover:to-cyan-400"
                    }`}
                  >
                    {show ? <KidsObject id={c.id} size={36} /> : null}
                  </button>
                );
              })}
            </div>
          </GlassCard>
          <button onClick={reset} className="btn-ghost mx-auto mt-6 block">
            {t("ابدأ من جديد", "Restart")}
          </button>
        </div>
      )}
    </KidsGameShell>
  );
}

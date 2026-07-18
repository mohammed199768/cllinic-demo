"use client";
import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsGameHeader from "@/components/kids/KidsGameHeader";
import GameProgress from "@/components/kids/GameProgress";
import GameResult from "@/components/kids/GameResult";
import KidsObject from "@/components/kids/KidsObject";
import Icon from "@/components/Icon";
import type { ObjectId } from "@/data/kidsGameObjects";

type Level = { grid: string[]; goal: ObjectId; goalAr: string; goalEn: string };

const LEVELS: Level[] = [
  {
    grid: ["S....", ".###.", ".....", ".###.", "....G"],
    goal: "water",
    goalAr: "اشرب الماء",
    goalEn: "Reach the water",
  },
  {
    grid: ["S..#..", "##.#.#", "...#..", ".###.#", ".....#", "#.###G"],
    goal: "tooth",
    goalAr: "نظّف أسنانك",
    goalEn: "Reach the toothbrush",
  },
  {
    grid: ["S....#.", "###.#..", "..#..##", ".....#.", "#.###..", "#...#.#", "##.....G"],
    goal: "moon",
    goalAr: "وقت النوم الهادئ",
    goalEn: "Reach the bedtime moon",
  },
];

type Pos = { r: number; c: number };

function findChar(grid: string[], ch: string): Pos {
  for (let r = 0; r < grid.length; r++) {
    const c = grid[r].indexOf(ch);
    if (c >= 0) return { r, c };
  }
  return { r: 0, c: 0 };
}

export default function HealthyMazeView() {
  const { t, lang } = useLang();
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [lvl, setLvl] = useState(0);
  const [pos, setPos] = useState<Pos>(() => findChar(LEVELS[0].grid, "S"));
  const [moves, setMoves] = useState(0);
  const [reachedAt, setReachedAt] = useState<number | null>(null);

  const level = LEVELS[lvl];
  const goalPos = findChar(level.grid, "G");
  const rows = level.grid.length;
  const cols = level.grid[0].length;

  const loadLevel = useCallback((idx: number) => {
    setPos(findChar(LEVELS[idx].grid, "S"));
    setLvl(idx);
  }, []);

  const reset = () => {
    setMoves(0);
    setReachedAt(null);
    setPhase("play");
    loadLevel(0);
  };

  const move = useCallback(
    (dr: number, dc: number) => {
      if (reachedAt !== null) return;
      setPos((p) => {
        const nr = p.r + dr;
        const nc = p.c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) return p;
        if (level.grid[nr][nc] === "#") return p;
        setMoves((m) => m + 1);
        return { r: nr, c: nc };
      });
    },
    [level.grid, rows, cols, reachedAt]
  );

  useEffect(() => {
    if (pos.r === goalPos.r && pos.c === goalPos.c && reachedAt === null) {
      setReachedAt(lvl);
      const tmo = window.setTimeout(() => {
        if (lvl + 1 < LEVELS.length) {
          setReachedAt(null);
          loadLevel(lvl + 1);
        } else setPhase("done");
      }, 1100);
      return () => window.clearTimeout(tmo);
    }
  }, [pos, goalPos.r, goalPos.c, lvl, reachedAt, loadLevel]);

  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        move(d[0], d[1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, move]);

  return (
    <KidsGameShell>
      <KidsGameHeader
        ar="المتاهة الصحية"
        en="Healthy Maze"
        subAr="أرشد صديقنا الصغير إلى العادة الصحية. تجنّب السحب الناعمة."
        subEn="Guide our little friend to the healthy habit. Go around the soft clouds."
        object="tooth"
      />

      {phase === "done" ? (
        <GameResult
          gameName={{ ar: "المتاهة الصحية", en: "Healthy Maze" }}
          headlineAr="نتيجة اللعبة"
          headlineEn="Game Result"
          levelAr="بطل التخطيط"
          levelEn="Planning Hero"
          score={`${moves} ${t("حركة", "moves")}`}
          onReset={reset}
        />
      ) : (
        <div className="mx-auto max-w-md">
          <GameProgress current={lvl + 1} total={LEVELS.length} labelAr="متاهة" labelEn="Maze" />
          <GlassCard>
            <p className="mb-4 text-center font-bold text-brand-600">
              {lang === "ar" ? level.goalAr : level.goalEn}
            </p>
            <div
              className="mx-auto grid w-fit gap-1.5"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              role="grid"
              aria-label={t("لوحة المتاهة", "Maze board")}
            >
              {level.grid.map((row, r) =>
                row.split("").map((cell, c) => {
                  const isChar = pos.r === r && pos.c === c;
                  const isGoal = cell === "G";
                  const isWall = cell === "#";
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${
                        isWall ? "bg-navy-100" : "bg-brand-50"
                      }`}
                    >
                      {isChar ? (
                        <span className="text-xl" aria-label={t("صديقنا", "our friend")}>
                          🧒
                        </span>
                      ) : isGoal ? (
                        <KidsObject id={level.goal} size={28} />
                      ) : isWall ? (
                        <span aria-hidden className="text-base opacity-80">
                          ☁️
                        </span>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            {reachedAt !== null && (
              <p className="mt-4 text-center text-sm font-semibold text-mint-500">
                {t("وصلت! أحسنت 🌟", "You made it! Great 🌟")}
              </p>
            )}

            <div className="mx-auto mt-6 grid w-44 grid-cols-3 gap-2">
              <span />
              <PadButton label={t("أعلى", "Up")} onClick={() => move(-1, 0)}>
                <Icon name="chevron" className="h-5 w-5 -rotate-90" />
              </PadButton>
              <span />
              <PadButton label={t("يسار", "Left")} onClick={() => move(0, -1)}>
                <Icon name="chevron" className="h-5 w-5 rotate-180" />
              </PadButton>
              <PadButton label={t("أسفل", "Down")} onClick={() => move(1, 0)}>
                <Icon name="chevron" className="h-5 w-5 rotate-90" />
              </PadButton>
              <PadButton label={t("يمين", "Right")} onClick={() => move(0, 1)}>
                <Icon name="chevron" className="h-5 w-5" />
              </PadButton>
            </div>
            <p className="mt-4 text-center text-xs text-navy-400">
              {t("يمكنك أيضًا استخدام مفاتيح الأسهم.", "You can also use the arrow keys.")}
            </p>
          </GlassCard>
        </div>
      )}
    </KidsGameShell>
  );
}

function PadButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-navy-200 bg-white text-navy-700 shadow-xs transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      {children}
    </button>
  );
}

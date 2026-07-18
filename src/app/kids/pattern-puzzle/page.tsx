import type { Metadata } from "next";
import PatternPuzzleView from "@/components/views/PatternPuzzleView";

export const metadata: Metadata = {
  title: "لعبة الأنماط | Pattern Puzzle",
  description: "لعبة أنماط ممتعة تساعد الطفل على التفكير المنطقي والتعرّف على التسلسل بطريقة آمنة.",
  alternates: { canonical: "/kids/pattern-puzzle" },
  openGraph: { title: "لعبة الأنماط | Pattern Puzzle", description: "لعبة أنماط ممتعة تساعد الطفل على التفكير المنطقي والتعرّف على التسلسل بطريقة آمنة.", url: "/kids/pattern-puzzle" },
};

export default function Page() {
  return <PatternPuzzleView />;
}

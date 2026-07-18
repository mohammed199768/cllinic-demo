import type { Metadata } from "next";
import MemoryGameView from "@/components/views/MemoryGameView";

export const metadata: Metadata = {
  title: "لعبة الذاكرة | Memory Game",
  description: "لعبة ذاكرة تعليمية ممتعة للأطفال من صغيرنا الذكي.",
  alternates: { canonical: "/kids/memory-game" },
  openGraph: { title: "لعبة الذاكرة | Memory Game", description: "لعبة ذاكرة تعليمية ممتعة للأطفال من صغيرنا الذكي.", url: "/kids/memory-game" },
};

export default function Page() {
  return <MemoryGameView />;
}

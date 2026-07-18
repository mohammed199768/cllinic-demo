import type { Metadata } from "next";
import HealthyMazeView from "@/components/views/HealthyMazeView";

export const metadata: Metadata = {
  title: "المتاهة الصحية | Healthy Maze",
  description: "لعبة متاهة بسيطة تساعد الطفل على التخطيط والتفكير المكاني للوصول إلى عادة صحية.",
  alternates: { canonical: "/kids/healthy-maze" },
  openGraph: { title: "المتاهة الصحية | Healthy Maze", description: "لعبة متاهة بسيطة تساعد الطفل على التخطيط والتفكير المكاني للوصول إلى عادة صحية.", url: "/kids/healthy-maze" },
};

export default function Page() {
  return <HealthyMazeView />;
}

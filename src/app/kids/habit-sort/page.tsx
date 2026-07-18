import type { Metadata } from "next";
import HabitSortView from "@/components/views/HabitSortView";

export const metadata: Metadata = {
  title: "رتّب العادات | Habit Sorting",
  description: "لعبة فرز العادات الصحية للأطفال من صغيرنا الذكي.",
  alternates: { canonical: "/kids/habit-sort" },
  openGraph: { title: "رتّب العادات | Habit Sorting", description: "لعبة فرز العادات الصحية للأطفال من صغيرنا الذكي.", url: "/kids/habit-sort" },
};

export default function Page() {
  return <HabitSortView />;
}

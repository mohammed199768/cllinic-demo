import type { Metadata } from "next";
import HealthyQuizView from "@/components/views/HealthyQuizView";

export const metadata: Metadata = {
  title: "اختبار صحي | Healthy Quiz",
  description: "اختبار صحي ممتع للأطفال من صغيرنا الذكي.",
  alternates: { canonical: "/kids/healthy-quiz" },
  openGraph: { title: "اختبار صحي | Healthy Quiz", description: "اختبار صحي ممتع للأطفال من صغيرنا الذكي.", url: "/kids/healthy-quiz" },
};

export default function Page() {
  return <HealthyQuizView />;
}

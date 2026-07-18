import type { Metadata } from "next";
import FocusLabView from "@/components/views/FocusLabView";

export const metadata: Metadata = {
  title: "مختبر التركيز | Focus Lab",
  description: "لعبة تركيز هادئة تساعد الطفل على الانتباه والفلترة البصرية بدون ضغط أو وقت قاسٍ.",
  alternates: { canonical: "/kids/focus-lab" },
  openGraph: { title: "مختبر التركيز | Focus Lab", description: "لعبة تركيز هادئة تساعد الطفل على الانتباه والفلترة البصرية بدون ضغط أو وقت قاسٍ.", url: "/kids/focus-lab" },
};

export default function Page() {
  return <FocusLabView />;
}

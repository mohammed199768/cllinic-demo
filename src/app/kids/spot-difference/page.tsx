import type { Metadata } from "next";
import SpotDifferenceView from "@/components/views/SpotDifferenceView";

export const metadata: Metadata = {
  title: "أين الاختلاف؟ | Spot the Difference",
  description: "لعبة ملاحظة لطيفة تدرّب الطفل على التركيز والمقارنة البصرية بطريقة ممتعة وآمنة.",
  alternates: { canonical: "/kids/spot-difference" },
  openGraph: { title: "أين الاختلاف؟ | Spot the Difference", description: "لعبة ملاحظة لطيفة تدرّب الطفل على التركيز والمقارنة البصرية بطريقة ممتعة وآمنة.", url: "/kids/spot-difference" },
};

export default function Page() {
  return <SpotDifferenceView />;
}

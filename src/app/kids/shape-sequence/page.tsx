import type { Metadata } from "next";
import ShapeSequenceView from "@/components/views/ShapeSequenceView";

export const metadata: Metadata = {
  title: "تسلسل الأشكال | Shape Sequence",
  description: "لعبة ذاكرة تساعد الطفل على تذكّر التسلسل والانتباه بطريقة ممتعة وآمنة.",
  alternates: { canonical: "/kids/shape-sequence" },
  openGraph: { title: "تسلسل الأشكال | Shape Sequence", description: "لعبة ذاكرة تساعد الطفل على تذكّر التسلسل والانتباه بطريقة ممتعة وآمنة.", url: "/kids/shape-sequence" },
};

export default function Page() {
  return <ShapeSequenceView />;
}

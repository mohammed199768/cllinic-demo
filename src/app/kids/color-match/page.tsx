import type { Metadata } from "next";
import ColorMatchView from "@/components/views/ColorMatchView";

export const metadata: Metadata = {
  title: "مطابقة الألوان | Color Match",
  description: "لعبة مطابقة ألوان لطيفة تساعد الطفل على التصنيف والتعلّم المبكر بطريقة ممتعة وآمنة.",
  alternates: { canonical: "/kids/color-match" },
  openGraph: { title: "مطابقة الألوان | Color Match", description: "لعبة مطابقة ألوان لطيفة تساعد الطفل على التصنيف والتعلّم المبكر بطريقة ممتعة وآمنة.", url: "/kids/color-match" },
};

export default function Page() {
  return <ColorMatchView />;
}

import type { Metadata } from "next";
import KidsView from "@/components/views/KidsView";

export const metadata: Metadata = {
  title: "صغيرنا الذكي | Smart Little One",
  description: "ركن مرح للأطفال: ألعاب تعليمية صحية وحكايات مساء من عيادتنا.",
  alternates: { canonical: "/kids" },
  openGraph: { title: "صغيرنا الذكي | Smart Little One", description: "ركن مرح للأطفال: ألعاب تعليمية صحية وحكايات مساء من عيادتنا.", url: "/kids" },
};

export default function Page() {
  return <KidsView />;
}

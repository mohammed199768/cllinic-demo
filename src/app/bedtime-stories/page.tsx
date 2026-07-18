import type { Metadata } from "next";
import BedtimeListView from "@/components/views/BedtimeListView";

export const metadata: Metadata = {
  title: "حكايات المساء | Evening Stories",
  description: "حكايات مساء لطيفة للأطفال قبل النوم من عيادتنا.",
  alternates: { canonical: "/bedtime-stories" },
  openGraph: { title: "حكايات المساء | Evening Stories", description: "حكايات مساء لطيفة للأطفال قبل النوم من عيادتنا.", url: "/bedtime-stories" },
};

export default function Page() {
  return <BedtimeListView />;
}

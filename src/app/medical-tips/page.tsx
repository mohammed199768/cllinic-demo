import type { Metadata } from "next";
import MedicalTipsView from "@/components/views/MedicalTipsView";

export const metadata: Metadata = {
  title: "نصائح طبية | Medical Tips",
  description: "نصائح طبية تثقيفية مبسّطة للأطفال والمزمنين والفيتامينات والطوارئ والفحوصات.",
  alternates: { canonical: "/medical-tips" },
  openGraph: { title: "نصائح طبية | Medical Tips", description: "نصائح طبية تثقيفية مبسّطة للأطفال والمزمنين والفيتامينات والطوارئ والفحوصات.", url: "/medical-tips" },
};

export default function Page() {
  return <MedicalTipsView />;
}

import type { Metadata } from "next";
import KnowYourselfHub from "@/components/know-yourself/KnowYourselfHub";

export const metadata: Metadata = {
  title: "اعرف نفسك | Know Yourself",
  description:
    "مساحة تفاعلية لاكتشاف طريقة التفكير والتركيز من خلال اختبارات تعليمية خفيفة. An interactive space to explore thinking and focus through lightweight educational assessments.",
  alternates: { canonical: "/know-yourself" },
  openGraph: {
    title: "اعرف نفسك | Know Yourself",
    description:
      "مساحة تفاعلية لاكتشاف طريقة التفكير والتركيز من خلال اختبارات تعليمية خفيفة.",
    url: "/know-yourself",
  },
};

export default function Page() {
  return <KnowYourselfHub />;
}

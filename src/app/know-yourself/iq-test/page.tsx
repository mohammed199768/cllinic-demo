import type { Metadata } from "next";
import LogicalIqTest from "@/components/know-yourself/LogicalIqTest";

export const metadata: Metadata = {
  title: "اختبار الذكاء المنطقي | اعرف نفسك",
  description:
    "اختبار تعليمي قصير يعتمد على الأنماط والمنطق البصري، ولا يُعد اختبار ذكاء رسميًا أو تقييمًا نفسيًا. A short educational assessment based on visual patterns and logic. It is not an official IQ test or psychological evaluation.",
  alternates: { canonical: "/know-yourself/iq-test" },
  openGraph: {
    title: "اختبار الذكاء المنطقي | Logical Intelligence Test",
    description:
      "اختبار تعليمي قصير يعتمد على الأنماط والمنطق البصري، ولا يُعد اختبار ذكاء رسميًا أو تقييمًا نفسيًا.",
    url: "/know-yourself/iq-test",
  },
};

export default function Page() {
  return <LogicalIqTest />;
}

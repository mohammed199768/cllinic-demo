import type { Metadata } from "next";
import EmergencyView from "@/components/views/EmergencyView";

export const metadata: Metadata = {
  title: "معلومات الرعاية العاجلة | Urgent care information",
  description: "إرشادات عامة للتواصل وتأكيد التوفر، مع توجيه الحالات الخطيرة إلى خدمات الطوارئ المحلية.",
  alternates: { canonical: "/emergency" },
  openGraph: { title: "معلومات الرعاية العاجلة | Urgent care information", description: "إرشادات عامة للتواصل وتأكيد التوفر.", url: "/emergency" },
};

export default function Page() {
  return <EmergencyView />;
}

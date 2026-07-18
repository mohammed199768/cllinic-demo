import type { Metadata } from "next";
import MedicalMinuteView from "@/components/views/MedicalMinuteView";

const DESCRIPTION =
  "محتوى صحي تثقيفي عام من عيادتنا مع جولة بصرية قصيرة داخل عيادة تجريبية. Quick general health education and a short demo-clinic visual tour from OurClinic.";

export const metadata: Metadata = {
  title: "صحتك في دقيقة | Medical Minute",
  description: DESCRIPTION,
  alternates: { canonical: "/medical-minute" },
  openGraph: { title: "صحتك في دقيقة | Medical Minute", description: DESCRIPTION, url: "/medical-minute" },
};

export default function Page() {
  return <MedicalMinuteView />;
}

import type { Metadata } from "next";
import BloodGlucoseView from "@/components/views/BloodGlucoseView";
export const metadata: Metadata = { title: "سجل سكر الدم | Blood Glucose Log", description: "نظّم قياسات سكر الدم محليًا حسب الوقت والوجبات دون تصنيف طبي. Organize glucose readings locally by time and meal context without medical classification.", alternates: { canonical: "/health-journey/blood-glucose" } };
export default function Page() { return <BloodGlucoseView />; }

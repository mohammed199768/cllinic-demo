import type { Metadata } from "next";
import BloodPressureView from "@/components/views/BloodPressureView";
export const metadata: Metadata = { title: "سجل ضغط الدم | Blood Pressure Log", description: "نظّم قراءات ضغط الدم محليًا واطبعها دون تفسير طبي. Organize and print blood-pressure readings locally without medical interpretation.", alternates: { canonical: "/health-journey/blood-pressure" } };
export default function Page() { return <BloodPressureView />; }

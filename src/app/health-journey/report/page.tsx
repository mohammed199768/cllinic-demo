import type { Metadata } from "next";
import DoctorSummaryView from "@/components/views/DoctorSummaryView";
export const metadata: Metadata = { title: "ملخص للطبيب | Doctor Summary", description: "أنشئ ملخصًا محليًا قابلًا للطباعة من المعلومات التي أدخلتها. Create a printable local summary from information you entered.", alternates: { canonical: "/health-journey/report" } };
export default function Page() { return <DoctorSummaryView />; }

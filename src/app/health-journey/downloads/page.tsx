import type { Metadata } from "next";
import PatientResourcesView from "@/components/views/PatientResourcesView";
export const metadata: Metadata = { title: "مكتبة النماذج | Patient Resource Library", description: "عشرة نماذج عربية وإنجليزية قابلة للطباعة لتنظيم القياسات والأدوية والاستعداد للزيارة. Ten bilingual printable templates for organizing health information.", alternates: { canonical: "/health-journey/downloads" } };
export default function Page() { return <PatientResourcesView />; }

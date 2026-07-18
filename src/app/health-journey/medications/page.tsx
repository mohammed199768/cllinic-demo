import type { Metadata } from "next";
import MedicationsView from "@/components/views/MedicationsView";
export const metadata: Metadata = { title: "أدويتي | My Medications", description: "قائمة محلية لتنظيم الأدوية ومناقشتها أثناء الزيارة، دون وصف أو توصيات. A local medication list for visit discussions, without prescribing advice.", alternates: { canonical: "/health-journey/medications" } };
export default function Page() { return <MedicationsView />; }

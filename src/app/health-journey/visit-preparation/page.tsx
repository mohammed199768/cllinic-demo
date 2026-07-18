import type { Metadata } from "next";
import VisitPreparationView from "@/components/views/VisitPreparationView";
export const metadata: Metadata = { title: "التحضير للزيارة | Visit Preparation", description: "ورقة محلية هادئة لترتيب أسئلتك وملاحظاتك قبل الزيارة. A calm, local worksheet for questions and notes before your visit.", alternates: { canonical: "/health-journey/visit-preparation" } };
export default function Page() { return <VisitPreparationView />; }

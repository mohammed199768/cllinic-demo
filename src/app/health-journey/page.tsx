import type { Metadata } from "next";
import HealthJourneyView from "@/components/views/HealthJourneyView";

export const metadata: Metadata = {
  title: "رفيق صحتك | Your Health Companion",
  description: "أدوات محلية لتنظيم القياسات والأدوية والاستعداد للزيارة. Local-first tools for measurements, medications, and visit preparation.",
  alternates: { canonical: "/health-journey" },
};

export default function Page() { return <HealthJourneyView />; }

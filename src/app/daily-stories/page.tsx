import type { Metadata } from "next";
import DailyStoriesView from "@/components/views/DailyStoriesView";

const DESCRIPTION =
  "قصص إنسانية وتوعوية عامة مستوحاة من تفاصيل الحياة اليومية — لأغراض تثقيفية. General educational everyday-care stories from OurClinic.";

export const metadata: Metadata = {
  title: "قصص من تفاصيل يومنا | Daily Stories",
  description: DESCRIPTION,
  alternates: { canonical: "/daily-stories" },
  openGraph: { title: "قصص من تفاصيل يومنا | Daily Stories", description: DESCRIPTION, url: "/daily-stories" },
};

export default function Page() {
  return <DailyStoriesView />;
}

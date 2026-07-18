import type { Metadata } from "next";
import FaqView from "@/components/views/FaqView";
import faqs from "@/data/faqs.json";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | FAQ",
  description: "إجابات عامة على الأسئلة الشائعة حول خدمات عيادتنا والحجز والتأمين.",
  alternates: { canonical: "/faq" },
  openGraph: { title: "الأسئلة الشائعة | FAQ", url: "/faq" },
};

export default function Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q.ar,
      acceptedAnswer: { "@type": "Answer", text: f.a.ar },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <FaqView />
    </>
  );
}

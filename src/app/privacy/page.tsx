import type { Metadata } from "next";
import PrivacyView from "@/components/views/PrivacyView";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | Privacy Policy",
  description: "سياسة الخصوصية لموقع عيادتنا واستخدام بيانات النماذج ورموز QR.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "سياسة الخصوصية | Privacy Policy", description: "سياسة الخصوصية لموقع عيادتنا واستخدام بيانات النماذج ورموز QR.", url: "/privacy" },
};

export default function Page() {
  return <PrivacyView />;
}

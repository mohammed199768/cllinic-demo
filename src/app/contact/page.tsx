import type { Metadata } from "next";
import ContactView from "@/components/views/ContactView";

export const metadata: Metadata = {
  title: "تواصل معنا | Contact Us",
  description: "تواصل مع عيادتنا: هاتف، واتساب، بريد، وموقع عام على الخريطة في عمّان.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "تواصل معنا | Contact Us", description: "تواصل مع عيادتنا: هاتف، واتساب، بريد، وموقع عام على الخريطة في عمّان.", url: "/contact" },
};

export default function Page() {
  return <ContactView />;
}

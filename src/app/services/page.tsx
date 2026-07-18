import type { Metadata } from "next";
import ServicesView from "@/components/views/ServicesView";

const SERVICES_DESCRIPTION =
  "Explore demonstration clinic services, general care information, appointment options, and an interactive tour from OurClinic.";

export const metadata: Metadata = {
  title: "الخدمات الطبية وجولة داخل المركز | Medical Services",
  description: SERVICES_DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: { title: "Medical Services", description: SERVICES_DESCRIPTION, url: "/services" },
};

export default function Page() {
  return <ServicesView />;
}

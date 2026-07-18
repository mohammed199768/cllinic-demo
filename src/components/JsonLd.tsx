import { CLINIC, SITE_URL } from "@/lib/clinic";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: CLINIC.name.en,
    alternateName: CLINIC.name.ar,
    url: SITE_URL,
    telephone: CLINIC.phoneE164,
    email: CLINIC.email,
    image: `${SITE_URL}/clinic-media/photos/photo_01.webp`,
    description:
      "OurClinic is a bilingual demonstration clinic website for appointments, clinic services, and general health information in Amman, Jordan.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Amman",
      addressRegion: "Amman",
      addressCountry: "JO",
    },
    availableService: ["Appointment requests", "General clinic information"],
    sameAs: [CLINIC.facebook].filter(Boolean),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

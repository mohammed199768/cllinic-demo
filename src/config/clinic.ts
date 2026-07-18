import clinicData from "@/data/clinic.json";

export type LocalizedText = Readonly<{ ar: string; en: string }>;

export type ClinicIdentity = Readonly<{
  name: LocalizedText;
  tagline: LocalizedText;
  phone: string;
  phoneE164: string;
  phoneIntl: string;
  whatsapp: string;
  email: string;
  emergency: LocalizedText;
  address: LocalizedText;
  maps: string;
  mapsEmbed: string;
  facebook: string;
  instagram: string;
  city: LocalizedText;
  country: LocalizedText;
  timezone: string;
}>;

export const CLINIC = clinicData satisfies ClinicIdentity;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:4173";

export const telHref = `tel:${CLINIC.phoneE164}`;
export const mailtoHref = `mailto:${CLINIC.email}`;

export const SITE_METADATA_IDENTITY = {
  applicationName: CLINIC.name.en,
  title: `${CLINIC.name.ar} | ${CLINIC.name.en}`,
  description: "عيادتنا في عمّان، الأردن: موقع تجريبي ثنائي اللغة لخدمات العيادة والحجز والمحتوى الصحي العام. OurClinic is a bilingual clinic demo for Amman, Jordan.",
} as const;

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${CLINIC.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Centralized media configuration.
 *
 * Remote editorial placeholders complement the local generic clinic imagery. Replace every URL
 * below with licensed clinic photos before launch. Keeping them here means the rest
 * of the codebase imports `MEDIA.*` and never hardcodes an image URL.
 */

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const MEDIA = {
  // Hero — calm, cinematic clinical / care imagery
  heroBackground: u("1519494026892-80bbd2d6fd0d", 2000), // soft clinical light
  heroAlt: {
    ar: "مساحة عيادة هادئة ومهنية",
    en: "A calm, professional clinic environment",
  },

  // Editorial healthcare imagery (doctor-patient, family, home, senior, lab, child)
  consultation: u("1576091160550-2173dba999ef"), // doctor / consultation
  familyCare: u("1559839734-2b71ea197ec2"), // caregiver + senior
  childCare: u("1632053001332-2268c0a4dd3c"), // child healthcare
  seniorHome: u("1584515933487-779824d29309"), // home / senior care
  labTesting: u("1581093588401-fbb62a02f120"), // lab / testing
  consultationRemote: u("1584982751601-97dcc096659c"), // telemedicine / call

  // Video thumbnails (premium media placeholders)
  videoThumbs: {
    inside: u("1538108149393-fbbd81895907"),
    tips: u("1505751172876-fa1923c5c528"),
    kids: u("1632053001332-2268c0a4dd3c"),
    short: u("1576091160550-2173dba999ef"),
  } as Record<string, string>,
} as const;

export type Media = typeof MEDIA;

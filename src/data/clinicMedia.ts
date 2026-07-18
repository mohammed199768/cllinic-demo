/**
 * Centralized, typed source of truth for neutral, generated clinic-demo
 * photography and video. Every component that shows clinic imagery imports from
 * here — no image path is hardcoded anywhere else.
 *
 * Assets live under /public/clinic-media (photos, video, frames, manifest) and
 * contain no patients, identifying information, signage, or legacy branding.
 */

export type LocalizedText = { ar: string; en: string };

export type ClinicPhotoId =
  | "photo_01"
  | "photo_02"
  | "photo_03"
  | "photo_04"
  | "photo_05"
  | "photo_06"
  | "photo_07";

export type ClinicVideoId = "video_01";
export type ClinicMediaId = ClinicPhotoId | ClinicVideoId;

/** Semantic space each photo depicts, used to pick imagery by meaning. */
export type ClinicSpace =
  | "reception"
  | "corridor"
  | "treatment"
  | "observation"
  | "room";

export interface ClinicPhoto {
  id: ClinicPhotoId;
  type: "photo";
  src: string;
  width: number;
  height: number;
  space: ClinicSpace;
  alt: LocalizedText;
  title: LocalizedText;
}

export interface ClinicVideo {
  id: ClinicVideoId;
  type: "video";
  src: string;
  poster: string;
  width: number;
  height: number;
  alt: LocalizedText;
  title: LocalizedText;
}

const PHOTO_BASE = "/clinic-media/photos";

export const CLINIC_PHOTOS: Record<ClinicPhotoId, ClinicPhoto> = {
  photo_01: {
    id: "photo_01",
    type: "photo",
    src: `${PHOTO_BASE}/photo_01.webp`,
    width: 1600,
    height: 900,
    space: "reception",
    alt: {
      ar: "قاعة استقبال وانتظار هادئة في عيادة تجريبية",
      en: "Calm reception and waiting hall in a demonstration clinic",
    },
    title: { ar: "الاستقبال والانتظار", en: "Reception & waiting" },
  },
  photo_02: {
    id: "photo_02",
    type: "photo",
    src: `${PHOTO_BASE}/photo_02.webp`,
    width: 1600,
    height: 1200,
    space: "reception",
    alt: {
      ar: "غرفة استشارة مريحة في عيادة تجريبية",
      en: "A comfortable consultation room in a demonstration clinic",
    },
    title: { ar: "منطقة الانتظار", en: "Waiting lounge" },
  },
  photo_03: {
    id: "photo_03",
    type: "photo",
    src: `${PHOTO_BASE}/photo_03.webp`,
    width: 1600,
    height: 900,
    space: "reception",
    alt: {
      ar: "قاعة استقبال مضيئة وواسعة في عيادة تجريبية",
      en: "A bright, spacious reception hall in a demonstration clinic",
    },
    title: { ar: "قاعة الاستقبال", en: "Reception hall" },
  },
  photo_04: {
    id: "photo_04",
    type: "photo",
    src: `${PHOTO_BASE}/photo_04.webp`,
    width: 1600,
    height: 900,
    space: "corridor",
    alt: {
      ar: "منظر عام لمساحة الاستقبال في عيادة تجريبية",
      en: "A general view of a demonstration clinic reception",
    },
    title: { ar: "الممر ومناطق العلاج", en: "Corridor & care areas" },
  },
  photo_05: {
    id: "photo_05",
    type: "photo",
    src: `${PHOTO_BASE}/photo_05.webp`,
    width: 1600,
    height: 1200,
    space: "treatment",
    alt: {
      ar: "غرفة فحص هادئة ومجهزة في عيادة تجريبية",
      en: "A calm, equipped examination room in a demonstration clinic",
    },
    title: { ar: "أجنحة العلاج", en: "Treatment bays" },
  },
  photo_06: {
    id: "photo_06",
    type: "photo",
    src: `${PHOTO_BASE}/photo_06.webp`,
    width: 1600,
    height: 1200,
    space: "observation",
    alt: {
      ar: "غرفة رعاية مرتبة في عيادة تجريبية",
      en: "An orderly care room in a demonstration clinic",
    },
    title: { ar: "أسرّة الملاحظة", en: "Observation beds" },
  },
  photo_07: {
    id: "photo_07",
    type: "photo",
    src: `${PHOTO_BASE}/photo_07.webp`,
    width: 1600,
    height: 1200,
    space: "room",
    alt: {
      ar: "غرفة استشارة عصرية في عيادة تجريبية",
      en: "A modern consultation room in a demonstration clinic",
    },
    title: { ar: "غرفة علاج مجهزة", en: "Equipped treatment room" },
  },
};

export const CLINIC_VIDEO: ClinicVideo = {
  id: "video_01",
  type: "video",
  src: "/clinic-media/video/video_01.mp4",
  poster: CLINIC_PHOTOS.photo_03.src,
  width: 1280,
  height: 720,
  alt: {
    ar: "جولة بصرية قصيرة داخل عيادة تجريبية",
    en: "A short visual tour of a demonstration clinic",
  },
  title: {
    ar: "جولة قصيرة داخل المركز",
    en: "A Short Tour Inside the Center",
  },
};

/** Ordered list of every photo, handy for galleries. */
export const CLINIC_PHOTO_LIST: ClinicPhoto[] = [
  CLINIC_PHOTOS.photo_01,
  CLINIC_PHOTOS.photo_02,
  CLINIC_PHOTOS.photo_03,
  CLINIC_PHOTOS.photo_04,
  CLINIC_PHOTOS.photo_05,
  CLINIC_PHOTOS.photo_06,
  CLINIC_PHOTOS.photo_07,
];

export function clinicPhoto(id: ClinicPhotoId): ClinicPhoto {
  return CLINIC_PHOTOS[id];
}

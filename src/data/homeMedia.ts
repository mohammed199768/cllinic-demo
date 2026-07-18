/**
 * Homepage media selection — neutral, generated clinic-demo photography.
 * Paths are not hardcoded here; every value points at the centralized
 * clinicMedia source of truth, so the homepage and the rest of the site share
 * exactly one definition per asset.
 */
import { CLINIC_PHOTOS } from "@/data/clinicMedia";

export const HOME_MEDIA = {
  hero: CLINIC_PHOTOS.photo_03.src, // bright, spacious reception hall
  reception: CLINIC_PHOTOS.photo_01.src, // reception & waiting area
  corridor: CLINIC_PHOTOS.photo_04.src, // corridor to the care areas
  room: CLINIC_PHOTOS.photo_07.src, // equipped treatment room
} as const;

export type HomeMedia = typeof HOME_MEDIA;

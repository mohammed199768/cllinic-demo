"use client";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import { CLINIC_PHOTOS, type ClinicPhotoId } from "@/data/clinicMedia";
import Icon from "@/components/Icon";
import { useStaggeredReveal } from "./maskHooks";

type MosaicItem = {
  photo: ClinicPhotoId;
  ar: string;
  en: string;
  num: string;
  feat?: boolean;
};

// Real clinic imagery (a selection of reception, corridor, treatment and
// observation spaces) behind the center's core service labels.
const MOSAIC: MosaicItem[] = [
  { photo: "photo_01", ar: "طلب موعد عام", en: "General appointment", num: "01", feat: true },
  { photo: "photo_04", ar: "خيارات الزيارة", en: "Visit options", num: "02" },
  { photo: "photo_05", ar: "موعد للعائلة", en: "Family appointment", num: "03" },
  { photo: "photo_06", ar: "طلب متابعة", en: "Follow-up request", num: "04" },
  { photo: "photo_07", ar: "استفسار عن فحص", en: "Test enquiry", num: "05" },
  { photo: "photo_04", ar: "استفسار عن علاج", en: "Treatment enquiry", num: "06" },
];

export default function CareMosaic() {
  const { lang, t } = useLang();
  const L = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en);
  const { containerRef, getAnimStyle } = useStaggeredReveal();

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="snap-section flex min-h-[calc(100svh-4rem)] w-full max-w-full items-center overflow-x-clip py-16 sm:py-20 lg:py-24"
    >
      <div className="container-x w-full max-w-full">
        <div className="mb-8 max-w-2xl" style={getAnimStyle(0)}>
          <p className="eyebrow mb-3">{t("خدماتنا", "Our services")}</p>
          <h2 className="text-h2 font-extrabold tracking-tight text-navy-900">
            {t("رعاية شاملة في مكان واحد", "Comprehensive care in one place")}
          </h2>
          <p className="mt-3 text-lead text-navy-500">
            {t(
              "من الأسئلة العاجلة إلى المتابعة المزمنة، نرتب لك الخطوة الطبية الأقرب.",
              "From emergencies to chronic follow-up, we arrange your nearest medical step."
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 md:gap-2 lg:h-[68vh] lg:min-h-[540px] lg:grid-cols-3 lg:grid-rows-2">
          {MOSAIC.map((s, i) => {
            const photo = CLINIC_PHOTOS[s.photo];
            return (
              <Link
                key={i}
                href="/booking"
                className={`group relative h-full min-h-[150px] overflow-hidden rounded-xl md:min-h-[170px] md:rounded-2xl ${
                  s.feat ? "min-h-[220px] lg:row-span-2" : ""
                }`}
                style={getAnimStyle(Math.min(i + 1, 3))}
              >
                <Image
                  src={photo.src}
                  alt={L(photo.alt)}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/35 to-navy-950/10 transition-opacity duration-300 group-hover:from-navy-950/90" />
                <span className="absolute top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 text-xs font-semibold text-white ltr:left-3 rtl:right-3 md:h-10 md:w-10 md:text-sm">
                  {s.num}
                </span>
                <div className="absolute bottom-3 z-10 ltr:left-4 rtl:right-4 md:bottom-5 ltr:md:left-6 rtl:md:right-6">
                  <h3 className={`font-extrabold leading-[1.05] tracking-tight text-white ${s.feat ? "text-2xl md:text-4xl" : "text-lg md:text-2xl"}`}>
                    {L(s)}
                  </h3>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-white/80">
                    {t("احجز الآن", "Book now")} <Icon name="arrow" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

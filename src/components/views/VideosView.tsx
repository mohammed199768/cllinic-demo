"use client";
import { useState } from "react";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import SectionShell from "@/components/SectionShell";
import ClinicVideo from "@/components/ClinicVideo";
import Lightbox from "@/components/videos/Lightbox";
import { CLINIC_PHOTO_LIST, CLINIC_VIDEO, type ClinicSpace } from "@/data/clinicMedia";

const SPACE_LABEL: Record<ClinicSpace, { ar: string; en: string }> = {
  reception: { ar: "الاستقبال", en: "Reception" },
  corridor: { ar: "من داخل المركز", en: "Inside the Center" },
  treatment: { ar: "مناطق العلاج", en: "Treatment Areas" },
  observation: { ar: "منطقة الملاحظة", en: "Observation Area" },
  room: { ar: "مناطق العلاج", en: "Treatment Areas" },
};

export default function VideosView() {
  const { lang, t } = useLang();
  const L = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en);
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <>
      <PageHeader
        ar="شاهد معنا"
        en="Watch With Us"
        subAr="جولة فيديو قصيرة داخل المركز، ومعرض من صور مساحاته الحقيقية."
        subEn="A short video tour inside the center, and a gallery of its real spaces."
        icon="video"
      />

      <SectionShell>
        {/* Featured real video */}
        <div className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-card">
          <div className="grid md:grid-cols-2">
            <ClinicVideo
              video={CLINIC_VIDEO}
              className="aspect-video w-full md:aspect-auto md:h-full md:min-h-[260px]"
            />
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <span className="eyebrow mb-3">{t("الفيديو المميّز", "Featured video")}</span>
              <h2 className="text-h3 font-bold text-navy-900">
                {t("جولة بصرية داخل عيادة تجريبية", "A Visual Tour Inside a Demo Clinic")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                {t(
                  "لقطات حقيقية من الاستقبال والممرات ومناطق العلاج داخل المركز.",
                  "Real footage of the reception, corridors and treatment areas inside the center.",
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Photo gallery */}
        <div className="mt-10">
          <h2 className="text-h3 font-bold text-navy-900">{t("من داخل المركز", "Inside the center")}</h2>
          <p className="mt-1 text-sm text-navy-500">{t("صور حقيقية لمساحات المركز.", "Real photos of the center's spaces.")}</p>

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            {CLINIC_PHOTO_LIST.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={L(photo.alt)}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-navy-100 text-start shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <Image
                  src={photo.src}
                  alt={L(photo.alt)}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">
                    {L(SPACE_LABEL[photo.space])}
                  </span>
                  <p className="mt-1.5 text-sm font-bold drop-shadow">{L(photo.title)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </SectionShell>

      {lightbox !== null && (
        <Lightbox
          photos={CLINIC_PHOTO_LIST}
          index={lightbox}
          onIndexChange={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

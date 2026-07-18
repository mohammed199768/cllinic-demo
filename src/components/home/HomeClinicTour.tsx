"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { CLINIC_VIDEO, CLINIC_PHOTOS } from "@/data/clinicMedia";
import ClinicVideo from "@/components/ClinicVideo";
import Icon from "@/components/Icon";
import { useStaggeredReveal } from "./maskHooks";

/**
 * Homepage teaser for the clinic walkthrough. Shows a lightweight poster only —
 * the MP4 is not fetched until the visitor presses play (ClinicVideo lazy).
 */
export default function HomeClinicTour() {
  const { t } = useLang();
  const { containerRef, getAnimStyle } = useStaggeredReveal();

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="snap-section flex min-h-[calc(100svh-4rem)] w-full max-w-full items-center overflow-x-clip py-16 sm:py-20"
    >
      <div className="container-x grid w-full max-w-full items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="order-2 lg:order-1" style={getAnimStyle(0)}>
          <p className="eyebrow mb-3">{t("جولة داخل المركز", "Inside the center")}</p>
          <h2 className="text-h2 font-extrabold tracking-tight text-navy-900">
            {t("جولة قصيرة داخل المركز", "A Short Tour Inside the Center")}
          </h2>
          <p className="mt-4 max-w-xl text-lead text-navy-500">
            {t(
              "شاهد لمحة سريعة عن الاستقبال والممرات ومناطق العلاج، ثم استكشف الجولة الكاملة بإيقاع تتحكم به أنت.",
              "Watch a brief look at the reception, corridors and treatment areas, then explore the full walk at your own pace."
            )}
          </p>
          <Link href="/services" className="btn-primary btn-lg mt-8">
            {t("استكشف خدمات المركز", "Explore Our Services")}
            <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="order-1 lg:order-2" style={getAnimStyle(1)}>
          <ClinicVideo
            video={CLINIC_VIDEO}
            poster={CLINIC_PHOTOS.photo_04.src}
            lazy
            className="aspect-[4/3] w-full rounded-[1.75rem] border border-white/60 shadow-float sm:aspect-[16/10]"
          />
        </div>
      </div>
    </section>
  );
}

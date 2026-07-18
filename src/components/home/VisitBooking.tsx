"use client";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import { whatsappHref } from "@/lib/clinic";
import { HOME_MEDIA } from "@/data/homeMedia";
import Icon from "@/components/Icon";
import { useStaggeredReveal } from "./maskHooks";

function ArrowBtn({ dark = true }: { dark?: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center self-end rounded-full border md:h-12 md:w-12 ${dark ? "border-navy-900 text-navy-900" : "border-white text-white"}`}
    >
      <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />
    </span>
  );
}

export default function VisitBooking() {
  const { lang, t } = useLang();
  const { containerRef, getAnimStyle } = useStaggeredReveal();

  return (
    <section
      ref={containerRef}
      className="snap-section flex min-h-[calc(100svh-4rem)] w-full max-w-full flex-col justify-center gap-1.5 overflow-x-clip px-3 pb-3 pt-1.5 md:gap-2 md:px-5 md:pb-5 md:pt-2 lg:overflow-hidden"
    >
      <div className="grid min-h-0 w-full max-w-full flex-1 grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-1.5 md:gap-2">
          {/* heading card */}
          <div
            className="flex min-h-[180px] flex-[1.2] flex-col justify-between rounded-xl bg-[#eef5fb] p-5 md:min-h-0 md:rounded-2xl md:p-7"
            style={getAnimStyle(0)}
          >
            <h2 className="font-extrabold leading-[0.95] tracking-tight text-navy-900 text-[clamp(2.6rem,7vw,6rem)]">
              {t("احجز بسهولة", "Book with ease")}
            </h2>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="max-w-xs text-xs font-semibold text-navy-600 md:text-sm">
                {t(
                  "اختر الخدمة، الوقت، وسنتواصل معك لتأكيد التفاصيل.",
                  "Pick a service and time; we'll confirm the details with you.",
                )}
              </p>
              <Link href="/booking" className="btn-primary px-6 py-3">
                {t("ابدأ الحجز", "Start booking")}{" "}
                <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          {/* two image cards */}
          <div
            className="flex min-h-[140px] flex-1 gap-1.5 md:gap-2"
            style={getAnimStyle(1)}
          >
            {[
              {
                src: HOME_MEDIA.corridor,
                ar: "الممر ومناطق العلاج",
                en: "Corridor & care areas",
              },
              {
                src: HOME_MEDIA.room,
                ar: "غرفة علاج مجهزة",
                en: "Equipped treatment room",
              },
            ].map((im, i) => (
              <div
                key={i}
                className="relative flex-1 overflow-hidden rounded-xl md:rounded-2xl"
              >
                <Image
                  src={im.src}
                  alt={lang === "ar" ? im.ar : im.en}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                <span className="absolute bottom-3 z-10 text-sm font-bold text-white ltr:left-3 rtl:right-3 md:text-base">
                  {lang === "ar" ? im.ar : im.en}
                </span>
              </div>
            ))}
          </div>

          {/* consultation card */}
          <div
            className="flex min-h-[150px] flex-[0.8] items-end justify-between rounded-xl bg-navy-900 p-5 text-white md:min-h-0 md:rounded-2xl md:p-7"
            style={getAnimStyle(2)}
          >
            <div>
              <p className="mb-2 text-xs font-semibold text-cyan-300 md:text-sm">
                {t("استشارة طبية", "Medical consultation")}
              </p>
              <h3 className="text-xl font-bold leading-7 md:text-3xl">
                {t(
                  "واتساب أو مكالمة قريبة منك",
                  "WhatsApp or a call, close to you",
                )}
              </h3>
            </div>
            <a
              href={whatsappHref("مرحباً، أرغب باستشارة طبية.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-white px-5 py-3 text-sm text-navy-900 hover:bg-brand-50"
            >
              {t("تواصل الآن", "Contact now")}
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN — tall image with overlays */}
        <div
          className="relative min-h-[360px] overflow-hidden rounded-xl md:min-h-0 md:rounded-2xl"
          style={getAnimStyle(3)}
        >
          <Image
            src={HOME_MEDIA.reception}
            alt={t("عيادتنا والموقع العام", "OurClinic and general location")}
            fill
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-navy-950/10" />

          {/* overlay cards */}
          <div className="absolute inset-x-3 bottom-3 z-10 flex gap-1.5 md:inset-x-5 md:bottom-5 md:gap-2">
            <Link
              href="/booking"
              className="flex h-36 flex-1 flex-col justify-between rounded-xl bg-white p-3 transition-transform hover:scale-[1.02] md:h-52 md:rounded-2xl md:p-5"
            >
              <h4 className="text-lg font-bold leading-5 text-navy-900 md:text-2xl md:leading-7">
                {t("خطوات الحجز البسيطة", "Simple booking steps")}
              </h4>
              <ArrowBtn dark />
            </Link>
            <Link
              href="/contact"
              className="flex h-36 flex-1 flex-col justify-between rounded-xl bg-white/20 p-3 backdrop-blur-xl transition-transform hover:scale-[1.02] md:h-52 md:rounded-2xl md:p-5"
            >
              <h4 className="text-lg font-bold leading-5 text-white md:text-2xl md:leading-7">
                {t("موقع المركز والاتجاهات", "Location & directions")}
              </h4>
              <ArrowBtn dark={false} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

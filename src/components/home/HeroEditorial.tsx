"use client";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import { CLINIC, whatsappHref } from "@/lib/clinic";
import { HOME_MEDIA } from "@/data/homeMedia";
import Icon from "@/components/Icon";
import { useStaggeredReveal } from "./maskHooks";

export default function HeroEditorial() {
  const { lang, t } = useLang();
  const { containerRef, getAnimStyle, getImageStyle } = useStaggeredReveal(0.25);

  const trust = [
    { icon: "clock", ar: "المواعيد حسب التوفر", en: "Appointments by availability" },
    { icon: "home", ar: "خيارات زيارة توضيحية", en: "Illustrative visit options" },
    { icon: "vial", ar: "محتوى خدمي تجريبي", en: "Demo service content" },
    { icon: "shield", ar: "تأكيد التفاصيل مباشرة", en: "Confirm details directly" },
  ];

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="snap-section relative w-full max-w-full overflow-x-clip bg-gradient-to-b from-[#eef5fb] to-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="container-x relative grid min-h-[calc(100svh-4rem)] max-w-full items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-16">
        {/* content */}
        <div className="order-2 lg:order-1">
          <span className="chip mb-5" style={getAnimStyle(0)}>
            <Icon name="activity" className="h-4 w-4 text-brand-600" />
            {lang === "ar" ? CLINIC.name.ar : CLINIC.name.en}
          </span>

          <h1
            className="font-extrabold tracking-tight text-navy-900 text-[clamp(2.25rem,4.6vw,4.25rem)] leading-[1.05]"
            style={getAnimStyle(1)}
          >
            {lang === "ar" ? CLINIC.tagline.ar : CLINIC.tagline.en}
          </h1>

          <p
            className="mt-5 max-w-[42rem] text-base leading-relaxed text-navy-600 md:text-xl"
            style={getAnimStyle(2)}
          >
            {t(
              "استكشف نموذجًا توضيحيًا ثنائي اللغة للحجز والتواصل ومعلومات العيادة العامة. تُؤكَّد الخدمات والمواعيد مباشرة قبل الزيارة.",
              "Explore a bilingual demonstration of clinic booking, contact, and general information. Services and appointment availability must be confirmed directly."
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3" style={getAnimStyle(3)}>
            <Link href="/booking" className="btn-primary btn-lg shadow-glow">
              <Icon name="calendar" className="h-4 w-4" /> {t("احجز الآن", "Book Now")}
            </Link>
            <a
              href={whatsappHref("مرحباً، أرغب بالتواصل مع عيادتنا.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <Icon name="whatsapp" className="h-4 w-4 text-[#1faf54]" /> WhatsApp
            </a>
          </div>

          <div className="mt-9 flex flex-wrap gap-2" style={getAnimStyle(4)}>
            {trust.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-navy-100 bg-white/70 px-3 py-1.5 text-xs font-semibold text-navy-700 backdrop-blur">
                <Icon name={c.icon} className="h-3.5 w-3.5 text-brand-600" />
                {lang === "ar" ? c.ar : c.en}
              </span>
            ))}
          </div>
        </div>

        {/* image panel */}
        <div className="order-1 lg:order-2" style={getImageStyle()}>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-white/60 shadow-float sm:aspect-[5/4] lg:aspect-auto lg:h-[clamp(420px,62vh,640px)]">
            <Image
              src={HOME_MEDIA.hero}
              alt={t("قاعة استقبال مضيئة وواسعة في عيادة تجريبية", "A bright, spacious reception hall in a demonstration clinic")}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent" />
            <div className="absolute bottom-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-navy-800 backdrop-blur ltr:left-4 rtl:right-4">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
              {t("نسمعك ونعتني بك", "We listen and we care")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

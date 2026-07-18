"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { CLINIC, whatsappHref } from "@/lib/clinic";
import { MEDIA } from "@/data/media";
import Icon from "./Icon";

const PAGE_BG = "#eef5fb";

export default function Hero() {
  const { lang, t } = useLang();
  const reduce = useReducedMotion();

  const ease = [0.22, 0.61, 0.36, 1] as const;
  const fade = (d: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease, delay: d },
        };

  const trust = [
    { icon: "clock", ar: "المواعيد حسب التوفر", en: "Appointments by availability" },
    { icon: "home", ar: "خيارات زيارة توضيحية", en: "Illustrative visit options" },
    { icon: "vial", ar: "محتوى خدمي تجريبي", en: "Demo service content" },
    { icon: "shield", ar: "تأكيد التفاصيل مباشرة", en: "Confirm details directly" },
  ];

  return (
    <section className="px-3 pt-3 sm:px-5 sm:pt-5" style={{ background: PAGE_BG }}>
      <div className="js-hero-frame relative mx-auto w-full max-w-[88rem] overflow-hidden rounded-[1.75rem] border border-white/50 shadow-float sm:rounded-[2.5rem] lg:min-h-[720px]">
        {/* background media */}
        <Image
          src={MEDIA.heroBackground}
          alt={lang === "ar" ? MEDIA.heroAlt.ar : MEDIA.heroAlt.en}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* calm, stronger overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/82 to-white/92" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1100px 600px at 15% 20%, rgba(255,255,255,0.95), transparent 62%)",
          }}
        />

        {/* transition brighten overlay (animated by HeroTransition) */}
        <div
          className="js-hero-overlay pointer-events-none absolute inset-0 z-[6] opacity-0"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(223,238,255,0.95))" }}
          aria-hidden
        />

        {/* content */}
        <div className="js-hero-content relative z-10 flex min-h-[600px] flex-col justify-center px-6 py-20 sm:px-12 lg:min-h-[720px] lg:px-24 lg:py-28">
          <motion.div {...fade(0)} className="js-hero-badge">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-navy-700 shadow-soft">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-cyan-300">
                <Icon name="activity" className="h-3.5 w-3.5" />
              </span>
              {lang === "ar" ? CLINIC.name.ar : CLINIC.name.en}
            </span>
          </motion.div>

          <motion.h1 {...fade(0.08)} className="js-hero-title mt-7 max-w-3xl text-display font-extrabold leading-[1.1] text-navy-900">
            {lang === "ar" ? CLINIC.tagline.ar : CLINIC.tagline.en}
          </motion.h1>

          <motion.p {...fade(0.16)} className="js-hero-sub mt-6 max-w-xl text-lead text-navy-600">
            {t(
              "استكشف نموذجًا توضيحيًا ثنائي اللغة للحجز والتواصل ومعلومات العيادة العامة. تُؤكَّد الخدمات والمواعيد مباشرة قبل الزيارة.",
              "Explore a bilingual demonstration of clinic booking, contact, and general information. Services and appointment availability must be confirmed directly."
            )}
          </motion.p>

          <motion.div {...fade(0.24)} className="js-hero-cta mt-9 flex flex-wrap items-center gap-3">
            <Link href="/booking" className="btn-primary btn-lg group">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Icon name="calendar" className="h-3.5 w-3.5" />
              </span>
              {t("احجز الآن", "Book Now")}
              <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </Link>
            <a href={whatsappHref("مرحباً، أرغب بالتواصل مع عيادتنا.")} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <Icon name="whatsapp" className="h-4 w-4 text-[#1faf54]" /> WhatsApp
            </a>
          </motion.div>

          {/* one clean trust row */}
          <motion.div {...fade(0.34)} className="js-hero-pills mt-12 flex max-w-2xl flex-wrap gap-2">
            {trust.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/55 px-3 py-1.5 text-xs font-semibold text-navy-700 backdrop-blur">
                <Icon name={c.icon} className="h-3.5 w-3.5 text-brand-600" />
                {lang === "ar" ? c.ar : c.en}
              </span>
            ))}
          </motion.div>
        </div>

        {/* single supporting card — upper end side */}
        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.8, ease, delay: 0.45 } })}
          className="js-hero-card absolute top-10 z-10 hidden ltr:right-10 rtl:left-10 lg:block"
        >
          <div className="glass w-60 rounded-3xl p-5 shadow-glow">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-navy-500">
                <span className="h-1.5 w-1.5 rounded-full bg-mint-400" /> {t("مراقبة حيوية", "Vitals")}
              </span>
              <Icon name="activity" className="h-4 w-4 text-brand-500" />
            </div>
            <svg viewBox="0 0 180 50" className="mt-3 w-full">
              <path d="M0 28 H40 l8 -18 l10 36 l8 -26 l9 14 H180" fill="none" stroke="#3470e4" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/70 px-2.5 py-1.5">
                <p className="text-[10px] font-semibold text-navy-400">{t("النبض", "Pulse")}</p>
                <p className="text-sm font-extrabold text-navy-800">72<span className="text-[10px] font-medium text-navy-400"> bpm</span></p>
              </div>
              <div className="rounded-xl bg-white/70 px-2.5 py-1.5">
                <p className="text-[10px] font-semibold text-navy-400">SpO₂</p>
                <p className="text-sm font-extrabold text-navy-800">98<span className="text-[10px] font-medium text-navy-400"> %</span></p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* one bottom corner cutout booking module (end side) */}
        <div className="js-hero-cutout absolute bottom-0 z-10 ltr:right-0 rtl:left-0">
          <div className="p-3 ltr:rounded-tl-[2rem] rtl:rounded-tr-[2rem]" style={{ background: PAGE_BG }}>
            <div className="flex w-[18rem] max-w-[78vw] items-center gap-3 rounded-[1.4rem] bg-white p-4 shadow-card">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
                <Icon name="calendar" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-navy-900">{t("ابدأ بخطوة بسيطة", "Start with one simple step")}</p>
                <p className="mt-0.5 text-xs text-navy-500">{t("اختر الخدمة والموعد وسنتواصل معك.", "Pick a service and time, and we'll reach out.")}</p>
              </div>
              <Link href="/booking" className="btn-primary shrink-0 px-3.5 py-2 text-xs">
                {t("احجز", "Book")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

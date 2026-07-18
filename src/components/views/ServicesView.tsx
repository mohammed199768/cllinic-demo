"use client";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import SectionShell from "@/components/SectionShell";
import ServiceCard from "@/components/ServiceCard";
import DisclaimerNote from "@/components/DisclaimerNote";
import Icon from "@/components/Icon";
import { CLINIC_PHOTOS } from "@/data/clinicMedia";
import services from "@/data/services.json";

export default function ServicesView() {
  const { lang, t } = useLang();
  const L = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en);
  const dentistry = services.find((s) => s.id === "dentistry");
  const gridServices = services.filter((s) => s.id !== "dentistry");
  const dentPhoto = CLINIC_PHOTOS.photo_07;

  return (
    <>
      <PageHeader
        ar="فئات خدمات توضيحية"
        en="Illustrative Service Categories"
        subAr="محتوى تجريبي لعرض رحلة الاستفسار والحجز؛ يجب تأكيد الخدمة والتوفر مباشرة."
        subEn="Demo content showing the enquiry and booking journey; confirm services and availability directly."
        icon="stethoscope"
      />

      <SectionShell>
        <section className="mb-10 overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-6 shadow-card sm:p-8">
          <div className="grid items-center gap-7 md:grid-cols-[1fr_auto]">
            <div className="flex items-start gap-4">
              <span className="icon-pad h-12 w-12 shrink-0 bg-white"><Icon name="heart-pulse" className="h-6 w-6" /></span>
              <div><p className="text-xs font-bold uppercase tracking-widest text-brand-600">{t("دعم المريض", "Patient support")}</p><h2 className="mt-2 text-h2 font-extrabold text-navy-900">{t("رفيق صحتك", "Health Companion")}</h2><p className="mt-2 max-w-2xl text-navy-600">{t("أدوات تساعدك بين زيارة وأخرى: رتّب قياساتك وأدويتك، استعد لموعدك، واطبع ملخصًا واضحًا دون إنشاء حساب.", "Tools that support you between visits: organize measurements and medications, prepare for appointments, and print a clear summary without an account.")}</p></div>
            </div>
            <Link href="/health-journey" className="btn-primary w-full md:w-auto">{t("ابدأ رحلتك الصحية", "Start your health journey")}<Icon name="arrow" className="h-4 w-4 rtl:rotate-180" /></Link>
          </div>
        </section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gridServices.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-24">
              <ServiceCard service={s} full />
            </div>
          ))}
        </div>

        {/* Dentistry highlight */}
        {dentistry && (
          <div
            id="dentistry"
            className="mt-10 scroll-mt-24 overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-card"
          >
            <div className="grid items-stretch md:grid-cols-2">
              <div className="relative min-h-[240px] md:min-h-full">
                <Image
                  src={dentPhoto.src}
                  alt={L(dentPhoto.alt)}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-9">
                <span className="icon-pad h-12 w-12">
                  <Icon name="smile" className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-h2 font-extrabold text-navy-900">{L(dentistry.title)}</h2>
                <p className="mt-3 text-navy-500">{L(dentistry.desc)}</p>
                <Link href="/booking" className="btn-primary mt-6 w-fit">
                  {t("احجز موعدك", "Book your visit")}
                  <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <DisclaimerNote />
        </div>
      </SectionShell>
    </>
  );
}

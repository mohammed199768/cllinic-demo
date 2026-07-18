"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { useLang } from "@/lib/i18n";
import { HEALTH_ROUTES } from "@/data/healthJourneyContent";

export function HealthCompanionBridge({ source }: { source: "stories" | "tips" }) {
  const { t } = useLang();
  const isStories = source === "stories";
  return (
    <aside className="mb-8 overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-5 shadow-soft sm:p-7">
      <div className="grid items-center gap-5 md:grid-cols-[1fr_auto]">
        <div className="flex items-start gap-4">
          <span className="icon-pad h-12 w-12 shrink-0 bg-white"><Icon name={isStories ? "quote" : "activity"} className="h-6 w-6" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">{t("من المعرفة إلى التنظيم", "From learning to organization")}</p>
            <h2 className="mt-2 text-h3 font-extrabold text-navy-900">
              {isStories ? t("هل أثارت القصة سؤالًا لزيارتك القادمة؟", "Did the story raise a question for your next visit?") : t("احتفظ بما يفيدك بين زيارة وأخرى", "Keep useful information organized between visits")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-600">
              {isStories ? t("استخدم رفيق صحتك لتدوين السؤال والاستعداد لمناقشته مع طبيبك، دون إرسال أي بيانات إلى المركز.", "Use Health Companion to note the question and prepare to discuss it with your clinician, without sending data to the clinic.") : t("رفيق صحتك يساعدك على ترتيب القياسات والأدوية والأسئلة التي تختار تسجيلها محليًا على جهازك.", "Health Companion helps organize the measurements, medications, and questions you choose to record locally on your device.")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          <Link href={HEALTH_ROUTES.hub} className="btn-primary whitespace-nowrap"><Icon name="heart-pulse" className="h-4 w-4" />{t("افتح رفيق صحتك", "Open Health Companion")}</Link>
          <Link href={isStories ? HEALTH_ROUTES.visit : HEALTH_ROUTES.downloads} className="btn-ghost whitespace-nowrap">{isStories ? t("حضّر لزيارتك", "Prepare for a visit") : t("النماذج القابلة للطباعة", "Printable resources")}</Link>
        </div>
      </div>
    </aside>
  );
}

export function HealthLearningLinks() {
  const { t } = useLang();
  const links = [
    { href: "/daily-stories", icon: "quote", title: t("قصص يومية", "Daily Stories"), body: t("حكايات إنسانية وتوعوية من تفاصيل الحياة اليومية.", "Human-centered educational stories from everyday life.") },
    { href: "/medical-tips", icon: "activity", title: t("نصائح طبية", "Medical Tips"), body: t("معلومات عامة مبسطة للعناية بك وبعائلتك.", "Clear general information for you and your family.") },
  ];
  return (
    <section className="rounded-4xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
      <p className="eyebrow">{t("اقرأ وتعلّم", "Read and learn")}</p>
      <h2 className="mt-3 text-h2 font-extrabold text-navy-900">{t("محتوى يدعم رحلتك", "Content that supports your journey")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-500">{t("اطّلع على المحتوى التثقيفي، ثم عد إلى أدواتك لترتيب ما ترغب في مناقشته خلال زيارتك.", "Explore educational content, then return to your tools to organize what you want to discuss during your visit.")}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {links.map((item) => <Link key={item.href} href={item.href} className="group flex min-h-28 items-start gap-4 rounded-2xl border border-navy-100 bg-cloud/50 p-4 transition hover:border-brand-200 hover:bg-brand-50/60"><span className="icon-pad h-11 w-11 shrink-0 bg-white"><Icon name={item.icon} className="h-5 w-5" /></span><span><strong className="block text-navy-900 group-hover:text-brand-700">{item.title}</strong><span className="mt-1 block text-sm leading-relaxed text-navy-500">{item.body}</span></span></Link>)}
      </div>
    </section>
  );
}

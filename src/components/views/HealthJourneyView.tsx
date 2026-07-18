"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { useLang } from "@/lib/i18n";
import { GATEWAYS, GLOBAL_DISCLAIMER, HERO, JOURNEY_STEPS, PRODUCT } from "@/data/healthJourneyContent";
import PrivacyNotice from "@/components/health-journey/PrivacyNotice";
import LocalDataControls from "@/components/health-journey/LocalDataControls";
import { HealthLearningLinks } from "@/components/health-journey/HealthCompanionBridge";

export default function HealthJourneyView() {
  const { lang, t } = useLang();
  const L = (value: { ar: string; en: string }) => lang === "ar" ? value.ar : value.en;

  return (
    <div className="health-print overflow-x-clip bg-cloud/40">
      <section className="relative overflow-hidden border-b border-navy-100 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="container-x relative grid min-h-[70svh] items-center gap-10 py-16 lg:grid-cols-[1.15fr_.85fr] lg:py-24">
          <div>
            <p className="eyebrow">{L(HERO.eyebrow)}</p>
            <h1 className="mt-5 max-w-4xl text-display font-extrabold text-navy-900">{L(HERO.headline)}</h1>
            <p className="mt-5 max-w-2xl text-lead text-navy-600">{L(HERO.description)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#tools" className="btn-primary btn-lg"><Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />{L(HERO.primaryCta)}</a>
              <a href="#privacy" className="btn-ghost btn-lg"><Icon name="shield" className="h-4 w-4" />{L(HERO.secondaryCta)}</a>
            </div>
          </div>
          <div className="rounded-4xl border border-brand-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-6 shadow-card sm:p-8">
            <p className="text-sm font-bold text-brand-700">{L(PRODUCT.name)}</p>
            <ol className="mt-5 space-y-3">
              {JOURNEY_STEPS.slice(1).map((step, index) => (
                <li key={step.en} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-navy-700 shadow-xs">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{index + 1}</span>
                  {L(step)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="tools" className="container-x scroll-mt-20 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{t("اختر ما تحتاجه", "Choose what you need")}</p>
          <h2 className="mt-3 text-h2 font-extrabold text-navy-900">{t("أدوات بسيطة، في وقتك أنت", "Simple tools, at your own pace")}</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GATEWAYS.map((gateway, index) => (
            <Link key={gateway.slug} href={gateway.href} className="group relative min-h-56 overflow-hidden rounded-3xl border border-navy-100 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-float motion-reduce:transform-none">
              <span className="absolute top-5 text-xs font-bold text-navy-300 ltr:right-5 rtl:left-5">0{index + 1}</span>
              <span className="icon-pad h-12 w-12"><Icon name={gateway.icon} className="h-6 w-6" /></span>
              <h3 className="mt-6 text-h3 font-bold text-navy-900 group-hover:text-brand-700">{L(gateway.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{L(gateway.description)}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand-700">{t("افتح الأداة", "Open tool")}<Icon name="arrow" className="h-4 w-4 rtl:rotate-180" /></span>
            </Link>
          ))}
        </div>
      </section>

      <div className="container-x space-y-8 pb-16">
        <HealthLearningLinks />
        <PrivacyNotice detailed />
        <LocalDataControls />
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">{L(GLOBAL_DISCLAIMER)}</p>
      </div>
    </div>
  );
}

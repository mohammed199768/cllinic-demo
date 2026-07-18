"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { useLang } from "@/lib/i18n";
import { HEALTH_ROUTES, PRODUCT } from "@/data/healthJourneyContent";

export default function HealthCompanionFeature() {
  const { lang, t } = useLang();
  const tools = [
    { icon: "heart-pulse", ar: "رتّب قياساتك", en: "Organize measurements" },
    { icon: "pill", ar: "اجمع قائمة أدويتك", en: "Gather your medication list" },
    { icon: "file-text", ar: "اطبع ملخصًا للطبيب", en: "Print a doctor summary" },
  ];
  return <section className="snap-section flex min-h-[calc(100svh-4rem)] w-full items-center overflow-x-clip bg-gradient-to-br from-navy-950 via-navy-900 to-brand-950 py-16 text-white sm:py-20">
    <div className="container-x grid w-full items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{t("رعاية تمتد إلى ما بعد الزيارة", "Care that continues beyond the visit")}</p><h2 className="mt-4 text-display font-extrabold">{lang === "ar" ? PRODUCT.name.ar : PRODUCT.name.en}</h2><p className="mt-4 max-w-2xl text-lead text-navy-200">{lang === "ar" ? PRODUCT.brandMessage.ar : PRODUCT.brandMessage.en}</p><p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-300">{t("أدوات محلية بسيطة تساعدك بين زيارة وأخرى، دون حساب ودون إرسال بياناتك إلى المركز.", "Simple local tools that support you between visits, without an account and without sending your data to the clinic.")}</p><Link href={HEALTH_ROUTES.hub} className="btn mt-7 bg-white px-7 py-3.5 text-brand-700 shadow-float hover:bg-brand-50"><Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />{t("اكتشف رفيق صحتك", "Explore Health Companion")}</Link></div>
      <div className="space-y-3">{tools.map((tool, index) => <div key={tool.en} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-300"><Icon name={tool.icon} className="h-6 w-6" /></span><div><span className="text-xs font-bold text-navy-400">0{index + 1}</span><h3 className="font-bold text-white">{lang === "ar" ? tool.ar : tool.en}</h3></div></div>)}</div>
    </div>
  </section>;
}

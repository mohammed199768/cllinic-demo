"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Icon from "./Icon";

type Service = {
  id: string; icon: string;
  title: { ar: string; en: string };
  short: { ar: string; en: string };
  desc?: { ar: string; en: string };
};

export default function ServiceCard({ service, full = false, featured = false }: { service: Service; full?: boolean; featured?: boolean }) {
  const { lang, t } = useLang();
  const body = full && service.desc ? (lang === "ar" ? service.desc.ar : service.desc.en) : (lang === "ar" ? service.short.ar : service.short.en);

  if (featured) {
    return (
      <Link href="/booking" className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-navy-100/70 bg-gradient-to-br from-navy-900 to-navy-800 p-7 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl" />
        <div className="relative">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300 ring-1 ring-white/15">
            <Icon name={service.icon} className="h-6 w-6" />
          </span>
          <h3 className="mt-5 text-xl font-bold">{lang === "ar" ? service.title.ar : service.title.en}</h3>
          <p className="mt-2 max-w-xs text-sm text-navy-200">{lang === "ar" ? service.desc?.ar ?? service.short.ar : service.desc?.en ?? service.short.en}</p>
        </div>
        <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300">
          {t("احجز الآن", "Book now")} <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </span>
      </Link>
    );
  }

  return (
    <div className="group card-elevated flex flex-col p-6">
      <span className="icon-pad h-12 w-12 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon name={service.icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-h3 font-bold text-navy-900">{lang === "ar" ? service.title.ar : service.title.en}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">{body}</p>
      <Link href="/booking" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        {t("احجز الآن", "Book now")} <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
      </Link>
    </div>
  );
}

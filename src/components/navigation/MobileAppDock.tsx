"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/lib/i18n";
import { usePWAInstall } from "@/components/pwa/PWAProvider";
import Icon from "@/components/Icon";

type Bi = { ar: string; en: string };
type NavItem = Bi & { href: string; icon: string };

const PRIMARY: NavItem[] = [
  { ar: "الرئيسية", en: "Home", href: "/", icon: "home" },
  { ar: "الخدمات", en: "Services", href: "/services", icon: "stethoscope" },
  { ar: "رفيق صحتك", en: "Companion", href: "/health-journey", icon: "heart-pulse" },
];

const GROUPS: { title: Bi; items: NavItem[] }[] = [
  { title: { ar: "رعايتك", en: "Your Care" }, items: [
    { ar: "حجز موعد", en: "Booking", href: "/booking", icon: "calendar" },
    { ar: "رفيق صحتك", en: "Health Companion", href: "/health-journey", icon: "heart-pulse" },
  ] },
  { title: { ar: "المحتوى الصحي", en: "Health Content" }, items: [
    { ar: "صحتك في دقيقة", en: "Medical Minute", href: "/medical-minute", icon: "play" },
    { ar: "نصائح طبية", en: "Medical Tips", href: "/medical-tips", icon: "activity" },
    { ar: "قصص يومية", en: "Daily Stories", href: "/daily-stories", icon: "quote" },
    { ar: "فيديوهات", en: "Videos", href: "/videos", icon: "video" },
    { ar: "أسئلة شائعة", en: "FAQ", href: "/faq", icon: "message" },
  ] },
  { title: { ar: "العائلة", en: "Family" }, items: [
    { ar: "العائلة والأطفال", en: "Family & Kids", href: "/kids", icon: "users" },
    { ar: "اعرف نفسك", en: "Know Yourself", href: "/know-yourself", icon: "brain" },
  ] },
  { title: { ar: "المركز", en: "Center" }, items: [
    { ar: "تواصل معنا", en: "Contact", href: "/contact", icon: "headset" },
  ] },
];

export default function MobileAppDock() {
  const { lang, t } = useLang();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const guideButton = useRef<HTMLButtonElement>(null);
  const L = (value: Bi) => value[lang];

  useEffect(() => {
    const opened = () => setGuideOpen(true);
    const closed = () => { setGuideOpen(false); guideButton.current?.focus(); };
    window.addEventListener("our-clinic-guide-opened", opened);
    window.addEventListener("our-clinic-guide-closed", closed);
    return () => { window.removeEventListener("our-clinic-guide-opened", opened); window.removeEventListener("our-clinic-guide-closed", closed); };
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const resize = () => setKeyboardOpen(viewport.height < window.innerHeight * 0.72);
    resize(); viewport.addEventListener("resize", resize);
    return () => viewport.removeEventListener("resize", resize);
  }, []);

  const active = (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));
  if (guideOpen || keyboardOpen) return null;
  return <>
    <nav aria-label={t("التنقل الرئيسي", "Primary navigation")} className="app-dock fixed inset-x-0 bottom-0 z-[700] px-2 pb-[max(.5rem,env(safe-area-inset-bottom,0px))] lg:hidden">
      <div className="mx-auto grid h-[4.75rem] w-full max-w-2xl grid-cols-5 items-stretch rounded-[1.4rem] border border-navy-100/90 bg-white/95 p-1.5 shadow-float backdrop-blur-xl">
        <DockLink item={PRIMARY[0]} active={active(PRIMARY[0].href)} label={L(PRIMARY[0])} />
        <DockLink item={PRIMARY[1]} active={active(PRIMARY[1].href)} label={L(PRIMARY[1])} />
        <button ref={guideButton} type="button" onClick={() => window.dispatchEvent(new CustomEvent("our-clinic-guide-open"))} aria-haspopup="dialog" className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl bg-brand-600 px-1 text-white shadow-soft transition active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"><Icon name="navigation" className="h-5 w-5" /><span className="text-[10px] font-bold leading-tight sm:text-xs">{t("الدليل", "Guide")}</span></button>
        <DockLink item={PRIMARY[2]} active={active(PRIMARY[2].href)} label={L(PRIMARY[2])} />
        <button ref={moreButton} type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen} className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-navy-600 transition hover:bg-navy-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"><Icon name="more" className="h-5 w-5" /><span className="text-[10px] font-semibold leading-tight sm:text-xs">{t("المزيد", "More")}</span></button>
      </div>
    </nav>
    <MoreSheet open={moreOpen} onClose={() => { setMoreOpen(false); requestAnimationFrame(() => moreButton.current?.focus()); }} pathname={pathname} />
  </>;
}

function DockLink({ item, active, label }: { item: NavItem; active: boolean; label: string }) {
  return <Link href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${active ? "bg-brand-50 font-bold text-brand-700" : "text-navy-600 hover:bg-navy-50"}`}><Icon name={item.icon} className="h-5 w-5" /><span className="text-[10px] font-semibold leading-tight sm:text-xs">{label}</span></Link>;
}

function MoreSheet({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string | null }) {
  const { lang, setLang, t } = useLang();
  const { canInstall, showInstall } = usePWAInstall();
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(onClose, [onClose]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
    const focusable = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('a,button:not([disabled])') ?? []);
    requestAnimationFrame(() => focusable()[0]?.focus());
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") { const items = focusable(); if (!items.length) return; const first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
    };
    window.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", keydown); };
  }, [open, close]);
  if (!open) return null;
  return createPortal(<div className="app-sheet fixed inset-0 z-[1000] flex items-end justify-center bg-navy-950/50 lg:hidden" onMouseDown={(e) => e.target === e.currentTarget && close()}><div ref={panel} role="dialog" aria-modal="true" aria-label={t("المزيد", "More")} className="max-h-[88dvh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-cloud px-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-3 shadow-float sm:px-6"><div className="mx-auto mb-3 h-1 w-10 rounded-full bg-navy-200" /><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-navy-900">{t("المزيد", "More")}</h2><button type="button" onClick={close} aria-label={t("إغلاق", "Close")} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy-700 shadow-xs"><Icon name="close" /></button></div><div className="mt-4 grid gap-4 sm:grid-cols-2">{GROUPS.map((group) => <section key={group.title.en} className="rounded-2xl border border-navy-100 bg-white p-3"><h3 className="px-2 pb-2 text-xs font-bold uppercase tracking-[.14em] text-brand-600">{group.title[lang]}</h3><div className="grid gap-1">{group.items.map((item) => { const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} onClick={close} aria-current={isActive ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold ${isActive ? "bg-brand-50 text-brand-700" : "text-navy-700 hover:bg-navy-50"}`}><span className="icon-pad h-9 w-9 shrink-0"><Icon name={item.icon} className="h-4 w-4" /></span>{item[lang]}</Link>; })}</div></section>)}<section className="rounded-2xl border border-navy-100 bg-white p-3"><h3 className="px-2 pb-2 text-xs font-bold uppercase tracking-[.14em] text-brand-600">{t("التطبيق", "Application")}</h3><div className="grid gap-2"><div className="grid grid-cols-2 gap-2"><button onClick={() => setLang("ar")} aria-pressed={lang === "ar"} className={`min-h-11 rounded-xl text-sm font-bold ${lang === "ar" ? "bg-brand-600 text-white" : "bg-navy-50 text-navy-700"}`}>العربية</button><button onClick={() => setLang("en")} aria-pressed={lang === "en"} className={`min-h-11 rounded-xl text-sm font-bold ${lang === "en" ? "bg-brand-600 text-white" : "bg-navy-50 text-navy-700"}`}>English</button></div>{canInstall && <button onClick={() => { close(); showInstall(); }} className="flex min-h-12 items-center gap-3 rounded-xl px-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50"><span className="icon-pad h-9 w-9"><Icon name="download" className="h-4 w-4" /></span>{t("تثبيت التطبيق", "Install application")}</button>}</div></section></div></div></div>, document.body);
}

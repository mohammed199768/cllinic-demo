"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import Icon from "./Icon";

type DockLink = { ar: string; en: string; href: string; icon: string };

const LINKS: DockLink[] = [
  { ar: "صحتك في دقيقة", en: "Medical Minute", href: "/medical-minute", icon: "play" },
  { ar: "نصائح طبية", en: "Medical Tips", href: "/medical-tips", icon: "activity" },
  { ar: "قصص يومية", en: "Daily Stories", href: "/daily-stories", icon: "quote" },
  { ar: "شاهد معنا", en: "Videos", href: "/videos", icon: "video" },
  { ar: "الأسئلة الشائعة", en: "FAQ", href: "/faq", icon: "message" },
];

/** Routes where a floating dock would compete with the layout or forms. */
const HIDDEN_ON = new Set(["/", "/booking", "/contact"]);

export default function MedicalContentDock() {
  const { lang, t } = useLang();
  const pathname = usePathname();
  const L = (o: { ar: string; en: string }) => (lang === "ar" ? o.ar : o.en);
  const [nearFooter, setNearFooter] = useState(false);

  // Hide when the footer enters the viewport so the dock never covers it.
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setNearFooter(entry.isIntersecting),
      { rootMargin: "0px 0px 0px 0px", threshold: 0 },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, [pathname]);

  if (pathname && HIDDEN_ON.has(pathname)) return null;

  const isActive = (href: string) => pathname === href;

  const hiddenCls = nearFooter
    ? "pointer-events-none opacity-0 translate-y-2"
    : "opacity-100";

  return (
    <nav aria-label={t("المحتوى الطبي", "Medical Content")}>
      {/* Desktop-only contextual rail; mobile/tablet use the application dock. */}
      <div
        className={`fixed top-1/2 z-40 hidden -translate-y-1/2 lg:block ltr:right-4 rtl:left-4 transition-all duration-300 ${hiddenCls}`}
      >
        <ul className="flex flex-col items-center gap-1.5 rounded-full border border-navy-100 bg-white/90 p-1.5 shadow-card backdrop-blur">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href} className="group relative">
                <Link
                  href={l.href}
                  aria-label={L(l)}
                  aria-current={active ? "page" : undefined}
                  title={L(l)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                    active
                      ? "bg-brand-600 text-white shadow-soft"
                      : "text-navy-600 hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  <Icon name={l.icon} className="h-5 w-5" />
                </Link>
                {/* Label revealed on hover/focus; also announced via aria-label/title. */}
                <span
                  className="pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 ltr:right-full ltr:mr-2 rtl:left-full rtl:ml-2"
                >
                  {L(l)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

    </nav>
  );
}

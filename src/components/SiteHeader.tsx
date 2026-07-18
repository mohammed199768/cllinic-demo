"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";
import BrandMark from "./BrandMark";
import LanguageToggle from "./LanguageToggle";
import Icon from "./Icon";

const LINKS = [
  { ar: "الرئيسية", en: "Home", href: "/" },
  { ar: "الخدمات", en: "Services", href: "/services" },
  {
    ar: "المحتوى الطبي",
    en: "Medical Content",
    href: "/medical-minute",
    matches: ["/medical-tips", "/daily-stories", "/videos", "/faq"],
  },
  { ar: "رفيق صحتك", en: "Health Companion", href: "/health-journey" },
  { ar: "العائلة والأطفال", en: "Family & Kids", href: "/kids" },
  { ar: "اعرف نفسك", en: "Know Yourself", href: "/know-yourself" },
  { ar: "تواصل معنا", en: "Contact Us", href: "/contact" },
];

export default function SiteHeader() {
  const { lang, t } = useLang();
  const pathname = usePathname();
  const active = (item: (typeof LINKS)[number]) =>
    pathname === item.href ||
    (item.href !== "/" && pathname?.startsWith(`${item.href}/`)) ||
    item.matches?.includes(pathname ?? "");
  return (
    <header className="fixed inset-x-0 top-0 z-[500] h-16 border-b border-white/70 bg-white/90 backdrop-blur-xl lg:sticky">
      <div className="container-x flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          aria-label={t("عيادتنا", "OurClinic")}
          className="min-w-0 shrink-0"
        >
          <BrandMark />
        </Link>
        <nav
          aria-label={t("التنقل الرئيسي", "Primary navigation")}
          className="hidden items-center gap-0.5 lg:flex"
        >
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item) ? "page" : undefined}
              className={`relative rounded-full px-2.5 py-2 text-xs font-semibold transition xl:px-3.5 xl:text-sm ${active(item) ? "text-brand-700" : "text-navy-600 hover:text-navy-900"}`}
            >
              {item[lang]}
              {active(item) && (
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />
              )}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link href="/booking" className="btn-primary hidden lg:inline-flex">
            <Icon name="calendar" className="h-4 w-4" />
            {t("احجز الآن", "Book Now")}
          </Link>
        </div>
      </div>
    </header>
  );
}

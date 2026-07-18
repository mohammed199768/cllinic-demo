"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappHref } from "@/lib/clinic";
import { useLang } from "@/lib/i18n";
import Icon from "./Icon";

export default function WhatsAppFloatingButton() {
  const { t } = useLang();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(pathname === "/");

  useEffect(() => {
    if (pathname !== "/") { setHidden(false); return; }
    const compute = () => {
      const attr = document.documentElement.getAttribute("data-home-section");
      if (attr != null) setHidden(parseInt(attr, 10) < 1); // pager: show from section 1+
      else setHidden(window.scrollY < window.innerHeight * 0.6); // fallback scroll
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("home-section", compute as EventListener);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("home-section", compute as EventListener);
    };
  }, [pathname]);

  return (
    <a
      href={whatsappHref("مرحباً، أرغب بالتواصل مع عيادتنا.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("تواصل عبر واتساب", "Chat on WhatsApp")}
      className={`group fixed bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1faf54] text-white shadow-float ring-1 ring-white/30 transition-all duration-300 ltr:left-5 rtl:right-5 hover:scale-105 lg:bottom-5 ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"
      }`}
    >
      <Icon name="whatsapp" className="h-6 w-6" />
    </a>
  );
}

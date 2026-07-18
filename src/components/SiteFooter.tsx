"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { CLINIC, whatsappHref } from "@/lib/clinic";
import BrandMark from "./BrandMark";
import Icon from "./Icon";
import { clinicRepository } from "@ourclinic/local-data";
import { createId } from "@ourclinic/local-data/create-id";

export default function SiteFooter({ force = false }: { force?: boolean }) {
  const { lang, t } = useLang();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [sub, setSub] = useState<"idle" | "sending" | "done">("idle");
  const [subError, setSubError] = useState("");
  const [website, setWebsite] = useState("");
  const idempotencyKey = useRef("");

  // On the homepage the footer is rendered by the section pager (force); hide the global one.
  if (pathname === "/" && !force) return null;

  const links = [
    { ar: "الرئيسية", en: "Home", href: "/" },
    { ar: "الخدمات", en: "Services", href: "/services" },
    { ar: "احجز الآن", en: "Booking", href: "/booking" },
    { ar: "صحتك في دقيقة", en: "Medical Minute", href: "/medical-minute" },
    { ar: "صغيرنا الذكي", en: "Kids", href: "/kids" },
    { ar: "حكايات المساء", en: "Evening Stories", href: "/bedtime-stories" },
    { ar: "تواصل معنا", en: "Contact", href: "/contact" },
    { ar: "الأسئلة الشائعة", en: "FAQ", href: "/faq" },
    { ar: "الخصوصية", en: "Privacy", href: "/privacy" },
    { ar: "رفيق صحتك", en: "Health Companion", href: "/health-journey" },
  ];

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSub("sending");
    setSubError("");
    try {
      if (!idempotencyKey.current) idempotencyKey.current = createId();
      if (website) throw new Error("Newsletter submission failed");
      await clinicRepository.createSubmission({
        type: "GENERAL_MESSAGE",
        email,
        subject: lang === "ar" ? "اشتراك بالنشرة" : "Newsletter subscription",
        source: "SITE_FOOTER",
        payload: { kind: "NEWSLETTER", locale: lang, idempotencyKey: idempotencyKey.current },
      });
      setSub("done");
      setEmail("");
    } catch {
      setSub("idle");
      setSubError(t("تعذّر تسجيل البريد. حاول مرة أخرى.", "Could not register your email. Please try again."));
    }
  };

  const socials = [
    { name: "facebook", href: CLINIC.facebook, label: "Facebook", enabled: !!CLINIC.facebook },
    { name: "instagram", href: CLINIC.instagram, label: "Instagram", enabled: !!CLINIC.instagram },
    { name: "whatsapp", href: whatsappHref(), label: "WhatsApp", enabled: true },
    { name: "directions", href: CLINIC.maps, label: t("الاتجاهات", "Directions"), enabled: !!CLINIC.maps },
  ];

  return (
    <footer className="relative w-full max-w-full overflow-x-clip bg-gradient-to-b from-white to-[#eef5fb] py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent" />
      <div className="container-x flex max-w-full flex-col items-center text-center">
        <div>
          <BrandMark subtitle className="justify-center" />
        </div>
        <p className="mt-4 max-w-md text-sm text-navy-500">
          {lang === "ar" ? CLINIC.tagline.ar : CLINIC.tagline.en}
        </p>

        {/* nav links */}
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-semibold text-navy-600 transition hover:text-brand-700">
              {lang === "ar" ? l.ar : l.en}
            </Link>
          ))}
        </nav>

        {/* social buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {socials.map((s) =>
            s.enabled ? (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-100 bg-white text-navy-700 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700"
              >
                <Icon name={s.name} className="h-5 w-5" />
                <span className="sr-only">{s.label}</span>
              </a>
            ) : (
              <span
                key={s.name}
                aria-disabled="true"
                title={t("قريبًا", "Coming soon")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-100 bg-white/60 text-navy-300"
              >
                <Icon name={s.name} className="h-5 w-5" />
                <span className="sr-only">{s.label} ({t("قريبًا", "coming soon")})</span>
              </span>
            )
          )}
        </div>

        {/* newsletter */}
        <form onSubmit={onSubscribe} className="mt-9 w-full max-w-md">
          <input type="text" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute -start-[10000px] h-px w-px opacity-0" />
          {sub === "done" ? (
            <p className="rounded-2xl bg-mint-50 px-4 py-3 text-sm font-semibold text-mint-600">
              {t("تم تسجيل بريدك، شكرًا لاشتراكك.", "Your email is registered — thanks for subscribing.")}
            </p>
          ) : (
            <div>
              <label htmlFor="newsletter-email" className="mb-2 block text-sm font-semibold text-navy-700">{t("البريد الإلكتروني", "Email")}</label>
              <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-navy-100 bg-white p-1.5 shadow-soft sm:flex-row sm:items-center sm:rounded-full">
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("أدخل بريدك للاشتراك بالنصائح الطبية", "Enter your email for medical tips")}
                aria-label={t("البريد الإلكتروني", "Email")}
                className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-navy-800 outline-none placeholder:text-navy-400"
              />
              <button type="submit" disabled={sub === "sending"} className="btn-primary shrink-0 px-5 py-2.5 text-sm">
                {sub === "sending" ? t("...", "...") : t("اشترك", "Subscribe")}
                <Icon name="send" className="h-4 w-4 rtl:rotate-180" />
              </button>
              </div>
            </div>
          )}
          {subError && <p className="mt-2 text-sm font-semibold text-rose-600">{subError}</p>}
        </form>

        {/* contact line */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-navy-500">
          <a href={`tel:${CLINIC.phoneE164}`} className="flex items-center gap-1.5 hover:text-brand-700"><Icon name="phone" className="h-4 w-4 text-brand-500" /> {CLINIC.phone}</a>
          <a href={`mailto:${CLINIC.email}`} className="flex items-center gap-1.5 hover:text-brand-700"><Icon name="mail" className="h-4 w-4 text-brand-500" /> {CLINIC.email}</a>
          <span className="flex items-center gap-1.5"><Icon name="pin" className="h-4 w-4 text-brand-500" /> {lang === "ar" ? CLINIC.address.ar : CLINIC.address.en}</span>
        </div>

        {/* disclaimer + copyright */}
        <div className="mt-9 w-full border-t border-navy-100 pt-6">
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-navy-400">
            {t(
              "المحتوى الطبي في هذا الموقع لأغراض تثقيفية عامة ولا يُعد تشخيصًا أو بديلًا عن مراجعة الطبيب. الحجز عبر الموقع طلب أولي وليس تأكيدًا طبيًا نهائيًا.",
              "The medical content on this website is for general educational purposes only and does not replace medical consultation. Website booking is an initial request, not a final medical confirmation."
            )}
          </p>
          <p className="mt-4 text-xs font-semibold text-navy-500">
            © 2026 {t("عيادتنا", "OurClinic")}. {t("جميع الحقوق محفوظة.", "All rights reserved.")}
          </p>
        </div>
      </div>
    </footer>
  );
}

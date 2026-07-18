"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";

/**
 * Light, playful surface shared by every kids game and the hub — matches the
 * site's visual identity (soft sky gradient and gentle pastel glows).
 */
export default function KidsGameShell({
  children,
  back = true,
}: {
  children: React.ReactNode;
  back?: boolean;
}) {
  const { t } = useLang();
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-gradient-to-b from-cyan-50 via-icy to-brand-50/40 text-ink">
      {/* soft pastel glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-[#d9d2ff]/40 blur-3xl" />
      </div>
      <div className="container-x relative z-10 py-8 sm:py-12">
        {back && (
          <Link
            href="/kids"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-200/70 bg-white/80 px-4 py-2 text-sm font-semibold text-navy-700 backdrop-blur transition hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <Icon name="chevron" className="h-4 w-4 rtl:rotate-180" />
            {t("عالم الألعاب", "Games world")}
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}

/** Light liquid-glass card used inside the kids shell. */
export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.75rem] border border-white bg-white/80 p-6 shadow-card backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

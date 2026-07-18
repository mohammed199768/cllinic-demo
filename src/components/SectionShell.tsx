"use client";
import React from "react";
import Reveal from "./Reveal";

export default function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  center = false,
  action,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  center?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="container-x">
        {(eyebrow || title || subtitle || action) && (
          <Reveal className={`mb-10 flex flex-col gap-5 sm:mb-12 ${center ? "items-center text-center" : action ? "sm:flex-row sm:items-end sm:justify-between" : ""}`}>
            <div className={`${center ? "max-w-2xl" : "max-w-2xl"}`}>
              {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
              {title && <h2 className="text-h2 font-extrabold text-navy-900">{title}</h2>}
              {subtitle && <p className="mt-3 text-lead text-navy-500">{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

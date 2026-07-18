"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import HealthToolShell from "@/components/health-journey/HealthToolShell";
import HealthPrintHeader from "@/components/health-journey/HealthPrintHeader";
import ToolNavigation from "@/components/health-journey/ToolNavigation";
import Icon from "@/components/Icon";
import {
  PATIENT_RESOURCES,
  type PatientResource,
} from "@/data/patientResources";
import { GLOBAL_DISCLAIMER } from "@/data/healthJourneyContent";
import { printPage } from "@/lib/health-print";

export default function PatientResourcesView() {
  const { lang, t } = useLang();
  const [selected, setSelected] = useState<PatientResource>(
    PATIENT_RESOURCES[0],
  );
  const L = (value: { ar: string; en: string }) => value[lang];
  const printResource = (resource: PatientResource) => {
    setSelected(resource);
    window.setTimeout(printPage, 0);
  };
  return (
    <HealthToolShell
      icon="download"
      title={{ ar: "مكتبة النماذج", en: "Resource Library" }}
      helper={{
        ar: "نماذج ثنائية اللغة جاهزة للطباعة تساعدك على تنظيم معلوماتك يدويًا.",
        en: "Bilingual print-ready templates that help you organize information by hand.",
      }}
    >
      <div className="health-print">
        <div className="screen-only">
          <div className="max-w-3xl">
            <p className="text-sm leading-relaxed text-navy-600">
              {t(
                "اختر نموذجًا ثم اطبعه. من نافذة الطباعة يمكنك اختيار «حفظ كملف PDF». لا تُرسل أي معلومات إلى الموقع عند الطباعة.",
                "Choose a template and print it. In the print dialog, choose “Save as PDF” if you prefer. Printing sends no information to the website.",
              )}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PATIENT_RESOURCES.map((resource) => (
              <article
                key={resource.slug}
                className="flex min-h-72 flex-col rounded-3xl border border-navy-100 bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="icon-pad h-11 w-11">
                    <Icon name={resource.icon} className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-cloud px-2.5 py-1 text-[11px] font-bold text-navy-500">
                    {resource.version}
                  </span>
                </div>
                <h2 className="mt-5 text-h3 font-bold text-navy-900">
                  {L(resource.title)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">
                  {L(resource.description)}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-navy-600">
                  <strong>{t("الاستخدام المقترح:", "Intended use:")}</strong>{" "}
                  {L(resource.intendedUse)}
                </p>
                <button
                  type="button"
                  onClick={() => printResource(resource)}
                  className="btn-primary mt-auto w-full"
                >
                  <Icon name="printer" className="h-4 w-4" />
                  {t("طباعة أو حفظ PDF", "Print or Save as PDF")}
                </button>
              </article>
            ))}
          </div>
          <p className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            {L(GLOBAL_DISCLAIMER)}
          </p>
        </div>
        <div className="print-only print-area">
          <PrintableResource resource={selected} lang={lang} />
        </div>
        <ToolNavigation current="downloads" />
      </div>
    </HealthToolShell>
  );
}

function PrintableResource({
  resource,
  lang,
}: {
  resource: PatientResource;
  lang: "ar" | "en";
}) {
  const { t } = useLang();
  const L = (value: { ar: string; en: string }) => value[lang];
  return (
    <article
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={resource.category === "card" ? "mx-auto max-w-xl" : ""}
    >
      <HealthPrintHeader title={L(resource.title)} />
      <div className="mb-5 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-navy-600">{L(resource.description)}</p>
          <p className="mt-1 text-xs text-navy-500">
            <strong>{t("الاستخدام المقترح", "Intended use")}:</strong>{" "}
            {L(resource.intendedUse)}
          </p>
        </div>
        <span className="shrink-0 text-xs font-bold text-navy-500">
          {resource.version}
        </span>
      </div>
      {resource.instructions && (
        <p className="mb-4 rounded-xl bg-cloud p-3 text-xs text-navy-600">
          {L(resource.instructions)}
        </p>
      )}
      {resource.columns && (
        <table className="text-[10px]">
          <thead>
            <tr>
              {resource.columns.map((column) => (
                <th
                  key={column.header.en}
                  className={`${column.wide ? "w-1/4" : ""} border border-navy-300 bg-cloud p-1.5 text-start`}
                >
                  {L(column.header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: resource.rows ?? 1 }, (_, index) => (
              <tr key={index}>
                {resource.columns!.map((column) => (
                  <td
                    key={column.header.en}
                    className="h-7 border border-navy-200 p-1"
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {resource.fields && (
        <div
          className={`grid gap-5 ${resource.category === "card" ? "rounded-2xl border-2 border-brand-600 p-5 sm:grid-cols-2" : ""}`}
        >
          {resource.fields.map((field) => (
            <section key={field.label.en} className="break-inside-avoid">
              <h2 className="text-xs font-bold text-navy-800">
                {L(field.label)}
              </h2>
              <div className="mt-2 space-y-4">
                {Array.from({ length: field.lines ?? 1 }, (_, index) => (
                  <div key={index} className="h-4 border-b border-navy-300" />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <footer className="mt-6 border-t border-navy-200 pt-3 text-[10px] leading-relaxed text-navy-500">
        <p>{L(resource.disclaimer)}</p>
        <p className="mt-1">
          {L({ ar: "عيادتنا", en: "OurClinic" })} · {resource.version}
        </p>
      </footer>
    </article>
  );
}

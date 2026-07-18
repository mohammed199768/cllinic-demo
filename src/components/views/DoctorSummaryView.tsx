"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import HealthToolShell, {
  ToolGuidePanel,
} from "@/components/health-journey/HealthToolShell";
import {
  DateTimeInput,
  TextAreaInput,
  TextInput,
} from "@/components/health-journey/HealthField";
import HealthPrintHeader from "@/components/health-journey/HealthPrintHeader";
import ToolNavigation from "@/components/health-journey/ToolNavigation";
import Icon from "@/components/Icon";
import { SUMMARY_FOOTER, TOOL_GUIDES } from "@/data/healthJourneyContent";
import { useHealthStore } from "@/hooks/useHealthStore";
import { savePatientProfile } from "@/lib/health-storage";
import {
  formatAppointment,
  formatDate,
  formatDateTime,
} from "@/lib/health-format";
import { printPage } from "@/lib/health-print";
import type { HealthStoreV1, PatientProfile } from "@/types/health";

type SectionKey =
  | "profile"
  | "bloodPressure"
  | "bloodGlucose"
  | "medications"
  | "visit"
  | "allergies"
  | "conditions"
  | "notes";
const initialSections: Record<SectionKey, boolean> = {
  profile: true,
  bloodPressure: true,
  bloodGlucose: true,
  medications: true,
  visit: true,
  allergies: true,
  conditions: true,
  notes: true,
};

export default function DoctorSummaryView() {
  const { lang, t } = useLang();
  const { store, ready } = useHealthStore();
  const initialized = useRef(false);
  const [profile, setProfile] = useState<PatientProfile>({});
  const [sections, setSections] = useState(initialSections);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (ready && !initialized.current) {
      setProfile(store.patientProfile ?? {});
      initialized.current = true;
    }
  }, [ready, store.patientProfile]);
  const setProfileField = (key: keyof PatientProfile) => (value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setStatus("");
  };
  const labels: Array<{ key: SectionKey; ar: string; en: string }> = [
    {
      key: "profile",
      ar: "المعلومات الشخصية الاختيارية",
      en: "Optional personal information",
    },
    {
      key: "bloodPressure",
      ar: "قراءات ضغط الدم",
      en: "Blood-pressure readings",
    },
    {
      key: "bloodGlucose",
      ar: "قراءات سكر الدم",
      en: "Blood-glucose readings",
    },
    { key: "medications", ar: "قائمة الأدوية", en: "Medication list" },
    {
      key: "visit",
      ar: "إجابات التحضير للزيارة",
      en: "Visit-preparation answers",
    },
    { key: "allergies", ar: "الحساسية", en: "Allergies" },
    { key: "conditions", ar: "الأمراض المزمنة", en: "Chronic conditions" },
    { key: "notes", ar: "ملاحظات الملخص", en: "Summary notes" },
  ];
  const saveProfile = () => {
    savePatientProfile(profile);
    setStatus(
      t(
        "تم حفظ المعلومات الاختيارية محليًا.",
        "Optional information saved locally.",
      ),
    );
  };

  return (
    <HealthToolShell
      icon="file-text"
      title={{ ar: "ملخص للطبيب", en: "Doctor Summary" }}
      helper={TOOL_GUIDES.report.helper}
    >
      <div className="health-print">
        <div className="screen-only grid gap-8 lg:grid-cols-[21rem_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="card-clinical rounded-3xl p-5">
              <h2 className="text-h3 font-bold text-navy-900">
                {t("اختر ما يظهر", "Choose what to include")}
              </h2>
              <fieldset className="mt-4 space-y-2">
                <legend className="sr-only">
                  {t("أقسام الملخص", "Summary sections")}
                </legend>
                {labels.map((item) => (
                  <label
                    key={item.key}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-navy-100 bg-white px-3 py-2 text-sm font-semibold text-navy-700"
                  >
                    <input
                      type="checkbox"
                      checked={sections[item.key]}
                      onChange={(event) =>
                        setSections((current) => ({
                          ...current,
                          [item.key]: event.target.checked,
                        }))
                      }
                      className="h-5 w-5 rounded border-navy-300 accent-brand-600"
                    />
                    <span>{lang === "ar" ? item.ar : item.en}</span>
                  </label>
                ))}
              </fieldset>
            </section>
            <section className="card-clinical rounded-3xl p-5">
              <h2 className="font-bold text-navy-900">
                {t("معلومات شخصية اختيارية", "Optional personal information")}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-navy-500">
                {t(
                  "لا نطلب رقمًا وطنيًا أو عنوانًا أو معلومات تأمين.",
                  "We do not ask for a national ID, address, or insurance information.",
                )}
              </p>
              <div className="mt-4 space-y-4">
                <TextInput
                  label={t("الاسم", "Name")}
                  value={profile.displayName ?? ""}
                  onChange={setProfileField("displayName")}
                />
                <DateTimeInput
                  type="date"
                  label={t("تاريخ الميلاد", "Date of birth")}
                  value={profile.dateOfBirth ?? ""}
                  onChange={setProfileField("dateOfBirth")}
                />
                <TextInput
                  type="tel"
                  label={t("الهاتف", "Phone")}
                  value={profile.phone ?? ""}
                  onChange={setProfileField("phone")}
                />
                <TextAreaInput
                  label={t("الأمراض المزمنة", "Chronic conditions")}
                  value={profile.chronicConditions ?? ""}
                  onChange={setProfileField("chronicConditions")}
                />
                <TextAreaInput
                  label={t("الحساسية", "Allergies")}
                  value={profile.allergies ?? ""}
                  onChange={setProfileField("allergies")}
                />
                <button
                  type="button"
                  onClick={saveProfile}
                  className="btn-ghost w-full"
                >
                  <Icon name="save" className="h-4 w-4" />
                  {t("حفظ محليًا", "Save locally")}
                </button>
                <span
                  aria-live="polite"
                  className="block text-xs font-semibold text-mint-500"
                >
                  {status}
                </span>
              </div>
            </section>
            <ToolGuidePanel guide={TOOL_GUIDES.report} />
          </aside>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-h3 font-bold text-navy-900">
                  {t("معاينة الملخص", "Summary preview")}
                </h2>
                <p className="mt-1 text-sm text-navy-500">
                  {t(
                    "لا تُرفع هذه المعاينة ولا تُرسل إلى المركز.",
                    "This preview is not uploaded or sent to the clinic.",
                  )}
                </p>
              </div>
              <button type="button" onClick={printPage} className="btn-primary">
                <Icon name="printer" className="h-4 w-4" />
                {t("طباعة أو حفظ PDF", "Print or Save as PDF")}
              </button>
            </div>
            <TextAreaInput
              label={t("ملاحظات إضافية للملخص", "Additional summary notes")}
              value={notes}
              onChange={setNotes}
              rows={3}
            />
            <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
              <SummaryDocument
                lang={lang}
                store={store}
                profile={profile}
                sections={sections}
                notes={notes}
              />
            </div>
          </div>
        </div>
        <div className="print-only print-area">
          <SummaryDocument
            lang={lang}
            store={store}
            profile={profile}
            sections={sections}
            notes={notes}
            print
          />
        </div>
        <ToolNavigation current="report" />
      </div>
    </HealthToolShell>
  );
}

function SummaryDocument({
  lang,
  store,
  profile,
  sections,
  notes,
  print = false,
}: {
  lang: "ar" | "en";
  store: HealthStoreV1;
  profile: PatientProfile;
  sections: Record<SectionKey, boolean>;
  notes: string;
  print?: boolean;
}) {
  const { t } = useLang();
  const pressure = [...store.bloodPressure]
    .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
    .slice(0, 10);
  const glucose = [...store.bloodGlucose]
    .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))
    .slice(0, 10);
  const medications = store.medications.filter((item) => item.active);
  const visit = store.visitPreparation;
  const visitRows = visit
    ? [
        [
          t("موعد الزيارة", "Appointment"),
          visit.appointmentDate || visit.appointmentTime
            ? formatAppointment(
                visit.appointmentDate,
                visit.appointmentTime,
                lang,
              )
            : "",
        ],
        [t("الموضوع الرئيسي", "Main concern"), visit.mainConcern],
        [
          t("الأعراض أو التغيّرات", "Symptoms or changes"),
          visit.symptomsToDiscuss,
        ],
        [t("متى بدأت", "When they began"), visit.symptomsStarted ?? ""],
        [t("الأسئلة", "Questions"), visit.questionsForClinician],
        [t("تغيّرات حديثة", "Recent changes"), visit.recentChanges],
        [
          t("أدوية للمراجعة", "Medications to review"),
          visit.medicationsToReview,
        ],
        [t("ملفات لإحضارها", "Files to bring"), visit.filesToBring],
        [t("هدف الزيارة", "Visit goal"), visit.personalGoals],
        [t("ملاحظات", "Notes"), visit.notes],
      ].filter(([, value]) => value)
    : [];
  return (
    <article dir={lang === "ar" ? "rtl" : "ltr"} className="text-navy-900">
      {print ? (
        <HealthPrintHeader title={t("ملخص للطبيب", "Doctor Summary")} />
      ) : (
        <div className="mb-6 border-b-2 border-brand-600 pb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
            {t("عيادتنا", "OurClinic")}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">
            {t("ملخص للطبيب", "Doctor Summary")}
          </h1>
          <p className="mt-1 text-xs text-navy-500">
            {t("أُعدّ", "Prepared")}{" "}
            {formatDate(new Date().toISOString(), lang)}
          </p>
        </div>
      )}
      {sections.profile &&
        (profile.displayName || profile.dateOfBirth || profile.phone) && (
          <SummarySection title={t("معلومات شخصية", "Personal information")}>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {profile.displayName && (
                <Info label={t("الاسم", "Name")} value={profile.displayName} />
              )}
              {profile.dateOfBirth && (
                <Info
                  label={t("تاريخ الميلاد", "Date of birth")}
                  value={formatDate(profile.dateOfBirth, lang)}
                />
              )}
              {profile.phone && (
                <Info label={t("الهاتف", "Phone")} value={profile.phone} />
              )}
            </dl>
          </SummarySection>
        )}
      {sections.conditions && profile.chronicConditions && (
        <SummarySection title={t("الأمراض المزمنة", "Chronic conditions")}>
          <p className="whitespace-pre-wrap text-sm">
            {profile.chronicConditions}
          </p>
        </SummarySection>
      )}
      {sections.allergies && profile.allergies && (
        <SummarySection title={t("الحساسية", "Allergies")}>
          <p className="whitespace-pre-wrap text-sm">{profile.allergies}</p>
        </SummarySection>
      )}
      {sections.medications && (
        <SummarySection title={t("الأدوية النشطة", "Active medications")}>
          <SimpleTable
            heads={[
              t("الدواء", "Medication"),
              t("الجرعة", "Dose"),
              t("عدد المرات", "Frequency"),
              t("الأوقات", "Times"),
            ]}
            rows={medications.map((item) => [
              item.name,
              [item.dose, item.unit].filter(Boolean).join(" ") || "—",
              item.frequency,
              item.scheduledTimes.join(", ") || "—",
            ])}
            empty={t(
              "لا توجد أدوية نشطة مدخلة.",
              "No active medications entered.",
            )}
          />
        </SummarySection>
      )}
      {sections.bloodPressure && (
        <SummarySection
          title={t("أحدث قراءات ضغط الدم", "Latest blood-pressure readings")}
        >
          <SimpleTable
            heads={[
              t("التاريخ", "Date"),
              t("الانقباضي", "Systolic"),
              t("الانبساطي", "Diastolic"),
              t("النبض", "Pulse"),
            ]}
            rows={pressure.map((item) => [
              formatDateTime(item.measuredAt, lang),
              String(item.systolic),
              String(item.diastolic),
              item.pulse === undefined ? "—" : String(item.pulse),
            ])}
            empty={t("لا توجد قراءات مدخلة.", "No readings entered.")}
          />
        </SummarySection>
      )}
      {sections.bloodGlucose && (
        <SummarySection
          title={t("أحدث قياسات سكر الدم", "Latest blood-glucose readings")}
        >
          <SimpleTable
            heads={[
              t("التاريخ", "Date"),
              t("القراءة", "Reading"),
              t("سياق الوجبة", "Meal context"),
            ]}
            rows={glucose.map((item) => [
              formatDateTime(item.measuredAt, lang),
              `${item.value} ${item.unit}`,
              {
                fasting: t("صائم", "Fasting"),
                "before-meal": t("قبل الوجبة", "Before meal"),
                "after-meal": t("بعد الوجبة", "After meal"),
                bedtime: t("قبل النوم", "Bedtime"),
                other: t("أخرى", "Other"),
              }[item.mealContext],
            ])}
            empty={t("لا توجد قراءات مدخلة.", "No readings entered.")}
          />
        </SummarySection>
      )}
      {sections.visit && (
        <SummarySection title={t("التحضير للزيارة", "Visit preparation")}>
          {visitRows.length ? (
            <dl className="space-y-2">
              {visitRows.map(([label, value]) => (
                <Info key={label} label={label} value={value} />
              ))}
            </dl>
          ) : (
            <p className="text-sm text-navy-500">
              {t("لا توجد إجابات محفوظة.", "No saved answers.")}
            </p>
          )}
        </SummarySection>
      )}
      {sections.notes && notes && (
        <SummarySection title={t("ملاحظات إضافية", "Additional notes")}>
          <p className="whitespace-pre-wrap text-sm">{notes}</p>
        </SummarySection>
      )}
      <footer className="mt-7 border-t border-navy-200 pt-3 text-xs leading-relaxed text-navy-500">
        <p>{SUMMARY_FOOTER[lang]}</p>
        <p className="mt-1">
          {t(
            "المصدر: معلومات أدخلها المستخدم يدويًا في رفيق صحتك على هذا الجهاز.",
            "Source: information entered manually by the user in Your Health Companion on this device.",
          )}
        </p>
      </footer>
    </article>
  );
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 break-inside-avoid">
      <h2 className="mb-2 border-b border-navy-100 pb-1 text-sm font-extrabold text-brand-700">
        {title}
      </h2>
      {children}
    </section>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-navy-500">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm text-navy-800">{value}</dd>
    </div>
  );
}
function SimpleTable({
  heads,
  rows,
  empty,
}: {
  heads: string[];
  rows: string[][];
  empty: string;
}) {
  if (!rows.length) return <p className="text-sm text-navy-500">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-xs">
        <thead>
          <tr>
            {heads.map((head) => (
              <th
                key={head}
                className="border border-navy-200 bg-cloud p-2 text-start"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-navy-200 p-2 align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

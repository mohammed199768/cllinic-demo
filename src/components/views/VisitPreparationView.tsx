"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import HealthToolShell, { ToolGuidePanel } from "@/components/health-journey/HealthToolShell";
import { TextAreaInput } from "@/components/health-journey/HealthField";
import AppointmentDateTimeFields from "@/components/health-journey/AppointmentDateTimeFields";
import ConfirmDialog from "@/components/health-journey/ConfirmDialog";
import HealthPrintHeader from "@/components/health-journey/HealthPrintHeader";
import ToolNavigation from "@/components/health-journey/ToolNavigation";
import Icon from "@/components/Icon";
import { HEALTH_ROUTES, SUMMARY_FOOTER, TOOL_GUIDES } from "@/data/healthJourneyContent";
import { useHealthStore } from "@/hooks/useHealthStore";
import { clearVisitPreparation, saveVisitPreparation } from "@/lib/health-storage";
import { formatAppointment } from "@/lib/health-format";
import { printPage } from "@/lib/health-print";
import { emptyVisitPreparation, type VisitPreparation } from "@/types/health";

export default function VisitPreparationView() {
  const { lang, t } = useLang();
  const { store, ready } = useHealthStore();
  const initialized = useRef(false);
  const [form, setForm] = useState<VisitPreparation>(() => emptyVisitPreparation(new Date().toISOString()));
  const [status, setStatus] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => {
    if (ready && !initialized.current) {
      if (store.visitPreparation) setForm(store.visitPreparation);
      initialized.current = true;
    }
  }, [ready, store.visitPreparation]);
  const set = (key: keyof VisitPreparation) => (value: string) => { setForm((current) => ({ ...current, [key]: value })); setStatus(""); };
  const save = (event: React.FormEvent) => { event.preventDefault(); const next = { ...form, updatedAt: new Date().toISOString() }; saveVisitPreparation(next); setForm(next); setStatus(t("تم الحفظ على هذا الجهاز.", "Saved on this device.")); };
  const fields: Array<{ key: keyof VisitPreparation; number: string; title: string; prompt: string; rows?: number }> = [
    { key: "mainConcern", number: "01", title: t("ما أكثر ما يهمك؟", "Your main concern"), prompt: t("اكتب الموضوع الأهم الذي ترغب في مناقشته.", "Note the most important topic you want to discuss.") },
    { key: "symptomsToDiscuss", number: "02", title: t("الأعراض أو التغيّرات", "Symptoms or changes noticed"), prompt: t("ما الذي لاحظته وتريد شرحه للطبيب؟", "What have you noticed that you want to explain?") },
    { key: "symptomsStarted", number: "03", title: t("متى بدأت؟", "When did they begin?"), prompt: t("تاريخ تقريبي أو وصف بسيط للمدة يكفي.", "An approximate date or simple duration is enough."), rows: 2 },
    { key: "questionsForClinician", number: "04", title: t("أسئلتك للطبيب", "Questions for the clinician"), prompt: t("دوّن الأسئلة حتى لا تنساها أثناء الزيارة.", "Write questions down so they are not forgotten during the visit.") },
    { key: "recentChanges", number: "05", title: t("تغيّرات حديثة", "Recent changes"), prompt: t("اذكر أي تغيّر حديث يهمك مناقشته.", "Note any recent change you want to discuss.") },
    { key: "medicationsToReview", number: "06", title: t("أدوية للمراجعة", "Medications to review"), prompt: t("اكتب أسماء الأدوية التي تريد السؤال عنها فقط.", "List medicines you want to ask about.") },
    { key: "filesToBring", number: "07", title: t("تقارير أو فحوصات تحضرها", "Reports or tests to bring"), prompt: t("ضع قائمة بما تريد وضعه في حقيبتك قبل الموعد.", "List what you want to put in your bag before the appointment.") },
    { key: "personalGoals", number: "08", title: t("هدفك من الزيارة", "Personal goal for the visit"), prompt: t("ما الذي سيجعل هذه الزيارة مفيدة لك؟", "What would make this visit useful for you?") },
    { key: "notes", number: "09", title: t("ملاحظات إضافية", "Additional notes"), prompt: t("أي تفاصيل أخرى ترغب في تذكّرها.", "Anything else you want to remember.") },
  ];

  return (
    <HealthToolShell icon="clipboard" title={{ ar: "استعد لزيارتك", en: "Prepare for Your Visit" }} helper={TOOL_GUIDES.visit.helper}>
      <div className="health-print">
        <div className="screen-only grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="space-y-8">
            <form onSubmit={save} className="space-y-5">
              <section className="card-clinical rounded-3xl p-5 sm:p-7"><h2 className="text-h3 font-bold text-navy-900">{t("موعدك", "Your appointment")}</h2><p className="mt-1 text-sm text-navy-500">{t("أضف التاريخ والوقت بشكل منفصل، ويمكنك ترك أي منهما فارغًا.", "Add the date and time separately; either may be left blank.")}</p><div className="mt-5"><AppointmentDateTimeFields date={form.appointmentDate ?? ""} time={form.appointmentTime ?? ""} onDateChange={set("appointmentDate")} onTimeChange={set("appointmentTime")} /></div></section>
              {fields.map((field) => <section key={field.key} className="card-clinical rounded-3xl p-5 sm:p-7"><div className="flex items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-700 ring-1 ring-brand-100">{field.number}</span><div className="min-w-0 flex-1"><TextAreaInput label={field.title} hint={field.prompt} value={String(form[field.key] ?? "")} onChange={set(field.key)} rows={field.rows ?? 3} /></div></div></section>)}
              <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-white bg-white/95 p-3 shadow-float backdrop-blur"><button type="submit" className="btn-primary"><Icon name="save" className="h-4 w-4" />{t("حفظ التحضير", "Save preparation")}</button><button type="button" onClick={printPage} className="btn-ghost"><Icon name="printer" className="h-4 w-4" />{t("طباعة", "Print")}</button><Link href={HEALTH_ROUTES.report} className="btn-ghost"><Icon name="file-text" className="h-4 w-4" />{t("إضافته إلى الملخص", "Add to summary")}</Link><button type="button" onClick={() => setConfirmClear(true)} className="btn px-4 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50">{t("مسح النموذج", "Clear form")}</button><span aria-live="polite" className="text-sm font-semibold text-mint-500">{status}</span></div>
            </form>
          </div><ToolGuidePanel guide={TOOL_GUIDES.visit} />
        </div>
        <div className="print-only print-area"><HealthPrintHeader title={t("التحضير للزيارة", "Visit Preparation")} />{(form.appointmentDate || form.appointmentTime) && <p className="mb-5 text-sm"><strong>{t("موعد الزيارة", "Appointment")}:</strong> {formatAppointment(form.appointmentDate, form.appointmentTime, lang)}</p>}<div className="space-y-4">{fields.map((field) => <section key={field.key}><h2 className="text-sm font-bold text-navy-900">{field.title}</h2><p className="mt-1 min-h-8 whitespace-pre-wrap border-b border-navy-200 pb-2 text-sm text-navy-700">{String(form[field.key] ?? "") || "—"}</p></section>)}</div><p className="mt-6 border-t border-navy-200 pt-3 text-xs text-navy-500">{SUMMARY_FOOTER[lang]}</p></div>
        <ToolNavigation current="visit-preparation" />
      </div>
      <ConfirmDialog open={confirmClear} title={t("مسح نموذج التحضير؟", "Clear the preparation form?")} body={t("سيتم حذف كل الإجابات المحفوظة على هذا الجهاز.", "All saved answers will be removed from this device.")} confirmLabel={t("مسح", "Clear")} cancelLabel={t("إلغاء", "Cancel")} onConfirm={() => { clearVisitPreparation(); setForm(emptyVisitPreparation(new Date().toISOString())); setConfirmClear(false); setStatus(t("تم مسح النموذج.", "Form cleared.")); }} onCancel={() => setConfirmClear(false)} />
    </HealthToolShell>
  );
}

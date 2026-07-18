"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";
import HealthToolShell, { ToolGuidePanel } from "@/components/health-journey/HealthToolShell";
import { TextAreaInput, TextInput } from "@/components/health-journey/HealthField";
import LocalDataControls from "@/components/health-journey/LocalDataControls";
import EmptyState from "@/components/health-journey/EmptyState";
import ConfirmDialog from "@/components/health-journey/ConfirmDialog";
import HealthPrintHeader from "@/components/health-journey/HealthPrintHeader";
import ToolNavigation from "@/components/health-journey/ToolNavigation";
import Icon from "@/components/Icon";
import { SUMMARY_FOOTER, TOOL_GUIDES } from "@/data/healthJourneyContent";
import { useHealthStore } from "@/hooks/useHealthStore";
import { addMedication, clearCollection, deleteMedication, updateMedication } from "@/lib/health-storage";
import { hasErrors, validateMedication, type FieldErrors } from "@/lib/health-validation";
import { downloadCsv, downloadJson, fileDateStamp } from "@/lib/health-export";
import { printPage } from "@/lib/health-print";
import type { Medication } from "@/types/health";

type FormState = { name: string; dose: string; unit: string; frequency: string; scheduledTimes: string; purpose: string; prescribingClinician: string; notes: string };
const freshForm = (): FormState => ({ name: "", dose: "", unit: "", frequency: "", scheduledTimes: "", purpose: "", prescribingClinician: "", notes: "" });

export default function MedicationsView() {
  const { lang, t } = useLang();
  const { store, ready } = useHealthStore();
  const [form, setForm] = useState<FormState>(freshForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medication | null>(null);
  const [status, setStatus] = useState("");
  const active = useMemo(() => store.medications.filter((item) => item.active), [store.medications]);
  const inactive = useMemo(() => store.medications.filter((item) => !item.active), [store.medications]);
  const set = (key: keyof FormState) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const error = (key: string) => errors[key]?.[lang];
  const reset = () => { setForm(freshForm()); setEditingId(null); setErrors({}); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateMedication(form); setErrors(nextErrors);
    if (hasErrors(nextErrors)) { requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    const input = {
      name: form.name.trim(), frequency: form.frequency.trim(), scheduledTimes: form.scheduledTimes.split(/[,،]/).map((value) => value.trim()).filter(Boolean),
      ...(form.dose.trim() ? { dose: form.dose.trim() } : {}), ...(form.unit.trim() ? { unit: form.unit.trim() } : {}), ...(form.purpose.trim() ? { purpose: form.purpose.trim() } : {}), ...(form.prescribingClinician.trim() ? { prescribingClinician: form.prescribingClinician.trim() } : {}), ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    };
    if (editingId) updateMedication(editingId, input); else addMedication({ ...input, active: true });
    setStatus(editingId ? t("تم تحديث الدواء.", "Medication updated.") : t("تمت إضافة الدواء.", "Medication added.")); reset();
  };
  const edit = (item: Medication) => { setEditingId(item.id); setForm({ name: item.name, dose: item.dose ?? "", unit: item.unit ?? "", frequency: item.frequency, scheduledTimes: item.scheduledTimes.join(", "), purpose: item.purpose ?? "", prescribingClinician: item.prescribingClinician ?? "", notes: item.notes ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const exportCsv = () => downloadCsv(`our-clinic-medications-${fileDateStamp()}.csv`, store.medications, [
    { header: t("الدواء", "Medication"), value: (r) => r.name }, { header: t("الجرعة", "Dose"), value: (r) => [r.dose, r.unit].filter(Boolean).join(" ") }, { header: t("عدد المرات", "Frequency"), value: (r) => r.frequency }, { header: t("الأوقات", "Times"), value: (r) => r.scheduledTimes.join("; ") }, { header: t("الغرض", "Purpose"), value: (r) => r.purpose }, { header: t("الطبيب الواصف", "Prescribing clinician"), value: (r) => r.prescribingClinician }, { header: t("الحالة", "Status"), value: (r) => r.active ? t("نشط", "Active") : t("غير نشط", "Inactive") }, { header: t("ملاحظات", "Notes"), value: (r) => r.notes },
  ]);

  return (
    <HealthToolShell icon="pill" title={{ ar: "أدويتي", en: "My Medications" }} helper={TOOL_GUIDES.medications.helper}>
      <div className="health-print">
        <div className="screen-only grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="min-w-0 space-y-8">
            <form onSubmit={submit} noValidate data-health-section="medication-entry" className="card-clinical rounded-3xl p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3"><h2 className="text-h3 font-bold text-navy-900">{editingId ? t("تعديل الدواء", "Edit medication") : t("أضف دواء", "Add medication")}</h2>{editingId && <button type="button" onClick={reset} className="btn-ghost px-4">{t("إلغاء", "Cancel")}</button>}</div>
              <div className="mt-6 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
                <TextInput label={t("اسم الدواء", "Medication name")} value={form.name} onChange={set("name")} error={error("name")} required />
                <TextInput label={t("عدد المرات", "Frequency")} hint={t("اكتبها كما وصفها لك طبيبك", "Write it exactly as prescribed") } value={form.frequency} onChange={set("frequency")} error={error("frequency")} required />
                <TextInput label={t("الجرعة (اختياري)", "Dose (optional)")} value={form.dose} onChange={set("dose")} />
                <TextInput label={t("الوحدة (اختياري)", "Unit (optional)")} value={form.unit} onChange={set("unit")} />
                <TextInput label={t("أوقات التناول (اختياري)", "Scheduled times (optional)")} hint={t("افصل بين الأوقات بفاصلة، مثل 08:00، 20:00", "Separate times with commas, e.g. 08:00, 20:00")} value={form.scheduledTimes} onChange={set("scheduledTimes")} error={error("scheduledTimes")} />
                <TextInput label={t("الغرض (اختياري)", "Purpose (optional)")} value={form.purpose} onChange={set("purpose")} />
                <TextInput label={t("الطبيب الواصف (اختياري)", "Prescribing clinician (optional)")} value={form.prescribingClinician} onChange={set("prescribingClinician")} />
                <div className="sm:col-span-2"><TextAreaInput label={t("ملاحظات (اختياري)", "Notes (optional)")} value={form.notes} onChange={set("notes")} /></div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3"><button type="submit" className="btn-primary"><Icon name="save" className="h-4 w-4" />{editingId ? t("حفظ التعديل", "Save changes") : t("إضافة إلى القائمة", "Add to list")}</button><span aria-live="polite" className="text-sm font-semibold text-mint-500">{status}</span></div>
            </form>
            <section data-health-section="medication-list" className="card-clinical rounded-3xl p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-h3 font-bold text-navy-900">{t("قائمة الأدوية", "Medication list")}</h2><p className="mt-1 text-sm text-navy-500">{t("قسّم القائمة إلى أدوية نشطة وغير نشطة.", "The list is grouped into active and inactive medications.")}</p></div><button type="button" onClick={printPage} className="btn-ghost"><Icon name="printer" className="h-4 w-4" />{t("طباعة القائمة", "Print list")}</button></div>
              {!ready ? <p className="mt-6 text-sm text-navy-500">{t("جارٍ تحميل بيانات الجهاز…", "Loading device data…")}</p> : store.medications.length === 0 ? <div className="mt-6"><EmptyState icon="pill" title={t("قائمتك فارغة", "Your list is empty")} body={t("أضف دواءً كما هو مكتوب على العبوة أو الوصفة.", "Add a medication exactly as written on its package or prescription.")} /></div> : <div className="mt-6 min-w-0 space-y-8"><MedicationGroup title={t("الأدوية النشطة", "Active medications")} items={active} onEdit={edit} onDelete={setDeleteTarget} onToggle={(item) => updateMedication(item.id, { active: !item.active })} /><MedicationGroup title={t("أدوية غير نشطة", "Inactive medications")} items={inactive} onEdit={edit} onDelete={setDeleteTarget} onToggle={(item) => updateMedication(item.id, { active: !item.active })} /></div>}
            </section>
            <LocalDataControls sectionLabel={{ ar: "قائمة الأدوية", en: "medication list" }} onExportCsv={exportCsv} onExportJson={() => downloadJson(`our-clinic-medications-${fileDateStamp()}.json`, JSON.stringify(store.medications, null, 2))} onClearSection={() => clearCollection("medications")} />
          </div><ToolGuidePanel guide={TOOL_GUIDES.medications} />
        </div>
        <div className="print-only print-area"><HealthPrintHeader title={t("قائمة الأدوية", "Medication List")} /><table className="text-xs"><thead><tr>{[t("الدواء", "Medication"), t("الجرعة", "Dose"), t("عدد المرات", "Frequency"), t("الأوقات", "Times"), t("الغرض", "Purpose")].map((head) => <th key={head} className="border border-navy-200 bg-cloud p-2 text-start">{head}</th>)}</tr></thead><tbody>{store.medications.map((item) => <tr key={item.id}><td className="border border-navy-200 p-2 font-bold">{item.name}</td><td className="border border-navy-200 p-2">{[item.dose, item.unit].filter(Boolean).join(" ") || "—"}</td><td className="border border-navy-200 p-2">{item.frequency}</td><td className="border border-navy-200 p-2">{item.scheduledTimes.join(", ") || "—"}</td><td className="border border-navy-200 p-2">{item.purpose || "—"}</td></tr>)}</tbody></table><p className="mt-6 border-t border-navy-200 pt-3 text-xs text-navy-500">{SUMMARY_FOOTER[lang]}</p></div>
        <ToolNavigation current="medications" />
      </div>
      <ConfirmDialog open={!!deleteTarget} title={t("إزالة هذا الدواء؟", "Remove this medication?")} body={t("سيُحذف نهائيًا من القائمة. يمكنك جعله غير نشط بدلًا من ذلك.", "It will be permanently removed. You can mark it inactive instead.")} confirmLabel={t("إزالة", "Remove")} cancelLabel={t("إلغاء", "Cancel")} onConfirm={() => { if (deleteTarget) deleteMedication(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
    </HealthToolShell>
  );
}

function MedicationGroup({ title, items, onEdit, onDelete, onToggle }: { title: string; items: Medication[]; onEdit: (item: Medication) => void; onDelete: (item: Medication) => void; onToggle: (item: Medication) => void }) {
  const { t } = useLang();
  if (!items.length) return null;
  return <section><h3 className="text-sm font-bold text-navy-700">{title} · {items.length}</h3><ul className="mt-3 grid gap-3 sm:grid-cols-2">{items.map((item) => <li key={item.id} className="rounded-2xl border border-navy-100 bg-white p-4 shadow-xs"><div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-navy-900">{item.name}</h4><p className="mt-1 text-sm text-navy-600">{[item.dose, item.unit].filter(Boolean).join(" ") || t("الجرعة غير مدخلة", "Dose not entered")} · {item.frequency}</p>{item.scheduledTimes.length > 0 && <p className="mt-1 text-xs text-navy-500">{item.scheduledTimes.join(" · ")}</p>}</div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.active ? "bg-brand-50 text-brand-700" : "bg-navy-100 text-navy-600"}`}>{item.active ? t("نشط", "Active") : t("غير نشط", "Inactive")}</span></div>{(item.purpose || item.prescribingClinician || item.notes) && <p className="mt-3 text-xs leading-relaxed text-navy-500">{[item.purpose, item.prescribingClinician, item.notes].filter(Boolean).join(" · ")}</p>}<div className="mt-4 flex flex-wrap gap-2 border-t border-navy-50 pt-3"><button type="button" onClick={() => onEdit(item)} className="btn-ghost px-3 py-2 text-xs"><Icon name="pencil" className="h-3.5 w-3.5" />{t("تعديل", "Edit")}</button><button type="button" onClick={() => onToggle(item)} className="btn-ghost px-3 py-2 text-xs">{item.active ? t("جعله غير نشط", "Mark inactive") : t("تنشيط", "Activate")}</button><button type="button" onClick={() => onDelete(item)} className="btn px-3 py-2 text-xs text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"><Icon name="trash" className="h-3.5 w-3.5" />{t("إزالة", "Remove")}</button></div></li>)}</ul></section>;
}

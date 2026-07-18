"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";
import HealthToolShell, { ToolGuidePanel } from "@/components/health-journey/HealthToolShell";
import { DateTimeInput, NumberInput, SelectInput, TextAreaInput } from "@/components/health-journey/HealthField";
import MeasurementHistory, { type HistoryColumn } from "@/components/health-journey/MeasurementHistory";
import TrendSummary from "@/components/health-journey/TrendSummary";
import LocalDataControls from "@/components/health-journey/LocalDataControls";
import EmptyState from "@/components/health-journey/EmptyState";
import ConfirmDialog from "@/components/health-journey/ConfirmDialog";
import HealthPrintHeader from "@/components/health-journey/HealthPrintHeader";
import ToolNavigation from "@/components/health-journey/ToolNavigation";
import Icon from "@/components/Icon";
import { TOOL_GUIDES, SUMMARY_FOOTER } from "@/data/healthJourneyContent";
import { useHealthStore } from "@/hooks/useHealthStore";
import { addBloodPressure, clearCollection, deleteBloodPressure, nowLocalInput, updateBloodPressure } from "@/lib/health-storage";
import { validateBloodPressure, hasErrors, parseNumber, type FieldErrors } from "@/lib/health-validation";
import { formatDateTime, summarize } from "@/lib/health-format";
import { downloadCsv, downloadJson, fileDateStamp } from "@/lib/health-export";
import { printPage } from "@/lib/health-print";
import type { BloodPressureReading } from "@/types/health";

type FormState = { measuredAt: string; systolic: string; diastolic: string; pulse: string; arm: string; bodyPosition: string; notes: string };
const freshForm = (): FormState => ({ measuredAt: nowLocalInput(), systolic: "", diastolic: "", pulse: "", arm: "", bodyPosition: "", notes: "" });

export default function BloodPressureView() {
  const { lang, t } = useLang();
  const { store, ready } = useHealthStore();
  const [form, setForm] = useState<FormState>(freshForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BloodPressureReading | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(() => store.bloodPressure
    .filter((item) => (!from || item.measuredAt.slice(0, 10) >= from) && (!to || item.measuredAt.slice(0, 10) <= to))
    .sort((a, b) => (sort === "newest" ? b.measuredAt.localeCompare(a.measuredAt) : a.measuredAt.localeCompare(b.measuredAt))), [store.bloodPressure, from, to, sort]);
  const newest = useMemo(() => [...rows].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt)), [rows]);
  const sys = summarize(newest.map((r) => r.systolic));
  const dia = summarize(newest.map((r) => r.diastolic));
  const pulse = summarize(newest.flatMap((r) => r.pulse === undefined ? [] : [r.pulse]));
  const LError = (key: string) => errors[key] ? (lang === "ar" ? errors[key].ar : errors[key].en) : undefined;
  const set = (key: keyof FormState) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const reset = () => { setForm(freshForm()); setEditingId(null); setErrors({}); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateBloodPressure(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const input = {
      measuredAt: form.measuredAt,
      systolic: parseNumber(form.systolic)!,
      diastolic: parseNumber(form.diastolic)!,
      ...(parseNumber(form.pulse) === null ? {} : { pulse: parseNumber(form.pulse)! }),
      ...(form.arm ? { arm: form.arm as "left" | "right" } : {}),
      ...(form.bodyPosition ? { bodyPosition: form.bodyPosition as "sitting" | "standing" | "lying" } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    };
    if (editingId) updateBloodPressure(editingId, input); else addBloodPressure(input);
    setStatus(editingId ? t("تم تحديث القراءة.", "Reading updated.") : t("تم حفظ القراءة.", "Reading saved."));
    reset();
  };
  const edit = (item: BloodPressureReading) => {
    setEditingId(item.id);
    setForm({ measuredAt: item.measuredAt, systolic: String(item.systolic), diastolic: String(item.diastolic), pulse: item.pulse === undefined ? "" : String(item.pulse), arm: item.arm ?? "", bodyPosition: item.bodyPosition ?? "", notes: item.notes ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const exportCsv = () => downloadCsv(`our-clinic-blood-pressure-${fileDateStamp()}.csv`, rows, [
    { header: t("التاريخ والوقت", "Date and time"), value: (r) => r.measuredAt },
    { header: t("الانقباضي", "Systolic"), value: (r) => r.systolic },
    { header: t("الانبساطي", "Diastolic"), value: (r) => r.diastolic },
    { header: t("النبض", "Pulse"), value: (r) => r.pulse },
    { header: t("الذراع", "Arm"), value: (r) => r.arm },
    { header: t("الوضعية", "Position"), value: (r) => r.bodyPosition },
    { header: t("ملاحظات", "Notes"), value: (r) => r.notes },
  ]);
  const columns: HistoryColumn<BloodPressureReading>[] = [
    { header: t("التاريخ والوقت", "Date and time"), cell: (r) => formatDateTime(r.measuredAt, lang) },
    { header: t("الانقباضي", "Systolic"), cell: (r) => <span className="font-bold tabular-nums">{r.systolic}</span> },
    { header: t("الانبساطي", "Diastolic"), cell: (r) => <span className="font-bold tabular-nums">{r.diastolic}</span> },
    { header: t("النبض", "Pulse"), cell: (r) => r.pulse ?? "—" },
    { header: t("تفاصيل", "Details"), cell: (r) => [r.arm ? t(r.arm === "left" ? "يسار" : "يمين", r.arm) : "", r.bodyPosition ? t(r.bodyPosition === "sitting" ? "جلوس" : r.bodyPosition === "standing" ? "وقوف" : "استلقاء", r.bodyPosition) : "", r.notes].filter(Boolean).join(" · ") || "—" },
  ];
  const stats = [
    { label: t("عدد القراءات", "Readings"), value: String(rows.length) },
    { label: t("متوسط الانقباضي", "Average systolic"), value: sys.average === null ? "—" : String(sys.average) },
    { label: t("متوسط الانبساطي", "Average diastolic"), value: dia.average === null ? "—" : String(dia.average) },
    { label: t("متوسط النبض", "Average pulse"), value: pulse.average === null ? "—" : String(pulse.average) },
    { label: t("أعلى رقم مسجل", "Highest recorded number"), value: rows.length ? String(Math.max(sys.highest!, dia.highest!)) : "—" },
    { label: t("أدنى رقم مسجل", "Lowest recorded number"), value: rows.length ? String(Math.min(sys.lowest!, dia.lowest!)) : "—" },
  ];

  return (
    <HealthToolShell icon="heart-pulse" title={{ ar: "سجل ضغط الدم", en: "Blood Pressure Log" }} helper={TOOL_GUIDES.bloodPressure.helper}>
      <div className="health-print">
        <div className="screen-only grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="space-y-8">
            <form onSubmit={submit} className="card-clinical rounded-3xl p-5 sm:p-7" noValidate>
              <div className="flex items-center justify-between gap-3"><h2 className="text-h3 font-bold text-navy-900">{editingId ? t("تعديل القراءة", "Edit reading") : t("أضف قراءة", "Add a reading")}</h2>{editingId && <button type="button" onClick={reset} className="btn-ghost px-4">{t("إلغاء", "Cancel")}</button>}</div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <DateTimeInput label={t("تاريخ ووقت القياس", "Measurement date and time")} value={form.measuredAt} onChange={set("measuredAt")} error={LError("measuredAt")} required />
                <div className="hidden sm:block" />
                <NumberInput label={t("الانقباضي", "Systolic")} hint={t("الرقم العلوي كما ظهر على الجهاز", "The top number shown by your device")} value={form.systolic} onChange={set("systolic")} error={LError("systolic")} required />
                <NumberInput label={t("الانبساطي", "Diastolic")} hint={t("الرقم السفلي كما ظهر على الجهاز", "The bottom number shown by your device")} value={form.diastolic} onChange={set("diastolic")} error={LError("diastolic")} required />
                <NumberInput label={t("النبض (اختياري)", "Pulse (optional)")} value={form.pulse} onChange={set("pulse")} error={LError("pulse")} />
                <SelectInput label={t("الذراع (اختياري)", "Arm (optional)")} value={form.arm} onChange={set("arm")} options={[{ value: "", label: t("غير محدد", "Not specified") }, { value: "left", label: t("اليسرى", "Left") }, { value: "right", label: t("اليمنى", "Right") }]} />
                <SelectInput label={t("وضعية الجسم (اختياري)", "Body position (optional)")} value={form.bodyPosition} onChange={set("bodyPosition")} options={[{ value: "", label: t("غير محدد", "Not specified") }, { value: "sitting", label: t("جلوس", "Sitting") }, { value: "standing", label: t("وقوف", "Standing") }, { value: "lying", label: t("استلقاء", "Lying") }]} />
                <div className="sm:col-span-2"><TextAreaInput label={t("ملاحظات (اختياري)", "Notes (optional)")} value={form.notes} onChange={set("notes")} /></div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3"><button type="submit" className="btn-primary"><Icon name="save" className="h-4 w-4" />{editingId ? t("حفظ التعديل", "Save changes") : t("حفظ القراءة", "Save reading")}</button><span aria-live="polite" className="text-sm font-semibold text-mint-500">{status}</span></div>
            </form>
            <TrendSummary stats={stats} note={(from || to) ? t("الحسابات تشمل النطاق الزمني المحدد فقط.", "Calculations include only the selected date range.") : undefined} />
            <section className="card-clinical rounded-3xl p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-h3 font-bold text-navy-900">{t("سجل القراءات", "Reading history")}</h2><p className="mt-1 text-sm text-navy-500">{t("يمكنك ترتيب السجل أو تحديد فترة زمنية.", "Sort the log or choose a date range.")}</p></div><button type="button" onClick={printPage} className="btn-ghost"><Icon name="printer" className="h-4 w-4" />{t("طباعة", "Print")}</button></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3"><DateTimeInput type="date" label={t("من", "From")} value={from} onChange={setFrom} /><DateTimeInput type="date" label={t("إلى", "To")} value={to} onChange={setTo} /><SelectInput label={t("الترتيب", "Sort") } value={sort} onChange={(v) => setSort(v as "newest" | "oldest")} options={[{ value: "newest", label: t("الأحدث أولًا", "Newest first") }, { value: "oldest", label: t("الأقدم أولًا", "Oldest first") }]} /></div>
              <div className="mt-6">{ready ? <MeasurementHistory caption={t("سجل قراءات ضغط الدم", "Blood pressure reading history")} rows={rows} columns={columns} onEdit={edit} onDelete={setDeleteTarget} emptyState={<EmptyState icon="heart-pulse" title={t("لا توجد قراءات هنا", "No readings here")} body={t("أضف أول قراءة أو غيّر مرشح التاريخ.", "Add your first reading or change the date filter.")} />} /> : <p className="text-sm text-navy-500">{t("جارٍ تحميل بيانات الجهاز…", "Loading device data…")}</p>}</div>
            </section>
            <LocalDataControls sectionLabel={{ ar: "قراءات ضغط الدم", en: "blood-pressure readings" }} onExportCsv={exportCsv} onExportJson={() => downloadJson(`our-clinic-blood-pressure-${fileDateStamp()}.json`, JSON.stringify(rows, null, 2))} onClearSection={() => clearCollection("bloodPressure")} />
          </div>
          <ToolGuidePanel guide={TOOL_GUIDES.bloodPressure} />
        </div>
        <div className="print-only print-area">
          <HealthPrintHeader title={t("سجل ضغط الدم", "Blood Pressure Log")} />
          <p className="mb-5 text-sm text-navy-600">{TOOL_GUIDES.bloodPressure.helper[lang]}</p>
          <table className="text-xs"><thead><tr>{columns.slice(0, 4).map((c) => <th key={c.header} className="border border-navy-200 bg-cloud p-2 text-start">{c.header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{columns.slice(0, 4).map((c) => <td key={c.header} className="border border-navy-200 p-2">{c.cell(row)}</td>)}</tr>)}</tbody></table>
          <p className="mt-6 border-t border-navy-200 pt-3 text-xs text-navy-500">{SUMMARY_FOOTER[lang]}</p>
        </div>
        <ToolNavigation current="blood-pressure" />
      </div>
      <ConfirmDialog open={!!deleteTarget} title={t("حذف هذه القراءة؟", "Delete this reading?")} body={t("سيتم حذفها نهائيًا من هذا الجهاز.", "It will be permanently removed from this device.")} confirmLabel={t("حذف", "Delete")} cancelLabel={t("إلغاء", "Cancel")} onConfirm={() => { if (deleteTarget) deleteBloodPressure(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
    </HealthToolShell>
  );
}

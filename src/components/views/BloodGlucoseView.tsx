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
import { SUMMARY_FOOTER, TOOL_GUIDES } from "@/data/healthJourneyContent";
import { useHealthStore } from "@/hooks/useHealthStore";
import { addBloodGlucose, clearCollection, deleteBloodGlucose, nowLocalInput, updateBloodGlucose } from "@/lib/health-storage";
import { hasErrors, parseNumber, validateBloodGlucose, type FieldErrors } from "@/lib/health-validation";
import { formatDateTime, summarize } from "@/lib/health-format";
import { downloadCsv, downloadJson, fileDateStamp } from "@/lib/health-export";
import { printPage } from "@/lib/health-print";
import type { BloodGlucoseReading, GlucoseUnit, MealContext } from "@/types/health";

type FormState = { measuredAt: string; value: string; unit: GlucoseUnit; mealContext: MealContext; notes: string };
const freshForm = (): FormState => ({ measuredAt: nowLocalInput(), value: "", unit: "mg/dL", mealContext: "fasting", notes: "" });

export default function BloodGlucoseView() {
  const { lang, t } = useLang();
  const { store, ready } = useHealthStore();
  const [form, setForm] = useState<FormState>(freshForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BloodGlucoseReading | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [meal, setMeal] = useState<"all" | MealContext>("all");
  const [status, setStatus] = useState("");
  const mealLabel = (value: MealContext) => ({ fasting: t("صائم", "Fasting"), "before-meal": t("قبل الوجبة", "Before meal"), "after-meal": t("بعد الوجبة", "After meal"), bedtime: t("قبل النوم", "Bedtime"), other: t("أخرى", "Other") })[value];
  const rows = useMemo(() => store.bloodGlucose
    .filter((item) => (!from || item.measuredAt.slice(0, 10) >= from) && (!to || item.measuredAt.slice(0, 10) <= to) && (meal === "all" || item.mealContext === meal))
    .sort((a, b) => sort === "newest" ? b.measuredAt.localeCompare(a.measuredAt) : a.measuredAt.localeCompare(b.measuredAt)), [store.bloodGlucose, from, to, meal, sort]);
  const units = new Set(rows.map((row) => row.unit));
  const summary = summarize([...rows].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt)).map((row) => row.value));
  const canCalculate = units.size <= 1;
  const LError = (key: string) => errors[key] ? errors[key][lang] : undefined;
  const set = <K extends keyof FormState>(key: K) => (value: string) => setForm((current) => ({ ...current, [key]: value as FormState[K] }));
  const reset = () => { setForm(freshForm()); setEditingId(null); setErrors({}); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateBloodGlucose(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) { requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    const input = { measuredAt: form.measuredAt, value: parseNumber(form.value)!, unit: form.unit, mealContext: form.mealContext, ...(form.notes.trim() ? { notes: form.notes.trim() } : {}) };
    if (editingId) updateBloodGlucose(editingId, input); else addBloodGlucose(input);
    setStatus(editingId ? t("تم تحديث القراءة.", "Reading updated.") : t("تم حفظ القراءة.", "Reading saved."));
    reset();
  };
  const edit = (item: BloodGlucoseReading) => { setEditingId(item.id); setForm({ measuredAt: item.measuredAt, value: String(item.value), unit: item.unit, mealContext: item.mealContext, notes: item.notes ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const columns: HistoryColumn<BloodGlucoseReading>[] = [
    { header: t("التاريخ والوقت", "Date and time"), cell: (r) => formatDateTime(r.measuredAt, lang) },
    { header: t("القراءة", "Reading"), cell: (r) => <span className="font-bold tabular-nums">{r.value} {r.unit}</span> },
    { header: t("سياق الوجبة", "Meal context"), cell: (r) => mealLabel(r.mealContext) },
    { header: t("ملاحظات", "Notes"), cell: (r) => r.notes || "—" },
  ];
  const exportCsv = () => downloadCsv(`our-clinic-blood-glucose-${fileDateStamp()}.csv`, rows, [
    { header: t("التاريخ والوقت", "Date and time"), value: (r) => r.measuredAt }, { header: t("القيمة", "Value"), value: (r) => r.value }, { header: t("الوحدة", "Unit"), value: (r) => r.unit }, { header: t("سياق الوجبة", "Meal context"), value: (r) => mealLabel(r.mealContext) }, { header: t("ملاحظات", "Notes"), value: (r) => r.notes },
  ]);
  const unit = units.size === 1 ? [...units][0] : "";
  const stats = [
    { label: t("عدد القراءات", "Readings"), value: String(rows.length) },
    { label: t("المتوسط", "Average"), value: canCalculate && summary.average !== null ? `${summary.average} ${unit}` : "—" },
    { label: t("أعلى قيمة مسجلة", "Highest recorded value"), value: canCalculate && summary.highest !== null ? `${summary.highest} ${unit}` : "—" },
    { label: t("أدنى قيمة مسجلة", "Lowest recorded value"), value: canCalculate && summary.lowest !== null ? `${summary.lowest} ${unit}` : "—" },
  ];
  const mealOptions = [
    { value: "fasting", label: t("صائم", "Fasting") }, { value: "before-meal", label: t("قبل الوجبة", "Before meal") }, { value: "after-meal", label: t("بعد الوجبة", "After meal") }, { value: "bedtime", label: t("قبل النوم", "Bedtime") }, { value: "other", label: t("أخرى", "Other") },
  ];

  return (
    <HealthToolShell icon="droplet" title={{ ar: "سجل سكر الدم", en: "Blood Glucose Log" }} helper={TOOL_GUIDES.bloodGlucose.helper}>
      <div className="health-print">
        <div className="screen-only grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="space-y-8">
            <form onSubmit={submit} className="card-clinical rounded-3xl p-5 sm:p-7" noValidate>
              <div className="flex items-center justify-between gap-3"><h2 className="text-h3 font-bold text-navy-900">{editingId ? t("تعديل القراءة", "Edit reading") : t("أضف قراءة", "Add a reading")}</h2>{editingId && <button type="button" onClick={reset} className="btn-ghost px-4">{t("إلغاء", "Cancel")}</button>}</div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <DateTimeInput label={t("تاريخ ووقت القياس", "Measurement date and time")} value={form.measuredAt} onChange={set("measuredAt")} error={LError("measuredAt")} required />
                <NumberInput label={t("القيمة", "Value")} value={form.value} onChange={set("value")} error={LError("value")} step="0.1" required />
                <SelectInput label={t("الوحدة كما يعرضها الجهاز", "Unit shown by your device")} value={form.unit} onChange={set("unit")} options={[{ value: "mg/dL", label: "mg/dL" }, { value: "mmol/L", label: "mmol/L" }]} required />
                <SelectInput label={t("سياق الوجبة", "Meal context")} value={form.mealContext} onChange={set("mealContext")} options={mealOptions} required />
                <div className="sm:col-span-2"><TextAreaInput label={t("ملاحظات (اختياري)", "Notes (optional)")} value={form.notes} onChange={set("notes")} /></div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3"><button type="submit" className="btn-primary"><Icon name="save" className="h-4 w-4" />{editingId ? t("حفظ التعديل", "Save changes") : t("حفظ القراءة", "Save reading")}</button><span aria-live="polite" className="text-sm font-semibold text-mint-500">{status}</span></div>
            </form>
            <TrendSummary stats={stats} note={!canCalculate ? t("تتضمن النتائج وحدات مختلفة، لذلك لم تُحسب المتوسطات.", "The results contain different units, so averages were not calculated.") : undefined} />
            <section className="card-clinical rounded-3xl p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-h3 font-bold text-navy-900">{t("سجل القراءات", "Reading history")}</h2><p className="mt-1 text-sm text-navy-500">{t("صفِّ السجل حسب التاريخ أو سياق الوجبة.", "Filter by date or meal context.")}</p></div><button type="button" onClick={printPage} className="btn-ghost"><Icon name="printer" className="h-4 w-4" />{t("طباعة", "Print")}</button></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><DateTimeInput type="date" label={t("من", "From")} value={from} onChange={setFrom} /><DateTimeInput type="date" label={t("إلى", "To")} value={to} onChange={setTo} /><SelectInput label={t("سياق الوجبة", "Meal context")} value={meal} onChange={(v) => setMeal(v as "all" | MealContext)} options={[{ value: "all", label: t("الكل", "All") }, ...mealOptions]} /><SelectInput label={t("الترتيب", "Sort")} value={sort} onChange={(v) => setSort(v as "newest" | "oldest")} options={[{ value: "newest", label: t("الأحدث أولًا", "Newest first") }, { value: "oldest", label: t("الأقدم أولًا", "Oldest first") }]} /></div>
              <div className="mt-6">{ready ? <MeasurementHistory caption={t("سجل قياسات سكر الدم", "Blood glucose reading history")} rows={rows} columns={columns} onEdit={edit} onDelete={setDeleteTarget} emptyState={<EmptyState icon="droplet" title={t("لا توجد قراءات هنا", "No readings here")} body={t("أضف أول قراءة أو غيّر المرشحات.", "Add your first reading or change the filters.")} />} /> : <p className="text-sm text-navy-500">{t("جارٍ تحميل بيانات الجهاز…", "Loading device data…")}</p>}</div>
            </section>
            <LocalDataControls sectionLabel={{ ar: "قراءات سكر الدم", en: "blood-glucose readings" }} onExportCsv={exportCsv} onExportJson={() => downloadJson(`our-clinic-blood-glucose-${fileDateStamp()}.json`, JSON.stringify(rows, null, 2))} onClearSection={() => clearCollection("bloodGlucose")} />
          </div><ToolGuidePanel guide={TOOL_GUIDES.bloodGlucose} />
        </div>
        <div className="print-only print-area"><HealthPrintHeader title={t("سجل سكر الدم", "Blood Glucose Log")} /><p className="mb-5 text-sm text-navy-600">{TOOL_GUIDES.bloodGlucose.helper[lang]}</p><table className="text-xs"><thead><tr>{columns.map((c) => <th key={c.header} className="border border-navy-200 bg-cloud p-2 text-start">{c.header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{columns.map((c) => <td key={c.header} className="border border-navy-200 p-2">{c.cell(row)}</td>)}</tr>)}</tbody></table><p className="mt-6 border-t border-navy-200 pt-3 text-xs text-navy-500">{SUMMARY_FOOTER[lang]}</p></div>
        <ToolNavigation current="blood-glucose" />
      </div>
      <ConfirmDialog open={!!deleteTarget} title={t("حذف هذه القراءة؟", "Delete this reading?")} body={t("سيتم حذفها نهائيًا من هذا الجهاز.", "It will be permanently removed from this device.")} confirmLabel={t("حذف", "Delete")} cancelLabel={t("إلغاء", "Cancel")} onConfirm={() => { if (deleteTarget) deleteBloodGlucose(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
    </HealthToolShell>
  );
}

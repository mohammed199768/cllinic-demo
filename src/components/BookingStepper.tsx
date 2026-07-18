"use client";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { whatsappHref } from "@/lib/clinic";
import services from "@/data/services.json";
import BookingSuccessQR, { BookingSummary } from "./BookingSuccessQR";
import DisclaimerNote from "./DisclaimerNote";
import Icon from "./Icon";
import { clinicRepository } from "@ourclinic/local-data";
import { createId } from "@ourclinic/local-data/create-id";

type Bi = { ar: string; en: string };

const DATE_LOCALE = { ar: "ar-JO", en: "en-US" } as const;
const WEEKDAYS = {
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
} as const;

// Booking UI slots only; adjust these later if the clinic wants a different booking window.
const TIME_SLOT_CONFIG = { start: "09:00", end: "22:00", stepMinutes: 30 } as const;

type Form = {
  service: string;
  fullName: string;
  phone: string;
  ageGroup: "" | "child" | "adult" | "senior";
  gender: "" | "male" | "female";
  insurance: "" | "yes" | "no";
  date: string;
  time: string;
  condition: string;
  website: string;
};

const initial: Form = {
  service: "", fullName: "", phone: "",
  ageGroup: "", gender: "", insurance: "", date: "", time: "",
  condition: "", website: "",
};

export default function BookingStepper() {
  const { lang, t } = useLang();
  const L = (b: Bi) => (lang === "ar" ? b.ar : b.en);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<BookingSummary | null>(null);
  const [error, setError] = useState("");
  // Stable idempotency key per booking attempt (prevents duplicates on retry).
  const idemRef = useRef<string>("");

  const steps = ["patient", "service", "datetime", "condition", "review"];
  const current = steps[step];
  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const serviceLabel = (id: string) => {
    const s = services.find((x) => x.id === id);
    return s ? L(s.title) : id;
  };

  const canNext = (): boolean => {
    switch (current) {
      case "service": return !!form.service;
      case "patient": return !!form.fullName && form.phone.length >= 7 && !!form.ageGroup && !!form.gender && !!form.insurance;
      case "datetime": return !!form.date && !!form.time;
      default: return true;
    }
  };

  const summaryText = (s: BookingSummary) =>
    (lang === "ar"
      ? `طلب حجز جديد\nرقم الحجز: ${s.bookingId}\nالاسم: ${s.firstName}\nالخدمة: ${s.service}\nالتاريخ: ${s.date}\nالوقت: ${s.time}`
      : `New booking request\nBooking ID: ${s.bookingId}\nName: ${s.firstName}\nService: ${s.service}\nDate: ${s.date}\nTime: ${s.time}`);

  const submit = async () => {
    setSubmitting(true); setError("");
    try {
      if (!idemRef.current) idemRef.current = createId();
      if (form.website) throw new Error("Booking submission failed");
      const booking = await clinicRepository.createBooking({
        fullName: form.fullName,
        phone: form.phone,
        requestedService: serviceLabel(form.service),
        requestedDate: form.date,
        requestedTime: form.time,
        ageGroup: form.ageGroup || undefined,
        requestedGender: form.gender || undefined,
        insurance: form.insurance || undefined,
        message: form.condition || undefined,
        source: "PUBLIC_WEBSITE",
      });
      const summary: BookingSummary = {
        bookingId: booking.publicReference,
        firstName: form.fullName.split(" ")[0] || form.fullName,
        service: serviceLabel(form.service),
        date: form.date,
        time: form.time,
      };
      setDone(summary);
    } catch {
      setError(t("تعذّر إرسال طلب الحجز. حاول مرة أخرى أو تواصل معنا عبر واتساب.", "Could not send the booking request. Please try again or contact us on WhatsApp."));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl animate-pop text-center">
        <div className="card p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-100 text-mint-500">
            <Icon name="check" className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-ink">{t("تم استلام طلبك", "Your request is received")}</h2>
          <p className="mt-2 text-sm text-slate-600">{t("سنتواصل معك لتأكيد الموعد. هذا طلب حجز وليس تأكيداً طبياً نهائياً.", "We'll contact you to confirm. This is a booking request, not a final medical confirmation.")}</p>

          <div className="mt-6 rounded-2xl bg-cloud p-5 text-start text-sm">
            <Row k={t("رقم الحجز", "Booking ID")} v={done.bookingId} />
            <Row k={t("الاسم", "Name")} v={done.firstName} />
            <Row k={t("الخدمة", "Service")} v={done.service} />
            <Row k={t("التاريخ", "Date")} v={done.date} />
            <Row k={t("الوقت", "Time")} v={done.time} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <BookingSuccessQR summary={done} />
            <a href={whatsappHref(summaryText(done))} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
              <Icon name="whatsapp" className="h-5 w-5" /> {t("أرسل الملخص عبر واتساب", "Send summary on WhatsApp")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{t("الخطوة", "Step")} {step + 1} / {steps.length}</span>
          <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <input
          type="text"
          value={form.website}
          onChange={(event) => set("website", event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute -start-[10000px] h-px w-px opacity-0"
        />
        {current === "service" && (
          <Step title={t("ما الخدمة المطلوبة؟", "Requested service")}>
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((s) => (
                <button key={s.id} onClick={() => set("service", s.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-start text-sm font-semibold transition ${form.service === s.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:border-brand-300"}`}>
                  <Icon name={s.icon} className="h-5 w-5 shrink-0 text-brand-500" />
                  {L(s.title)}
                </button>
              ))}
            </div>
          </Step>
        )}

        {current === "patient" && (
          <Step title={t("معلومات المريض", "Patient information")}>
            <div className="space-y-3">
              <Field label={t("الاسم الكامل", "Full name")}>
                <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputCls} placeholder={t("الاسم", "Name")} />
              </Field>
              <Field label={t("رقم الهاتف", "Phone number")}>
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" className={inputCls} placeholder="07xxxxxxxx" />
              </Field>
              <Field label={t("الفئة العمرية", "Age group")}>
                <Pills value={form.ageGroup} onChange={(v) => set("ageGroup", v)} options={[
                  { v: "child", label: t("طفل", "Child") }, { v: "adult", label: t("بالغ", "Adult") }, { v: "senior", label: t("كبير سن", "Senior") }]} />
              </Field>
              <Field label={t("الجنس", "Gender")}>
                <Pills value={form.gender} onChange={(v) => set("gender", v)} options={[
                  { v: "male", label: t("ذكر", "Male") }, { v: "female", label: t("أنثى", "Female") }]} />
              </Field>
              <Field label={t("هل لديك تأمين؟", "Has insurance?")}>
                <Pills value={form.insurance} onChange={(v) => set("insurance", v)} options={[
                  { v: "yes", label: t("نعم", "Yes") }, { v: "no", label: t("لا", "No") }]} />
              </Field>
            </div>
          </Step>
        )}

        {current === "datetime" && (
          <Step title={t("التاريخ والوقت المفضّل", "Preferred date and time")}>
            <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
              <Field label={t("التاريخ", "Date")}>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
              </Field>
              <Field label={t("الوقت", "Time")}>
                <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="hidden gap-3 lg:grid lg:grid-cols-2">
              <Field label={t("التاريخ", "Date")}>
                <DesktopDatePicker
                  value={form.date}
                  onChange={(value) => set("date", value)}
                  lang={lang}
                  label={t("التاريخ", "Date")}
                  placeholder={t("اختر التاريخ", "Select date")}
                />
              </Field>
              <Field label={t("الوقت", "Time")}>
                <DesktopTimePicker
                  value={form.time}
                  onChange={(value) => set("time", value)}
                  lang={lang}
                  label={t("الوقت", "Time")}
                  placeholder={t("اختر الوقت", "Select time")}
                />
              </Field>
            </div>
          </Step>
        )}

        {current === "condition" && (
          <Step title={t("وصف الحالة (اختياري)", "Condition description (optional)")}>
            <textarea value={form.condition} onChange={(e) => set("condition", e.target.value)} className={`${inputCls} min-h-28`} placeholder={t("اكتب الأعراض أو سبب الزيارة باختصار", "Briefly describe symptoms or reason")} />
            <p className="mt-3 text-xs text-rose-600">{t("لا ترسل تفاصيل حالات الطوارئ المهددة للحياة عبر النموذج — اتصل بخدمات الطوارئ المحلية فوراً.", "Do not submit life-threatening emergency details via the form - call local emergency services immediately.")}</p>
          </Step>
        )}

        {current === "review" && (
          <Step title={t("مراجعة وتأكيد", "Review and submit")}>
            <div className="rounded-2xl bg-cloud p-4 text-sm">
              <Row k={t("الخدمة", "Service")} v={serviceLabel(form.service)} />
              <Row k={t("الاسم", "Name")} v={form.fullName} />
              <Row k={t("الهاتف", "Phone")} v={form.phone} />
              <Row k={t("الموعد", "Appointment")} v={`${form.date} ${form.time}`} />
            </div>
            <div className="mt-4"><DisclaimerNote compact /></div>
          </Step>
        )}

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

        <div className="mt-7 flex items-center justify-between gap-3">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-ghost disabled:opacity-40">
            {t("رجوع", "Back")}
          </button>
          {current === "review" ? (
            <button onClick={submit} disabled={submitting} className="btn-primary min-w-40">
              {submitting ? t("جارٍ الإرسال…", "Sending…") : t("تأكيد الحجز", "Confirm booking")}
            </button>
          ) : (
            <button onClick={() => canNext() && setStep((s) => s + 1)} disabled={!canNext()} className="btn-primary min-w-32 disabled:opacity-40">
              {t("التالي", "Next")} <Icon name="arrow" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
const pickerTriggerCls = "flex h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/85 px-4 text-start text-sm shadow-sm outline-none transition hover:border-brand-300 hover:bg-white focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-100";

function DesktopDatePicker({
  value,
  onChange,
  lang,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  lang: string;
  label: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  const selected = value ? parseDateValue(value) : null;
  const [viewDate, setViewDate] = useState(() => selected ?? today);
  const locale = lang === "ar" ? DATE_LOCALE.ar : DATE_LOCALE.en;
  const weekdays = lang === "ar" ? WEEKDAYS.ar : WEEKDAYS.en;
  const days = useMemo(() => calendarDays(viewDate), [viewDate]);
  const placement = usePopoverPlacement(open, triggerRef, DATE_POPOVER_HEIGHT);

  useEffect(() => {
    if (value) setViewDate(parseDateValue(value));
  }, [value]);

  useClosePopover(open, rootRef, () => setOpen(false));

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewDate);
  const display = selected ? formatDateDisplay(value, lang) : "";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={pickerTriggerCls}
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon name="calendar" className="h-4 w-4" />
          </span>
          <span className={`truncate font-semibold ${display ? "text-ink" : "text-slate-400"}`}>{display || placeholder}</span>
        </span>
        <Icon name="chevron" className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>

      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={label}
          className={`absolute left-0 right-0 z-[80] rounded-3xl border border-white/70 bg-white/95 p-4 shadow-xl ring-1 ring-slate-100 backdrop-blur-xl ${placement === "above" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, -1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
              aria-label={lang === "ar" ? "الشهر السابق" : "Previous month"}
            >
              <Icon name="chevron" className="h-4 w-4 rotate-180 rtl:rotate-0" />
            </button>
            <p className="min-w-0 flex-1 truncate text-center text-sm font-extrabold text-ink">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
              aria-label={lang === "ar" ? "الشهر التالي" : "Next month"}
            >
              <Icon name="chevron" className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
            {weekdays.map((day) => (
              <span key={day} className="py-1">{day}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} className="h-10" aria-hidden="true" />;
              const dayValue = toDateValue(day);
              const isPast = day < today;
              const isToday = sameDate(day, today);
              const isSelected = value === dayValue;
              return (
                <button
                  key={dayValue}
                  type="button"
                  disabled={isPast}
                  aria-label={formatDateDisplay(dayValue, lang)}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange(dayValue);
                    setOpen(false);
                  }}
                  className={`flex h-10 items-center justify-center rounded-xl text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-100 ${
                    isSelected
                      ? "bg-brand-600 text-white shadow-glow"
                      : isPast
                        ? "cursor-not-allowed text-slate-300"
                        : isToday
                          ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
                          : "text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  {new Intl.DateTimeFormat(locale, { day: "numeric" }).format(day)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopTimePicker({
  value,
  onChange,
  lang,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  lang: string;
  label: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const slots = useMemo(() => buildTimeSlots(TIME_SLOT_CONFIG), []);
  const display = value ? formatTimeDisplay(value, lang) : "";
  const placement = usePopoverPlacement(open, triggerRef, TIME_POPOVER_HEIGHT);

  useClosePopover(open, rootRef, () => setOpen(false));

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={pickerTriggerCls}
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon name="clock" className="h-4 w-4" />
          </span>
          <span className={`truncate font-semibold ${display ? "text-ink" : "text-slate-400"}`}>{display || placeholder}</span>
        </span>
        <Icon name="chevron" className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>

      {open && (
        <div
          id={id}
          role="dialog"
          aria-label={label}
          className={`absolute left-0 right-0 z-[80] rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl ring-1 ring-slate-100 backdrop-blur-xl ${placement === "above" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1">
            {slots.map((slot) => {
              const selected = value === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    onChange(slot);
                    setOpen(false);
                  }}
                  className={`min-h-10 rounded-full border px-3 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-100 ${
                    selected
                      ? "border-brand-600 bg-brand-600 text-white shadow-glow"
                      : "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  {formatTimeDisplay(slot, lang)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- estimated popover heights (px) for collision detection ---------- */
// Date picker: header ~56 + weekday row ~24 + 6 calendar rows × 44 = ~344, plus p-4 padding (~32) ≈ 400
const DATE_POPOVER_HEIGHT = 400;
// Time picker: max-h-72 = 288px + p-3 padding (~24) ≈ 312
const TIME_POPOVER_HEIGHT = 312;
const POPOVER_SAFE_GAP = 24; // px safety margin before footer

/**
 * Lightweight collision-aware placement hook.
 * Returns "above" or "below" depending on available viewport space.
 */
function usePopoverPlacement(
  open: boolean,
  triggerRef: React.RefObject<HTMLButtonElement | null>,
  estimatedHeight: number,
): "above" | "below" {
  const [placement, setPlacement] = useState<"above" | "below">("below");

  const calculate = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return "below" as const;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < estimatedHeight + POPOVER_SAFE_GAP && spaceAbove > estimatedHeight) {
      return "above" as const;
    }
    return "below" as const;
  }, [triggerRef, estimatedHeight]);

  useEffect(() => {
    if (!open) return;
    setPlacement(calculate());
  }, [open, calculate]);

  return placement;
}

function useClosePopover(open: boolean, ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open, ref]);
}

function calendarDays(viewDate: Date) {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const total = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const days: Array<Date | null> = Array.from({ length: first.getDay() }, () => null);
  for (let day = 1; day <= total; day += 1) {
    days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  }
  return days;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateDisplay(value: string, lang: string) {
  const date = parseDateValue(value);
  return new Intl.DateTimeFormat(lang === "ar" ? DATE_LOCALE.ar : DATE_LOCALE.en, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function buildTimeSlots(config: typeof TIME_SLOT_CONFIG) {
  const start = timeToMinutes(config.start);
  const end = timeToMinutes(config.end);
  const slots: string[] = [];
  for (let minutes = start; minutes <= end; minutes += config.stepMinutes) {
    slots.push(minutesToTime(minutes));
  }
  return slots;
}

function formatTimeDisplay(value: string, lang: string) {
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat(lang === "ar" ? DATE_LOCALE.ar : DATE_LOCALE.en, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hour, minute));
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTime(total: number) {
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${pad2(hour)}:${pad2(minute)}`;
}

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="animate-fadeUp">
      <h2 className="mb-5 text-xl font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5 last:border-0">
      <span className="text-slate-500">{k}</span>
      <span className="font-semibold text-ink">{v}</span>
    </div>
  );
}
function Pills({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${value === o.v ? "border-brand-500 bg-brand-600 text-white" : "border-slate-200 hover:border-brand-300"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

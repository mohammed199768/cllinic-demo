"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLang } from "@/lib/i18n";
import { dateToLocalDateKey, formatLocalDateKey, formatTime, parseLocalDateKey } from "@/lib/health-format";

const WEEKDAYS = {
  ar: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
} as const;

export default function AppointmentDateTimeFields({
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <BilingualDatePicker value={date} onChange={onDateChange} />
      <BilingualTimeInput value={time} onChange={onTimeChange} />
    </div>
  );
}

function BilingualDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { lang, t } = useLang();
  const locale = lang === "ar" ? "ar-JO" : "en-GB";
  const panelId = useId();
  const selected = parseLocalDateKey(value);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selected ?? startOfDay(new Date()));
  const days = useMemo(() => calendarDays(viewDate), [viewDate]);

  useEffect(() => {
    if (value) setViewDate(parseLocalDateKey(value) ?? startOfDay(new Date()));
  }, [value]);

  const choose = (day: Date) => {
    onChange(dateToLocalDateKey(day));
    setOpen(false);
  };
  const label = t("تاريخ الموعد (اختياري)", "Appointment date (optional)");
  const displayValue = value ? formatLocalDateKey(value) : t("اختر التاريخ", "Choose date");

  return (
    <div className="relative">
      <label className="text-sm font-semibold text-navy-800" id={`${panelId}-label`}>
        {label}
      </label>
      <p className="mt-1 text-xs leading-relaxed text-navy-500">
        {t("اختر التاريخ من التقويم.", "Choose the date from the calendar.")}
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-overlay-trigger="popover"
            aria-label={`${label}: ${displayValue}`}
            aria-controls={panelId}
            className="mt-2 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-navy-200/80 bg-white px-3.5 py-2.5 text-start text-sm shadow-xs transition hover:border-brand-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="icon-pad h-9 w-9 shrink-0"><Icon name="calendar" className="h-4 w-4" /></span>
              <span className={value ? "font-semibold text-navy-800" : "text-navy-400"}>
                {displayValue}
              </span>
            </span>
            <Icon name="chevron" className={`h-4 w-4 shrink-0 text-navy-400 transition-transform ${open ? "-rotate-90" : "rotate-90"}`} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          id={panelId}
          aria-labelledby={`${panelId}-label`}
          className="w-[min(22rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-3xl border-navy-100 p-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setViewDate((current) => addMonths(current, -1))} aria-label={t("الشهر السابق", "Previous month")} className="flex h-11 w-11 items-center justify-center rounded-xl border border-navy-200 text-navy-600 transition hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              <Icon name="chevron" className="h-4 w-4 rotate-180 rtl:rotate-0" />
            </button>
            <p aria-live="polite" className="min-w-0 flex-1 text-center text-sm font-extrabold text-navy-900">
              {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewDate)}
            </p>
            <button type="button" onClick={() => setViewDate((current) => addMonths(current, 1))} aria-label={t("الشهر التالي", "Next month")} className="flex h-11 w-11 items-center justify-center rounded-xl border border-navy-200 text-navy-600 transition hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              <Icon name="chevron" className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-navy-400">
            {WEEKDAYS[lang].map((day) => <span key={day} className="py-1">{day}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day, index) => day ? (
              <button
                key={dateToLocalDateKey(day)}
                type="button"
                aria-label={formatLocalDateKey(dateToLocalDateKey(day))}
                aria-pressed={value === dateToLocalDateKey(day)}
                onClick={() => choose(day)}
                className={`flex h-11 min-w-0 items-center justify-center rounded-xl text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${value === dateToLocalDateKey(day) ? "bg-brand-600 text-white shadow-soft" : sameDate(day, new Date()) ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100" : "text-navy-700 hover:bg-brand-50 hover:text-brand-700"}`}
              >
                {new Intl.NumberFormat(locale).format(day.getDate())}
              </button>
            ) : <span key={`empty-${index}`} className="h-11" aria-hidden="true" />)}
          </div>
          {value && <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="btn-ghost mt-3 w-full text-xs">{t("مسح التاريخ", "Clear date")}</button>}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function BilingualTimeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { lang, t } = useLang();
  const locale = lang === "ar" ? "ar-JO" : "en-GB";
  const parsed = parseTime(value);
  const hour12 = parsed ? (parsed.hour % 12 || 12) : 9;
  const minute = parsed?.minute ?? 0;
  const period = parsed && parsed.hour >= 12 ? "pm" : "am";
  const hourValue: number | "" = parsed ? hour12 : "";
  const minuteValue: number | "" = parsed ? minute : "";
  const number = (valueToFormat: number, length = 1) => new Intl.NumberFormat(locale, { minimumIntegerDigits: length, useGrouping: false }).format(valueToFormat);
  const update = (nextHour: number, nextMinute: number, nextPeriod: "am" | "pm") => {
    const hour24 = nextPeriod === "pm" ? (nextHour % 12) + 12 : nextHour % 12;
    onChange(`${String(hour24).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`);
  };
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-navy-800">{t("وقت الموعد (اختياري)", "Appointment time (optional)")}</legend>
      <p className="mt-1 text-xs leading-relaxed text-navy-500">{t("أدخل الساعة والدقائق بشكل منفصل.", "Set the hour and minute separately.")}</p>
      <div className="mt-2 rounded-xl border border-navy-200/80 bg-white p-3 shadow-xs">
        <div className="mb-3 flex items-center gap-3"><span className="icon-pad h-9 w-9 shrink-0"><Icon name="clock" className="h-4 w-4" /></span><span className={value ? "text-sm font-semibold text-navy-800" : "text-sm text-navy-400"}>{value ? formatTime(value, lang) : t("الوقت غير محدد", "No time selected")}</span></div>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2" dir={lang === "ar" ? "rtl" : "ltr"}>
          <label className="text-xs font-semibold text-navy-500"><span className="mb-1 block">{t("الساعة", "Hour")}</span><select aria-label={t("الساعة", "Hour")} value={hourValue} onChange={(event) => update(Number(event.target.value), minute, period)} className="min-h-11 w-full rounded-xl border border-navy-200 bg-white px-2 text-center text-sm font-bold text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"><option value="" disabled>—</option>{Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => <option key={hour} value={hour}>{number(hour)}</option>)}</select></label>
          <label className="text-xs font-semibold text-navy-500"><span className="mb-1 block">{t("الدقائق", "Minute")}</span><select aria-label={t("الدقائق", "Minute")} value={minuteValue} onChange={(event) => update(hour12, Number(event.target.value), period)} className="min-h-11 w-full rounded-xl border border-navy-200 bg-white px-2 text-center text-sm font-bold text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"><option value="" disabled>—</option>{Array.from({ length: 60 }, (_, index) => index).map((minuteOption) => <option key={minuteOption} value={minuteOption}>{number(minuteOption, 2)}</option>)}</select></label>
          <label className="text-xs font-semibold text-navy-500"><span className="mb-1 block">{t("الفترة", "Period")}</span><select aria-label={t("صباحًا أو مساءً", "AM or PM")} value={parsed ? period : ""} onChange={(event) => update(hour12, minute, event.target.value as "am" | "pm")} className="min-h-11 rounded-xl border border-navy-200 bg-white px-3 text-sm font-bold text-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"><option value="" disabled>—</option><option value="am">{t("ص", "AM")}</option><option value="pm">{t("م", "PM")}</option></select></label>
        </div>
        {value ? <button type="button" onClick={() => onChange("")} className="mt-3 min-h-11 text-xs font-semibold text-navy-500 underline-offset-4 hover:text-brand-700 hover:underline">{t("مسح الوقت", "Clear time")}</button> : <button type="button" onClick={() => update(hour12, minute, period)} className="btn-ghost mt-3 w-full text-xs">{t("تعيين الوقت", "Set time")}</button>}
      </div>
    </fieldset>
  );
}

function calendarDays(viewDate: Date): Array<Date | null> {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const total = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const result: Array<Date | null> = Array.from({ length: first.getDay() }, () => null);
  for (let day = 1; day <= total; day += 1) result.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  return result;
}

function parseTime(value: string): { hour: number; minute: number } | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}

function startOfDay(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function addMonths(date: Date, amount: number): Date { return new Date(date.getFullYear(), date.getMonth() + amount, 1); }
function sameDate(a: Date, b: Date): boolean { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

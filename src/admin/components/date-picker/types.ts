import type { Locale } from '../../i18n/dict';

export type DateValue = string;

export interface DateRangeValue {
  start: DateValue;
  end: DateValue;
}

export interface DateTimeValue {
  date: DateValue;
  time: string;
}

export type DisabledDateMatcher = DateValue[] | ((date: DateValue) => boolean);

export interface DatePickerBaseProps {
  label: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
  disabledDates?: DisabledDateMatcher;
  locale?: Locale;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export interface DatePickerProps extends DatePickerBaseProps {
  value: DateValue;
  onChange: (value: DateValue) => void;
  allowClear?: boolean;
}

export interface DateRangePickerProps extends DatePickerBaseProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  allowClear?: boolean;
  presets?: boolean;
}

export interface DateTimePickerProps extends Omit<DatePickerBaseProps, 'label'> {
  value: DateTimeValue;
  onChange: (value: DateTimeValue) => void;
  dateLabel: string;
  timeLabel: string;
  allowClear?: boolean;
  timeRequired?: boolean;
}

import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { LocaleProvider } from '../../i18n/LocaleProvider';
import { CalendarPanel } from './CalendarPanel';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';
import { addDays, todayInAmman } from './date-utils';
import type { DateRangeValue } from './types';

afterEach(() => cleanup());

function DateHarness({ initial = '2026-07-14', locale = 'en' }: { initial?: string; locale?: 'ar' | 'en' }) {
  const [value, setValue] = useState(initial);
  return (
    <LocaleProvider>
      <DatePicker label="Appointment date" value={value} onChange={setValue} locale={locale} />
      <output data-testid="date-value">{value}</output>
    </LocaleProvider>
  );
}

function RangeHarness() {
  const [value, setValue] = useState<DateRangeValue>({ start: '2026-07-10', end: '2026-07-12' });
  return (
    <LocaleProvider>
      <DateRangePicker label="Report range" value={value} onChange={setValue} locale="en" presets />
      <output data-testid="range-value">{JSON.stringify(value)}</output>
    </LocaleProvider>
  );
}

describe('DatePicker interactions', () => {
  it('stages the Amman Today shortcut and commits it with Apply', async () => {
    const today = todayInAmman();
    const initial = addDays(today, -1);
    render(<DateHarness initial={initial} />);
    fireEvent.click(screen.getByRole('button', { name: /Appointment date/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Today' }));
    expect(screen.getByTestId('date-value').textContent).toBe(initial);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByTestId('date-value').textContent).toBe(today);
  });

  it('keeps draft navigation and selection uncommitted on cancel, then applies and clears explicitly', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateHarness />);
    const trigger = screen.getByRole('button', { name: /Appointment date.*14 July 2026/i });

    await user.click(trigger);
    expect(await screen.findByRole('dialog', { name: 'Choose date' })).toBeTruthy();
    await user.click(container.ownerDocument.querySelector('[data-date="2026-07-16"]')!);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByTestId('date-value').textContent).toBe('2026-07-14');
    expect(document.activeElement).toBe(trigger);

    await user.click(trigger);
    await user.click(container.ownerDocument.querySelector('[data-date="2026-07-16"]')!);
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByTestId('date-value').textContent).toBe('2026-07-16');

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByTestId('date-value').textContent).toBe('');
  });

  it('supports direct month/year changes while committing only after a day and Apply', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateHarness />);
    await user.click(screen.getByRole('button', { name: /Appointment date/ }));
    fireEvent.change(screen.getByLabelText('Select month'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Select year'), { target: { value: '2027' } });
    expect(screen.getByTestId('date-value').textContent).toBe('2026-07-14');
    await user.click(container.ownerDocument.querySelector('[data-date="2027-08-20"]')!);
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByTestId('date-value').textContent).toBe('2027-08-20');
  });

  it('uses roving keyboard focus and native Enter selection', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateHarness />);
    await user.click(screen.getByRole('button', { name: /Appointment date/ }));
    const selected = container.ownerDocument.querySelector<HTMLElement>('[data-date="2026-07-14"]')!;
    await waitFor(() => expect(document.activeElement).toBe(selected));
    await user.keyboard('{ArrowRight}{Enter}');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByTestId('date-value').textContent).toBe('2026-07-15');
  });
});

describe('DateRangePicker and localized calendar rendering', () => {
  it('normalizes reverse range selection and applies an inclusive range', async () => {
    const user = userEvent.setup();
    const { container } = render(<RangeHarness />);
    await user.click(screen.getByRole('button', { name: /Report range/ }));
    await user.click(container.ownerDocument.querySelector('[data-date="2026-07-14"]')!);
    await user.click(container.ownerDocument.querySelector('[data-date="2026-07-10"]')!);
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByTestId('range-value').textContent).toBe('{"start":"2026-07-10","end":"2026-07-14"}');
  });

  it('renders the same selected Gregorian date in English LTR and Arabic RTL', () => {
    const onSelect = () => {};
    const onViewDateChange = () => {};
    const { rerender } = render(
      <CalendarPanel locale="en" viewDate="2026-07-01" selectedDate="2026-07-14" onSelect={onSelect} onViewDateChange={onViewDateChange} />,
    );
    const enGrid = screen.getByRole('grid', { name: 'Date selection calendar' });
    expect(enGrid.getAttribute('dir')).toBe('ltr');
    expect(screen.getByRole('columnheader', { name: /Sat/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Tuesday, 14 July 2026/i }).closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe('true');

    rerender(<CalendarPanel locale="ar" viewDate="2026-07-01" selectedDate="2026-07-14" onSelect={onSelect} onViewDateChange={onViewDateChange} />);
    const arGrid = screen.getByRole('grid', { name: 'تقويم اختيار التاريخ' });
    expect(arGrid.getAttribute('dir')).toBe('rtl');
    expect(screen.getByRole('columnheader', { name: 'السبت' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /الثلاثاء.*١٤ (يوليو|تموز) ٢٠٢٦/ })).toBeTruthy();
  });
});

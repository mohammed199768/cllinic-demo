import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CLINIC } from './clinic';
import { T } from '../i18n/dict';
import { LocaleProvider, useI18n } from '../i18n/LocaleProvider';

function LocaleProbe() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div>
      <span>{locale}</span>
      <strong>{t('appShort')}</strong>
      <button onClick={() => setLocale('en')}>English</button>
    </div>
  );
}

describe('Admin clinic identity', () => {
  beforeEach(() => localStorage.clear());

  it('uses the exact demo identity across navigation, login, settings, and print dictionaries', () => {
    expect(CLINIC).toMatchObject({
      nameAr: 'عيادتنا',
      nameEn: 'OurClinic',
      phoneDisplay: '0779667168',
      phoneE164: '+962779667168',
      email: 'mohammed.aldomi68@gmail.com',
      cityAr: 'عمّان',
      cityEn: 'Amman',
      countryAr: 'الأردن',
      countryEn: 'Jordan',
      timezone: 'Asia/Amman',
    });
    expect(T.appShort).toEqual({ ar: 'عيادتنا', en: 'OurClinic' });
    expect(T.appName.ar).toContain('عيادتنا');
    expect(T.appName.en).toContain('OurClinic');

    const src = path.resolve(__dirname, '../..');
    const login = fs.readFileSync(path.join(src, 'app/admin/login/page.tsx'), 'utf8');
    const shell = fs.readFileSync(path.join(src, 'admin/components/Shell.tsx'), 'utf8');
    const print = fs.readFileSync(path.join(src, 'app/admin/(protected)/visits/[id]/print/page.tsx'), 'utf8');
    expect(login).toContain("t('appShort')");
    expect(shell).toContain("t('appShort')");
    expect(print).toContain("t('appShort')");
    expect(`${login}\n${shell}\n${print}`).not.toMatch(/0796119707|796119707/i);
  });

  it('switches Arabic RTL to English LTR and changes the displayed identity', async () => {
    render(<LocaleProvider><LocaleProbe /></LocaleProvider>);
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
    expect(screen.getByText('عيادتنا')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    await waitFor(() => expect(document.documentElement.dir).toBe('ltr'));
    expect(screen.getByText('OurClinic')).toBeTruthy();
    expect(localStorage.getItem('our_clinic_locale')).toBe('en');
  });
});

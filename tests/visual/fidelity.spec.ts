import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const sizes = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1366, height: 768 },
] as const;

const publicRoutes = [
  ['home', '/'],
  ['booking', '/booking'],
  ['services', '/services'],
  ['content', '/medical-tips'],
] as const;

const adminRoutes = [
  ['login', '/admin/login'],
  ['today', '/admin/today'],
  ['dashboard', '/admin/dashboard'],
  ['bookings', '/admin/bookings'],
  ['patient-profile', '/admin/patients/patient-demo-1'],
  ['visit-workspace', '/admin/visits/visit-demo-1'],
  ['reports', '/admin/reports'],
] as const;

async function stable(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({ content: '.demo-switcher { display: none !important } *,*::before,*::after { animation: none !important; transition: none !important; caret-color: transparent !important }' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

test('captures and checks all major public and admin surfaces at required viewports', async ({ page }) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => {
    localStorage.setItem('our-clinic-lang', 'en');
    localStorage.setItem('our_clinic_locale', 'en');
  });
  const output = path.resolve('tests/visual/results');
  await mkdir(output, { recursive: true });

  for (const size of sizes) {
    await page.setViewportSize({ width: size.width, height: size.height });
    for (const [name, route] of publicRoutes) {
      await page.goto(route);
      await stable(page);
      await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
      await page.screenshot({ path: path.join(output, `public-${name}-${size.name}.png`), fullPage: true });
    }

    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('our_clinic_session'));
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill('admin@ourclinic.demo');
    await page.getByLabel('Password').fill('OurClinic2026!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    const session = await page.evaluate(() => localStorage.getItem('our_clinic_session'));
    expect(session).toBeTruthy();
    for (const [name, route] of adminRoutes) {
      if (name === 'login') {
        await page.evaluate(() => localStorage.removeItem('our_clinic_session'));
        await page.goto(route);
      } else {
        await page.evaluate((value) => localStorage.setItem('our_clinic_session', value), session!);
        await page.goto(route);
      }
      await stable(page);
      await expect(page.locator('.admin-app')).toBeVisible();
      await page.screenshot({ path: path.join(output, `admin-${name}-${size.name}.png`), fullPage: true });
    }
  }
});

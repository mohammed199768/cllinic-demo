import { expect, test, type Page } from '@playwright/test';

const STORAGE_KEY = 'ourClinic.healthCompanion.v1';

function seededStore() {
  const now = '2026-07-18T09:00';
  const stamp = '2026-07-18T09:00:00.000Z';
  return {
    version: 1,
    bloodPressure: [{
      id: 'bp-layout-1',
      measuredAt: now,
      systolic: 118,
      diastolic: 76,
      pulse: 72,
      createdAt: stamp,
      updatedAt: stamp,
    }],
    bloodGlucose: [{
      id: 'bg-layout-1',
      measuredAt: now,
      value: 96,
      unit: 'mg/dL',
      mealContext: 'fasting',
      createdAt: stamp,
      updatedAt: stamp,
    }],
    medications: [{
      id: 'med-layout-1',
      name: 'Demo medication',
      dose: '5',
      unit: 'mg',
      frequency: 'Once daily',
      scheduledTimes: ['08:00'],
      active: true,
      createdAt: stamp,
      updatedAt: stamp,
    }],
    visitPreparation: {
      appointmentDate: '2026-07-18',
      appointmentTime: '09:00',
      mainConcern: 'Discuss current readings.',
      symptomsToDiscuss: '',
      symptomsStarted: '',
      recentChanges: '',
      questionsForClinician: 'What should I monitor?',
      medicationsToReview: 'Demo medication',
      filesToBring: '',
      personalGoals: 'Leave with a clear plan.',
      notes: '',
      updatedAt: stamp,
    },
    patientProfile: null,
  };
}

async function setLocaleAndSeed(page: Page, locale: 'ar' | 'en') {
  await page.addInitScript(({ locale, store }) => {
    localStorage.setItem('our-clinic-lang', locale);
    localStorage.setItem('our_clinic_locale', locale);
    localStorage.setItem('ourClinic.healthCompanion.v1', JSON.stringify(store));
  }, { locale, store: seededStore() });
}

function pageCount(pdf: Buffer) {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
}

test('health journey date picker displays stable placeholders and stores local date keys', async ({ page }) => {
  await setLocaleAndSeed(page, 'en');
  await page.goto('/health-journey/report');
  const englishDateTrigger = page.locator('button').filter({ hasText: 'Choose date' }).first();
  await expect(englishDateTrigger).toBeVisible();
  await englishDateTrigger.click();
  await page.getByRole('button', { name: '18/07/2026' }).click();
  await expect(page.locator('button').filter({ hasText: '18/07/2026' }).first()).toBeVisible();
  await page.getByRole('button', { name: /Save locally/i }).click();
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE_KEY);
  expect(stored.patientProfile.dateOfBirth).toBe('2026-07-18');

  const arabic = await page.context().newPage();
  await setLocaleAndSeed(arabic, 'ar');
  await arabic.goto('/health-journey/report');
  await expect(arabic.locator('button').filter({ hasText: 'اختر التاريخ' }).first()).toBeVisible();
  await arabic.close();
});

test('health journey pages do not horizontally overflow across key viewports', async ({ page }) => {
  await setLocaleAndSeed(page, 'en');
  const routes = [
    '/health-journey',
    '/health-journey/blood-pressure',
    '/health-journey/blood-glucose',
    '/health-journey/medications',
    '/health-journey/visit-preparation',
    '/health-journey/downloads',
  ];
  const sizes = [
    { width: 1536, height: 864 },
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
  ];
  for (const size of sizes) {
    await page.setViewportSize(size);
    for (const route of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${route} ${size.width}x${size.height}`).toBeLessThanOrEqual(1);
    }
  }
});

test('medication entry and list stay in normal flow without geometric overlap', async ({ page }) => {
  await setLocaleAndSeed(page, 'en');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/health-journey/medications');
  const entry = await page.locator('[data-health-section="medication-entry"]').boundingBox();
  const list = await page.locator('[data-health-section="medication-list"]').boundingBox();
  expect(entry).toBeTruthy();
  expect(list).toBeTruthy();
  expect(list!.y).toBeGreaterThan(entry!.y + entry!.height);
});

test('print mode exposes only the full-width document and short reports avoid blank second pages', async ({ page, browser }) => {
  await setLocaleAndSeed(page, 'en');
  await page.goto('/health-journey/blood-pressure');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.screen-only')).toBeHidden();
  await expect(page.locator('.print-area')).toBeVisible();
  const width = await page.locator('.print-area').evaluate((node) => node.getBoundingClientRect().width);
  expect(width).toBeGreaterThan(650);

  const routes = [
    '/health-journey/blood-pressure',
    '/health-journey/blood-glucose',
    '/health-journey/medications',
    '/health-journey/visit-preparation',
  ];
  for (const locale of ['en', 'ar'] as const) {
    for (const route of routes) {
      const context = await browser.newContext();
      await context.addInitScript(({ locale, store }) => {
        localStorage.setItem('our-clinic-lang', locale);
        localStorage.setItem('our_clinic_locale', locale);
        localStorage.setItem('ourClinic.healthCompanion.v1', JSON.stringify(store));
      }, { locale, store: seededStore() });
      const reportPage = await context.newPage();
      await reportPage.goto(route);
      const pdf = await reportPage.pdf({ format: 'A4', printBackground: true });
      expect(pageCount(pdf), `${locale} ${route}`).toBe(1);
      await context.close();
    }
  }
});

import { expect, test, type Locator, type Page } from '@playwright/test';

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
    window.print = () => undefined;
  }, { locale, store: seededStore() });
}

function pageCount(pdf: Buffer) {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length;
}

async function expectPickerAbovePageContent(page: Page, trigger: Locator) {
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const overlay = page.locator('[data-overlay-layer="popover"]');
  await expect(overlay).toBeVisible();
  await overlay.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });

  const geometry = await overlay.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const sampleX = rect.left + rect.width / 2;
    const sampleY = rect.top + rect.height / 2;
    const topElement = document.elementFromPoint(sampleX, sampleY);
    const trigger = document.querySelector('[data-overlay-trigger="popover"][data-state="open"]');
    const underlyingContent = [...document.querySelectorAll('.card-clinical, button, input, select, textarea, [data-health-section]')].filter((candidate) =>
      !element.contains(candidate) && candidate !== trigger,
    );
    const overlappingContent = underlyingContent.find((candidate) => {
      const candidateRect = candidate.getBoundingClientRect();
      return candidateRect.width > 1 && candidateRect.height > 1 && candidateRect.left < rect.right && candidateRect.right > rect.left && candidateRect.top < rect.bottom && candidateRect.bottom > rect.top;
    });

    let overlapHitIsPicker = false;
    if (overlappingContent) {
      const contentRect = overlappingContent.getBoundingClientRect();
      const left = Math.max(rect.left, contentRect.left);
      const right = Math.min(rect.right, contentRect.right);
      const top = Math.max(rect.top, contentRect.top);
      const bottom = Math.min(rect.bottom, contentRect.bottom);
      const overlapElement = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
      overlapHitIsPicker = !!overlapElement?.closest('[data-overlay-layer="popover"]');
    }

    return {
      insideBodyPortal: document.body.contains(element) && !element.closest('.card-clinical'),
      withinViewport: rect.left >= -1 && rect.right <= viewportWidth + 1 && rect.top >= -1 && rect.bottom <= viewportHeight + 1,
      centerHitIsPicker: !!topElement?.closest('[data-overlay-layer="popover"]'),
      overlapsPageContent: !!overlappingContent,
      overlapHitIsPicker,
      overflow: document.documentElement.scrollWidth - viewportWidth,
    };
  });

  expect(geometry.insideBodyPortal).toBe(true);
  expect(geometry.withinViewport).toBe(true);
  expect(geometry.centerHitIsPicker).toBe(true);
  expect(geometry.overlapsPageContent).toBe(true);
  expect(geometry.overlapHitIsPicker).toBe(true);
  expect(geometry.overflow).toBeLessThanOrEqual(1);

  await overlay.locator('button[aria-label*="/"]').first().click();
  await expect(overlay).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(overlay).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(overlay).toBeHidden();
  await expect(trigger).toBeFocused();
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

test('health journey date overlays portal above cards in Arabic and English', async ({ browser }) => {
  test.setTimeout(180_000);
  const pickerRoutes = [
    '/health-journey/blood-pressure',
    '/health-journey/blood-glucose',
    '/health-journey/visit-preparation',
    '/health-journey/report',
  ];

  for (const locale of ['en', 'ar'] as const) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setLocaleAndSeed(page, locale);

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 360, height: 800 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
    ]) {
      await page.setViewportSize(viewport);
      for (const route of pickerRoutes) {
        await page.goto(route);
        const trigger = page.locator('.health-print button[aria-haspopup="dialog"]').first();
        await expect(trigger, `${locale} ${route} picker trigger`).toBeVisible();
        await expectPickerAbovePageContent(page, trigger);
      }
    }

    await page.goto('/health-journey/medications');
    await expect(page.locator('.health-print button[aria-haspopup="dialog"]')).toHaveCount(0);

    await page.goto('/health-journey/visit-preparation');
    const timeFields = page.locator('fieldset').filter({ has: page.locator('select') }).first().locator('select');
    await expect(timeFields).toHaveCount(3);
    await timeFields.nth(0).selectOption('9');
    await timeFields.nth(1).selectOption('30');
    await timeFields.nth(2).selectOption('pm');
    await expect(timeFields.nth(2)).toHaveValue('pm');

    await context.close();
  }
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

test('downloads printable resources use intentional A4 pagination without app chrome', async ({ browser }) => {
  const expectedPageCounts = [1, 2, 1, 2, 1, 1, 1, 1, 1, 1];

  for (const locale of ['en', 'ar'] as const) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await setLocaleAndSeed(page, locale);
    await page.goto('/health-journey/downloads');

    const cards = page.locator('.screen-only article');
    await expect(cards).toHaveCount(expectedPageCounts.length);

    for (let index = 0; index < expectedPageCounts.length; index++) {
      await page.emulateMedia({ media: 'screen' });
      await cards.nth(index).locator('button').click();
      await page.emulateMedia({ media: 'print' });

      const geometry = await page.evaluate(() => {
        const area = document.querySelector('.print-area');
        const article = document.querySelector('.print-area article');
        const areaRect = area?.getBoundingClientRect();
        const articleRect = article?.getBoundingClientRect();
        const tables = [...document.querySelectorAll('.print-area table')].map((table) => table.getBoundingClientRect());
        const visibleChrome = [...document.querySelectorAll('header, footer, nav, .fixed, .sticky, .app-dock, .demo-switcher, .pwa-notice, .screen-only, .no-print')]
          .filter((node) => {
            const element = node as HTMLElement;
            if (area?.contains(element) || element.contains(area)) return false;
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
          });

        return {
          dir: document.documentElement.dir,
          areaWidth: areaRect?.width ?? 0,
          articleX: articleRect?.x ?? 0,
          articleRight: articleRect?.right ?? 0,
          clippedTables: tables.filter((table) => areaRect && (table.x < areaRect.x - 1 || table.right > areaRect.right + 1)).length,
          visibleChromeCount: visibleChrome.length,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

      expect(geometry.dir, `${locale} resource ${index + 1} direction`).toBe(locale === 'ar' ? 'rtl' : 'ltr');
      expect(geometry.areaWidth, `${locale} resource ${index + 1} print width`).toBeGreaterThan(650);
      expect(geometry.articleX, `${locale} resource ${index + 1} displaced left`).toBeGreaterThanOrEqual(0);
      expect(geometry.articleRight, `${locale} resource ${index + 1} displaced right`).toBeLessThanOrEqual(1441);
      expect(geometry.clippedTables, `${locale} resource ${index + 1} clipped tables`).toBe(0);
      expect(geometry.visibleChromeCount, `${locale} resource ${index + 1} app chrome`).toBe(0);
      expect(geometry.overflow, `${locale} resource ${index + 1} overflow`).toBeLessThanOrEqual(1);

      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      expect(pageCount(pdf), `${locale} resource ${index + 1}`).toBe(expectedPageCounts[index]);
    }

    await context.close();
  }
});

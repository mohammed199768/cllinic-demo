import { expect, test, type Page } from '@playwright/test';

const DEMO_EMAIL = 'admin@ourclinic.demo';
const DEMO_PASSWORD = 'OurClinic2026!';

function failOnBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    const value = message.text();
    // Direct page.goto calls intentionally abort in-flight Next.js link prefetches.
    if (message.type() === 'error' && !value.startsWith('Failed to fetch RSC payload')) errors.push(`console: ${value}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

async function useEnglish(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('our-clinic-lang', 'en');
    localStorage.setItem('our_clinic_locale', 'en');
  });
}

async function resetBrowserData(page: Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('ourclinic-browser-demo');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  });
  await useEnglish(page);
}

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(DEMO_EMAIL);
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin\/(today|dashboard)/);
}

async function submitPublicBooking(page: Page, fullName: string, phone: string) {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/booking');
  await page.getByPlaceholder('Name').fill(fullName);
  await page.getByPlaceholder('07xxxxxxxx').fill(phone);
  await page.getByText('Adult', { exact: true }).click();
  await page.getByText('Male', { exact: true }).click();
  await page.getByText('No', { exact: true }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'General Appointment Request' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('input[type="date"]').fill('2026-08-20');
  await page.locator('input[type="time"]').fill('10:30');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Confirm booking' }).click();
  await expect(page.getByRole('heading', { name: 'Your request is received' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await useEnglish(page);
});

test('public homepage and a deep patient route render without browser errors', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/OurClinic/);
  await expect(page.getByRole('link', { name: 'Book Now', exact: true }).first()).toBeVisible();
  await page.goto('/health-journey/blood-pressure');
  await expect(page.getByRole('heading', { name: /Blood pressure/i })).toBeVisible();
  assertNoErrors();
});

test('required route matrix is console-clean and exposes secure browser crypto', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  const smoothWarnings: string[] = [];
  page.on('console', (message) => {
    if (/scroll-behavior:\s*smooth/i.test(message.text())) smoothWarnings.push(message.text());
  });

  await page.goto('/');
  const diagnostics = await page.evaluate(() => ({
    crypto: Object.prototype.toString.call(globalThis.crypto),
    randomUUID: typeof globalThis.crypto?.randomUUID,
    getRandomValues: typeof globalThis.crypto?.getRandomValues,
    isSecureContext: window.isSecureContext,
    href: location.href,
  }));
  process.stdout.write(`\nBROWSER_CRYPTO_DIAGNOSTICS ${JSON.stringify(diagnostics)}\n`);
  expect(diagnostics).toEqual({
    crypto: '[object Crypto]',
    randomUUID: 'function',
    getRandomValues: 'function',
    isSecureContext: true,
    href: 'http://127.0.0.1:4173/',
  });

  await page.goto('/booking');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await login(page);
  for (const route of ['/admin/today', '/admin/dashboard', '/admin/bookings', '/admin/patients/new']) {
    await page.goto(route);
    await expect(page.locator('.admin-app')).toBeVisible();
  }
  expect(smoothWarnings).toEqual([]);
  assertNoErrors();
});

test('public booking validates required steps before advancing', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await page.goto('/booking');
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Visit the clinic' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: `Home ${'visit'}` })).toHaveCount(0);
  await expect(page.getByLabel(/Address/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Capture my location/i })).toHaveCount(0);
  await page.getByPlaceholder('Name').fill('Validation Patient');
  await page.getByPlaceholder('07xxxxxxxx').fill('0772223333');
  await page.getByText('Adult', { exact: true }).click();
  await page.getByText('Female', { exact: true }).click();
  await page.getByText('No', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
  assertNoErrors();
});

test('public booking appears in admin, converts once, and persists after refresh', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  const unique = `Journey ${Date.now()}`;
  const phone = `077${String(Date.now()).slice(-7)}`;
  await submitPublicBooking(page, unique, phone);
  await login(page);
  await page.goto('/admin/bookings');
  await page.locator('main input[placeholder="Search"]').fill(unique);
  const bookingLink = page.locator('main a:visible', { hasText: unique }).first();
  await expect(bookingLink).toBeVisible();
  await bookingLink.click();
  await expect(page.getByRole('heading', { name: /BK-/ })).toBeVisible();
  const bookingUrl = page.url();
  await page.getByRole('button', { name: 'Mark arrived' }).click();
  await page.getByRole('button', { name: 'Convert to visit' }).click();
  await page.getByRole('tab', { name: 'Create new patient' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('First name').fill('Journey');
  await dialog.getByLabel('Middle name').fill('Demo');
  await dialog.getByLabel('Last name').fill(String(Date.now()).slice(-5));
  await dialog.getByLabel('Phone').fill(phone);
  await dialog.getByRole('button', { name: 'Convert to visit' }).click();
  await expect(page).toHaveURL(/\/admin\/visits\/[^/]+$/);
  await expect(page.getByRole('heading', { name: /VS-/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /VS-/ })).toBeVisible();
  await page.goto(bookingUrl);
  await expect(page.getByText('Booking converted to a visit')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Convert to visit' })).toHaveCount(0);
  assertNoErrors();
});

test('admin root, failed login, successful login, protected refresh, and logout are deterministic', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel('Email').fill(DEMO_EMAIL);
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Invalid email or password')).toBeVisible();
  await page.getByLabel('Password').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin\/(today|dashboard)/);
  await page.goto('/admin/reports');
  await page.reload();
  await expect(page).toHaveURL(/\/admin\/reports$/);
  await page.getByRole('button', { name: 'Log out' }).last().click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto('/admin/patients');
  await expect(page).toHaveURL(/\/admin\/login\?next=/);
  assertNoErrors();
});

test('admin can create a patient and retain the profile', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await login(page);
  const suffix = String(Date.now()).slice(-6);
  await page.goto('/admin/patients/new');
  await page.getByLabel('First name').fill('Playwright');
  await page.getByLabel('Middle name').fill('Demo');
  await page.getByLabel('Last name').fill(suffix);
  await page.getByRole('textbox', { name: 'Phone', exact: true }).fill(`078${suffix}1`);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(/\/admin\/patients\/[^/]+$/);
  await expect(page.getByText(`Playwright Demo ${suffix}`).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText(`Playwright Demo ${suffix}`).first()).toBeVisible();
  assertNoErrors();
});

test('admin clinical creation surfaces generate related records, follow-up, prescription, and audit events', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  const suffix = String(Date.now()).slice(-5);
  await login(page);
  await page.goto('/admin/patients/patient-demo-1');

  await page.getByRole('tab', { name: 'Conditions' }).click();
  await page.getByRole('button', { name: 'Add' }).first().click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill(`Condition ${suffix}`);
  await dialog.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText(`Condition ${suffix}`)).toBeVisible();

  await page.getByRole('button', { name: 'Add' }).nth(1).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Substance').fill(`Allergen ${suffix}`);
  await dialog.getByLabel('Reaction').fill('Mild demo reaction');
  await dialog.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText(`Allergen ${suffix}`, { exact: true })).toBeVisible();

  await page.getByRole('tab', { name: 'Medications' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name').fill(`Medication ${suffix}`);
  await dialog.getByLabel('Dose').fill('1 tablet');
  await dialog.getByLabel('Frequency').fill('Daily');
  await dialog.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText(`Medication ${suffix}`)).toBeVisible();

  await page.getByRole('tab', { name: 'Measurements' }).click();
  await page.getByRole('button', { name: 'Add measurement' }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Systolic').fill('121');
  await dialog.getByLabel('Diastolic').fill('79');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/121\/79/)).toBeVisible();

  await page.goto('/admin/visits/visit-demo-1');
  await page.getByRole('button', { name: /Follow-up date/ }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Today' }).click();
  await dialog.getByRole('button', { name: 'Apply' }).click();
  await page.getByPlaceholder('Medication').fill(`Prescription ${suffix}`);
  await page.getByPlaceholder('Dose').fill('5 mg');
  await page.getByRole('button', { name: 'Add' }).last().click();
  await expect(page.getByText(`Prescription ${suffix}`)).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).last().click();

  await page.goto('/admin/audit');
  await expect(page.getByText(/Prescription|Observation|conditions|allergies|medications/i).first()).toBeVisible();
  assertNoErrors();
});

test('settings exports, resets, and reimports validated existing IDs through the UI', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await login(page);
  await page.goto('/admin/settings');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();

  page.once('dialog', (confirmation) => confirmation.accept());
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo data reset.')).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles(downloadPath!);
  await expect(page.getByText('Local data imported.')).toBeVisible();
  assertNoErrors();
});

test('mobile public and admin navigation remain usable', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: /Primary navigation/i })).toBeVisible();
  await login(page);
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('link', { name: 'Bookings' })).toBeVisible();
  assertNoErrors();
});

test('demo switcher navigates on one origin and direct admin deep-route refresh works', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  await page.goto('/');
  const switcher = page.getByRole('navigation', { name: 'Switch demo experience' });
  await expect(switcher).toBeVisible();
  await switcher.getByRole('link', { name: /Clinic Dashboard/ }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await login(page);
  await page.goto('/admin/bookings');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Switch demo experience' }).getByRole('link', { name: /Patient Experience/ }).click();
  await expect(page).toHaveURL('/');
  assertNoErrors();
});

test('production service worker installs once and remains stable across refresh and update checks', async ({ page }) => {
  const assertNoErrors = failOnBrowserErrors(page);
  let mainFrameLoads = 0;
  page.on('load', () => { mainFrameLoads += 1; });
  await page.goto('/');
  const first = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active ?? registration.installing ?? registration.waiting;
    if (worker && worker.state !== 'activated') {
      await new Promise<void>((resolve) => {
        const onStateChange = () => {
          if (worker.state === 'activated') {
            worker.removeEventListener('statechange', onStateChange);
            resolve();
          }
        };
        worker.addEventListener('statechange', onStateChange);
      });
    }
    return {
      scope: registration.scope,
      active: registration.active?.state,
      registrations: (await navigator.serviceWorker.getRegistrations()).length,
    };
  });
  expect(first).toEqual({
    scope: 'http://127.0.0.1:4173/',
    active: 'activated',
    registrations: 1,
  });

  await page.reload();
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });
  await page.waitForTimeout(1_000);
  expect(mainFrameLoads).toBe(2);
  await expect(page.getByRole('link', { name: 'Book Now', exact: true }).first()).toBeVisible();
  assertNoErrors();
});

import { expect, test, type Page } from '@playwright/test';

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.stack ?? error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().startsWith('Failed to fetch RSC payload')) {
      errors.push(message.text());
    }
  });
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

test('getRandomValues fallback supports UI messages and a persisted public submission', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('our-clinic-lang', 'en');
    localStorage.setItem('our_clinic_locale', 'en');
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      configurable: true,
      value: undefined,
    });
  });
  const assertNoErrors = collectBrowserErrors(page);

  await page.goto('/');
  await page.getByRole('button', { name: 'Open OurClinic Guide' }).click();
  await page.getByLabel('Type your question').fill('booking');
  await page.getByLabel('Type your question').press('Enter');
  await expect(page.getByText('booking', { exact: true })).toBeVisible();

  const messageIds = await page.evaluate(() => {
    const raw = sessionStorage.getItem('our-clinic-guide-session-v1');
    return raw ? (JSON.parse(raw) as Array<{ id: string }>).map((item) => item.id) : [];
  });
  expect(messageIds.length).toBeGreaterThanOrEqual(2);
  messageIds.forEach((id) => expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));

  await page.goto('/contact');
  await page.getByLabel('Name').fill('Fallback Browser');
  await page.getByLabel('Phone').fill('0771234567');
  await page.getByLabel('Your message').fill('Fallback UUID workflow');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByText("Message received. We'll get back to you.")).toBeVisible();

  const ids = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('ourclinic-browser-demo', 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const snapshot = await new Promise<{ submissions: Array<{ id: string }>; activities: Array<{ id: string }> }>((resolve, reject) => {
      const request = database.transaction('snapshots', 'readonly').objectStore('snapshots').get('current');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return {
      submission: snapshot.submissions[0]?.id,
      activity: snapshot.activities[0]?.id,
    };
  });
  expect(ids.submission).toMatch(/^submission-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  expect(ids.activity).toMatch(/^activity-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assertNoErrors();
});

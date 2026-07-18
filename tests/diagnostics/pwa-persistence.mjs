import { chromium } from '@playwright/test';
import path from 'node:path';

const mode = process.argv[2];
if (!['install-production', 'verify-development'].includes(mode)) {
  throw new Error('Use install-production or verify-development.');
}

const profile = path.resolve('test-results/pwa-persistent-profile');
const context = await chromium.launchPersistentContext(profile, { headless: true });
const page = context.pages()[0] ?? await context.newPage();
const errors = [];
let loads = 0;
page.on('load', () => { loads += 1; });
page.on('pageerror', (error) => errors.push(error.stack ?? error.message));
page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().startsWith('Failed to fetch RSC payload')) errors.push(message.text());
});

await page.goto('http://127.0.0.1:4173/');

if (mode === 'install-production') {
  const result = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active ?? registration.installing ?? registration.waiting;
    if (worker && worker.state !== 'activated') {
      await new Promise((resolve) => {
        const changed = () => {
          if (worker.state === 'activated') {
            worker.removeEventListener('statechange', changed);
            resolve();
          }
        };
        worker.addEventListener('statechange', changed);
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      registrations: (await navigator.serviceWorker.getRegistrations()).length,
      state: registration.active?.state,
      caches: (await caches.keys()).filter((key) => key.startsWith('our-clinic-')),
    };
  });
  if (result.registrations !== 1 || result.state !== 'activated') throw new Error(`Production install failed: ${JSON.stringify(result)}`);
  process.stdout.write(`PWA_PRODUCTION_INSTALL ${JSON.stringify({ ...result, errors })}\n`);
} else {
  await page.waitForTimeout(2_500);
  const result = await page.evaluate(async () => ({
    registrations: (await navigator.serviceWorker.getRegistrations()).length,
    controller: navigator.serviceWorker.controller?.scriptURL ?? null,
    caches: (await caches.keys()).filter((key) => key.startsWith('our-clinic-')),
    crypto: Object.prototype.toString.call(globalThis.crypto),
    randomUUID: typeof globalThis.crypto?.randomUUID,
    getRandomValues: typeof globalThis.crypto?.getRandomValues,
    isSecureContext: window.isSecureContext,
    href: location.href,
  }));
  if (result.registrations !== 0 || result.controller !== null || result.caches.length !== 0 || loads > 2 || errors.length) {
    throw new Error(`Development cleanup failed: ${JSON.stringify({ ...result, loads, errors })}`);
  }
  process.stdout.write(`PWA_DEVELOPMENT_CLEANUP ${JSON.stringify({ ...result, loads, errors })}\n`);
}

await context.close();

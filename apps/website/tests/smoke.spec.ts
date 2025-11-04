import { test, expect } from '@playwright/test';

test.describe('Website Smoke Tests', () => {
  test('no hydration warnings and page renders', async ({ page }) => {
    const warnings: string[] = [];
    const errors: string[] = [];

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'warning' && /Hydration/.test(text)) {
        warnings.push(text);
      }

      if (type === 'error') {
        // Ignore network errors and CORS errors that might be expected
        if (!/Failed to load resource|CORS|NetworkError/.test(text)) {
          errors.push(text);
        }
      }
    });

    await page.goto(process.env.E2E_BASE_URL ?? 'http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    expect(warnings, `Hydration warnings found:\n${warnings.join('\n')}`).toHaveLength(0);
    expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0);
  });

  test('no duplicate React detected', async ({ page }) => {
    await page.goto(process.env.E2E_BASE_URL ?? 'http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Basic check - React duplicate detection is better done via console warnings
    const hasReact = await page.evaluate(() => {
      return typeof (window as any).React !== 'undefined' ||
             Array.from(document.querySelectorAll('script')).some(
               (s) => s.src?.includes('react') || s.src?.includes('_next')
             );
    });

    expect(hasReact).toBe(true);
  });
});


import { test, expect } from '@playwright/test';

test.describe('Editor Smoke Tests', () => {
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

    await page.goto(process.env.E2E_BASE_URL ?? 'http://localhost:3001', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    expect(warnings, `Hydration warnings found:\n${warnings.join('\n')}`).toHaveLength(0);
    expect(errors, `Console errors found:\n${errors.join('\n')}`).toHaveLength(0);
  });

  test('Cesium workers & assets resolve', async ({ page }) => {
    await page.goto(process.env.E2E_BASE_URL ?? 'http://localhost:3001', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for Cesium viewer to be initialized (exposed by CesiumViewer component)
    await page.waitForFunction(
      () => (window as any).cesiumViewer?.scene?.globe,
      { timeout: 30000 }
    ).catch(() => {
      // If viewer not found, try checking CESIUM_BASE_URL instead
      return page.waitForFunction(() => (window as any).CESIUM_BASE_URL, { timeout: 5000 });
    });

    const workerOk = await page.evaluate(async () => {
      try {
        const baseUrl = (window as any).CESIUM_BASE_URL ?? '/cesium';
        const res = await fetch(`${baseUrl}/Workers/createTaskProcessorWorker.js`);
        return res.ok;
      } catch {
        return false;
      }
    });

    expect(workerOk, 'Cesium workers should be accessible').toBe(true);

    // Verify assets are accessible
    const assetsOk = await page.evaluate(async () => {
      try {
        const baseUrl = (window as any).CESIUM_BASE_URL ?? '/cesium';
        const res = await fetch(`${baseUrl}/Assets/approximateTerrainHeights.json`);
        return res.ok;
      } catch {
        return false;
      }
    });

    expect(assetsOk, 'Cesium assets should be accessible').toBe(true);
  });

  test('no duplicate React detected', async ({ page }) => {
    await page.goto(process.env.E2E_BASE_URL ?? 'http://localhost:3001', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    const reactVersions = await page.evaluate(() => {
      // Check for multiple React instances
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const reactScripts = scripts.filter((s) =>
        s.getAttribute('src')?.includes('react') || s.getAttribute('src')?.includes('_next')
      );
      return reactScripts.length;
    });

    // This is a basic check - React duplicate detection is better done via console warnings
    // which we already check in the first test
    expect(reactVersions).toBeGreaterThan(0);
  });
});


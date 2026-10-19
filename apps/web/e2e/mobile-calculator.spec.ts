import { test, expect } from '@playwright/test';
import { translations } from '../src/lib/i18n';
import { dollars, expectNoHorizontalOverflow, expectThumbSizedTargets } from './phone';

const en = translations.en;

test.describe('province calculator on a phone', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/calculator/ontario');
  });

  test('fits the screen and uses thumb-sized controls', async ({ page }) => {
    await expectNoHorizontalOverflow(page);
    await expectThumbSizedTargets(page.getByRole('region', { name: en.calculator.title }));
    await expectThumbSizedTargets(page.getByRole('region', { name: en.results.heroLabel }));
  });

  test('the result follows income, province, year and pay frequency', async ({ page }) => {
    const result = page.getByRole('status');
    const at80k = dollars(await result.innerText());

    await page.getByRole('textbox', { name: en.calculator.employmentIncome }).fill('120000');
    await expect.poll(async () => dollars(await result.innerText())).toBeGreaterThan(at80k);
    const at120k = dollars(await result.innerText());

    await page.locator('label', { hasText: /^AB$/ }).click();
    await expect(page.getByRole('radio', { name: 'Alberta' })).toBeChecked();
    await expect.poll(async () => dollars(await result.innerText())).not.toBe(at120k);

    // Quebec has no 2025 rules yet, so 2025 is disabled while Quebec is selected.
    await page.locator('label', { hasText: /^QC$/ }).click();
    await expect(page.getByRole('radio', { name: '2025' })).toBeDisabled();

    await page.locator('label', { hasText: /^ON$/ }).click();
    await page.locator('label', { hasText: /^2025$/ }).click();
    await expect(page.getByRole('radio', { name: '2025' })).toBeChecked();

    const annual = dollars(await result.innerText());
    await page.locator('label', { hasText: en.payFrequency.short.monthly }).click();
    await expect.poll(async () => dollars(await result.innerText())).toBeCloseTo(annual / 12, 0);
  });

  test('a trace line opens to show its formula and source', async ({ page }) => {
    const line = page.locator('summary', { hasText: 'Total Income' }).first();
    await line.click();
    await expect(page.getByText(/^Formula: /).first()).toBeVisible();
    await expect(page.getByRole('link', { name: en.results.sourceLink }).first()).toBeVisible();
  });

  test('the sticky bar repeats take-home pay once the result scrolls away', async ({ page }) => {
    const shown = await page.getByRole('status').innerText();
    const bar = page.getByRole('button', { name: en.calculator.phone.backToResult });
    await expect(bar).toBeHidden();

    await page.getByRole('heading', { name: en.results.tracesTitle }).scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 600));
    await expect(bar).toBeVisible();
    await expect(bar).toContainText(shown);

    await bar.click();
    await expect(page.getByRole('status')).toBeInViewport();
  });
});

test('every salary benchmark page renders on a phone', async ({ page }) => {
  for (const amount of [50000, 100000, 150000]) {
    await page.goto(`/en/salary/${amount}/ontario`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(`$${amount.toLocaleString('en-CA')} After Tax in Ontario`);
    await expectNoHorizontalOverflow(page);
  }
});

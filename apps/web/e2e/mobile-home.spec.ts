import { test, expect } from '@playwright/test';
import { translations } from '../src/lib/i18n';
import { dollars, expectNoHorizontalOverflow, expectThumbSizedTargets } from './phone';

const en = translations.en;

test.describe('home page on a phone', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('fits the screen and uses thumb-sized controls in the rebuilt sections', async ({ page }) => {
    await expectNoHorizontalOverflow(page);
    for (const id of ['#simulator', '#how-it-works', '#provinces']) {
      await expectThumbSizedTargets(page.locator(id));
    }
  });

  test('the quick estimate answers as the salary, deduction and frequency change', async ({ page }) => {
    const estimate = page.locator('#simulator');
    const result = estimate.locator('[aria-live="polite"]').getByText(/^\$[\d,]+\.\d{2}$/).first();
    const annual = dollars(await result.innerText());

    await estimate.getByRole('textbox', { name: en.simulation.controls.salary }).fill('100000');
    await expect.poll(async () => dollars(await result.innerText())).toBeGreaterThan(annual);
    const at100k = dollars(await result.innerText());

    await estimate.locator('label', { hasText: en.simulation.phone.rrspSwitch }).click();
    await expect(estimate.getByRole('switch', { name: en.simulation.phone.rrspSwitch })).toBeChecked();
    await expect.poll(async () => dollars(await result.innerText())).toBeGreaterThan(at100k);
    const withRrsp = dollars(await result.innerText());

    await estimate.locator('label', { hasText: en.payFrequency.label.monthly }).click();
    await expect(estimate.getByRole('radio', { name: en.payFrequency.label.monthly })).toBeChecked();
    await expect.poll(async () => dollars(await result.innerText())).toBeCloseTo(withRrsp / 12, 0);
  });

  test('every federal program opens in a sheet and the sheet closes', async ({ page }) => {
    const estimate = page.locator('#simulator');
    await estimate.locator('summary', { hasText: en.simulation.phone.spendingTitle }).click();
    await estimate.getByRole('button', { name: en.simulation.phone.seeAllPrograms.replace('{count}', '11') }).click();

    const sheet = page.getByRole('dialog', { name: en.simulation.phone.spendingTitle });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('listitem')).toHaveCount(11);
    await sheet.getByRole('button', { name: en.nav.closeSheet }).click();
    await expect(sheet).toBeHidden();
  });

  test('province tiles open their calculator', async ({ page }) => {
    await page.locator('#provinces').getByRole('link', { name: /Alberta/ }).click();
    await expect(page).toHaveURL(/\/en\/calculator\/alberta$/);
  });
});

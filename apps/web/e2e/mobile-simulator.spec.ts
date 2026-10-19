import { test, expect } from '@playwright/test';
import { translations } from '../src/lib/i18n';
import { expectNoHorizontalOverflow, expectThumbSizedTargets } from './phone';

const sim = translations.en.budgetSimulator;
const ELDERLY = 'Elderly Benefits (OAS & GIS)';

test.describe('budget simulator on a phone', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/simulator');
  });

  test('has one main landmark, fits the screen and uses thumb-sized controls', async ({ page }) => {
    await expect(page.locator('main')).toHaveCount(1);
    await expectNoHorizontalOverflow(page);
    await expectThumbSizedTargets(page.locator('main'));
  });

  test('the summary bar is slim', async ({ page }) => {
    const bar = page.getByRole('button', { name: sim.phone.openSummary });
    const box = await bar.boundingBox();
    expect(box!.height).toBeLessThanOrEqual(64);
  });

  test('nudging an envelope shows a deficit and a per-taxpayer cost; reset balances it', async ({ page }) => {
    await page.getByRole('button', { name: new RegExp(ELDERLY.replace(/[()&]/g, '.')) }).click();
    const increase = page.getByRole('button', { name: sim.phone.increase.replace('{name}', ELDERLY) });
    await increase.click();
    await increase.click();

    const bar = page.getByRole('button', { name: sim.phone.openSummary });
    await expect(bar).toContainText('$1.0B');

    await bar.click();
    const sheet = page.getByRole('dialog', { name: sim.phone.sheetTitle });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText('+$49').first()).toBeVisible();

    await sheet.getByRole('button', { name: sim.reset }).click();
    await expect(sheet.getByText(sim.perTaxpayerCard.baselineText)).toBeVisible();
  });

  test('switching groups changes the list and the URL hash', async ({ page }) => {
    await page.locator('label', { hasText: /^Discretionary/ }).click();
    await expect(page).toHaveURL(/#discretionary$/);
    await expect(page.getByRole('button', { name: /National Defence/ })).toBeVisible();
    await expect(page.getByRole('button', { name: new RegExp(ELDERLY.replace(/[()&]/g, '.')) })).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('radio', { name: /^Discretionary/ })).toBeChecked();
  });
});

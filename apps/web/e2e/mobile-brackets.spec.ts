import { test, expect } from '@playwright/test';
import { translations } from '../src/lib/i18n';
import { expectThumbSizedTargets } from './phone';

const hub = translations.en.infoHub;

test.describe('brackets and audit on a phone', () => {
  test('no table needs side-scrolling on the home page or a province page', async ({ page }) => {
    for (const route of ['/en', '/en/calculator/ontario']) {
      await page.goto(route);
      await expect(page.getByRole('table')).toHaveCount(0);
    }
  });

  test('the schedule switches between federal and the selected province', async ({ page }) => {
    await page.goto('/en');
    const brackets = page.locator('#brackets');
    await expect(brackets.getByText(hub.brackets.federalCitation).filter({ visible: true })).toBeVisible();

    await brackets.locator('label', { hasText: /^Ontario$/ }).click();
    await expect(brackets.getByText('Form ON428, Part A').filter({ visible: true })).toBeVisible();
    await expectThumbSizedTargets(brackets);
  });

  test('payroll ceilings come from the 2026 rule set', async ({ page }) => {
    await page.goto('/en');
    const ceilings = page.getByRole('heading', { name: hub.ceilings.title }).locator('xpath=../..');
    await expect(ceilings.getByText('$74,600').filter({ visible: true })).toBeVisible();
    await expect(ceilings.getByText('$85,000').filter({ visible: true })).toBeVisible();
    await expect(ceilings.getByText('$68,900').filter({ visible: true })).toBeVisible();
  });

  test('the legacy audit lists each line with both figures', async ({ page }) => {
    await page.goto('/en');
    const audit = page.locator('#legacy-audit');
    await expect(audit.getByText('$10,323.00').filter({ visible: true })).toBeVisible();
    await expect(audit.getByText('$9,242.60').filter({ visible: true })).toBeVisible();
    await expect(audit.getByText('$60,302.62').filter({ visible: true })).toBeVisible();
  });

  test('FAQ answers open and close', async ({ page }) => {
    await page.goto('/en');
    const question = page.locator('summary', { hasText: hub.faq.q2 });
    await question.click();
    await expect(page.getByText(hub.faq.a2).filter({ visible: true })).toBeVisible();
    await question.click();
    await expect(page.getByText(hub.faq.a2)).toBeHidden();
  });
});

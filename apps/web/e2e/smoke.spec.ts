import { test, expect, type Page } from '@playwright/test';
import { translations } from '../src/lib/i18n';

const en = translations.en;
const fr = translations.fr;

// Fails the test on any uncaught error in the page, such as a crashing calculation.
function trackPageErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('the root redirects to the English site', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-CA');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(en.hero.title);
});

test('the French home page is in French', async ({ page }) => {
  await page.goto('/fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(fr.hero.title);
});

test('the result updates as the income changes', async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto('/en/calculator/ontario');
  const result = page.getByRole('status');
  await expect(result).toContainText('$');
  const before = await result.innerText();

  // Desktop renders a number field, phones a numeric text field; only the visible one has a role.
  const income = new RegExp(`^${en.calculator.employmentIncome}`);
  await page.getByRole('spinbutton', { name: income }).or(page.getByRole('textbox', { name: income })).fill('100000');
  await expect(result).not.toHaveText(before);
  expect(errors).toEqual([]);
});

// The desktop form uses a select and year buttons; e2e/mobile-calculator.spec.ts covers the phone form.
test('every year and province combination renders or is disabled', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop form');
  const errors = trackPageErrors(page);
  await page.goto('/en/calculator/ontario');
  const yearGroup = page.getByRole('group', { name: en.calculator.filingYear });
  const province = page.getByRole('combobox', { name: en.calculator.province });
  const result = page.getByRole('status');

  for (const year of ['2026', '2025']) {
    await province.selectOption('ON');
    await yearGroup.getByRole('button', { name: year }).click();
    await expect(yearGroup.getByRole('button', { name: year })).toHaveAttribute('aria-pressed', 'true');

    for (const option of await province.locator('option').all()) {
      const value = (await option.getAttribute('value'))!;
      if (await option.isDisabled()) {
        await expect(option).toContainText(en.calculator.provinceUnavailable.replace('{year}', year));
        continue;
      }
      await province.selectOption(value);
      await expect(result).toContainText('$');
    }
  }

  // Quebec has no 2025 rules yet, so 2025 cannot be picked while Quebec is selected.
  await yearGroup.getByRole('button', { name: '2026' }).click();
  await province.selectOption('QC');
  await expect(yearGroup.getByRole('button', { name: '2025' })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('the Ontario province page renders its bracket table', async ({ page }) => {
  await page.goto('/en/calculator/ontario');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ontario Income Tax Calculator 2026');
  await expect(page.getByRole('table').filter({ hasText: 'ON428' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('$');
});

test('the $80,000 Ontario salary page renders', async ({ page }) => {
  await page.goto('/en/salary/80000/ontario');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('$80,000 After Tax in Ontario');
  await expect(page.getByRole('status')).toContainText('$');
});

test('an unknown province page is a 404', async ({ page }) => {
  const response = await page.goto('/en/calculator/manitoba');
  expect(response?.status()).toBe(404);
});

test('the home page renders the audit comparison and how it works cards', async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto('/en');
  await expect(page.locator('#how-it-works')).toBeVisible();
  await expect(page.locator('#legacy-audit')).toBeVisible();
  await expect(page.locator('#legacy-audit a')).toHaveAttribute('href', '/en/salary/80000/ontario');
  expect(errors).toEqual([]);
});


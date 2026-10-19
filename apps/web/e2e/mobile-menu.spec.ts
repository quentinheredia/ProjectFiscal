import { test, expect, type Locator, type Page } from '@playwright/test';
import { translations } from '../src/lib/i18n';
import { expectThumbSizedTargets } from './phone';

const nav = translations.en.nav;

function menu(page: Page) {
  return page.getByRole('dialog', { name: nav.menuTitle });
}

// The server-rendered button exists before React hydrates; a tap that early does nothing, so retry until the sheet opens.
async function openMenuWith(page: Page, trigger: Locator) {
  await expect(async () => {
    await trigger.click();
    await expect(menu(page)).toBeVisible({ timeout: 1000 });
  }).toPass();
}

function openMenuFromTabBar(page: Page) {
  return openMenuWith(page, page.getByRole('navigation', { name: nav.mobileNavLabel }).getByRole('button', { name: nav.menu }));
}

test.describe('menu on a phone', () => {
  test('opens from the tab bar and the province chip, with thumb-sized controls', async ({ page }) => {
    await page.goto('/en');
    await openMenuFromTabBar(page);
    await expect(menu(page)).toBeVisible();
    await expectThumbSizedTargets(menu(page));
    await page.keyboard.press('Escape');
    await expect(menu(page)).toBeHidden();

    await openMenuWith(page, page.getByRole('button', { name: new RegExp(`^${nav.changeProvince}`) }));
    await menu(page).getByRole('button', { name: nav.close }).click();
    await expect(menu(page)).toBeHidden();
  });

  test('every destination is reachable', async ({ page }) => {
    const destinations: [string, RegExp][] = [
      [nav.taxCalculator, /\/en\/calculator\/ontario$/],
      [nav.budgetSimulator, /\/en\/simulator$/],
      [nav.auditBenchmark, /\/en\/salary\/80000\/ontario$/],
      [nav.home, /\/en$/],
    ];
    await page.goto('/en/simulator');
    for (const [label, url] of destinations) {
      await openMenuFromTabBar(page);
      await menu(page).getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(url);
    }
  });

  test('picking a province on a calculator page opens that calculator', async ({ page }) => {
    await page.goto('/en/calculator/ontario');
    await openMenuFromTabBar(page);
    await menu(page).getByRole('button', { name: /Alberta/ }).click();
    await expect(page).toHaveURL(/\/en\/calculator\/alberta$/);
    await expect(menu(page)).toBeHidden();
  });

  test('switching language keeps the current page', async ({ page }) => {
    await page.goto('/en/simulator');
    await openMenuFromTabBar(page);
    await menu(page).getByRole('link', { name: nav.languageFrench }).click();
    await expect(page).toHaveURL(/\/fr\/simulator$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA');
  });

  test('the Brackets tab lights up when the brackets section is on screen', async ({ page }) => {
    await page.goto('/en');
    const tab = page.getByRole('navigation', { name: nav.mobileNavLabel }).getByRole('link', { name: nav.bracketsShort });
    await expect(tab).not.toHaveAttribute('aria-current', 'page');
    await page.locator('#brackets').scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById('brackets')?.scrollIntoView({ block: 'center' }));
    await expect(tab).toHaveAttribute('aria-current', 'page');
  });
});

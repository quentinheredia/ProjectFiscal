import { expect, type Locator, type Page } from '@playwright/test';

const MIN_TARGET_PX = 44;

/** The page must not scroll sideways. */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

/** Every visible control inside `scope` must be at least 44 px in its smaller dimension. */
export async function expectThumbSizedTargets(scope: Locator) {
  const undersized = await scope.evaluate((root, min) => {
    const controls = root.querySelectorAll<HTMLElement>('a, button, select, summary, input:not([type=radio]):not([type=checkbox]), label:has(input)');
    return [...controls]
      .filter((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && Math.min(box.width, box.height) < min;
      })
      .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 40)}"`);
  }, MIN_TARGET_PX);
  expect(undersized).toEqual([]);
}

/** Dollar text such as "$52,806.95" as a number. */
export function dollars(text: string): number {
  return Number(text.replace(/[^0-9.]/g, ''));
}

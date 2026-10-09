// How the demo looks and holds still: finger-sized controls, light and dark, English and Japanese, and no sideways
// scroll, at a phone's width and a desk's.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, type } from "./demo.mjs";

for (const scheme of ["light", "dark"]) {
  for (const lang of ["en", "ja"]) {
    test(`fits the page without a sideways scroll, in ${scheme} and ${lang}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      const errors = await open(page, `?lang=${lang}`);
      await noSidewaysScroll(page);
      // The longest things the demo is given still fit: a long address with no spaces, a long Japanese one, every
      // fold open.
      await type(page, "parse-input", "〒100-0005 東京都千代田区丸の内1丁目2番3号 サンプルビル5階501号室".repeat(4));
      await type(page, "validate-input", "1600PennsylvaniaAvenueNorthwestWashingtonDistrictOfColumbia20500".repeat(3));
      await type(page, "compare-first", "100 Queen Street West, Toronto, Ontario M5H 2N2 ".repeat(5));
      await type(page, "postal-input", "Hokkaido");
      await type(page, "clean-input", "742 evergreen terrace,springfield ,  il 62704 ".repeat(6));
      await type(page, "japan-input", "〒604-8571 京都府京都市中京区寺町通御池上る上本能寺前町488".repeat(3));
      await type(page, "bulk-input", "1600PennsylvaniaAvenueNorthwestWashingtonDistrictOfColumbia20500 ".repeat(4));
      await page.locator('[data-testid="corpus-load"]').click();
      await page.waitForSelector('[data-testid="corpus-bar-japan"]');
      for (const summary of await page.locator("details.fam-fold summary").all()) await summary.click();
      await noSidewaysScroll(page);
      const paper = await page
        .locator(".fam-panels")
        .first()
        .evaluate((node) => getComputedStyle(node).backgroundColor);
      expect(paper).toBe(scheme === "dark" ? "rgb(29, 32, 30)" : "rgb(251, 248, 241)");
      expect(errors).toEqual([]);
    });
  }
}

test("the API reference fits the page without a sideways scroll", async ({ page }) => {
  const errors = await open(page, "", "api.html");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("every button and field is a finger tall", async ({ page }) => {
  await open(page);
  const small = await page.evaluate(() =>
    [...document.querySelectorAll("main button, main input, main textarea, nav a, nav button")]
      .filter((one) => one.offsetParent !== null)
      .map((one) => ({
        name: one.textContent.trim() || one.id || one.dataset.lang,
        ...one.getBoundingClientRect().toJSON(),
      }))
      .filter((one) => one.height < 43.5 || (one.width < 43.5 && one.name !== "")),
  );
  expect(small).toEqual([]);
});

test("each panel keeps its answer's width while it is typed in, so nothing beside it moves", async ({ page }) => {
  await open(page);
  const box = page.locator(at("parse-answer"));
  const first = await box.boundingBox();
  await type(page, "parse-input", "PO Box 1234, Springfield, IL 62701");
  const second = await box.boundingBox();
  await type(page, "parse-input", "〒100-0005 東京都千代田区丸の内1丁目2番3号 サンプルビル5階501号室");
  const third = await box.boundingBox();
  expect(Math.abs(second.width - first.width)).toBeLessThan(0.5);
  expect(Math.abs(third.width - first.width)).toBeLessThan(0.5);
  expect(first.height).toBeGreaterThan(100);
});

test("the fields are real fields: no zoom on a phone, no autocorrect", async ({ page }) => {
  await open(page);
  const fields = await page.evaluate(() =>
    [...document.querySelectorAll("main input")].map((one) => ({
      size: parseFloat(getComputedStyle(one).fontSize),
      spellcheck: one.spellcheck,
    })),
  );
  expect(fields.length).toBe(9);
  for (const one of fields) {
    expect(one.size).toBeGreaterThanOrEqual(16);
    expect(one.spellcheck).toBe(false);
  }
});

// Australia and the United Kingdom in the demo: every panel reads them through their modules, the parse panel's
// country choice is the hint, and the corpus panel runs their corpora; in English and in Japanese, at a phone's width.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, tap, type } from "./demo.mjs";

const answer = (page, name) => page.locator(at(`${name}-answer`));
const call = (page, name) => page.locator(at(`${name}-call`));
const chip = (page, name, label) =>
  page.locator(at(`${name}-examples`)).getByRole("button", { name: label, exact: true });
const choice = (page, id, label) => page.locator(at(id)).getByRole("button", { name: label, exact: true });

test("parse: Australia and the UK by their examples, and the country choice as the hint", async ({
  page,
}, testInfo) => {
  const errors = await open(page);
  await tap(page, chip(page, "parse", "Australia, 3/12"), testInfo);
  await expect(answer(page, "parse")).toContainText("AU · Australia");
  await expect(answer(page, "parse")).toContainText("Unit");
  await expect(answer(page, "parse")).toContainText("Parramatta");
  await expect(answer(page, "parse")).toContainText("NSW");
  await tap(page, chip(page, "parse", "Australia, a level"), testInfo);
  await expect(answer(page, "parse")).toContainText("Level");
  await expect(answer(page, "parse")).toContainText("Jacobson");
  await tap(page, chip(page, "parse", "UK, a flat"), testInfo);
  await expect(answer(page, "parse")).toContainText("GB · United Kingdom");
  await expect(answer(page, "parse")).toContainText("Rose Court");
  await expect(answer(page, "parse")).toContainText("Kingsbury");
  await expect(answer(page, "parse")).toContainText("ENG");
  await tap(page, chip(page, "parse", "London"), testInfo);
  await expect(answer(page, "parse")).toContainText("SW1A 2AA");

  // With no state or postcode, nothing says Australia until the country is chosen.
  await type(page, "parse-input", "3/12 Smith St, Parramatta");
  await expect(answer(page, "parse")).not.toContainText("AU · Australia");
  await tap(page, choice(page, "parse-country", "Australia"), testInfo);
  await expect(answer(page, "parse")).toContainText("AU · Australia");
  await expect(call(page, "parse")).toContainText('country: "AU"');
  await expect(page).toHaveURL(/country=AU/);
  await tap(page, choice(page, "parse-country", "Detect"), testInfo);
  await expect(call(page, "parse")).not.toContainText('country: "AU"');
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("validate, format, compare, postal and clean read Australia and the UK", async ({ page }, testInfo) => {
  const errors = await open(page);
  await tap(page, chip(page, "validate", "Another Australian state"), testInfo);
  await expect(answer(page, "validate")).toContainText("Postcode 2000 belongs to NSW, not VIC");
  await tap(page, chip(page, "validate", "Jersey"), testInfo);
  await expect(answer(page, "validate")).toContainText("OUTSIDE_UK");

  await tap(page, chip(page, "format", "Australia"), testInfo);
  await expect(answer(page, "format")).toContainText("Australia Post");
  await expect(answer(page, "format")).toContainText("UNIT 3 12 SMITH ST");
  await expect(answer(page, "format")).toContainText("PARRAMATTA NSW 2150");
  await expect(call(page, "format")).toContainText("formatAustraliaPost(");
  await tap(page, chip(page, "format", "UK"), testInfo);
  await expect(answer(page, "format")).toContainText("Royal Mail");
  await expect(answer(page, "format")).toContainText("LONDON");
  await expect(answer(page, "format")).toContainText("NW9 0AA");

  await tap(page, chip(page, "compare", "3/12 and Unit 3"), testInfo);
  await expect(answer(page, "compare").locator(".fam-badge")).toHaveText("Yes");
  await expect(call(page, "compare")).toContainText("compareAustralianAddresses(");
  await tap(page, chip(page, "compare", "UK postcode spacing"), testInfo);
  await expect(answer(page, "compare").locator(".fam-badge")).toHaveText("Yes");
  await expect(call(page, "compare")).toContainText("compareUKAddresses(");

  await tap(page, chip(page, "postal", "2620"), testInfo);
  await expect(answer(page, "postal")).toContainText("Australian postcode");
  await expect(answer(page, "postal")).toContainText("NSW · ACT");
  await tap(page, chip(page, "postal", "CH5 1AA"), testInfo);
  await expect(answer(page, "postal")).toContainText("WLS · Wales");
  await expect(answer(page, "postal")).toContainText("CH · Chester");
  await tap(page, chip(page, "postal", "JE2 3AB"), testInfo);
  await expect(answer(page, "postal")).toContainText("JE · Jersey");

  await tap(page, chip(page, "clean", "Australia"), testInfo);
  await expect(answer(page, "clean")).toContainText("As Australia Post writes it");
  await tap(page, chip(page, "clean", "UK"), testInfo);
  await expect(answer(page, "clean")).toContainText("As Royal Mail writes it");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("the corpus panel runs the Australian and British corpora, and their only wrong cases are known gaps", async ({
  page,
}, testInfo) => {
  const errors = await open(page);
  await tap(page, at("corpus-load"), testInfo);
  await expect(page.locator(at("corpus-bar-au"))).toContainText("266 of 266 pass");
  await expect(page.locator(at("corpus-bar-gb"))).toContainText(/\d+ of 190 pass/);
  await tap(page, choice(page, "corpus-country", "UK"), testInfo);
  await tap(page, at("corpus-wrong"), testInfo);
  const list = page.locator(`${at("corpus-list")} > li`);
  await expect(list.first()).toBeVisible();
  await expect(page.locator(at("corpus-list"))).not.toContainText("Fails");
  await expect(page.locator(at("corpus-list"))).toContainText("Known gap");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("Australia and the UK speak Japanese with the page", async ({ page }, testInfo) => {
  const errors = await open(page, "?lang=ja");
  await tap(page, chip(page, "parse", "オーストラリア（3/12）"), testInfo);
  await expect(answer(page, "parse")).toContainText("AU · オーストラリア");
  await expect(page.locator(at("parse-country"))).toContainText("自動判定");
  await tap(page, chip(page, "parse", "イギリス（フラット）"), testInfo);
  await expect(answer(page, "parse")).toContainText("GB · イギリス");
  await expect(answer(page, "parse")).toContainText("構成国");
  await tap(page, chip(page, "validate", "ジャージー島"), testInfo);
  await expect(answer(page, "validate")).toContainText("王室属領");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

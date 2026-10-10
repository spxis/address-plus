// Germany in the demo: every panel but Clean reads it through its module, the parse panel's country choice is the hint,
// the postal panel reads a five-digit code as a German postcode too, and the corpus panel runs its corpus; in English and
// in Japanese, at a phone's width.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, tap, type } from "./demo.mjs";

const answer = (page, name) => page.locator(at(`${name}-answer`));
const call = (page, name) => page.locator(at(`${name}-call`));
const chip = (page, name, label) =>
  page.locator(at(`${name}-examples`)).getByRole("button", { name: label, exact: true });
const choice = (page, id, label) => page.locator(at(id)).getByRole("button", { name: label, exact: true });

test("parse: Germany by its examples, and the country choice as the hint", async ({ page }, testInfo) => {
  const errors = await open(page);
  await tap(page, chip(page, "parse", "Germany, a street"), testInfo);
  await expect(answer(page, "parse")).toContainText("DE · Germany");
  await expect(answer(page, "parse")).toContainText("Hauptstraße");
  await expect(answer(page, "parse")).toContainText("12A");
  await expect(answer(page, "parse")).toContainText("Land");
  await expect(answer(page, "parse")).toContainText("BE");
  await tap(page, chip(page, "parse", "Germany, c/o and a floor"), testInfo);
  await expect(answer(page, "parse")).toContainText("Care of");
  await expect(answer(page, "parse")).toContainText("Weber");
  await expect(answer(page, "parse")).toContainText("Hinterhaus");
  await expect(answer(page, "parse")).toContainText("Obergeschoss");

  // With no postcode, nothing says Germany until the country is chosen.
  await type(page, "parse-input", "Hauptstraße 12, Berlin");
  await expect(answer(page, "parse")).not.toContainText("DE · Germany");
  await tap(page, choice(page, "parse-country", "Germany"), testInfo);
  await expect(answer(page, "parse")).toContainText("DE · Germany");
  await expect(call(page, "parse")).toContainText('country: "DE"');
  await expect(page).toHaveURL(/country=DE/);
  await tap(page, choice(page, "parse-country", "Detect"), testInfo);
  await expect(call(page, "parse")).not.toContainText('country: "DE"');
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("validate, format, compare and postal read Germany", async ({ page }, testInfo) => {
  const errors = await open(page);
  await tap(page, chip(page, "validate", "A German postcode GeoNames does not list"), testInfo);
  await expect(answer(page, "validate")).toContainText("UNRECOGNIZED_POSTAL_CODE");
  await expect(answer(page, "validate")).toContainText("10000");

  await tap(page, chip(page, "format", "Germany"), testInfo);
  await expect(answer(page, "format")).toContainText("Deutsche Post");
  await expect(answer(page, "format")).toContainText("c/o Weber");
  await expect(answer(page, "format")).toContainText("Kastanienallee 4B");
  await expect(answer(page, "format")).toContainText("10435 Berlin");
  await expect(call(page, "format")).toContainText("formatDeutschePost(");

  await tap(page, chip(page, "compare", "Straße and Str."), testInfo);
  await expect(answer(page, "compare").locator(".fam-badge")).toHaveText("Yes");
  await expect(call(page, "compare")).toContainText("compareGermanAddresses(");

  await tap(page, chip(page, "postal", "80331"), testInfo);
  await expect(answer(page, "postal")).toContainText("German postcode");
  await expect(answer(page, "postal")).toContainText("BY · Bavaria");
  await expect(call(page, "postal")).toContainText("parseGermanPostcode(");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("the list reads Germany, and the corpus panel runs the German corpus, none of it wrong", async ({
  page,
}, testInfo) => {
  const errors = await open(page);
  await tap(page, at("bulk-sample"), testInfo);
  await expect(page.locator(at("bulk-table"))).toContainText("c/o Weber, Hinterhaus, Kastanienallee 4B, 10435 Berlin");
  await expect(page.locator(at("bulk-table"))).toContainText("Am Markt 5, 01067 Dresden");
  await tap(page, at("corpus-load"), testInfo);
  await expect(page.locator(at("corpus-bar-de"))).toContainText("151 of 151 pass");
  await tap(page, choice(page, "corpus-country", "Germany"), testInfo);
  await tap(page, at("corpus-wrong"), testInfo);
  await expect(page.locator(at("corpus-list"))).not.toContainText("Fails");
  await expect(page.locator(at("corpus-list"))).not.toContainText("Known gap");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("Germany speaks Japanese with the page", async ({ page }, testInfo) => {
  const errors = await open(page, "?lang=ja");
  await tap(page, chip(page, "parse", "ドイツ（通りと番地）"), testInfo);
  await expect(answer(page, "parse")).toContainText("DE · ドイツ");
  await expect(answer(page, "parse")).toContainText("州（Land）");
  await tap(page, chip(page, "postal", "80331"), testInfo);
  await expect(answer(page, "postal")).toContainText("ドイツの郵便番号");
  await expect(answer(page, "postal")).toContainText("バイエルン自由州");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

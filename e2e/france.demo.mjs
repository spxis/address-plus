// France in the demo: every panel but Clean reads it through its module, the parse panel's country choice is the hint, the
// postal panel reads a five-digit code as a French postcode too, and the corpus panel runs its corpus; in English and in
// Japanese, at a phone's width.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, tap, type } from "./demo.mjs";

const answer = (page, name) => page.locator(at(`${name}-answer`));
const call = (page, name) => page.locator(at(`${name}-call`));
const chip = (page, name, label) =>
  page.locator(at(`${name}-examples`)).getByRole("button", { name: label, exact: true });
const choice = (page, id, label) => page.locator(at(id)).getByRole("button", { name: label, exact: true });

test("parse: France by its examples, and the country choice as the hint", async ({ page }, testInfo) => {
  const errors = await open(page);
  await tap(page, chip(page, "parse", "France, a bis"), testInfo);
  await expect(answer(page, "parse")).toContainText("FR · France");
  await expect(answer(page, "parse")).toContainText("Number extension");
  await expect(answer(page, "parse")).toContainText("bis");
  await expect(answer(page, "parse")).toContainText("de la Paix");
  await expect(answer(page, "parse")).toContainText("Department");
  await expect(answer(page, "parse")).toContainText("75");
  await tap(page, chip(page, "parse", "France, a residence"), testInfo);
  await expect(answer(page, "parse")).toContainText("Résidence Les Lilas");
  await expect(answer(page, "parse")).toContainText("Appartement");
  await expect(answer(page, "parse")).toContainText("Toulouse");

  // With no postcode, nothing says France until the country is chosen.
  await type(page, "parse-input", "12 rue de la Paix, Paris");
  await expect(answer(page, "parse")).not.toContainText("FR · France");
  await tap(page, choice(page, "parse-country", "France"), testInfo);
  await expect(answer(page, "parse")).toContainText("FR · France");
  await expect(call(page, "parse")).toContainText('country: "FR"');
  await expect(page).toHaveURL(/country=FR/);
  await tap(page, choice(page, "parse-country", "Detect"), testInfo);
  await expect(call(page, "parse")).not.toContainText('country: "FR"');
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("validate, format, compare and postal read France", async ({ page }, testInfo) => {
  const errors = await open(page);
  await tap(page, chip(page, "validate", "A French postcode La Poste does not list"), testInfo);
  await expect(answer(page, "validate")).toContainText("UNRECOGNIZED_POSTAL_CODE");
  await expect(answer(page, "validate")).toContainText("75099");
  await tap(page, chip(page, "validate", "Monaco"), testInfo);
  await expect(answer(page, "validate")).toContainText("OUTSIDE_FRANCE");

  await tap(page, chip(page, "format", "France"), testInfo);
  await expect(answer(page, "format")).toContainText("La Poste");
  await expect(answer(page, "format")).toContainText("CHEZ MME MARTIN");
  await expect(answer(page, "format")).toContainText("15 BIS RUE D ABOUKIR");
  await expect(answer(page, "format")).toContainText("69003 LYON");
  await expect(call(page, "format")).toContainText("formatLaPoste(");

  await tap(page, chip(page, "compare", "av. and avenue"), testInfo);
  await expect(answer(page, "compare").locator(".fam-badge")).toHaveText("Yes");
  await expect(call(page, "compare")).toContainText("compareFrenchAddresses(");

  await tap(page, chip(page, "postal", "20200"), testInfo);
  await expect(answer(page, "postal")).toContainText("French postcode");
  await expect(answer(page, "postal")).toContainText("2B · Haute-Corse");
  await expect(answer(page, "postal")).toContainText("Corse");
  await tap(page, chip(page, "postal", "98714"), testInfo);
  await expect(answer(page, "postal")).toContainText("PF · French Polynesia");
  // 75008 is a ZIP code and a French postcode: both readings are shown.
  await tap(page, chip(page, "postal", "75008"), testInfo);
  await expect(answer(page, "postal")).toContainText("French postcode");
  await expect(answer(page, "postal")).toContainText("75 · Paris");
  await expect(answer(page, "postal")).toContainText("US ZIP code");
  await expect(call(page, "postal")).toContainText("parseFrenchPostcode(");

  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("the list reads France, and the corpus panel runs the French corpus, none of it wrong", async ({
  page,
}, testInfo) => {
  const errors = await open(page);
  await tap(page, at("bulk-sample"), testInfo);
  await expect(page.locator(at("bulk-table"))).toContainText("RESIDENCE LES LILAS");
  await expect(page.locator(at("bulk-table"))).toContainText("75009 PARIS CEDEX 09");
  await tap(page, at("corpus-load"), testInfo);
  await expect(page.locator(at("corpus-bar-fr"))).toContainText("196 of 196 pass");
  await tap(page, choice(page, "corpus-country", "France"), testInfo);
  await tap(page, at("corpus-wrong"), testInfo);
  await expect(page.locator(at("corpus-list"))).not.toContainText("Fails");
  await expect(page.locator(at("corpus-list"))).not.toContainText("Known gap");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("France speaks Japanese with the page", async ({ page }, testInfo) => {
  const errors = await open(page, "?lang=ja");
  await tap(page, chip(page, "parse", "フランス（枝番）"), testInfo);
  await expect(answer(page, "parse")).toContainText("FR · フランス");
  await expect(answer(page, "parse")).toContainText("番地の枝番");
  await expect(answer(page, "parse")).toContainText("県（département）");
  await tap(page, chip(page, "validate", "モナコ"), testInfo);
  await expect(answer(page, "validate")).toContainText("モナコ");
  await expect(answer(page, "validate")).toContainText("OUTSIDE_FRANCE");
  await tap(page, chip(page, "postal", "20200"), testInfo);
  await expect(answer(page, "postal")).toContainText("フランスの郵便番号");
  await expect(answer(page, "postal")).toContainText("地域圏（région）");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

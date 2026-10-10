// How the country modules sit beside the core. Three promises are held here: handing the modules to parseLocation
// changes nothing for a US, Canadian or Japanese address (every case of those corpora gives the same result with the
// modules as without); an Australian or British address is told apart with no hint wherever its own country's signs
// are at its end; and a hint naming a country no module was given for is refused, not guessed at.

import { describe, expect, it } from "vitest";

import { australia, looksAustralian } from "../../au";
import { france, looksFrench } from "../../fr";
import { looksBritish, unitedKingdom } from "../../gb";
import { parseLocation } from "../../parser";
import { validateAddress } from "../../utils/comprehensive-validation";
import { allCases, COUNTRY_MODULES, parseCase } from "../corpus/corpus-support";

describe("the US, Canadian and Japanese corpora with the country modules handed in", () => {
  for (const country of ["us", "canada", "japan"]) {
    it(`gives every ${country} case the same result as without them`, () => {
      const changed: string[] = [];
      for (const testCase of allCases(country)) {
        const without = parseCase(testCase);
        const withModules = parseLocation(testCase.input, { ...testCase.options, countries: COUNTRY_MODULES });
        if (JSON.stringify(without) !== JSON.stringify(withModules)) changed.push(testCase.input);
      }

      expect(changed).toEqual([]);
      // Each corpus is parsed twice over, which takes longer than the default five seconds on a busy machine.
    }, 60_000);
  }
});

describe("telling Australian, British and French addresses apart with no hint", () => {
  const sure = (country: string): string[] =>
    allCases(country)
      .filter((testCase) => testCase.expected !== null)
      .map((testCase) => testCase.input);

  it("reads every Australian case that ends with a state and its postcode, or Australia, as Australian", () => {
    const misread = sure("au")
      .filter((input) => looksAustralian(input))
      .filter((input) => parseLocation(input, { countries: COUNTRY_MODULES })?.country !== "AU");

    expect(misread).toEqual([]);
  });

  it("reads every British case with a postcode in Royal Mail's grammar, or a country at its end, as British", () => {
    const misread = sure("gb")
      .filter((input) => looksBritish(input))
      .filter(
        (input) =>
          !["GB", "JE", "GY", "IM"].includes(parseLocation(input, { countries: COUNTRY_MODULES })?.country ?? ""),
      );

    expect(misread).toEqual([]);
  });

  it("reads every French case that ends with France, holds a CEDEX or has a French street and a postcode first, as French", () => {
    const misread = sure("fr")
      .filter((input) => looksFrench(input))
      .filter(
        (input) =>
          !["FR", "MC", "PM", "BL", "MF", "WF", "PF", "NC"].includes(
            parseLocation(input, { countries: COUNTRY_MODULES })?.country ?? "",
          ),
      );

    expect(misread).toEqual([]);
  });

  it("detects most of each corpus without a hint", () => {
    const share = (country: string, detect: (text: string) => boolean): number =>
      sure(country).filter(detect).length / sure(country).length;

    expect(share("au", looksAustralian)).toBeGreaterThan(0.9);
    expect(share("gb", looksBritish)).toBeGreaterThan(0.9);
    expect(share("fr", looksFrench)).toBeGreaterThan(0.9);
  });

  it("claims no US, Canadian or Japanese case", () => {
    const claimed = [...allCases("us"), ...allCases("canada"), ...allCases("japan")]
      .map((testCase) => testCase.input)
      .filter((input) => looksAustralian(input) || looksBritish(input) || looksFrench(input));

    expect(claimed).toEqual([]);
  });

  it("claims no case of another country's corpus for France", () => {
    const claimed = [...allCases("au"), ...allCases("gb")].map((testCase) => testCase.input).filter(looksFrench);

    expect(claimed).toEqual([]);
  });

  it("is not claimed by the Australian or British modules for any French case", () => {
    const claimed = allCases("fr")
      .map((testCase) => testCase.input)
      .filter((input) => looksAustralian(input) || looksBritish(input));

    expect(claimed).toEqual([]);
  });

  it.each([
    ["12 Smith St, Parramatta NSW 2150", "AU"],
    ["3/12 Smith St, Parramatta NSW 2150", "AU"],
    ["1 Main St, Perth WA 6000", "AU"],
    ["10 Downing Street, London SW1A 2AA", "GB"],
    ["Flat 2, 14 Byres Road, Glasgow G11 5RD", "GB"],
    ["12 Bath Street, St Helier JE2 4ST", "JE"],
    ["12 rue de la Paix, 75002 Paris", "FR"],
    ["15 boulevard Haussmann, 75009 PARIS CEDEX 09", "FR"],
    ["12 rue de la Paix, 75099 Paris", "FR"],
    ["1 place du Casino, 98000 Monaco", "MC"],
    ["Avenue Pouvanaa a Oopa, 98714 Papeete, Polynésie française", "PF"],
    ["100 Queen St W, Toronto, ON M5H 2N2", "CA"],
    ["4-123 Main St, Vancouver BC V5Y 1V4", "CA"],
    ["123 Main St, Seattle, WA 98101", "US"],
    ["〒100-0005 東京都千代田区丸の内1-2-3", "JP"],
    ["100 Avenue of the Americas, New York, NY 10036", "US"],
    ["100 Avenue of the Americas, New York, NY 10036 USA", "US"],
    ["1 Place Ville Marie, Montréal, QC H3B 4S6", "CA"],
    ["2 Court Square, Long Island City, NY 11101", "US"],
  ])("reads %s as %s", (input, country) => {
    expect(parseLocation(input, { countries: [australia, france, unitedKingdom] })?.country).toBe(country);
  });

  it("leaves a postcode that names no department to the core, with a French street beside it", () => {
    const input = "12 rue de la Paix, 96000 Paris";

    expect(parseLocation(input, { countries: [australia, france, unitedKingdom] })).toEqual(parseLocation(input));
  });

  it("leaves a German address, whose postcode comes first too, to the core", () => {
    const input = "Hauptstraße 5, 10115 Berlin";

    expect(parseLocation(input, { countries: [australia, france, unitedKingdom] })).toEqual(parseLocation(input));
  });

  it("leaves a Washington ZIP code cut to four digits to the core, as without the modules", () => {
    const input = "123 Main St, Seattle, WA 9810";

    expect(parseLocation(input, { countries: [australia, unitedKingdom] })).toEqual(parseLocation(input));
  });

  it("reads a Sydney postcode under the wrong state as Australian, for the validator to catch", () => {
    expect(parseLocation("1 Main St, Sydney VIC 2000", { countries: [australia] })?.country).toBe("AU");
  });
});

describe("the country hint", () => {
  it("reads an address as Australian when told to, whatever it ends with", () => {
    expect(parseLocation("3/12 Smith St, Parramatta", { country: "AU", countries: [australia] })).toEqual({
      secUnitType: "Unit",
      secUnitNum: "3",
      number: "12",
      street: "Smith",
      type: "St",
      city: "Parramatta",
      country: "AU",
    });
  });

  it("reads an address as French when told to, with the country's code or an overseas department's", () => {
    expect(parseLocation("12 rue de la Paix, Paris", { country: "FR", countries: [france] })?.country).toBe("FR");
    expect(
      parseLocation("5 rue Victor Hugo, 97200 Fort-de-France", { country: "MQ", countries: [france] })?.state,
    ).toBe("972");
  });

  it("reads Jersey with the British module", () => {
    expect(
      parseLocation("12 Bath Street, St Helier JE2 4ST", { country: "JE", countries: [unitedKingdom] })?.country,
    ).toBe("JE");
  });

  it("refuses a country whose module was not handed in", () => {
    expect(() => parseLocation("12 Smith St, Parramatta NSW 2150", { country: "AU" })).toThrow(/countries/);
    expect(() =>
      parseLocation("10 Downing Street, London SW1A 2AA", { country: "GB", countries: [australia] }),
    ).toThrow(/country module/);
    expect(() => parseLocation("12 rue de la Paix, 75002 Paris", { country: "FR" })).toThrow(/countries/);
  });

  it("keeps US, Canada and Japan in the core", () => {
    expect(
      parseLocation("100 Queen St W, Toronto, ON M5H 2N2", { country: "CA", countries: [australia] })?.country,
    ).toBe("CA");
  });

  it("gives snake_case keys through a module", () => {
    expect(
      parseLocation("Level 6, 51 Jacobson St, Brisbane QLD 4000", { countries: [australia], useSnakeCase: true }),
    ).toMatchObject({ floor_type: "Level", floor: "6" });
  });
});

describe("validateAddress with the country modules", () => {
  it("hands an Australian address to the Australian validator", () => {
    const result = validateAddress("1 Main St, Sydney VIC 2000", { countries: [australia] });

    expect(result.parsedAddress?.country).toBe("AU");
    expect(result.warnings.map((one) => one.code)).toEqual(["POSTAL_REGION_MISMATCH"]);
    expect(result.isValid).toBe(true);
  });

  it("makes a postcode finding an error with strict postal validation", () => {
    const result = validateAddress("1 Main St, Sydney VIC 2000", {
      countries: [australia],
      strictPostalValidation: true,
    });

    expect(result.errors.map((one) => one.code)).toEqual(["POSTAL_REGION_MISMATCH"]);
    expect(result.isValid).toBe(false);
  });

  it("does not ask a British address for a state", () => {
    const result = validateAddress("10 Downing Street, London SW1A 2AA", { countries: [unitedKingdom] });

    expect(result.warnings).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("leaves a US address to the core", () => {
    const withModules = validateAddress("123 Main St, Seattle, NY 98101", { countries: [australia, unitedKingdom] });

    expect(withModules).toEqual(validateAddress("123 Main St, Seattle, NY 98101"));
  });
});

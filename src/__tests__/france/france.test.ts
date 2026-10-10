// The French module beyond parsing: the postcode lookups, the tables (the departments and the collectivities from
// INSEE, the postcodes from La Poste), the validator, the La Poste formatter and the comparer. Parsing has its corpus
// under test-data/corpus/fr.

import { describe, expect, it } from "vitest";

import {
  compareFrenchAddresses,
  findFrenchDepartment,
  formatLaPoste,
  FR_COLLECTIVITIES,
  FR_DEPARTMENTS,
  getDepartmentFromFrenchPostcode,
  isKnownFrenchPostcode,
  isValidFrenchPostcode,
  looksFrench,
  parseFrenchAddress,
  parseFrenchPostcode,
  validateFrenchAddress,
} from "../../fr";
import type { ParsedAddress } from "../../types";

const parsed = (text: string): ParsedAddress => {
  const address = parseFrenchAddress(text);
  if (!address) throw new Error(`no parse: ${text}`);
  return address;
};
const codes = (text: string, options = {}): string[] => {
  const { errors, warnings } = validateFrenchAddress(parsed(text), options);
  return [...errors, ...warnings].map((one) => one.code);
};

describe("the postcode", () => {
  it.each(["75008", "01000", "97100", " 98714 ", "20200"])("is five digits: %s", (postcode) => {
    expect(isValidFrenchPostcode(postcode)).toBe(true);
  });

  it.each(["7500", "750081", "7500A", "", "75 008"])("is not %s", (postcode) => {
    expect(isValidFrenchPostcode(postcode)).toBe(false);
  });

  it("is known when La Poste's base lists it", () => {
    expect(["75008", "13001", "20000", "97100", "98000", "98800"].map(isKnownFrenchPostcode)).toEqual(
      new Array(6).fill(true),
    );
    expect(["75099", "00000", "96000", "99999", "20199", "abcde", ""].map(isKnownFrenchPostcode)).toEqual(
      new Array(7).fill(false),
    );
  });

  it("belongs to the department its number names, three digits overseas, Corsica split at 20200", () => {
    expect(
      ["75008", "01000", "95000", "20000", "20199", "20200", "20620", "97100", "97400", "97600"].map(
        getDepartmentFromFrenchPostcode,
      ),
    ).toEqual(["75", "01", "95", "2A", "2A", "2B", "2B", "971", "974", "976"]);
  });

  it("names the territory of a collectivity's or Monaco's postcode, with no department", () => {
    expect(parseFrenchPostcode("98714")).toEqual({ postcode: "98714", place: "987", country: "PF", known: true });
    expect(parseFrenchPostcode("98800")).toMatchObject({ place: "988", country: "NC" });
    expect(parseFrenchPostcode("98600")).toMatchObject({ place: "986", country: "WF" });
    expect(parseFrenchPostcode("97500")).toMatchObject({ place: "975", country: "PM" });
    expect(parseFrenchPostcode("98000")).toMatchObject({ place: "99", country: "MC" });
    expect(getDepartmentFromFrenchPostcode("98714")).toBeUndefined();
  });

  it("puts Saint-Barthélemy and Saint-Martin apart from Guadeloupe, though their codes begin 971", () => {
    expect(parseFrenchPostcode("97133")).toMatchObject({ place: "977", country: "BL" });
    expect(parseFrenchPostcode("97150")).toMatchObject({ place: "978", country: "MF" });
    expect(parseFrenchPostcode("97100")).toMatchObject({ place: "971", country: "FR", department: "971" });
  });

  it("takes spaces out and refuses what is not five digits", () => {
    expect(parseFrenchPostcode("75 008")?.postcode).toBe("75008");
    expect(parseFrenchPostcode("7500")).toBeNull();
    expect(parseFrenchPostcode("A5008")).toBeNull();
  });

  it("is a number that names no department when it begins 00, 96 or 99", () => {
    expect(parseFrenchPostcode("96000")).toMatchObject({ place: "96", known: false });
    expect(getDepartmentFromFrenchPostcode("96000")).toBeUndefined();
    expect(getDepartmentFromFrenchPostcode("00100")).toBeUndefined();
  });
});

describe("the tables", () => {
  it("has the 101 departments from INSEE, each with a region", () => {
    expect(FR_DEPARTMENTS).toHaveLength(101);
    expect(FR_DEPARTMENTS.every((one) => one.name !== "" && one.region !== "")).toBe(true);
    expect(FR_DEPARTMENTS.find((one) => one.code === "75")).toEqual({
      code: "75",
      name: "Paris",
      region: "Île-de-France",
    });
    expect(FR_DEPARTMENTS.filter((one) => one.code.length === 3).map((one) => one.code)).toEqual([
      "971",
      "972",
      "973",
      "974",
      "976",
    ]);
    expect(FR_DEPARTMENTS.map((one) => one.code)).toContain("2A");
    expect(FR_DEPARTMENTS.map((one) => one.code)).toContain("2B");
    expect(FR_DEPARTMENTS.map((one) => one.code)).not.toContain("20");
  });

  it("has the six overseas collectivities, each with its ISO 3166-1 code", () => {
    expect(FR_COLLECTIVITIES.map((one) => `${one.code}:${one.country}`)).toEqual([
      "975:PM",
      "977:BL",
      "978:MF",
      "986:WF",
      "987:PF",
      "988:NC",
    ]);
  });

  it("gives every department at least one postcode in La Poste's base", () => {
    const departments = new Set<string>();
    for (let number = 1000; number < 99000; number += 1) {
      const postcode = String(number).padStart(5, "0");
      if (isKnownFrenchPostcode(postcode)) {
        const department = getDepartmentFromFrenchPostcode(postcode);
        if (department) departments.add(department);
      }
    }

    expect(FR_DEPARTMENTS.filter((one) => !departments.has(one.code)).map((one) => one.code)).toEqual([]);
  });

  it("holds 6,328 postcodes, none outside the five-digit range", () => {
    let count = 0;
    for (let number = 0; number <= 99999; number += 1) {
      if (isKnownFrenchPostcode(String(number).padStart(5, "0"))) count += 1;
    }

    expect(count).toBe(6328);
  });

  it("finds a department by its code or its name, with or without accents", () => {
    expect(findFrenchDepartment("75")?.name).toBe("Paris");
    expect(findFrenchDepartment("2a")?.name).toBe("Corse-du-Sud");
    expect(findFrenchDepartment("haute corse")?.code).toBe("2B");
    expect(findFrenchDepartment("Côte-d'Or")?.code).toBe("21");
    expect(findFrenchDepartment("cote d or")?.code).toBe("21");
    expect(findFrenchDepartment("Atlantis")).toBeNull();
  });
});

describe("the validator", () => {
  it("finds nothing wrong with a complete address", () => {
    expect(codes("12 rue de la Paix, 75002 Paris")).toEqual([]);
    expect(codes("5 rue Victor Hugo, 97200 Fort-de-France")).toEqual([]);
  });

  it("warns of a postcode that names a department with no such postcode", () => {
    expect(codes("12 rue de la Paix, 75099 Paris")).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
  });

  it("warns of a postcode whose number is no department's", () => {
    expect(codes("12 rue de la Paix, 96000 Paris")).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
  });

  it("makes the postcode findings errors with strictPostalValidation", () => {
    const { errors, warnings } = validateFrenchAddress(parsed("12 rue de la Paix, 75099 Paris"), {
      strictPostalValidation: true,
    });

    expect(errors.map((one) => one.code)).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
    expect(warnings).toEqual([]);
  });

  it("warns that a postcode is not five digits", () => {
    expect(
      validateFrenchAddress({ number: "12", street: "de la Paix", city: "Paris", zip: "7500" }).warnings[0],
    ).toMatchObject({
      code: "INVALID_POSTAL_FORMAT",
      field: "zip",
    });
  });

  it("does not look a CEDEX's postcode up in the base, which lists communes' postcodes", () => {
    expect(codes("15 boulevard Haussmann, 75370 PARIS CEDEX 08")).toEqual([]);
    expect(codes("15 boulevard Haussmann, 75370 PARIS")).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
  });

  it("says that Monaco's and a collectivity's postcodes are not France's, always as a warning", () => {
    expect(codes("Place du Casino, 98000 Monaco")).toEqual(["OUTSIDE_FRANCE"]);
    expect(codes("Place du Casino, 98000 Monaco", { strictPostalValidation: true })).toEqual(["OUTSIDE_FRANCE"]);
    expect(codes("5 rue de Sébastopol, 98800 Nouméa")).toEqual(["OUTSIDE_FRANCE"]);
    const finding = validateFrenchAddress(parsed("5 rue de Sébastopol, 98800 Nouméa")).warnings[0];
    expect(finding.message).toContain("New Caledonia");
    expect(finding.message).toContain("NC");
  });

  it("warns of a missing postcode and a missing commune", () => {
    expect(codes("12 rue de la Paix, Paris")).toEqual(["MISSING_POSTAL_CODE"]);
    expect(codes("12 rue de la Paix, 75002")).toEqual(["MISSING_CITY"]);
  });

  it("has nothing to say about nothing", () => {
    expect(validateFrenchAddress(null as unknown as ParsedAddress)).toEqual({ errors: [], warnings: [] });
  });
});

describe("the La Poste formatter", () => {
  it("writes the lines in La Poste's order, in capitals with no accents or punctuation", () => {
    const address = parsed(
      "Chez Mme Martin, Apt 5, 2e étage, Escalier A, Résidence Les Pins, 15 bis rue d'Aboukir, Les Granges, BP 12, 69003 Lyon",
    );

    expect(formatLaPoste(address).lines).toEqual([
      "CHEZ MME MARTIN",
      "APPARTEMENT 5",
      "ETAGE 2",
      "ESCALIER A",
      "RESIDENCE LES PINS",
      "15 BIS RUE D ABOUKIR",
      "LES GRANGES",
      "BP 12",
      "69003 LYON",
    ]);
  });

  it("gives the delivery line, the last line and the whole on one line", () => {
    const formatted = formatLaPoste(parsed("12 rue de la Paix, 75002 Paris"));

    expect(formatted).toEqual({
      lines: ["12 RUE DE LA PAIX", "75002 PARIS"],
      singleLine: "12 RUE DE LA PAIX, 75002 PARIS",
      deliveryLine: "12 RUE DE LA PAIX",
      lastLine: "75002 PARIS",
      country: "FR",
      format: "la-poste",
    });
  });

  it("keeps a CEDEX on the last line and leaves an arrondissement to the postcode", () => {
    expect(formatLaPoste(parsed("15 boulevard Haussmann, 75009 Paris 9e CEDEX 09")).lastLine).toBe(
      "75009 PARIS CEDEX 09",
    );
    expect(formatLaPoste({ city: "Paris", arrondissement: "8", country: "FR" }).lastLine).toBe("PARIS 08");
  });

  it("adds the country for mail from abroad, by the territory's own name", () => {
    expect(formatLaPoste(parsed("12 rue de la Paix, 75002 Paris"), { includeCountry: true }).lines.at(-1)).toBe(
      "FRANCE",
    );
    expect(formatLaPoste(parsed("Place du Casino, 98000 Monaco"), { includeCountry: true }).lines.at(-1)).toBe(
      "MONACO",
    );
    expect(
      formatLaPoste(parsed("Avenue Pouvanaa a Oopa, 98714 Papeete, Polynésie française"), {
        includeCountry: true,
      }).lines.at(-1),
    ).toBe("POLYNESIE FRANCAISE");
  });

  it("keeps the accents when asked", () => {
    expect(formatLaPoste(parsed("3 rue de l'Église, 31000 Toulouse"), { keepAccents: true }).lines[0]).toBe(
      "3 RUE DE L'ÉGLISE",
    );
  });

  it("writes nothing for no address", () => {
    expect(formatLaPoste(null as unknown as ParsedAddress)).toEqual({
      lines: [],
      singleLine: "",
      country: "FR",
      format: "la-poste",
    });
  });
});

describe("the comparer", () => {
  const same = (one: string, two: string): boolean => compareFrenchAddresses(parsed(one), parsed(two)).isSame;

  it("takes a type of voie written in full or abbreviated, letter case, accents and hyphens as the same", () => {
    expect(same("12 rue de l'Église, 38000 Grenoble", "12 R. DE L EGLISE, 38000 GRENOBLE")).toBe(true);
    expect(same("27 avenue des Champs-Élysées, 75008 Paris", "27 av. des Champs Elysees, 75008 Paris")).toBe(true);
    expect(same("5 boulevard Saint-Michel, 75005 Paris", "5 bd St Michel, 75005 Paris")).toBe(true);
  });

  it("takes St and Saint, Ste and Sainte in a commune as the same", () => {
    expect(same("4 rue Victor Hugo, 42000 Saint-Étienne", "4 rue Victor Hugo, 42000 ST ETIENNE")).toBe(true);
    expect(same("4 rue Victor Hugo, 38000 Sainte-Foy", "4 rue Victor Hugo, 38000 Ste Foy")).toBe(true);
  });

  it("leaves the CEDEX and the department out, and reports what differs", () => {
    expect(same("15 boulevard Haussmann, 75009 Paris", "15 boulevard Haussmann, 75009 Paris CEDEX 09")).toBe(true);
    const found = compareFrenchAddresses(
      parsed("12 rue de la Paix, 75002 Paris"),
      parsed("12 bis rue de la Paix, 75002 Paris"),
    );

    expect(found.isSame).toBe(false);
    expect(found.differences).toEqual([{ field: "numberExtension", second: "BIS" }]);
  });

  it("tells two apartments of one building apart", () => {
    expect(same("Apt 12, 4 avenue des Écoles, 31000 Toulouse", "Apt 14, 4 avenue des Écoles, 31000 Toulouse")).toBe(
      false,
    );
  });

  it("is not the same as nothing", () => {
    expect(
      compareFrenchAddresses(null as unknown as ParsedAddress, parsed("12 rue de la Paix, 75002 Paris")).isSame,
    ).toBe(false);
  });
});

describe("the parser's edges", () => {
  it("gives snake_case keys when asked", () => {
    expect(
      parseFrenchAddress("Apt 12, 4 bis av. des Écoles, BP 3, 31000 Toulouse", { useSnakeCase: true }),
    ).toMatchObject({
      sec_unit_type: "Appartement",
      number_extension: "bis",
      postal_box_type: "BP",
      postal_box_num: "3",
    });
  });

  it("gives null for nothing, and for what is not text", () => {
    expect(parseFrenchAddress("")).toBeNull();
    expect(parseFrenchAddress(undefined as unknown as string)).toBeNull();
    expect(looksFrench("")).toBe(false);
    expect(looksFrench(undefined as unknown as string)).toBe(false);
  });

  it("marks a postcode that names no department as not valid, and says the department it does name", () => {
    expect(parseFrenchAddress("12 rue de la Paix, 96000 Paris")).toMatchObject({ zip: "96000", zipValid: false });
    expect(parseFrenchAddress("12 rue de la Paix, 20200 Bastia")).toMatchObject({ state: "2B", zipValid: true });
  });

  it("is not French when a US ZIP code follows its state, nor when a Canadian postal code does", () => {
    expect(looksFrench("100 Avenue of the Americas, New York, NY 10036")).toBe(false);
    expect(looksFrench("100 Avenue of the Americas, New York, NY, 10036, USA")).toBe(false);
    expect(looksFrench("2 Place Ville Marie, Montréal, QC H3B 4S6")).toBe(false);
  });
});

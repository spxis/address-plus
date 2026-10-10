// The German module beyond parsing: the postcode lookups, the tables (the Länder from kuni, the postcodes from GeoNames),
// the validator, the Deutsche Post formatter and the comparer. Parsing has its corpus under test-data/corpus/de.

import { describe, expect, it } from "vitest";

import {
  compareGermanAddresses,
  DE_STATES,
  findGermanState,
  formatDeutschePost,
  getStateFromGermanPostcode,
  isKnownGermanPostcode,
  isValidGermanPostcode,
  looksGerman,
  parseGermanAddress,
  parseGermanPostcode,
  validateGermanAddress,
} from "../../de";
import type { ParsedAddress } from "../../types";

const parsed = (text: string): ParsedAddress => {
  const address = parseGermanAddress(text);
  if (!address) throw new Error(`no parse: ${text}`);
  return address;
};
const codes = (text: string, options = {}): string[] => {
  const { errors, warnings } = validateGermanAddress(parsed(text), options);
  return [...errors, ...warnings].map((one) => one.code);
};

describe("the postcode", () => {
  it.each(["10115", "01067", " 80331 ", "99998"])("is five digits: %s", (postcode) => {
    expect(isValidGermanPostcode(postcode)).toBe(true);
  });

  it.each(["1011", "101155", "1011a", "", "10 115"])("is not %s", (postcode) => {
    expect(isValidGermanPostcode(postcode)).toBe(false);
  });

  it("is known when GeoNames' list has it", () => {
    expect(["10115", "80331", "01067", "20095", "99084"].map(isKnownGermanPostcode)).toEqual(new Array(5).fill(true));
    expect(["00000", "00999", "99999", "abcde", ""].map(isKnownGermanPostcode)).toEqual(new Array(5).fill(false));
  });

  it("is in the Land its number is in", () => {
    const lands = ["10115", "80331", "20095", "50667", "60311", "70173", "01067", "30159", "28195", "66111"];

    expect(lands.map(getStateFromGermanPostcode)).toEqual(["BE", "BY", "HH", "NW", "HE", "BW", "SN", "NI", "HB", "SL"]);
  });

  it("says where the Land's postcodes run on from one to the next", () => {
    expect(["14467", "19053", "24103", "39104", "55116"].map(getStateFromGermanPostcode)).toEqual([
      "BB",
      "MV",
      "SH",
      "ST",
      "RP",
    ]);
  });

  it("takes spaces out and refuses what is not five digits", () => {
    expect(parseGermanPostcode("10 115")?.postcode).toBe("10115");
    expect(parseGermanPostcode("1011")).toBeNull();
    expect(parseGermanPostcode("00000")).toEqual({ postcode: "00000", known: false });
  });
});

describe("the tables", () => {
  it("has the sixteen Länder from kuni, with their Japanese names", () => {
    expect(DE_STATES).toHaveLength(16);
    expect(DE_STATES.map((state) => state.code)).toEqual([
      "BB",
      "BE",
      "BW",
      "BY",
      "HB",
      "HE",
      "HH",
      "MV",
      "NI",
      "NW",
      "RP",
      "SH",
      "SL",
      "SN",
      "ST",
      "TH",
    ]);
    expect(DE_STATES.every((state) => state.iso === `DE-${state.code}` && state.nameJa !== "")).toBe(true);
    expect(DE_STATES.find((state) => state.code === "BY")).toEqual({
      code: "BY",
      iso: "DE-BY",
      name: "Bavaria",
      nameJa: "バイエルン自由州",
    });
  });

  it("gives every Land at least one postcode, and 10,813 postcodes in all", () => {
    const lands = new Set<string>();
    let count = 0;
    for (let number = 1000; number <= 99999; number += 1) {
      const postcode = String(number).padStart(5, "0");
      if (!isKnownGermanPostcode(postcode)) continue;
      count += 1;
      const state = getStateFromGermanPostcode(postcode);
      if (state) lands.add(state);
    }

    expect(count).toBe(10813);
    expect(DE_STATES.filter((state) => !lands.has(state.code)).map((state) => state.code)).toEqual([]);
  });

  it("finds a Land by its code, its English or German name, or its Japanese one", () => {
    expect(findGermanState("BY")?.code).toBe("BY");
    expect(findGermanState("DE-NW")?.code).toBe("NW");
    expect(findGermanState("Bayern")?.code).toBe("BY");
    expect(findGermanState("Lower Saxony")?.code).toBe("NI");
    expect(findGermanState("niedersachsen")?.code).toBe("NI");
    expect(findGermanState("Thüringen")?.code).toBe("TH");
    expect(findGermanState("thueringen")?.code).toBe("TH");
    expect(findGermanState("Baden-Württemberg")?.code).toBe("BW");
    expect(findGermanState("ベルリン")?.code).toBe("BE");
    expect(findGermanState("Atlantis")).toBeNull();
  });
});

describe("the validator", () => {
  it("finds nothing wrong with a complete address", () => {
    expect(codes("Hauptstraße 12, 10115 Berlin")).toEqual([]);
    expect(codes("Postfach 12 34 56, 50667 Köln")).toEqual([]);
  });

  it("warns of a postcode that GeoNames' list does not have", () => {
    expect(codes("Hauptstraße 12, 00000 Berlin")).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
  });

  it("makes the postcode findings errors with strictPostalValidation", () => {
    const { errors, warnings } = validateGermanAddress(parsed("Hauptstraße 12, 00000 Berlin"), {
      strictPostalValidation: true,
    });

    expect(errors.map((one) => one.code)).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
    expect(warnings).toEqual([]);
  });

  it("warns that a postcode is not five digits", () => {
    expect(
      validateGermanAddress({ street: "Hauptstraße", number: "12", city: "Berlin", zip: "1011" }).warnings[0],
    ).toMatchObject({ code: "INVALID_POSTAL_FORMAT", field: "zip" });
  });

  it("warns of a missing postcode, a missing place and a missing house number", () => {
    expect(codes("Hauptstraße 12, Berlin")).toEqual(["MISSING_POSTAL_CODE"]);
    expect(codes("Hauptstraße 12, 10115")).toEqual(["MISSING_CITY"]);
    expect(codes("Hauptstraße, 10115 Berlin")).toEqual(["MISSING_STREET_NUMBER"]);
  });

  it("has nothing to say about nothing", () => {
    expect(validateGermanAddress(null as unknown as ParsedAddress)).toEqual({ errors: [], warnings: [] });
  });
});

describe("the Deutsche Post formatter", () => {
  it("writes the lines in order, with no punctuation at the end of a line", () => {
    const address = parsed("c/o Weber, Hinterhaus, Wohnung 12, 2. OG, Kastanienallee 4 b, 10115 Berlin");

    expect(formatDeutschePost(address).lines).toEqual([
      "c/o Weber",
      "Hinterhaus",
      "Wohnung 12",
      "2. OG",
      "Kastanienallee 4B",
      "10115 Berlin",
    ]);
  });

  it("gives the delivery line, the last line and the whole on one line", () => {
    expect(formatDeutschePost(parsed("Hauptstraße 12, 10115 Berlin"))).toEqual({
      lines: ["Hauptstraße 12", "10115 Berlin"],
      singleLine: "Hauptstraße 12, 10115 Berlin",
      deliveryLine: "Hauptstraße 12",
      lastLine: "10115 Berlin",
      country: "DE",
      format: "deutsche-post",
    });
  });

  it("sets a Postfach's number in pairs from the right, and a Packstation with its number", () => {
    expect(formatDeutschePost(parsed("Postfach 123456, 50667 Köln")).lines).toEqual([
      "Postfach 12 34 56",
      "50667 Köln",
    ]);
    expect(formatDeutschePost(parsed("Postfach 12345, 50667 Köln")).lines[0]).toBe("Postfach 1 23 45");
    expect(formatDeutschePost(parsed("Postfach 1234, 50667 Köln")).lines[0]).toBe("Postfach 12 34");
    expect(formatDeutschePost(parsed("Packstation 123, 70173 Stuttgart")).lines).toEqual([
      "Packstation 123",
      "70173 Stuttgart",
    ]);
  });

  it("writes an Ortsteil after the place, as it was read", () => {
    expect(formatDeutschePost(parsed("Dorfstraße 5, 04109 Leipzig OT Gohlis")).lastLine).toBe(
      "04109 Leipzig OT Gohlis",
    );
  });

  it("adds the country for mail from abroad", () => {
    expect(formatDeutschePost(parsed("Hauptstraße 12, 10115 Berlin"), { includeCountry: true }).lines.at(-1)).toBe(
      "DEUTSCHLAND",
    );
  });

  it("writes nothing for no address", () => {
    expect(formatDeutschePost(null as unknown as ParsedAddress)).toEqual({
      lines: [],
      singleLine: "",
      country: "DE",
      format: "deutsche-post",
    });
  });
});

describe("the comparer", () => {
  const same = (one: string, two: string): boolean => compareGermanAddresses(parsed(one), parsed(two)).isSame;

  it("takes Straße, Strasse and Str. as one, and umlauts written out, and letter case", () => {
    expect(same("Hauptstraße 12, 10115 Berlin", "HAUPTSTR. 12, 10115 BERLIN")).toBe(true);
    expect(same("Hauptstraße 12, 10115 Berlin", "Hauptstrasse 12, 10115 Berlin")).toBe(true);
    expect(same("Müllerstraße 5, 13353 Berlin", "MUELLERSTR. 5, 13353 BERLIN")).toBe(true);
    expect(same("Berliner Straße 7, 60311 Frankfurt am Main", "Berliner Str. 7, 60311 Frankfurt am Main")).toBe(true);
  });

  it("takes the house number's letter and spacing as one", () => {
    expect(same("Hauptstraße 12a, 10115 Berlin", "Hauptstraße 12 A, 10115 Berlin")).toBe(true);
    expect(same("Hauptstraße 12-14, 10115 Berlin", "Hauptstraße 12 - 14, 10115 Berlin")).toBe(true);
  });

  it("reports what differs", () => {
    const found = compareGermanAddresses(
      parsed("Hauptstraße 12, 10115 Berlin"),
      parsed("Hauptstraße 14, 10115 Berlin"),
    );

    expect(found.isSame).toBe(false);
    expect(found.differences).toEqual([{ field: "number", first: "12", second: "14" }]);
  });

  it("tells two flats of one house apart", () => {
    expect(same("Wohnung 12, Hauptstraße 5, 10115 Berlin", "Wohnung 14, Hauptstraße 5, 10115 Berlin")).toBe(false);
  });

  it("is not the same as nothing", () => {
    expect(
      compareGermanAddresses(null as unknown as ParsedAddress, parsed("Hauptstraße 12, 10115 Berlin")).isSame,
    ).toBe(false);
  });
});

describe("the parser's edges", () => {
  it("gives snake_case keys when asked", () => {
    expect(
      parseGermanAddress("c/o Weber, Wohnung 12, 2. OG, Hauptstraße 5, 10115 Berlin", { useSnakeCase: true }),
    ).toMatchObject({ care_of: "Weber", sec_unit_type: "Wohnung", floor_type: "Obergeschoss" });
  });

  it("gives null for nothing, and for what is not text", () => {
    expect(parseGermanAddress("")).toBeNull();
    expect(parseGermanAddress(undefined as unknown as string)).toBeNull();
    expect(looksGerman("")).toBe(false);
    expect(looksGerman(undefined as unknown as string)).toBe(false);
  });

  it("says the Land a postcode is in, and finds no postcode in four digits", () => {
    expect(parseGermanAddress("Hauptstraße 12, 80331 München")).toMatchObject({ state: "BY", zipValid: true });
    expect(parseGermanAddress("Hauptstraße 12, 1011 Berlin")?.zip).toBeUndefined();
  });

  it("is not German when a US ZIP code follows its state, a Canadian postal code ends in a digit, or the number comes first", () => {
    expect(looksGerman("123 Main St, Seattle, WA 98101")).toBe(false);
    expect(looksGerman("100 Queen St W, Toronto, ON M5H 2N2")).toBe(false);
    expect(looksGerman("12 rue de la Paix, 75002 Paris")).toBe(false);
    expect(looksGerman("100 Avenue of the Americas, New York, NY, 10036, USA")).toBe(false);
  });
});

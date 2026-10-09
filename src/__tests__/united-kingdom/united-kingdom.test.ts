// The British module beyond parsing: the postcode grammar and lookups, the tables (the nations from kuni, the areas,
// and the districts and their nations from Code-Point Open), the validator, the Royal Mail formatter and the comparer.
// Parsing has its corpus under test-data/corpus/gb.

import { describe, expect, it } from "vitest";

import {
  compareUKAddresses,
  findUKNation,
  formatRoyalMail,
  GB_DISTRICT_NATIONS,
  GB_NATIONS,
  GB_POSTCODE_AREAS,
  GB_POSTCODE_DISTRICTS,
  getNationFromUKPostcode,
  getNationsForUKPostcode,
  isValidUKPostcode,
  parseUKAddress,
  parseUKPostcode,
  validateUKAddress,
} from "../../gb";
import type { ParsedAddress } from "../../types";

const parsed = (text: string): ParsedAddress => {
  const address = parseUKAddress(text);
  if (!address) throw new Error(`no parse: ${text}`);
  return address;
};
const codes = (text: string, options = {}): string[] => {
  const { errors, warnings } = validateUKAddress(parsed(text), options);
  return [...errors, ...warnings].map((one) => one.code);
};

describe("the postcode grammar", () => {
  it.each(["M2 5AA", "M34 4AB", "CR0 2YR", "DN16 9AA", "W1A 0AX", "EC1A 1BB", "GIR 0AA", "sw1a2aa", " B6 5BA "])(
    "accepts %s",
    (postcode) => {
      expect(isValidUKPostcode(postcode)).toBe(true);
    },
  );

  it.each([
    ["Q1 1AA", "Q never starts a postcode"],
    ["V1 1AA", "nor V"],
    ["X1 1AA", "nor X"],
    ["AI1 1AA", "I is never second"],
    ["AJ1 1AA", "nor J"],
    ["AZ1 1AA", "nor Z"],
    ["W1I 1AA", "I is not a third letter"],
    ["EC1C 1AA", "C is not a fourth letter"],
    ["EC1A 1CA", "C is not in the inward code"],
    ["EC1A 1AV", "nor V"],
    ["M5V 1A1", "a Canadian postal code"],
    ["EC1A", "an outward code alone"],
    ["", "nothing"],
  ])("refuses %s: %s", (postcode) => {
    expect(isValidUKPostcode(postcode)).toBe(false);
  });

  it("takes a postcode apart", () => {
    expect(parseUKPostcode("w1a0ax")).toEqual({
      postcode: "W1A 0AX",
      outward: "W1A",
      inward: "0AX",
      area: "W",
      district: "W1A",
      sector: "W1A 0",
      country: "GB",
      nation: "ENG",
    });
    expect(parseUKPostcode("GIR 0AA")).toMatchObject({ area: "GIR", country: "GB" });
    expect(parseUKPostcode("GIR 0AA")?.nation).toBeUndefined();
    expect(parseUKPostcode("AA1 1AA")).toBeNull();
  });
});

describe("the tables", () => {
  it("has the four nations from kuni, with their Japanese names", () => {
    expect(GB_NATIONS.map((nation) => nation.code)).toEqual(["ENG", "NIR", "SCT", "WLS"]);
    expect(GB_NATIONS.every((nation) => nation.iso === `GB-${nation.code}` && nation.nameJa !== "")).toBe(true);
  });

  it("has 121 areas in the United Kingdom, the three Crown Dependencies, BFPO and BX", () => {
    const areas = Object.entries(GB_POSTCODE_AREAS);
    expect(areas.filter(([, area]) => area.country === "GB" && area.nation).length).toBe(121);
    expect(
      areas
        .filter(([, area]) => area.country !== "GB")
        .map(([code]) => code)
        .sort(),
    ).toEqual(["GY", "IM", "JE"]);
    expect(areas.filter(([, area]) => area.country === "GB" && !area.nation).map(([code]) => code)).toEqual([
      "BF",
      "BX",
    ]);
  });

  it("lists districts for every area in Great Britain and none for BT", () => {
    for (const [code, area] of Object.entries(GB_POSTCODE_AREAS)) {
      if (area.country === "GB" && area.nation && area.nation !== "NIR")
        expect(GB_POSTCODE_DISTRICTS[code], code).toBeDefined();
    }
    expect(GB_POSTCODE_DISTRICTS.BT).toBeUndefined();
  });

  it("lists the districts on the borders, each with its nations", () => {
    expect(GB_DISTRICT_NATIONS.CH5).toEqual(["WLS"]);
    expect(GB_DISTRICT_NATIONS.TD15).toEqual(["ENG", "SCT"]);
    expect(Object.values(GB_DISTRICT_NATIONS).every((nations) => nations.length > 0)).toBe(true);
  });
});

describe("the nations", () => {
  it.each([
    ["SW1A 2AA", "ENG"],
    ["EH1 1YZ", "SCT"],
    ["CF10 1EP", "WLS"],
    ["BT1 5GS", "NIR"],
    ["CH5 1AA", "WLS"],
    ["CH1 1LE", "ENG"],
    ["TD15 1BN", "ENG"],
    ["TD1 1AA", "SCT"],
  ])("gives %s to %s", (postcode, nation) => {
    expect(getNationFromUKPostcode(postcode)).toBe(nation);
  });

  it("gives no nation outside the United Kingdom or for BFPO", () => {
    expect(getNationFromUKPostcode("JE2 3AB")).toBeUndefined();
    expect(getNationFromUKPostcode("BF1 3AA")).toBeUndefined();
    expect(getNationFromUKPostcode("not a postcode")).toBeUndefined();
  });

  it("lists both nations of a district on a border", () => {
    expect(getNationsForUKPostcode("SY10 7AA")).toEqual(["ENG", "WLS"]);
    expect(getNationsForUKPostcode("EC1A 1BB")).toEqual(["ENG"]);
    expect(getNationsForUKPostcode("JE2 3AB")).toEqual([]);
  });

  it("finds a nation by code, name and Japanese name", () => {
    expect(findUKNation("GB-SCT")?.name).toBe("Scotland");
    expect(findUKNation("wales")?.code).toBe("WLS");
    expect(findUKNation("北アイルランド")?.code).toBe("NIR");
    expect(findUKNation("Ontario")).toBeNull();
  });
});

describe("validateUKAddress", () => {
  it("passes a complete address in each nation", () => {
    for (const input of [
      "10 Downing Street, London SW1A 2AA",
      "12 Princes Street, Edinburgh EH2 2AN",
      "7 Queen Street, Cardiff CF10 2BU",
      "10 Donegall Square, Belfast BT1 5GS",
    ]) {
      expect(codes(input), input).toEqual([]);
    }
  });

  it("catches a postcode outside the grammar, an area not in use and a district not in use", () => {
    expect(codes("1 High Street, Anytown Q1 1AA")).toEqual(["INVALID_POSTAL_FORMAT"]);
    expect(codes("1 High Street, Anytown AA1 1AA")).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
    expect(codes("1 High Street, London EC9 1AA")).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
  });

  it("checks Northern Ireland's postcodes only to their area", () => {
    expect(codes("1 Main Street, Belfast BT99 9ZZ")).toEqual([]);
  });

  it("says when a postcode is a Crown Dependency's", () => {
    expect(codes("12 Bath Street, St Helier JE2 4ST")).toEqual(["OUTSIDE_UK"]);
  });

  it("asks a forces address for neither town nor postcode", () => {
    expect(codes("HQ Company, BFPO 105")).toEqual([]);
  });

  it("warns of a missing postcode or post town", () => {
    expect(codes("7 Queen Street, Cardiff, Wales")).toEqual(["MISSING_POSTAL_CODE"]);
    expect(codes("Albion Institute, The Blvd, ST4 2AA")).toEqual(["MISSING_CITY"]);
  });

  it("makes postcode findings errors with strict postal validation", () => {
    const result = validateUKAddress(parsed("1 High Street, Anytown AA1 1AA"), { strictPostalValidation: true });
    expect(result.errors.map((one) => one.code)).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
  });
});

describe("formatRoyalMail", () => {
  it.each([
    ["10 Downing St, London, sw1a2aa", ["10 Downing Street", "LONDON", "SW1A 2AA"]],
    [
      "Flat 2, Rose Court, 14 High St, Kingsbury, London NW9 0AA",
      ["Flat 2", "Rose Court", "14 High Street", "Kingsbury", "LONDON", "NW9 0AA"],
    ],
    [
      "2A Mill Cottages, Church Road, Cley, Holt NR25 7AA",
      ["2A Mill Cottages", "Church Road", "Cley", "HOLT", "NR25 7AA"],
    ],
    ["Basement Flat, 14 High Street, Bath BA1 1AA", ["Basement Flat", "14 High Street", "BATH", "BA1 1AA"]],
    [
      "Studio J, 4th Floor, 8 Lower Ormond St, Manchester M1 5AA",
      ["Studio J", "Floor 4", "8 Lower Ormond Street", "MANCHESTER", "M1 5AA"],
    ],
    ["Lloyds Bank, PO Box 111, Douglas, Isle of Man IM99 1JJ", ["Lloyds Bank", "PO Box 111", "DOUGLAS", "IM99 1JJ"]],
    ["HQ Company, BFPO 105", ["HQ Company", "BFPO 105"]],
  ])("writes %s", (input, lines) => {
    expect(formatRoyalMail(parsed(input)).lines).toEqual(lines);
  });

  it("keeps a county and adds the country when asked", () => {
    const address = parsed("3 Station Road, Woking, Surrey GU21 6AA");
    expect(formatRoyalMail(address).lines).toEqual(["3 Station Road", "WOKING", "GU21 6AA"]);
    expect(formatRoyalMail(address, { includeCounty: true, includeCountry: true }).lines).toEqual([
      "3 Station Road",
      "WOKING",
      "Surrey",
      "GU21 6AA",
      "UNITED KINGDOM",
    ]);
    expect(formatRoyalMail(parsed("12 Bath Street, St Helier JE2 4ST"), { includeCountry: true }).lines.at(-1)).toBe(
      "JERSEY",
    );
  });
});

describe("compareUKAddresses", () => {
  it("finds abbreviations, letter case and the postcode's space the same", () => {
    expect(
      compareUKAddresses(parsed("10 Downing Street, London SW1A 2AA"), parsed("10 DOWNING ST, LONDON, SW1A2AA")),
    ).toEqual({ isSame: true, differences: [] });
  });

  it("lists each field that differs", () => {
    expect(
      compareUKAddresses(parsed("Flat 2, 14 High Street, Bath BA1 1AA"), parsed("Flat 3, 14 High Road, Bath BA1 1AA"))
        .differences,
    ).toEqual([
      { field: "secUnitNum", first: "2", second: "3" },
      { field: "type", first: "STREET", second: "ROAD" },
    ]);
  });
});

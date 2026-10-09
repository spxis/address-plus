// The Australian module beyond parsing: the tables (the states from kuni, the blocks of postcodes, the postcodes that
// cross a border from the ABS), the lookups, the validator, the Australia Post formatter and the comparer. Parsing has
// its corpus under test-data/corpus/au.

import { describe, expect, it } from "vitest";

import {
  AU_CROSS_BORDER_POSTCODES,
  AU_EXTERNAL_TERRITORY_POSTCODES,
  AU_POSTCODE_RANGES,
  AU_STATES,
  AU_STREET_TYPES,
  compareAustralianAddresses,
  expandAustralianStreetType,
  findAustralianState,
  formatAustraliaPost,
  getPostcodeRangesForAustralianState,
  getStateFromAustralianPostcode,
  getStatesForAustralianPostcode,
  parseAustralianAddress,
  validateAustralianAddress,
} from "../../au";
import type { ParsedAddress } from "../../types";

const parsed = (text: string): ParsedAddress => {
  const address = parseAustralianAddress(text);
  if (!address) throw new Error(`no parse: ${text}`);
  return address;
};
const codes = (text: string, options = {}): string[] => {
  const { errors, warnings } = validateAustralianAddress(parsed(text), options);
  return [...errors, ...warnings].map((one) => one.code);
};

describe("the tables", () => {
  it("has the eight states and territories from kuni, with their Japanese names", () => {
    expect(AU_STATES.map((state) => state.code)).toEqual(["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]);
    expect(AU_STATES.filter((state) => state.kind === "territory").map((state) => state.code)).toEqual(["ACT", "NT"]);
    expect(AU_STATES.every((state) => state.iso === `AU-${state.code}` && state.nameJa !== "")).toBe(true);
  });

  it("gives every postcode from 0200 to 9999 at most one block, and none below 0200", () => {
    for (let number = 0; number <= 9999; number += 1) {
      const postcode = String(number).padStart(4, "0");
      const blocks = AU_POSTCODE_RANGES.filter((range) => postcode >= range.from && postcode <= range.to);
      expect(blocks.length, postcode).toBeLessThanOrEqual(1);
    }
    expect(getStateFromAustralianPostcode("0100")).toBeUndefined();
    expect(getStateFromAustralianPostcode("0300")).toBeUndefined();
  });

  it("lists only postcodes inside a block as crossing a border, each in two states or more", () => {
    for (const [postcode, states] of Object.entries(AU_CROSS_BORDER_POSTCODES)) {
      expect(getStateFromAustralianPostcode(postcode), postcode).toBeDefined();
      expect(states.length, postcode).toBeGreaterThan(1);
    }
    expect(AU_EXTERNAL_TERRITORY_POSTCODES).toEqual(["2540", "2899", "6798", "6799"]);
  });

  it("writes every street type as AS4590's code in proper case", () => {
    for (const code of Object.keys(AU_STREET_TYPES)) expect(code).toMatch(/^[A-Z][a-z]*$/);
    expect(expandAustralianStreetType("Pde")).toBe("Parade");
    expect(expandAustralianStreetType("Unknown")).toBe("Unknown");
  });
});

describe("the lookups", () => {
  it.each([
    ["0200", "ACT"],
    ["0800", "NT"],
    ["1234", "NSW"],
    ["2600", "ACT"],
    ["2619", "NSW"],
    ["2920", "ACT"],
    ["2921", "NSW"],
    ["3000", "VIC"],
    ["8001", "VIC"],
    ["4000", "QLD"],
    ["9001", "QLD"],
    ["5000", "SA"],
    ["6000", "WA"],
    ["7000", "TAS"],
  ])("gives %s to %s", (postcode, state) => {
    expect(getStateFromAustralianPostcode(postcode)).toBe(state);
  });

  it("refuses what is not four digits", () => {
    expect(getStateFromAustralianPostcode("200")).toBeUndefined();
    expect(getStateFromAustralianPostcode("20000")).toBeUndefined();
    expect(getStatesForAustralianPostcode("abcd")).toEqual([]);
  });

  it("lists every state a border postcode serves", () => {
    expect(getStatesForAustralianPostcode("2620")).toEqual(["NSW", "ACT"]);
    expect(getStatesForAustralianPostcode("3644")).toEqual(["VIC", "NSW"]);
    expect(getStatesForAustralianPostcode("2150")).toEqual(["NSW"]);
  });

  it("finds a state by code, name, Japanese name and ISO code", () => {
    expect(findAustralianState("qld")?.code).toBe("QLD");
    expect(findAustralianState("Western Australia")?.code).toBe("WA");
    expect(findAustralianState("タスマニア州")?.code).toBe("TAS");
    expect(findAustralianState("タスマニア")?.code).toBe("TAS");
    expect(findAustralianState("AU-NT")?.code).toBe("NT");
    expect(findAustralianState("Ontario")).toBeNull();
    expect(findAustralianState("")).toBeNull();
  });

  it("lists a state's blocks in order", () => {
    expect(getPostcodeRangesForAustralianState("NSW").map((range) => range.from)).toEqual([
      "1000",
      "2000",
      "2619",
      "2921",
    ]);
    expect(getPostcodeRangesForAustralianState("Atlantis")).toEqual([]);
  });
});

describe("validateAustralianAddress", () => {
  it("passes a complete address", () => {
    expect(codes("12 Smith St, Parramatta NSW 2150")).toEqual([]);
  });

  it("catches a postcode from another state", () => {
    expect(codes("1 Main St, Sydney VIC 2000")).toEqual(["POSTAL_REGION_MISMATCH"]);
  });

  it("passes a postcode that serves both states across a border", () => {
    expect(codes("15 Vermont St, Barooga NSW 3644")).toEqual([]);
    expect(codes("8 Sheppard St, Hume ACT 2620")).toEqual([]);
    expect(codes("Lot 5, Amata SA 0872")).toEqual([]);
  });

  it("does not judge the state given with an external territory's postcode", () => {
    expect(codes("20 Gaze Rd, Christmas Island WA 6798")).toEqual([]);
  });

  it("catches a postcode in no block and one that is not four digits", () => {
    expect(codes("1 Main St, Sydney NSW 0100")).toEqual(["UNRECOGNIZED_POSTAL_CODE"]);
    const address = { ...parsed("1 Main St, Sydney NSW 2000"), zip: "200" };
    expect(validateAustralianAddress(address).warnings.map((one) => one.code)).toEqual(["INVALID_POSTAL_FORMAT"]);
  });

  it("warns of a missing state, postcode or suburb", () => {
    expect(codes("Unit 3, 12 Smith St, NSW 2150")).toEqual(["MISSING_CITY"]);
    expect(codes("12 Smith St, Parramatta 2150")).toEqual(["MISSING_STATE"]);
    expect(codes("12 Smith St, Parramatta NSW")).toEqual(["MISSING_POSTAL_CODE"]);
  });

  it("makes postcode findings errors with strict postal validation, and only those", () => {
    const result = validateAustralianAddress(parsed("1 Main St, VIC 2000"), { strictPostalValidation: true });
    expect(result.errors.map((one) => one.code)).toEqual(["POSTAL_REGION_MISMATCH"]);
    expect(result.warnings.map((one) => one.code)).toEqual(["MISSING_CITY"]);
  });
});

describe("formatAustraliaPost", () => {
  it.each([
    ["12 Smith Street, Parramatta NSW 2150", ["12 SMITH ST", "PARRAMATTA NSW 2150"]],
    ["3/12 Smith St, Parramatta NSW 2150", ["UNIT 3 12 SMITH ST", "PARRAMATTA NSW 2150"]],
    ["Level 6, 51 Jacobson St, Brisbane QLD 4000", ["LEVEL 6 51 JACOBSON ST", "BRISBANE QLD 4000"]],
    ["PO Box 37, Springvale VIC 3171", ["PO BOX 37", "SPRINGVALE VIC 3171"]],
    ["Care PO, Alice Springs NT 0870", ["CARE PO", "ALICE SPRINGS NT 0870"]],
    ["Lot 12 Smith Rd, Kalgoorlie WA 6430", ["LOT 12 SMITH RD", "KALGOORLIE WA 6430"]],
    ["RMB 1234 Sturt Hwy, Wagga Wagga NSW 2650", ["RMB 1234 STURT HWY", "WAGGA WAGGA NSW 2650"]],
    [
      "Travel World House, Level 7 17 Jones St, North Sydney NSW 2060",
      ["Travel World House", "LEVEL 7 17 JONES ST", "NORTH SYDNEY NSW 2060"],
    ],
    ["12 Smith Street North, Collingwood VIC 3066", ["12 SMITH ST N", "COLLINGWOOD VIC 3066"]],
  ])("writes %s", (input, lines) => {
    expect(formatAustraliaPost(parsed(input)).lines).toEqual(lines);
  });

  it("writes the slash form, the wide last line and the country when asked", () => {
    const address = parsed("Unit 3, 12 Smith St, Parramatta NSW 2150");
    expect(formatAustraliaPost(address, { unitStyle: "slash", wideSpacing: true, includeCountry: true })).toEqual({
      lines: ["3/12 SMITH ST", "PARRAMATTA  NSW  2150", "AUSTRALIA"],
      singleLine: "3/12 SMITH ST, PARRAMATTA  NSW  2150, AUSTRALIA",
      deliveryLine: "3/12 SMITH ST",
      lastLine: "PARRAMATTA  NSW  2150",
      country: "AU",
      format: "australia-post",
    });
  });

  it("parses what it writes back to the same address", () => {
    for (const input of ["3/12 Smith St, Parramatta NSW 2150", "Level 6, 51 Jacobson St, Brisbane QLD 4000"]) {
      const address = parsed(input);
      const again = parsed(formatAustraliaPost(address).lines.join("\n"));
      expect(compareAustralianAddresses(address, again).isSame, input).toBe(true);
    }
  });
});

describe("compareAustralianAddresses", () => {
  it("finds the slash and the written unit the same", () => {
    expect(
      compareAustralianAddresses(
        parsed("3/12 Smith Street, Parramatta NSW 2150"),
        parsed("Unit 3, 12 Smith St, PARRAMATTA, New South Wales 2150"),
      ),
    ).toEqual({ isSame: true, differences: [] });
  });

  it("lists each field that differs", () => {
    expect(
      compareAustralianAddresses(
        parsed("3/12 Smith St, Parramatta NSW 2150"),
        parsed("4/12 Smith Rd, Parramatta NSW 2151"),
      ).differences,
    ).toEqual([
      { field: "secUnitNum", first: "3", second: "4" },
      { field: "type", first: "ST", second: "RD" },
      { field: "zip", first: "2150", second: "2151" },
    ]);
  });

  it("is not the same when one is missing", () => {
    expect(
      compareAustralianAddresses(parsed("12 Smith St, Parramatta NSW 2150"), null as unknown as ParsedAddress).isSame,
    ).toBe(false);
  });
});

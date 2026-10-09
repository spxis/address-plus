import { describe, expect, it } from "vitest";

import testData from "../../../test-data/utilities/postal-regions.json";
import { getPostalPrefixesForProvince, getProvinceFromPostalCode } from "../../constants/postal-code-provinces";
import { getStateFromZip, getZipPrefixesForState } from "../../constants/zip-code-states";
import * as api from "../../index";
import { parseLocation } from "../../parser";
import { validateAddress } from "../../utils/comprehensive-validation";

const { zipToState, prefixesForState, prefixesForProvince, regionConnectors, fullStateNames, regionMismatch } =
  testData.tests;

const US_STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const CA_PROVINCE_CODES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

describe("Postal codes and their regions", () => {
  describe("getStateFromZip", () => {
    zipToState.forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(getStateFromZip(input) ?? null).toBe(expected);
      });
    });
  });

  describe("getZipPrefixesForState", () => {
    prefixesForState.forEach(({ name, input, expected, expectedLength, expectedFirst }) => {
      it(`should ${name}`, () => {
        const prefixes = getZipPrefixesForState(input);
        if (expected) expect(prefixes).toEqual(expected);
        if (expectedLength !== undefined) expect(prefixes).toHaveLength(expectedLength);
        if (expectedFirst !== undefined) expect(prefixes[0]).toBe(expectedFirst);
      });
    });

    it.each(US_STATE_CODES)("should give %s prefixes that resolve back to it", (state) => {
      const prefixes = getZipPrefixesForState(state);
      expect(prefixes.length).toBeGreaterThan(0);
      for (const prefix of prefixes) {
        const samples = prefix.length === 3 ? [`${prefix}00`, `${prefix}50`] : [prefix];
        for (const zip of samples) expect(getStateFromZip(zip)).toBe(state);
      }
    });
  });

  describe("getPostalPrefixesForProvince", () => {
    prefixesForProvince.forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(getPostalPrefixesForProvince(input)).toEqual(expected);
      });
    });

    it.each(CA_PROVINCE_CODES)("should give %s prefixes that resolve back to it", (province) => {
      const prefixes = getPostalPrefixesForProvince(province);
      expect(prefixes.length).toBeGreaterThan(0);
      for (const prefix of prefixes) {
        // A1A 1A1's shape, with the prefix laid over its start: "G" → G1A1A1, "X0A" → X0A1A1.
        expect(getProvinceFromPostalCode(prefix + "A1A1A1".slice(prefix.length))).toBe(province);
      }
    });
  });

  describe("region names containing 'and'", () => {
    regionConnectors.forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(parseLocation(input)).toMatchObject(expected);
      });
    });
  });

  describe("state names that end in another state's name", () => {
    fullStateNames.forEach(({ name, input, expected }) => {
      it(`should ${name}`, () => {
        expect(parseLocation(input)).toMatchObject(expected);
      });
    });
  });

  describe("validateAddress POSTAL_REGION_MISMATCH", () => {
    regionMismatch.forEach(({ name, input, options, expected }) => {
      it(`should ${name}`, () => {
        const result = validateAddress(input, options);
        const finding = [...result.errors, ...result.warnings].find((item) => item.code === "POSTAL_REGION_MISMATCH");
        expect(result.isValid).toBe(expected.isValid);
        expect(finding?.severity ?? null).toBe(expected.severity);
        if (expected.message) expect(finding?.message).toBe(expected.message);
      });
    });
  });

  it("should export the lookups from the package entry", () => {
    expect(api.getStateFromZip("90210")).toBe("CA");
    expect(api.getZipPrefixesForState("RI")).toEqual(["028", "029"]);
    expect(api.getPostalPrefixesForProvince("QC")).toEqual(["G", "H", "J"]);
  });
});

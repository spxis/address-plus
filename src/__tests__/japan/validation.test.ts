import { describe, expect, it } from "vitest";

import testData from "../../../test-data/japan/validation.json";
import type { ValidationOptions } from "../../types";
import { validateAddress } from "../../utils/comprehensive-validation";

interface JapaneseValidationCase {
  expected: {
    code: string | null;
    isValid: boolean;
    message?: string;
    noWarnings?: boolean;
    severity?: string;
  };
  input: string;
  name: string;
  options?: ValidationOptions;
}

// The codes only a Japanese address can produce, so a correct address can be checked for none of them.
const JAPAN_CODES = [
  "AMBIGUOUS_MUNICIPALITY",
  "INVALID_POSTAL_FORMAT",
  "MUNICIPALITY_PREFECTURE_MISMATCH",
  "POSTAL_REGION_MISMATCH",
  "UNRECOGNIZED_MUNICIPALITY",
  "UNRECOGNIZED_POSTAL_CODE",
];

const findings: JapaneseValidationCase[] = testData.tests.findings;

describe("Validating Japanese addresses", () => {
  findings.forEach(({ name, input, options, expected }) => {
    it(`should ${name}`, () => {
      const result = validateAddress(input, options);
      const all = [...result.errors, ...result.warnings];
      expect(result.isValid).toBe(expected.isValid);
      expect(result.parsedAddress?.country).toBe("JP");
      if (expected.code === null) {
        expect(all.filter((finding) => JAPAN_CODES.includes(finding.code))).toEqual([]);
      } else {
        const finding = all.find((item) => item.code === expected.code);
        expect(finding).toBeDefined();
        expect(finding?.severity).toBe(expected.severity);
        if (expected.message) expect(finding?.message).toBe(expected.message);
      }
      if (expected.noWarnings) expect(result.warnings).toEqual([]);
      expect(result.suggestions.some((suggestion) => suggestion.includes("street type"))).toBe(false);
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  formatAddress,
  formatUSPS,
  formatCanadaPost,
  getAddressAbbreviations,
} from "../../formatting/address-formatting";
import type { ParsedAddress } from "../../types";
import testData from "../../../test-data/formatting/address-formatting.json";

describe("Address Formatting API", () => {
  describe("formatAddress", () => {
    testData.formatAddress.forEach((testCase, index) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = formatAddress(testCase.input as ParsedAddress, testCase.options);
        
        if (testCase.expected.lines) {
          expect(result.lines).toEqual(testCase.expected.lines);
        }
        
        if (testCase.expected.singleLine) {
          expect(result.singleLine).toBe(testCase.expected.singleLine);
        }
        
        if ((testCase.expected as any).format) {
          expect(result.format).toBe((testCase.expected as any).format);
        }
        
        if ((testCase.expected as any).shouldNotContain) {
          expect(result.lines.join(" ")).not.toContain((testCase.expected as any).shouldNotContain);
        }
        
        if ((testCase.expected as any).shouldContain) {
          expect(result.lines.join(" ")).toContain((testCase.expected as any).shouldContain);
        }
        
        if ((testCase.expected as any).regex) {
          expect(result.lines.join(" ")).toMatch(new RegExp((testCase.expected as any).regex));
        }
      });
    });
  });

  describe("formatUSPS", () => {
    testData.formatUSPS.forEach((testCase, index) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = formatUSPS(testCase.input as ParsedAddress, testCase.options);
        
        if (testCase.expected.lines) {
          expect(result.lines).toEqual(testCase.expected.lines);
        }
        
        if ((testCase.expected as any).format) {
          expect(result.format).toBe((testCase.expected as any).format);
        }
      });
    });
  });

  describe("formatCanadaPost", () => {
    testData.formatCanadaPost.forEach((testCase, index) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = formatCanadaPost(testCase.input as ParsedAddress, testCase.options);
        
        if (testCase.expected.lines) {
          expect(result.lines).toEqual(testCase.expected.lines);
        }
        
        if ((testCase.expected as any).format) {
          expect(result.format).toBe((testCase.expected as any).format);
        }
        
        if ((testCase.expected as any).country) {
          expect(result.country).toBe((testCase.expected as any).country);
        }
        
        if ((testCase.expected as any).regex) {
          expect(result.lines.join(" ")).toMatch(new RegExp((testCase.expected as any).regex));
        }
      });
    });
  });

  describe("getAddressAbbreviations", () => {
    testData.getAddressAbbreviations.forEach((testCase, index) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = getAddressAbbreviations();
        
        if ((testCase.expected as any).hasProperties) {
          (testCase.expected as any).hasProperties.forEach((prop: string) => {
            expect(result).toHaveProperty(prop);
          });
        }
        
        if ((testCase.expected as any).streetTypes) {
          Object.keys((testCase.expected as any).streetTypes).forEach(key => {
            expect((result.streetTypes as any)[key]).toBe((testCase.expected as any).streetTypes[key]);
          });
        }
        
        if ((testCase.expected as any).directions) {
          Object.keys((testCase.expected as any).directions).forEach(key => {
            expect((result.directions as any)[key]).toBe((testCase.expected as any).directions[key]);
          });
        }
        
        if ((testCase.expected as any).states) {
          Object.keys((testCase.expected as any).states).forEach(key => {
            expect((result.states as any)[key]).toBe((testCase.expected as any).states[key]);
          });
        }
        
        if ((testCase.expected as any).provinces) {
          Object.keys((testCase.expected as any).provinces).forEach(key => {
            expect((result.provinces as any)[key]).toBe((testCase.expected as any).provinces[key]);
          });
        }
        
        if ((testCase.expected as any).unitTypes) {
          Object.keys((testCase.expected as any).unitTypes).forEach(key => {
            expect((result.unitTypes as any)[key]).toBe((testCase.expected as any).unitTypes[key]);
          });
        }
      });
    });
  });

  describe("Edge Cases", () => {
    testData.edgeCases.forEach((testCase, index) => {
      it(`should ${testCase.description} (test ${index + 1})`, () => {
        const result = formatAddress(testCase.input as ParsedAddress, testCase.options);
        
        if (testCase.expected.lines) {
          expect(result.lines).toEqual(testCase.expected.lines);
        }
        
        if (testCase.expected.singleLine !== undefined) {
          expect(result.singleLine).toBe(testCase.expected.singleLine);
        }
      });
    });
  });
});
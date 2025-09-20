// Export all types from the types directory

export type { AddressParser } from "./address-parser";
export type { BatchParseError, BatchParseOptions, BatchParseResult, BatchParseStats } from "./batch-parse";
export type { CleanAddressOptions, CleanAddressResult } from "./clean-address";
export type {
  AddressComparisonOptions,
  AddressComparisonResult,
  AddressDifference,
  AddressMatchType,
  AddressSimilarityResult,
  FuzzyMatchOptions,
} from "./comparison";
export type {
  AddressAbbreviations,
  AddressFormattingOptions,
  CanadaPostFormattingOptions,
  FormattedAddress,
  USPSFormattingOptions,
} from "./formatting";
export type { ParseOptions } from "./parse-options";
export type { ParsedAddress } from "./parsed-address";
export type { ParsedIntersection } from "./parsed-intersection";

export type { Region } from "./region";

export type { SubRegion } from "./sub-region";

export type {
  AddressComparisonTestCase,
  AddressFormattingTestCase,
  AddressParsingTestCase,
  AddressValidationTestCase,
  BatchProcessingTestCase,
  CleanAddressTestCase,
  TestCase,
  TestCaseBase,
} from "./test-schema";

export type { AddressValidationResult, ValidationError, ValidationOptions } from "./validation";

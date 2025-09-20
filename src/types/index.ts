// Export all types from the types directory

export type { AddressParser } from "./address-parser";
export type { ParsedAddress } from "./parsed-address";
export type { ParsedIntersection } from "./parsed-intersection";
export type { ParseOptions } from "./parse-options";
export type { Region } from "./region";
export type { SubRegion } from "./sub-region";
export type { 
  BatchParseOptions, 
  BatchParseError, 
  BatchParseStats, 
  BatchParseResult 
} from "./batch-parse";
export type {
  ValidationError,
  AddressValidationResult,
  ValidationOptions
} from "./validation";

export type {
  AddressFormattingOptions,
  USPSFormattingOptions,
  CanadaPostFormattingOptions,
  FormattedAddress,
  AddressAbbreviations,
} from "./formatting";

export type {
  AddressComparisonOptions,
  AddressSimilarityResult,
  AddressDifference,
  AddressMatchType,
  AddressComparisonResult,
  FuzzyMatchOptions,
} from "./comparison";

export type {
  CleanAddressOptions,
  CleanAddressResult,
} from "./clean-address";
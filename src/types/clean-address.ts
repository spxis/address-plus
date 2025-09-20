/**
 * Types for clean address string functionality
 */

import type { AddressFormattingOptions } from "./formatting";

// Clean address options
export interface CleanAddressOptions extends AddressFormattingOptions {
  format?: "standard" | "usps" | "canada-post";
  removeExtraSpaces?: boolean;
  standardizeCase?: "upper" | "lower" | "title" | "none";
  expandAbbreviations?: boolean;
}

// Clean address result
export interface CleanAddressResult {
  cleanedAddress: string;
  wasModified: boolean;
  changes: string[];
}
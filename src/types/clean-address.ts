// Types for clean address string functionality

import type { AddressFormattingOptions } from "./formatting";

// Clean address options
interface CleanAddressOptions extends AddressFormattingOptions {
  format?: "standard" | "usps" | "canada-post"; // Desired output format
  removeExtraSpaces?: boolean; // Whether to remove redundant spaces
  standardizeCase?: "upper" | "lower" | "title" | "none"; // Case standardization option
  expandAbbreviations?: boolean; // Whether to expand abbreviations to full forms
}

// Clean address result
interface CleanAddressResult {
  cleanedAddress: string; // The cleaned address string
  wasModified: boolean; // Whether any modifications were made
  changes: string[]; // List of changes made to the address
}

export type { CleanAddressOptions, CleanAddressResult };
// Types for address formatting functions

import type { ParsedAddress } from "./index";

// Address formatting options
interface AddressFormattingOptions {
  includeCountry?: boolean; // Whether to include country in formatted address
  includeSecondaryUnit?: boolean; // Whether to include unit/suite information
  upperCase?: boolean; // Whether to format in uppercase
  separator?: string; // Line separator for multi-line formatting
  abbreviateStreetTypes?: boolean; // Whether to abbreviate street types (Street -> St)
  abbreviateDirections?: boolean; // Whether to abbreviate directions (North -> N)
  abbreviateStates?: boolean; // Whether to abbreviate state/province names
  usePlusCode?: boolean; // Whether to include Plus Code in formatting
}

// USPS formatting options
interface USPSFormattingOptions {
  includeDeliveryLine?: boolean; // Whether to include delivery line
  includeLastLine?: boolean; // Whether to include city/state/ZIP line
  includeBarcode?: boolean; // Whether to include postal barcode
  standardizeCase?: boolean; // Whether to standardize case per USPS guidelines
}

// Canada Post formatting options
interface CanadaPostFormattingOptions {
  includeDeliveryLine?: boolean; // Whether to include delivery line
  includeLastLine?: boolean; // Whether to include city/province/postal line
  bilingualLabels?: boolean; // Whether to include bilingual labels
  standardizeCase?: boolean; // Whether to standardize case per Canada Post guidelines
}

// Formatted address result
interface FormattedAddress {
  lines: string[]; // Individual address lines
  singleLine: string; // Single-line representation
  deliveryLine?: string; // Street address line
  lastLine?: string; // City/state/postal line
  country?: string; // Country designation
  format: "standard" | "usps" | "canada-post" | "international"; // Formatting standard used
}

// Address component abbreviations
interface AddressAbbreviations {
  streetTypes: Record<string, string>; // Street type abbreviation mappings
  directions: Record<string, string>; // Directional abbreviation mappings
  states: Record<string, string>; // State abbreviation mappings
  provinces: Record<string, string>; // Province abbreviation mappings
  unitTypes: Record<string, string>; // Unit type abbreviation mappings
}

export type {
  AddressFormattingOptions,
  USPSFormattingOptions,
  CanadaPostFormattingOptions,
  FormattedAddress,
  AddressAbbreviations
};
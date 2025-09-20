/**
 * Types for address formatting functions
 */

import type { ParsedAddress } from "./index";

// Address formatting options
export interface AddressFormattingOptions {
  includeCountry?: boolean;
  includeSecondaryUnit?: boolean;
  upperCase?: boolean;
  separator?: string;
  abbreviateStreetTypes?: boolean;
  abbreviateDirections?: boolean;
  abbreviateStates?: boolean;
  usePlusCode?: boolean;
}

// USPS formatting options
export interface USPSFormattingOptions {
  includeDeliveryLine?: boolean;
  includeLastLine?: boolean;
  includeBarcode?: boolean;
  standardizeCase?: boolean;
}

// Canada Post formatting options
export interface CanadaPostFormattingOptions {
  includeDeliveryLine?: boolean;
  includeLastLine?: boolean;
  bilingualLabels?: boolean;
  standardizeCase?: boolean;
}

// Formatted address result
export interface FormattedAddress {
  lines: string[];
  singleLine: string;
  deliveryLine?: string;
  lastLine?: string;
  country?: string;
  format: "standard" | "usps" | "canada-post" | "international";
}

// Address component abbreviations
export interface AddressAbbreviations {
  streetTypes: Record<string, string>;
  directions: Record<string, string>;
  states: Record<string, string>;
  provinces: Record<string, string>;
  unitTypes: Record<string, string>;
}
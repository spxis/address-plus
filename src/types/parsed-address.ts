/**
 * Types for address parsing results - compatible with parse-address npm package
 */

/**
 * Parsed address result with all possible fields
 */
export interface ParsedAddress {
  /** Street number */
  number?: string;
  /** Fractional address number (e.g., 1/2 in "123 1/2 Main St") */
  fraction?: string;
  /** Directional prefix (N, S, E, W, etc.) */
  prefix?: string;
  /** Street name */
  street?: string;
  /** Street type/suffix (St, Ave, Rd, etc.) */
  type?: string;
  /** Directional suffix */
  suffix?: string;
  /** City name */
  city?: string;
  /** State/Province code */
  state?: string;
  /** ZIP or postal code */
  zip?: string;
  /** Extended ZIP+4 code */
  plus4?: string;
  /** Secondary unit type (apt, suite, etc.) */
  sec_unit_type?: string;
  /** Secondary unit number */
  sec_unit_num?: string;
  /** Detected country (US, CA) */
  country?: "CA" | "US";
  /** Facility name (e.g., building name, complex name) */
  facility?: string;
  /** Rural route or similar */
  rural_route?: string;
  /** Site or compartment number */
  site?: string;
  /** General delivery indicator */
  general_delivery?: boolean;
  /** Legacy properties for backward compatibility */
  secondary?: string;
  unit?: string;
  zipext?: string;
}
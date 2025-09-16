/**
 * Types for address parsing results
 */
export interface ParsedAddress {
  /** Street number */
  number?: string;
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
  zipext?: string;
  /** Apartment, unit, or suite number */
  unit?: string;
  /** Building or facility name */
  facility?: string;
  /** Country (US or CA) */
  country?: 'US' | 'CA';
  /** Secondary address info (floor, apt, etc.) */
  secondary?: string;
  /** Address line as parsed for secondary info */
  sec_unit_type?: string;
  /** Secondary unit number */
  sec_unit_num?: string;
}

/**
 * Configuration options for address parsing
 */
export interface ParseOptions {
  /** Country to optimize parsing for */
  country?: 'US' | 'CA' | 'auto';
  /** Whether to normalize street types and directions */
  normalize?: boolean;
  /** Whether to validate postal/ZIP codes */
  validatePostalCode?: boolean;
  /** Language preference for bilingual parsing (Canada) */
  language?: 'en' | 'fr' | 'auto';
  /** Whether to extract facility names */
  extractFacilities?: boolean;
  /** Whether to parse parenthetical information */
  parseParenthetical?: boolean;
}

/**
 * Result from intersection parsing
 */
export interface ParsedIntersection {
  /** First street */
  street1?: string;
  /** First street type */
  type1?: string;
  /** First street prefix */
  prefix1?: string;
  /** First street suffix */
  suffix1?: string;
  /** Second street */
  street2?: string;
  /** Second street type */
  type2?: string;
  /** Second street prefix */
  prefix2?: string;
  /** Second street suffix */
  suffix2?: string;
  /** City */
  city?: string;
  /** State/Province */
  state?: string;
  /** ZIP/Postal code */
  zip?: string;
  /** Country */
  country?: 'US' | 'CA';
}

/**
 * Address parser interface for API compatibility
 */
export interface AddressParser {
  parseLocation(address: string, options?: ParseOptions): ParsedAddress | null;
  parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null;
  parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null;
  parseAddress(address: string, options?: ParseOptions): ParsedAddress | null;
}
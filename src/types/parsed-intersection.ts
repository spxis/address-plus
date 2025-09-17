/**
 * Result from intersection address parsing
 */

/**
 * Parsed intersection result containing two streets and location info
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
  /** Extended ZIP+4 code */
  zipext?: string;
  /** Country */
  country?: "CA" | "US";
}
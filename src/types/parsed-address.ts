// Parsed address result with all possible fields
interface ParsedAddress {
  city?: string; // City name
  country?: "CA" | "US"; // Detected country (US, CA)
  fraction?: string; // Fractional address number (e.g., 1/2 in "123 1/2 Main St")
  generalDelivery?: boolean; // General delivery indicator
  locality?: string; // Sub-city locality (borough, district, neighborhood)
  number?: string; // Street number
  place?: string; // Place name (landmark, POI, building, monument, etc.)
  plus4?: string; // Extended ZIP+4 code
  postalValid?: boolean; // Postal code validation status
  postalType?: "zip" | "postal"; // Postal code type (zip or postal)
  prefix?: string; // Directional prefix (N, S, E, W, etc.)
  rpo?: string; // Retail Postal Outlet (Canada Post) identifier
  rr?: string; // Rural Route number (RR/R.R.)
  ruralRoute?: string; // Rural route or similar
  secUnitNum?: string; // Secondary unit number
  secUnitType?: string; // Secondary unit type (apt, suite, etc.)
  secondary?: string; // Legacy properties for backward compatibility
  site?: string; // Site or compartment number
  state?: string; // State/Province code
  station?: string; // Station or Succursale identifier (e.g., Station A, Succ. Centre-ville)
  street?: string; // Street name
  suffix?: string; // Directional suffix
  type?: string; // Street type/suffix (St, Ave, Rd, etc.)
  unit?: string; // Legacy unit property for backward compatibility
  zip?: string; // ZIP or postal code
  zipValid?: boolean; // ZIP/postal code format validation (true if format is valid)
}

export type { ParsedAddress };
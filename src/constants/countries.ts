/**
 * Country codes used in address parsing
 */

// Country codes used in address parsing
export const COUNTRIES = {
  CANADA: 'CA',
  UNITED_STATES: 'US'
} as const;

// Type for country codes
export type CountryCode = typeof COUNTRIES[keyof typeof COUNTRIES];
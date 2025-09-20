// Country codes used in address parsing

// Country codes used in address parsing
const COUNTRIES = {
  CANADA: "CA",
  UNITED_STATES: "US",
} as const;

// Type for country codes
type CountryCode = (typeof COUNTRIES)[keyof typeof COUNTRIES];

export { COUNTRIES };
export type { CountryCode };

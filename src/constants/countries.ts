// Country codes used in address parsing

/**
 * The country codes the parser reports: `US`, `CA` and `JP`.
 *
 * @example
 * ```ts
 * COUNTRIES.JAPAN
 * // → "JP"
 * ```
 */
const COUNTRIES = {
  CANADA: "CA",
  JAPAN: "JP",
  UNITED_STATES: "US",
} as const;

/**
 * A country code the parser reports: `US`, `CA` or `JP`.
 *
 * @example
 * ```ts
 * parseLocation("100 Queen St W, Toronto, ON M5H 2N2")?.country
 * // → "CA"
 * ```
 */
type CountryCode = (typeof COUNTRIES)[keyof typeof COUNTRIES];

export { COUNTRIES };
export type { CountryCode };

// A country beyond the US, Canada and Japan comes as a module of its own, from its own entry point, so it costs only
// the callers who import it. The core knows nothing about any of them: it only asks a module handed to it whether an
// address is its country's, and hands the address over.

import type { FormattedAddress } from "./formatting";
import type { ParseOptions } from "./parse-options";
import type { ParsedAddress } from "./parsed-address";
import type { ValidationError, ValidationOptions } from "./validation";

/**
 * What a country module's validator returns: the errors and the warnings it found.
 *
 * @example
 * ```ts
 * validateAustralianAddress(parseAustralianAddress("1 Main St, Sydney VIC 2000")).warnings.map((one) => one.code)
 * // → ["POSTAL_REGION_MISMATCH"]
 * ```
 */
interface CountryValidation {
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * One way two addresses differ, as a country module's comparer reports it: the field, and its value in each address
 * after both were put in the same form.
 *
 * @example
 * ```ts
 * compareUKAddresses(parseUKAddress("10 High Street, Bath BA1 1AA"), parseUKAddress("12 High St, Bath BA1 1AA")).differences
 * // → [{"field":"number","first":"10","second":"12"}]
 * ```
 */
interface CountryDifference {
  field: string;
  first?: string;
  second?: string;
}

/**
 * What a country module's comparer returns: whether the two addresses are the same delivery point, and every field
 * that differs once both are in the same form (letter case, punctuation, a street type written out or abbreviated).
 *
 * @example
 * ```ts
 * compareAustralianAddresses(parseAustralianAddress("3/12 Smith Street, Parramatta NSW 2150"), parseAustralianAddress("Unit 3, 12 Smith St, PARRAMATTA NSW 2150")).isSame
 * // → true
 * ```
 */
interface CountryComparison {
  isSame: boolean;
  differences: CountryDifference[];
}

/**
 * A country's address module: its codes, how to tell its addresses apart, and its parser, validator, formatter and
 * comparer. Import one from its entry point (`australia` from `@johnmorrisdotca/address-plus/au`, `unitedKingdom` from
 * `@johnmorrisdotca/address-plus/gb`) and hand it to `parseLocation` and `validateAddress` in `countries`.
 *
 * @example
 * ```ts
 * australia.codes
 * // → ["AU"]
 * ```
 */
interface CountryModule {
  code: string; // The country's ISO 3166-1 code: AU, GB
  codes: readonly string[]; // Every country code the module reads; GB also reads Jersey (JE), Guernsey (GY) and the Isle of Man (IM)
  name: string; // The country's name in English
  detect(address: string): boolean; // Whether the address is surely this country's, with no hint
  parse(address: string, options?: ParseOptions): ParsedAddress | null;
  validate(address: ParsedAddress, options?: ValidationOptions): CountryValidation;
  format(address: ParsedAddress): FormattedAddress;
  compare(first: ParsedAddress, second: ParsedAddress): CountryComparison;
}

export type { CountryComparison, CountryDifference, CountryModule, CountryValidation };

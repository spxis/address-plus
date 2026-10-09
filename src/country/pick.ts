// Which country module, of those a caller handed in, reads an address. This is the whole of what the core knows about
// country modules, so a country costs the core nothing until a caller imports it.

import type { CountryModule } from "../types/country-module";

// The countries the core reads itself, so a hint naming one never looks for a module.
const CORE_COUNTRIES = new Set(["CA", "US", "JP", "auto"]);

// The module that reads an address: the one whose code the hint names, or, with no hint, the first whose own
// detection is sure of it. A hint naming a country no module was given for is a mistake in the call, and says so.
function pickCountryModule(
  address: string,
  country: string | undefined,
  countries: readonly CountryModule[] | undefined,
): CountryModule | undefined {
  if (country !== undefined && !CORE_COUNTRIES.has(country)) {
    const named = countries?.find((module) => module.codes.includes(country));
    if (named) return named;
    throw new TypeError(
      `address-plus reads ${country} addresses with its country module: pass it in countries, for example ` +
        `{ country: "AU", countries: [australia] } with australia from "@johnmorrisdotca/address-plus/au"`,
    );
  }
  if (country !== undefined && country !== "auto") return undefined;

  return countries?.find((module) => module.detect(address));
}

export { pickCountryModule };

// Japanese addresses on their own: import "@johnmorrisdotca/address-plus/jp" for the parser, the
// formatters, the validator and the tables, without the US and Canadian parser.

export {
  JP_DESIGNATED_CITIES,
  JP_MUNICIPALITIES,
  JP_POSTAL_EXCEPTIONS,
  JP_POSTAL_PREFIXES,
  JP_PREFECTURES,
  findMunicipalitiesByName,
  findMunicipalitiesByRomaji,
  findMunicipalityByCode,
  findPrefecture,
  getPostalPrefixesForPrefecture,
  getPrefectureFromJapanesePostalCode,
  municipalitiesOf,
} from "../constants/jp";
export type { JapaneseAddressFields, JapaneseMunicipality, JapanesePrefecture } from "../types/japan";
export type { ParseOptions } from "../types/parse-options";
export type { ParsedAddress } from "../types/parsed-address";
export type { ValidationError, ValidationOptions } from "../types/validation";
export { formatJapanese, formatJapaneseEnglish } from "./format";
export type { JapaneseEnglishFormattingOptions, JapaneseFormattingOptions } from "./format";
export { kanjiNumeralsToDigits, normalizeJapaneseAddressText } from "./normalize";
export { looksJapanese, parseJapaneseAddress } from "./parse";
export { validateJapaneseAddress } from "./validate";
export type { JapaneseValidation } from "./validate";

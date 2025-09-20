// Export all data constants from organized modules
// Provides centralized access to all address parsing data structures

export { 
  CA_PROVINCES, 
  CA_REGIONS, 
  CA_PROVINCE_NAMES, 
  CA_PROVINCE_NAMES_EN, 
  CA_PROVINCE_NAMES_FR, 
  CA_PROVINCE_ALTERNATIVES,
  PROVINCE_EXPANSIONS,
  PROVINCE_EXPANSIONS_EN,
  PROVINCE_EXPANSIONS_FR
} from "./ca-provinces";
export { CA_STREET_TYPES } from "./ca-street-types";
export { DIRECTIONAL_MAP, DIRECTION_EXPANSIONS } from "./directionals";
export { FACILITY_PATTERNS, FACILITY_DELIMITER_PATTERN } from "../patterns/facility";
export { validatePostalCode } from "../utils/postal-validation";
export type { PostalValidationResult } from "../utils/postal-validation";
export { 
  ZIP_CODE_PATTERN,
  CANADIAN_POSTAL_CODE_PATTERN,
  CANADIAN_POSTAL_LIBERAL_PATTERN,
  ZIP_CODE_REGEX_PATTERN
} from "../patterns/postal";
export { 
  SECONDARY_UNIT_PATTERN, 
  STREET_TYPE_DETECTION_PATTERN,
  UNIT_TYPE_NUMBER_PATTERN,
  UNIT_TYPE_KEYWORDS,
  WRITTEN_NUMBERS,
  PARENTHETICAL_PATTERN 
} from "../patterns/address";
export { SECONDARY_UNIT_TYPES, UNIT_TYPE_EXPANSIONS } from "./secondary-unit-types";
export { 
  US_REGIONS, 
  US_STATES, 
  US_STATE_NAMES, 
  US_STATE_ALTERNATIVES,
  US_STATE_EXPANSIONS
} from "./us-states";
export { US_STREET_TYPES, STREET_TYPE_EXPANSIONS } from "./us-street-types";
export { STREET_TYPE_PROPER_CASE } from "./street-type-proper-case";
export { FRENCH_PREPOSITIONS } from "./french-prepositions";
export { STREET_NAME_ACRONYMS } from "./street-name-acronyms";
export { COUNTRIES } from "./countries";
export type { CountryCode } from "./countries";
export { VALIDATION_PATTERNS } from "../patterns/validation-patterns";
export { CITY_PATTERNS } from "../patterns/city-patterns";
export { PO_BOX_PATTERNS, INTERSECTION_PATTERNS, COMMON_PARSER_PATTERNS } from "./parser-patterns";
export { STATE_NAME_TO_ABBREVIATION } from "./state-mappings";
export { 
  COMMON_STREET_NAMES_PATTERN,
  GENERAL_DELIVERY_PATTERNS,
  ZIP_VALIDATION_PATTERNS,
  FACILITY_DELIMITER_PATTERNS,
  ISLAND_TYPE_PATTERN,
  CONNECTOR_WORDS
} from "../patterns/general-patterns";
export { 
  POSTAL_CODE_TO_PROVINCE, 
  TERRITORY_POSTAL_RANGES,
  getProvinceFromPostalCode 
} from "./postal-code-provinces";
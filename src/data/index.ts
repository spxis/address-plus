/**
 * Export all data constants from organized modules
 */

export { 
  CA_PROVINCES, 
  CA_REGIONS, 
  CA_PROVINCE_NAMES, 
  CA_PROVINCE_NAMES_EN, 
  CA_PROVINCE_NAMES_FR, 
  CA_PROVINCE_ALTERNATIVES 
} from "./ca-provinces";
export { CA_STREET_TYPES } from "./ca-street-types";
export { DIRECTIONAL_MAP } from "./directionals";
export { FACILITY_PATTERNS, FACILITY_DELIMITER_PATTERN } from "../patterns/facility";
export { ZIP_CODE_PATTERN, validatePostalCode } from "../validation";
export type { PostalValidationResult } from "../validation";
export { CANADIAN_POSTAL_CODE_PATTERN } from "../patterns/postal";
export { 
  SECONDARY_UNIT_PATTERN, 
  UNIT_TYPE_NUMBER_PATTERN,
  UNIT_TYPE_KEYWORDS,
  WRITTEN_NUMBERS,
  PARENTHETICAL_PATTERN 
} from "../patterns/address";
export { CANADIAN_POSTAL_LIBERAL_PATTERN } from "../validation";
export { SECONDARY_UNIT_TYPES } from "./secondary-unit-types";
export { 
  US_REGIONS, 
  US_STATES, 
  US_STATE_NAMES, 
  US_STATE_ALTERNATIVES 
} from "./us-states";
export { US_STREET_TYPES } from "./us-street-types";
export { STREET_TYPE_PROPER_CASE } from "./street-type-proper-case";
export { FRENCH_PREPOSITIONS } from "./french-prepositions";
export { STREET_NAME_ACRONYMS } from "./street-name-acronyms";
export { 
  POSTAL_CODE_TO_PROVINCE, 
  TERRITORY_POSTAL_RANGES,
  getProvinceFromPostalCode 
} from "./postal-code-provinces";
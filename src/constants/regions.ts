import { CA_REGIONS } from "./ca-provinces.js";
import { US_REGIONS } from "./us-states.js";

// Combined regions data for fuzzy matching

// Array containing all regions (US states/territories and Canadian provinces/territories)
// for unified fuzzy matching across North America
const REGIONS = [...US_REGIONS, ...CA_REGIONS];

export { REGIONS };
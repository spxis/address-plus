import type { Region } from "../types/region.js";

// Canadian provinces and territories mapping

// Official Canadian province and territory names in English mapped to their abbreviations
const CA_PROVINCE_NAMES_EN: Record<string, string> = {
  alberta: "AB",
  "british columbia": "BC",
  manitoba: "MB",
  "new brunswick": "NB",
  "newfoundland and labrador": "NL",
  "northwest territories": "NT",
  "nova scotia": "NS",
  nunavut: "NU",
  ontario: "ON",
  "prince edward island": "PE",
  quebec: "QC",
  saskatchewan: "SK",
  yukon: "YT",
};

// Official Canadian province and territory names in French mapped to their abbreviations
const CA_PROVINCE_NAMES_FR: Record<string, string> = {
  alberta: "AB", // Same in French
  "colombie-britannique": "BC",
  manitoba: "MB", // Same in French
  "nouveau-brunswick": "NB",
  "terre-neuve-et-labrador": "NL",
  "territoires du nord-ouest": "NT",
  "nouvelle-écosse": "NS",
  nunavut: "NU", // Same in French (Inuktitut origin)
  ontario: "ON", // Same in French
  "île-du-prince-édouard": "PE",
  québec: "QC",
  saskatchewan: "SK", // Same in French (Cree origin)
  yukon: "YT", // Same in French
};

// Combined official Canadian province and territory names (English and French)
const CA_PROVINCE_NAMES: Record<string, string> = {
  ...CA_PROVINCE_NAMES_EN,
  ...CA_PROVINCE_NAMES_FR,
};

// Common shortened forms, abbreviations, and alternative names for Canadian provinces
const CA_PROVINCE_ALTERNATIVES: Record<string, string> = {
  // Alberta
  alb: "AB",
  alta: "AB",

  // Manitoba
  man: "MB",

  // Newfoundland and Labrador
  newfoundland: "NL",
  labrador: "NL",
  "terre-neuve": "NL",
  "terre neuve": "NL",
  "terre neuve et labrador": "NL",
  tnl: "NL",

  // Northwest Territories
  northwest: "NT",
  territories: "NT",
  territoires: "NT",
  nwt: "NT",
  "tn-o": "NT",

  // Nunavut
  nvt: "NU",

  // Ontario
  ont: "ON",

  // Prince Edward Island
  pei: "PE",
  "prince edward": "PE",
  "ile-du-prince-édouard": "PE", // without circumflex
  "île du prince édouard": "PE", // without hyphens
  "ile du prince édouard": "PE", // without circumflex or hyphens
  îpé: "PE",

  // Saskatchewan
  sask: "SK",
};

// Combined mapping of all Canadian province names and alternatives to their abbreviations
const CA_PROVINCES: Record<string, string> = {
  ...CA_PROVINCE_NAMES,
  ...CA_PROVINCE_ALTERNATIVES,
};

// Array of Canadian provinces and territories as Region objects for fuzzy matching
const CA_REGIONS: Region[] = Object.entries(CA_PROVINCES).map(([name, abbr]) => ({
  abbr,
  country: "CA",
  name,
}));

// Canadian province expansions (reverse mapping from abbreviations to full names)
// Supports both English and French province names
const PROVINCE_EXPANSIONS_EN: Record<string, string> = Object.fromEntries(
  Object.entries(CA_PROVINCE_NAMES_EN).map(([name, abbr]) => [abbr.toLowerCase(), name]),
);

const PROVINCE_EXPANSIONS_FR: Record<string, string> = Object.fromEntries(
  Object.entries(CA_PROVINCE_NAMES_FR).map(([name, abbr]) => [abbr.toLowerCase(), name]),
);

// Combined expansions - defaults to English but includes French options
const PROVINCE_EXPANSIONS: Record<string, string> = {
  ...PROVINCE_EXPANSIONS_EN,
  // Add French alternatives with _fr suffix for explicit French usage
  ...Object.fromEntries(Object.entries(PROVINCE_EXPANSIONS_FR).map(([abbr, name]) => [`${abbr}_fr`, name])),
};

export {
  CA_PROVINCE_ALTERNATIVES,
  CA_PROVINCE_NAMES,
  CA_PROVINCE_NAMES_EN,
  CA_PROVINCE_NAMES_FR,
  CA_PROVINCES,
  CA_REGIONS,
  PROVINCE_EXPANSIONS,
  PROVINCE_EXPANSIONS_EN,
  PROVINCE_EXPANSIONS_FR,
};

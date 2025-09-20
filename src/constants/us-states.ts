import type { Region } from "../types/region.js";
import { CA_PROVINCE_NAMES, CA_PROVINCE_ALTERNATIVES } from "./ca-provinces.js";

// US States and territories mapping

// Official US state and territory names mapped to their abbreviations
const US_STATE_NAMES: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  "american samoa": "AS",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  "district of columbia": "DC",
  florida: "FL",
  georgia: "GA",
  guam: "GU",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  "northern mariana islands": "MP",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "puerto rico": "PR",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  "virgin islands": "VI",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

// Common shortened forms, abbreviations, and alternative names for US states
const US_STATE_ALTERNATIVES: Record<string, string> = {
  // Alabama
  ala: "AL",
  bama: "AL",
  
  // Arizona
  ariz: "AZ",
  
  // Arkansas
  ark: "AR",
  
  // California
  cal: "CA",
  cali: "CA",
  calif: "CA",
  
  // Colorado
  colo: "CO",
  
  // Connecticut
  conn: "CT",
  
  // Delaware
  del: "DE",
  
  // District of Columbia
  dc: "DC",
  
  // Florida
  fla: "FL",
  
  // Illinois
  ill: "IL",
  
  // Indiana
  ind: "IN",
  
  // Kansas
  kan: "KS",
  kans: "KS",
  
  // Kentucky
  ky: "KY",
  kent: "KY",
  
  // Louisiana
  la: "LA",
  lou: "LA",
  
  // Massachusetts
  mass: "MA",
  
  // Michigan
  mich: "MI",
  
  // Minnesota
  minn: "MN",
  
  // Mississippi
  miss: "MS",
  
  // Missouri
  mo: "MO",
  
  // Montana
  mont: "MT",
  
  // Nebraska
  neb: "NE",
  nebr: "NE",
  
  // Nevada
  nev: "NV",
  
  // New Hampshire
  "new hamp": "NH",
  "new hampsh": "NH",
  
  // New Jersey
  "new jers": "NJ",
  
  // New Mexico
  "new mex": "NM",
  "new mexic": "NM",
  
  // North Carolina
  "n carolina": "NC",
  "north car": "NC",
  
  // North Dakota
  "n dakota": "ND",
  "north dak": "ND",
  
  // Oklahoma
  okla: "OK",
  
  // Oregon
  ore: "OR",
  oreg: "OR",
  
  // Pennsylvania
  penn: "PA",
  pa: "PA",
  penna: "PA",
  pennsyl: "PA",
  
  // Rhode Island
  "rhode isl": "RI",
  
  // South Carolina
  "s carolina": "SC",
  "south car": "SC",
  
  // South Dakota
  "s dakota": "SD",
  "south dak": "SD",
  
  // Tennessee
  tenn: "TN",
  
  // Texas
  tex: "TX",
  
  // Vermont
  vt: "VT",
  
  // Virginia
  va: "VA",
  virg: "VA",
  
  // Washington
  wash: "WA",
  
  // West Virginia
  "west va": "WV",
  "west virg": "WV",
  
  // Wisconsin
  wis: "WI",
  wisc: "WI",
  
  // Wyoming
  wyo: "WY",
};

// Combined mapping of all US state names and alternatives to their abbreviations
const US_STATES: Record<string, string> = {
  ...US_STATE_NAMES,
  ...US_STATE_ALTERNATIVES,
};

// Array of US states and territories as Region objects for fuzzy matching
const US_REGIONS: Region[] = Object.entries(US_STATES).map(([name, abbr]) => ({
  abbr,
  country: "US",
  name,
}));

// US state expansions (reverse mapping from abbreviations to full names)
const US_STATE_EXPANSIONS: Record<string, string> = Object.fromEntries(
  Object.entries(US_STATE_NAMES).map(([name, abbr]) => [abbr.toLowerCase(), name])
);

// Combined US and Canadian state/province normalization function
// Converts full state/province names to standard abbreviations (lowercase output)
function normalizeStateProvinceName(stateName: string): string | undefined {
  const normalizedInput = stateName.toLowerCase().replace(/\./g, "").trim();
  
  // Check US states first (convert to lowercase to match existing usage)
  const usState = US_STATES[normalizedInput];
  if (usState) {
    return usState.toLowerCase();
  }
  
  // Check Canadian provinces (convert to lowercase to match existing usage)
  const caProvince = CA_PROVINCE_NAMES[normalizedInput] || CA_PROVINCE_ALTERNATIVES[normalizedInput];
  if (caProvince) {
    return caProvince.toLowerCase();
  }
  
  return undefined;
}

export { US_REGIONS, US_STATES, US_STATE_NAMES, US_STATE_ALTERNATIVES, US_STATE_EXPANSIONS, normalizeStateProvinceName };
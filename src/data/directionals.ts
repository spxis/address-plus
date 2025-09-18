/**
 * Directional abbreviations for US and Canadian addresses
 */

/**
 * Mapping of directional words to their standard abbreviations
 * Supports both English and French (for Canada)
 */
const DIRECTIONAL_MAP: Record<string, string> = {
  // English
  east: "E",
  north: "N",
  northeast: "NE",
  northwest: "NW",
  south: "S",
  southeast: "SE",
  southwest: "SW",
  west: "W",
  
  // Short forms
  e: "E",
  n: "N",
  ne: "NE",
  nw: "NW",
  s: "S",
  se: "SE",
  sw: "SW",
  w: "W",

  // Dotted forms (common in formal addresses)
  "e.": "E",
  "n.": "N",
  "n.e.": "NE",
  "ne.": "NE",
  "n.w.": "NW",
  "nw.": "NW",
  "s.": "S",
  "s.e.": "SE",
  "se.": "SE",
  "s.w.": "SW",
  "sw.": "SW",
  "w.": "W",
  // Canadian dotted forms sometimes use uppercase with periods
  "E.": "E",
  "N.": "N",
  "S.": "S",
  "W.": "W",
  "S.E.": "SE",
  "S.W.": "SW",
  "N.E.": "NE",
  "N.W.": "NW",

  // French (for Canada)
  est: "E",
  nord: "N",
  "nord-est": "NE",
  "nord-ouest": "NW",
  // For French Canadian usage, use "O" (Ouest)
  ouest: "O",
  o: "O", // French abbreviation for ouest
  sud: "S",
  "sud-est": "SE",
  "sud-ouest": "SW",
  // French dotted forms (different from English)
  "o.": "O", // Ouest
  // Variants with hyphens and dots like "N.-O." (Nord-Ouest) and "S.-E."
  "n.-o.": "NW",
  "n.-e.": "NE",
  "s.-o.": "SW",
  "s.-e.": "SE",
  "N.-O.": "NW",
  "N.-E.": "NE",
  "S.-O.": "SW",
  "S.-E.": "SE",
};

export { DIRECTIONAL_MAP };
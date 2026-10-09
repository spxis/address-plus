// Finding where the street ends and the city begins when no comma says so.
//
// "1600 Amphitheatre Pkwy Mountain View" has a street type in the city (View) and "8605 Sycamore St Salt
// Lake City" a type in the city (Lake), so neither the last word nor the last type marks the edge. The
// street ends at its first type that is followed by something that can be a city: a word that does not
// itself continue the street. A directional and a unit may sit between the type and the city.

import { DIRECTIONAL_MAP } from "../constants/directionals";
import { STANDALONE_UNIT_KEYWORDS, UNIT_SEPARATOR, UNIT_TYPE_KEYWORDS, UNIT_VALUE } from "../patterns/address-patterns";
import { buildPatterns } from "../patterns/pattern-builder";

// What a street line and a city came to.
interface StreetAndCity {
  street: string; // The street line: number, directionals, name, type, unit
  city: string; // The city, or "" when none could be told apart
}

// The common types that a street continues with. A candidate city starting with one of these is the rest
// of the street ("Mill Creek Rd": Creek is a type, but "Rd Springfield" is not a city).
const STRONG_TYPES = new Set([
  "st",
  "street",
  "ave",
  "av",
  "avenue",
  "rd",
  "road",
  "dr",
  "drive",
  "ln",
  "lane",
  "blvd",
  "boulevard",
  "ct",
  "court",
  "pl",
  "place",
  "hwy",
  "highway",
  "pkwy",
  "parkway",
  "cir",
  "circle",
  "ter",
  "terrace",
  "trl",
  "trail",
  "cres",
  "crescent",
  "sq",
  "square",
]);

// Saint at the start of a city: "St. John's", "Ste-Foy". Not a street type in that place.
const SAINT = /^(?:st|ste|saint|sainte)\.?$/i;

// French particles between a leading French type and its name: "chemin de la Côte", "rue des Jardins".
const FRENCH_PARTICLE = /^(?:de|du|des|la|le|les|d'|l')$/i;

const NUMBER_TOKEN = /^(?:\d+[A-Za-z]?(?:[-/]\d*[A-Za-z0-9]+)?|[A-Za-z]\d+[A-Za-z]\d+|#?\d+-\d+)$/;
const FRACTION_TOKEN = /^\d+\/\d+$/;

let cachedTypes: RegExp | null = null;
let cachedDirectional: RegExp | null = null;
let cachedUnitStart: RegExp | null = null;
let cachedStandaloneUnit: RegExp | null = null;

function typeWord(): RegExp {
  cachedTypes ??= new RegExp(`^(?:${buildPatterns().streetType.slice(1, -1)})\\.?$`, "iu");
  return cachedTypes;
}

function directionalWord(): RegExp {
  cachedDirectional ??= new RegExp(
    `^(?:${Object.keys(DIRECTIONAL_MAP)
      .sort((a, b) => b.length - a.length)
      .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})\\.?$`,
    "iu",
  );
  return cachedDirectional;
}

// A unit and its value at the start of the given text; the match is what the unit took.
function unitStart(): RegExp {
  cachedUnitStart ??= new RegExp(`^(?:(?:${UNIT_TYPE_KEYWORDS})${UNIT_SEPARATOR}${UNIT_VALUE}|#\\s*[a-z0-9-]+)`, "iu");
  return cachedUnitStart;
}

function standaloneUnit(): RegExp {
  cachedStandaloneUnit ??= new RegExp(`^(?:${STANDALONE_UNIT_KEYWORDS})\\.?$`, "iu");
  return cachedStandaloneUnit;
}

// How many words a unit at position index takes (0 when there is none).
function unitWordsAt(words: string[], index: number): number {
  const rest = words.slice(index).join(" ");
  const match = rest.match(unitStart());
  if (!match) {
    return words[index] && standaloneUnit().test(words[index]) ? 1 : 0;
  }
  return match[0].trim().split(/\s+/).length;
}

// How strictly a candidate city is judged: "any" refuses one that starts with any street type, "strong"
// only one that starts with a common type, and "none" refuses neither.
type Strictness = "any" | "strong" | "none";

// Whether the words from index on can be a city: at least one word, no digits, and not the street going on.
function canBeCity(words: string[], index: number, strictness: Strictness): boolean {
  if (index >= words.length) return false;
  if (words.slice(index).some((word: string) => /\d/.test(word))) return false;
  if (SAINT.test(words[index]) && index < words.length - 1) return true;
  const first = words[index].replace(/\.$/, "").toLowerCase();
  if (strictness === "strong" && STRONG_TYPES.has(first)) return false;
  if (strictness === "any" && typeWord().test(words[index])) return false;
  return true;
}

// Skip a route number, a directional, then a unit, after position index; return where the city would start.
function skipSuffixAndUnit(words: string[], index: number): number {
  let next = index;
  // "State Highway 116 Sebastopol": the number belongs to the road.
  if (next < words.length - 1 && /^\d+[A-Za-z]?$/.test(words[next])) next += 1;
  if (next < words.length - 1 && directionalWord().test(words[next])) next += 1;
  const unitWords = unitWordsAt(words, next);
  return next + unitWords;
}

// Split a street line with the city run on after it. canadian allows a French type before the name.
function splitStreetAndCity(text: string, canadian: boolean): StreetAndCity {
  const words = text.trim().split(/\s+/);
  const none: StreetAndCity = { city: "", street: text.trim() };

  // Past the number, a fraction and a predirectional.
  let start = 0;
  if (words[start] && (NUMBER_TOKEN.test(words[start]) || /^#/.test(words[start]))) start += 1;
  if (words[start] && FRACTION_TOKEN.test(words[start])) start += 1;
  if (start < words.length - 1 && directionalWord().test(words[start]) && !typeWord().test(words[start + 1] ?? "")) {
    start += 1;
  }
  if (start >= words.length) return none;

  const split = (cityStart: number): StreetAndCity => ({
    city: words.slice(cityStart).join(" "),
    street: words.slice(0, cityStart).join(" "),
  });

  // A grid street, "2200 W": the city follows its directional and any unit.
  if (/^\d+$/.test(words[start]) && words[start + 1] && directionalWord().test(words[start + 1])) {
    const cityStart = start + 2 + unitWordsAt(words, start + 2);
    return canBeCity(words, cityStart, "none") ? split(cityStart) : none;
  }

  // A French type first, Canada Post's order: "rue des Jardins Québec", "chemin de la Côte-Sainte-Catherine".
  if (canadian && typeWord().test(words[start]) && start + 1 < words.length) {
    let next = start + 1;
    while (next < words.length - 1 && FRENCH_PARTICLE.test(words[next])) next += 1;
    // "d'Youville" carries its particle on the word itself.
    next += 1;
    const cityStart = skipSuffixAndUnit(words, next);
    if (canBeCity(words, cityStart, "none")) return split(cityStart);
  }

  // The first type, after at least one word of name, that a city can follow. A city that starts with a
  // type is first taken for more street ("University Square Mall Tampa"); if every candidate is refused
  // that way, only the common types refuse ("Amphitheatre Pkwy Mountain View": Mountain and View are types).
  const typeAt: number[] = [];
  for (let index = start + 1; index < words.length; index += 1) {
    if (typeWord().test(words[index])) typeAt.push(index);
  }
  for (const strictness of ["any", "strong"] as Strictness[]) {
    for (const index of typeAt) {
      const cityStart = skipSuffixAndUnit(words, index + 1);
      if (canBeCity(words, cityStart, strictness)) return split(cityStart);
    }
  }
  if (typeAt.length > 0) return none;

  // No type at all: a unit ends the street ("2200 W Apt D304 Park City" is handled above), and otherwise
  // the street is one word and the city the rest ("123 Maple Rochester", "115 Broadway San Francisco").
  for (let index = start + 1; index < words.length; index += 1) {
    const unitWords = unitWordsAt(words, index);
    if (unitWords > 0 && !standaloneUnit().test(words[index])) {
      const cityStart = index + unitWords;
      return canBeCity(words, cityStart, "none") ? split(cityStart) : none;
    }
  }
  if (words.length - start >= 2 && canBeCity(words, start + 1, "none")) {
    return split(start + 1);
  }

  return none;
}

export { splitStreetAndCity };
export type { StreetAndCity };

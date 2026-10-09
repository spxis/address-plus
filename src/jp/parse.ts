// Parsing a Japanese address, written in Japanese or in romaji, into one set of fields.
//
// Japanese order runs from the largest part to the smallest: postal code, prefecture, municipality,
// town, then the block as 丁目 (chome), 番 (ban) and 号 (go), then a building, floor and room.
// English order runs the other way, comma-separated, with the block written 1-2-3 before the town.
// Both end up in the same ParsedAddress: the Japan-specific fields, plus the shared ones so that
// formatting, comparison and validation treat the result like any other address.

import type { JapaneseMunicipality, JapanesePrefecture } from "../types/japan";
import type { ParsedAddress } from "../types/parsed-address";
import type { ParseOptions } from "../types/parse-options";
import { toSnakeCase } from "../utils/case-converter";
import {
  findMunicipalitiesByRomaji,
  findPrefecture,
  municipalityAtStart,
  prefectureAtStart,
  prefectureShortRomaji,
} from "../constants/jp";
import { hasJapaneseScript, normalizeJapaneseAddressText } from "./normalize";

const POSTAL_CODE = /(?<!\d)(\d{3})-?(\d{4})(?!\d)/;
const COUNTRY_WORD = /^(?:日本国?|japan)\s*/i;
const TRAILING_COUNTRY = /[,\s]*\b(?:japan|jp)\.?\s*$/i;

// A block written with its markers: 1丁目2番3号, 1丁目2番地3, 1丁目2-3, 2番3号, 2番地.
const BLOCK_WITH_MARKERS = /^(.*?)(?:(\d+)丁目)?\s*(?:(\d+)(?:番地|番)(?:の|-)?(?:(\d+)号?)?|(\d+)-(\d+)(?:-(\d+))?)/;
// A block of bare numbers after the town: 丸の内1-2-3, 大手町1-1.
const BLOCK_HYPHENATED = /^(.*?)(\d+)-(\d+)(?:-(\d+))?/;
// A lone number after the town, the block of a village address: 大字下里123.
const BLOCK_SINGLE = /^(.*?)(\d+)(?:番地?)?(?=\s|$|[^\d-])/;

const FLOOR = /(\d+)\s*(?:階|F\b|f\b)/;
const ROOM = /(\d+)\s*号室|(?:^|\s)#?(\d+)号$/;
const ROMAJI_FLOOR = /\b(\d+)(?:F|f|st floor|nd floor|rd floor|th floor)\b/;
const ROMAJI_ROOM = /\b(?:room|rm\.?|suite|#)\s*(\d+)\b/i;
const ROMAJI_BLOCK = /\b(\d+)-(\d+)(?:-(\d+))?\b/;
const ROMAJI_CHOME = /\b(\d+)-?chome\b/i;
const ROMAJI_BUILDING_WORD = /\b(?:bldg\.?|building|tower|mansion|heights|court|house|plaza|center|centre)\b/i;

// Whether the text is a Japanese address, in either script. Romaji counts when a prefecture is named
// with the country, a Japanese postal code or a hyphenated designator beside it.
function looksJapanese(text: string): boolean {
  if (hasJapaneseScript(text)) return true;
  const hasCountry = TRAILING_COUNTRY.test(text);
  const hasPostal = POSTAL_CODE.test(text);
  const hasDesignator = /-(?:ku|shi|cho|machi|mura|gun|to|fu|ken)\b/i.test(text);
  const namesPrefecture = text.split(/[,\s]+/).some((word) => findPrefecture(word) !== null);
  return hasCountry || (namesPrefecture && (hasPostal || hasDesignator));
}

interface Block {
  town?: string;
  chome?: string;
  ban?: string;
  go?: string;
  rest: string;
}

// The town and block at the start of the text, and whatever follows them. A pair of numbers after a
// town is read as chome and ban, the usual city form; it reads as ban and go after 大字 or 字, which
// name a rural town that has no chome.
function splitTownAndBlock(text: string): Block {
  const markers = text.match(BLOCK_WITH_MARKERS);
  if (markers && (markers[2] || markers[3] || markers[5])) {
    const [, town, chome, ban, go, a, b, c] = markers;
    const rest = text.slice(markers[0].length);
    if (a !== undefined) return { ...pairOrTriple(town, a, b, c), town: town.trim() || undefined, rest };
    return { town: town.trim() || undefined, chome, ban, go, rest };
  }
  const hyphenated = text.match(BLOCK_HYPHENATED);
  if (hyphenated) {
    const [, town, a, b, c] = hyphenated;
    return { ...pairOrTriple(town, a, b, c), town: town.trim() || undefined, rest: text.slice(hyphenated[0].length) };
  }
  const single = text.match(BLOCK_SINGLE);
  if (single) {
    const [, town, ban] = single;
    return { town: town.trim() || undefined, ban, rest: text.slice(single[0].length) };
  }
  return { town: text.trim() || undefined, rest: "" };
}

function pairOrTriple(town: string, a: string, b: string, c: string | undefined): Omit<Block, "rest" | "town"> {
  if (c !== undefined) return { chome: a, ban: b, go: c };
  if (/大字|字/.test(town)) return { ban: a, go: b };
  return { chome: a, ban: b };
}

// The building, floor and room in what follows the block.
function splitBuilding(text: string): { building?: string; floor?: string; room?: string } {
  let rest = text.replace(/^[\s,、]+/, "").trim();
  if (!rest) return {};
  const floor = rest.match(FLOOR);
  if (floor) rest = rest.replace(floor[0], " ");
  const room = rest.match(ROOM);
  if (room) rest = rest.replace(room[0], " ");
  const building = rest.replace(/\s+/g, " ").trim() || undefined;
  return { building, floor: floor?.[1], room: room ? (room[1] ?? room[2]) : undefined };
}

const blockOf = (chome?: string, ban?: string, go?: string): string | undefined =>
  [chome, ban, go].filter((part) => part !== undefined).join("-") || undefined;

// Shared fields laid over the Japanese ones, so the rest of the library reads the result as an address.
function assemble(fields: {
  postalCode?: string;
  prefecture?: JapanesePrefecture;
  municipality?: JapaneseMunicipality;
  municipalityName?: string;
  town?: string;
  chome?: string;
  ban?: string;
  go?: string;
  building?: string;
  floor?: string;
  room?: string;
}): ParsedAddress {
  const block = blockOf(fields.chome, fields.ban, fields.go);
  const address: ParsedAddress = { country: "JP" };
  if (fields.postalCode) {
    address.postalCode = fields.postalCode;
    address.zip = fields.postalCode;
    address.zipValid = /^\d{3}-\d{4}$/.test(fields.postalCode);
    address.postalType = "postal";
  }
  if (fields.prefecture) {
    address.prefecture = fields.prefecture.name;
    address.prefectureCode = fields.prefecture.code;
    address.prefectureRomaji = prefectureShortRomaji(fields.prefecture);
    address.state = fields.prefecture.code;
  }
  const municipalityName = fields.municipality?.name ?? fields.municipalityName;
  if (municipalityName) {
    address.municipality = municipalityName;
    address.city = municipalityName;
  }
  if (fields.municipality) {
    address.municipalityCode = fields.municipality.code;
    address.municipalityRomaji = fields.municipality.romaji;
  }
  if (fields.town) {
    address.town = fields.town;
    address.street = fields.town;
  }
  if (fields.chome) address.chome = fields.chome;
  if (fields.ban) address.ban = fields.ban;
  if (fields.go) address.go = fields.go;
  if (block) {
    address.block = block;
    address.number = block;
  }
  if (fields.building) {
    address.building = fields.building;
    address.place = fields.building;
  }
  if (fields.floor) address.floor = fields.floor;
  if (fields.room) address.room = fields.room;
  return address;
}

// A Japanese-script address: 〒100-0005 東京都千代田区丸の内1丁目2番3号 丸ビル5階.
function parseJapaneseScript(text: string): ParsedAddress | null {
  let rest = normalizeJapaneseAddressText(text).replace(COUNTRY_WORD, "");
  let postalCode: string | undefined;
  const postal = rest.match(POSTAL_CODE);
  if (postal) {
    postalCode = `${postal[1]}-${postal[2]}`;
    rest = rest.replace(postal[0], " ").trim();
  }
  rest = rest.replace(/^[\s,、]+/, "");

  const prefectureHit = prefectureAtStart(rest);
  let prefecture = prefectureHit?.prefecture;
  if (prefectureHit) rest = prefectureHit.rest;

  const municipalityHit = municipalityAtStart(rest, prefecture?.code) ?? municipalityAtStart(rest);
  let municipality = municipalityHit?.municipality;
  let municipalityName: string | undefined;
  if (municipalityHit) {
    rest = municipalityHit.rest;
    // The ward stands in for a city written without one: keep the name as written.
    if (municipalityHit.matched !== municipality!.name && !municipality!.name.endsWith(municipalityHit.matched)) {
      municipalityName = municipalityHit.matched;
      municipality = undefined;
    }
    if (!prefecture && municipalityHit.municipality) prefecture = findPrefecture(municipalityHit.municipality.prefecture) ?? undefined;
  } else {
    // Not in the table, but written as a municipality: keep the name and let validation say so.
    const written = rest.match(/^(.+?[市区町村])/);
    if (written && written[1].length <= 12) {
      municipalityName = written[1];
      rest = rest.slice(written[1].length);
    }
  }

  if (!prefecture && !municipality && !municipalityName && !postalCode) return null;

  rest = rest.replace(/^[\s,、]+/, "");
  const { town, chome, ban, go, rest: tail } = splitTownAndBlock(rest);
  const { building, floor, room } = splitBuilding(tail);
  return assemble({ postalCode, prefecture, municipality, municipalityName, town, chome, ban, go, building, floor, room });
}

// A romaji address: Marunouchi Bldg 5F, 1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan.
function parseRomaji(text: string): ParsedAddress | null {
  let rest = text.normalize("NFKC").replace(/\s+/g, " ").replace(TRAILING_COUNTRY, "").trim();
  let postalCode: string | undefined;
  const postal = rest.match(POSTAL_CODE);
  if (postal) {
    postalCode = `${postal[1]}-${postal[2]}`;
    rest = rest.replace(postal[0], " ");
  }
  const parts = rest
    .split(/\s*,\s*/)
    .map((part) => part.replace(/^[\s〒]+|[\s.]+$/g, "").trim())
    .filter(Boolean);

  let prefecture: JapanesePrefecture | undefined;
  for (let i = parts.length - 1; i >= 0 && !prefecture; i--) {
    const found = findPrefecture(parts[i]);
    if (found) {
      prefecture = found;
      parts.splice(i, 1);
    }
  }

  let municipality: JapaneseMunicipality | undefined;
  let municipalityName: string | undefined;
  for (let i = parts.length - 1; i >= 0 && !municipality; i--) {
    const alone = findMunicipalitiesByRomaji(parts[i], prefecture?.code);
    if (alone.length === 1) {
      municipality = alone[0];
      parts.splice(i, 1);
      break;
    }
    // A ward and its city in two parts: "Chuo-ku, Sapporo".
    if (i > 0) {
      const joined = findMunicipalitiesByRomaji(`${parts[i - 1]} ${parts[i]}`, prefecture?.code);
      if (joined.length === 1) {
        municipality = joined[0];
        parts.splice(i - 1, 2);
        break;
      }
    }
    if (alone.length === 0 && /-(?:ku|shi|cho|machi|mura)\b/i.test(parts[i]) && !municipalityName) {
      municipalityName = parts[i];
      parts.splice(i, 1);
      break;
    }
  }
  if (!prefecture && municipality) prefecture = findPrefecture(municipality.prefecture) ?? undefined;
  if (!prefecture && !municipality && !municipalityName) return null;

  // The part holding the block numbers names the town; the parts before it are the building.
  let town: string | undefined;
  let chome: string | undefined;
  let ban: string | undefined;
  let go: string | undefined;
  const blockAt = parts.findIndex((part) => ROMAJI_BLOCK.test(part) || ROMAJI_CHOME.test(part));
  if (blockAt >= 0) {
    let part = parts[blockAt];
    const chomeHit = part.match(ROMAJI_CHOME);
    if (chomeHit) {
      chome = chomeHit[1];
      part = part.replace(chomeHit[0], " ");
    }
    const numbers = part.match(ROMAJI_BLOCK);
    if (numbers) {
      part = part.replace(numbers[0], " ");
      if (numbers[3] !== undefined) [chome, ban, go] = [numbers[1], numbers[2], numbers[3]];
      else if (chome) [ban, go] = [numbers[1], numbers[2]];
      else [chome, ban] = [numbers[1], numbers[2]];
    }
    town = part.replace(/\s+/g, " ").trim() || undefined;
    parts.splice(blockAt, 1);
  } else if (parts.length > 0) {
    town = parts.pop();
  }

  let building: string | undefined;
  let floor: string | undefined;
  let room: string | undefined;
  if (parts.length > 0) {
    let rest = parts.join(", ");
    const floorHit = rest.match(ROMAJI_FLOOR);
    if (floorHit) {
      floor = floorHit[1];
      rest = rest.replace(floorHit[0], " ");
    }
    const roomHit = rest.match(ROMAJI_ROOM);
    if (roomHit) {
      room = roomHit[1];
      rest = rest.replace(roomHit[0], " ");
    }
    building = rest.replace(/\s+/g, " ").replace(/^[,\s]+|[,\s]+$/g, "").trim() || undefined;
    // A town with no block and a building word is a building, not a town.
    if (!building && town && ROMAJI_BUILDING_WORD.test(town) && !chome && !ban) {
      building = town;
      town = undefined;
    }
  }
  return assemble({ postalCode, prefecture, municipality, municipalityName, town, chome, ban, go, building, floor, room });
}

// A Japanese address in either script, or null when nothing in it names a place in Japan.
// @example parseJapaneseAddress('東京都千代田区丸の内1-2-3') → { prefecture: '東京都', municipality: '千代田区', town: '丸の内', chome: '1', ban: '2', go: '3', … }
function parseJapaneseAddress(text: string, options: ParseOptions = {}): ParsedAddress | null {
  if (!text || typeof text !== "string") return null;
  const result = hasJapaneseScript(text) ? parseJapaneseScript(text) : parseRomaji(text);
  if (result && options.useSnakeCase) return toSnakeCase(result) as unknown as ParsedAddress;
  return result;
}

export { looksJapanese, parseJapaneseAddress };

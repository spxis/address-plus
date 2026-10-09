// Lookups over the generated Japanese tables: prefectures by name, kana, romaji or JIS code;
// municipalities by name or romaji within a prefecture; and which prefecture a postal code delivers to.

import type { JapaneseMunicipality, JapanesePrefecture } from "../../types/japan";
import { JP_MUNICIPALITIES } from "./municipalities.data";
import { JP_POSTAL_EXCEPTIONS, JP_POSTAL_PREFIXES } from "./postal-prefixes.data";
import { JP_PREFECTURES } from "./prefectures.data";

// Designators written after a name: 都道府県 on a prefecture, 市区町村 and 郡 on a municipality.
const PREFECTURE_DESIGNATOR = /[都道府県]$/;
const ROMAJI_DESIGNATOR = /-(?:to|do|fu|ken|shi|ku|cho|machi|mura|son|gun)\b/g;
const ENGLISH_DESIGNATOR = /\b(?:prefecture|pref\.?|metropolis|city|ward|town|village|district)\b/g;

// 北海道 is the one prefecture whose designator is part of its name: nobody says 北海.
const prefectureShortName = (prefecture: JapanesePrefecture): string =>
  prefecture.name === "北海道" ? prefecture.name : prefecture.name.replace(PREFECTURE_DESIGNATOR, "");

// Tokyo, Osaka, Hokkaido: the form English addresses use.
const prefectureShortRomaji = (prefecture: JapanesePrefecture): string => prefecture.romaji.replace(/-(?:to|do|fu|ken)$/, "");

const PREFECTURE_BY_CODE: ReadonlyMap<string, JapanesePrefecture> = new Map(JP_PREFECTURES.map((p) => [p.code, p]));

// Every spelling a prefecture goes by, lower-cased, to the prefecture.
const PREFECTURE_BY_NAME: ReadonlyMap<string, JapanesePrefecture> = new Map(
  JP_PREFECTURES.flatMap((p) => {
    const short = prefectureShortRomaji(p).toLowerCase();
    return [
      [p.name, p],
      [prefectureShortName(p), p],
      [p.kana, p],
      [p.romaji.toLowerCase(), p],
      [short, p],
      [`${short} prefecture`, p],
      [`${short} pref`, p],
      [`${short} pref.`, p],
      [`${short} metropolis`, p],
    ] as [string, JapanesePrefecture][];
  }),
);

const MUNICIPALITIES_BY_PREFECTURE: ReadonlyMap<string, readonly JapaneseMunicipality[]> = (() => {
  const map = new Map<string, JapaneseMunicipality[]>();
  for (const municipality of JP_MUNICIPALITIES) {
    if (!map.has(municipality.prefecture)) map.set(municipality.prefecture, []);
    map.get(municipality.prefecture)!.push(municipality);
  }
  return map;
})();

const MUNICIPALITY_BY_CODE: ReadonlyMap<string, JapaneseMunicipality> = new Map(JP_MUNICIPALITIES.map((m) => [m.code, m]));

// A romaji municipality reduced to its words without designators, sorted, so "Chuo-ku, Sapporo" and
// "Sapporo-shi Chuo-ku" meet at "chuo sapporo".
const romajiKey = (text: string): string =>
  text
    .toLowerCase()
    .replace(ROMAJI_DESIGNATOR, "")
    .replace(ENGLISH_DESIGNATOR, "")
    .replace(/[^a-z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");

const MUNICIPALITIES_BY_ROMAJI: ReadonlyMap<string, readonly JapaneseMunicipality[]> = (() => {
  const map = new Map<string, JapaneseMunicipality[]>();
  for (const municipality of JP_MUNICIPALITIES) {
    const key = romajiKey(municipality.romaji);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(municipality);
  }
  return map;
})();

// The prefecture a name, reading, romaji or JIS code refers to, or null.
// @example findPrefecture('東京都') → Tokyo; findPrefecture('Osaka Prefecture') → Osaka; findPrefecture('13') → Tokyo
function findPrefecture(text: string): JapanesePrefecture | null {
  if (!text) return null;
  const clean = text.trim();
  return PREFECTURE_BY_CODE.get(clean) ?? PREFECTURE_BY_NAME.get(clean.toLowerCase()) ?? null;
}

// The prefecture whose name opens the text, with what follows it.
function prefectureAtStart(text: string): { prefecture: JapanesePrefecture; rest: string } | null {
  for (const prefecture of JP_PREFECTURES) {
    if (text.startsWith(prefecture.name)) return { prefecture, rest: text.slice(prefecture.name.length) };
  }
  // The designator is sometimes left off: 東京千代田区. 北海道 and the one-character stems are too short to guess.
  for (const prefecture of JP_PREFECTURES) {
    const short = prefectureShortName(prefecture);
    if (short !== prefecture.name && short.length >= 2 && text.startsWith(short)) {
      return { prefecture, rest: text.slice(short.length) };
    }
  }
  return null;
}

// The municipality whose name opens the text, with what follows it. Looks in one prefecture when it is
// known, otherwise everywhere. A town or village is often written without its district (当別町 for
// 石狩郡当別町), and a city with wards is sometimes written without the ward (札幌市), so both are tried.
function municipalityAtStart(
  text: string,
  prefectureCode?: string,
): { municipality: JapaneseMunicipality; matched: string; rest: string } | null {
  const candidates = prefectureCode ? (MUNICIPALITIES_BY_PREFECTURE.get(prefectureCode) ?? []) : JP_MUNICIPALITIES;
  let best: { municipality: JapaneseMunicipality; matched: string } | null = null;
  for (const municipality of candidates) {
    const spellings = [municipality.name];
    const afterDistrict = municipality.name.replace(/^.+?郡/, "");
    if (afterDistrict !== municipality.name) spellings.push(afterDistrict);
    for (const spelling of spellings) {
      if (text.startsWith(spelling) && (!best || spelling.length > best.matched.length)) {
        best = { municipality, matched: spelling };
      }
    }
  }
  if (best) return { ...best, rest: text.slice(best.matched.length) };

  // A city named without its ward: the first ward's row stands in for the city, and the ward is left out.
  const city = text.match(/^(.+?市)/);
  if (city) {
    const wardCity = candidates.find((m) => m.name.startsWith(city[1]) && m.name !== city[1]);
    if (wardCity) return { municipality: wardCity, matched: city[1], rest: text.slice(city[1].length) };
  }
  return null;
}

// The municipalities a romaji name could mean, narrowed to one prefecture when it is known.
// @example findMunicipalitiesByRomaji('Chiyoda-ku', '13') → [千代田区]; findMunicipalitiesByRomaji('Chuo-ku, Sapporo') → [札幌市中央区]
function findMunicipalitiesByRomaji(text: string, prefectureCode?: string): JapaneseMunicipality[] {
  const found = MUNICIPALITIES_BY_ROMAJI.get(romajiKey(text)) ?? [];
  return prefectureCode ? found.filter((m) => m.prefecture === prefectureCode) : [...found];
}

// All municipalities of a prefecture, by JIS code.
function municipalitiesOf(prefectureCode: string): readonly JapaneseMunicipality[] {
  return MUNICIPALITIES_BY_PREFECTURE.get(prefectureCode) ?? [];
}

function findMunicipalityByCode(code: string): JapaneseMunicipality | null {
  return MUNICIPALITY_BY_CODE.get(code) ?? null;
}

// The JIS code of the prefecture a postal code delivers to, or null for a malformed code or one no
// prefix in the table covers. Hyphens and full-width digits are accepted.
// @example getPrefectureFromJapanesePostalCode('100-0005') → '13'; getPrefectureFromJapanesePostalCode('498-0000') → '23'
function getPrefectureFromJapanesePostalCode(postalCode: string): string | null {
  if (!postalCode) return null;
  const digits = postalCode.normalize("NFKC").replace(/\D/g, "");
  if (digits.length !== 7) return null;
  return JP_POSTAL_EXCEPTIONS[digits] ?? JP_POSTAL_PREFIXES[digits.slice(0, 3)] ?? null;
}

// The three-digit postal prefixes a prefecture's codes begin with, the reverse of the lookup above.
// A prefix on a border is listed under the prefecture most of its codes belong to.
// @example getPostalPrefixesForPrefecture('47') → ['900', '901', …, '907']
function getPostalPrefixesForPrefecture(prefectureCode: string): string[] {
  return Object.entries(JP_POSTAL_PREFIXES)
    .filter(([, code]) => code === prefectureCode)
    .map(([prefix]) => prefix)
    .sort();
}

export {
  findMunicipalitiesByRomaji,
  findMunicipalityByCode,
  findPrefecture,
  getPostalPrefixesForPrefecture,
  getPrefectureFromJapanesePostalCode,
  JP_MUNICIPALITIES,
  JP_POSTAL_EXCEPTIONS,
  JP_POSTAL_PREFIXES,
  JP_PREFECTURES,
  municipalitiesOf,
  municipalityAtStart,
  prefectureAtStart,
  prefectureShortName,
  prefectureShortRomaji,
  romajiKey,
};

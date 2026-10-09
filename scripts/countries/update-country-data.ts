// Builds the Australian and British tables in src/constants/au/ and src/constants/gb/ from three open sources:
//
//   - kuni (@johnmorrisdotca/kuni, MIT, a devDependency only): the states and territories of Australia and the four
//     nations of the United Kingdom, with their ISO 3166-2 codes and their names in English and Japanese. The few
//     rows needed are copied here, so kuni is never a dependency of the package.
//   - The Australian Bureau of Statistics' allocation of mesh blocks to Postal Areas, ASGS Edition 3 (July 2021 to
//     June 2026), POA_2021_AUST.xlsx, CC BY 4.0: which states each postcode's area lies in, so the postcodes that
//     cross a state border are known rather than guessed. A mesh block's code begins with its state's code.
//   - Ordnance Survey's Code-Point Open, Open Government Licence v3.0: every postcode in Great Britain with the nation
//     it lies in, read down to the postcode districts each area has and the nations each district lies in.
//     Northern Ireland (BT) is not in it, and is not taken from anywhere else: the ONS Postcode Directory carries it,
//     but its Northern Ireland postcodes need a licence from Land & Property Services for commercial use.
//
// Run: node scripts/countries/update-country-data.ts [--abs <POA_2021_AUST.xlsx>] [--codepoint <codepo_gb folder>]
// Without arguments it downloads both (about 35 MB) into a temporary folder. It needs `unzip`. Node 24 runs it as is.

import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import australianStates from "@johnmorrisdotca/kuni/subdivisions/au";
import britishSubdivisions from "@johnmorrisdotca/kuni/subdivisions/gb";

const ABS_URL =
  "https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/allocation-files/POA_2021_AUST.xlsx";
const CODEPOINT_URL = "https://api.os.uk/downloads/v1/products/CodePointOpen/downloads?area=GB&format=CSV&redirect";
const AU_DIR = resolve("src/constants/au");
const GB_DIR = resolve("src/constants/gb");

// The first digit of a mesh block's code is its state's code in the ABS's own numbering. 9 is the Other Territories
// (Jervis Bay, Christmas Island, the Cocos (Keeling) Islands, Norfolk Island); Z is outside Australia.
const ABS_STATES: Readonly<Record<string, string>> = {
  "1": "NSW",
  "2": "VIC",
  "3": "QLD",
  "4": "SA",
  "5": "WA",
  "6": "TAS",
  "7": "NT",
  "8": "ACT",
  "9": "OT",
};
// The ABS's own codes that are not postcodes: 9494 is "no usual address" and 9797 "migratory, offshore and shipping".
const ABS_NOT_POSTCODES = new Set(["9494", "9797"]);
// Code-Point Open's nation codes (ONS GSS codes for England, Scotland and Wales).
const GSS_NATIONS: Readonly<Record<string, string>> = { E92000001: "ENG", S92000003: "SCT", W92000004: "WLS" };

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : undefined;
};

const download = async (url: string, path: string): Promise<void> => {
  console.log(`Downloading ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  writeFileSync(path, Buffer.from(await res.arrayBuffer()));
};

const fetchInputs = async (): Promise<{ abs: string; codepoint: string }> => {
  let abs = flag("abs");
  let codepoint = flag("codepoint");
  if (abs && codepoint) return { abs, codepoint };
  const dir = mkdtempSync(join(tmpdir(), "address-plus-countries-"));
  if (!abs) {
    abs = join(dir, "POA_2021_AUST.xlsx");
    await download(ABS_URL, abs);
  }
  if (!codepoint) {
    const zip = join(dir, "codepo_gb.zip");
    await download(CODEPOINT_URL, zip);
    codepoint = join(dir, "codepo_gb");
    execFileSync("unzip", ["-q", "-o", zip, "-d", codepoint]);
  }
  return { abs, codepoint };
};

// One file of an xlsx workbook as text, streamed through unzip.
const unzipText = (archive: string, file: string): Promise<string> =>
  new Promise((done, fail) => {
    const chunks: Buffer[] = [];
    const child = spawn("unzip", ["-p", archive, file]);
    child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.on("error", fail);
    child.on("close", (code) =>
      code === 0 ? done(Buffer.concat(chunks).toString("utf8")) : fail(new Error(`unzip ${file}: ${code}`)),
    );
  });

const SHARED_STRING = /<si>(?:<t[^>]*>([^<]*)<\/t>|[\s\S]*?)<\/si>/g;
const ROW = /<row[^>]*>([\s\S]*?)<\/row>/g;
const CELL = /<c r="([A-Z]+)\d+"(?:[^>]*?t="(\w+)")?[^>]*>(?:<v>([^<]*)<\/v>|<is><t>([^<]*)<\/t><\/is>)?<\/c>/g;

// The first two columns of the sheet, mesh block and postal area, row by row: postcode -> state -> mesh blocks.
const readAbs = async (path: string): Promise<Map<string, Map<string, number>>> => {
  const strings: string[] = [];
  for (const match of (await unzipText(path, "xl/sharedStrings.xml")).matchAll(SHARED_STRING)) {
    strings.push(match[1] ?? "");
  }
  const sheet = await unzipText(path, "xl/worksheets/sheet1.xml");
  const postcodes = new Map<string, Map<string, number>>();
  let header = true;
  for (const row of sheet.matchAll(ROW)) {
    const cells: Record<string, string> = {};
    for (const cell of row[1].matchAll(CELL)) {
      const [, column, kind, value, inline] = cell;
      cells[column] = kind === "s" ? strings[Number(value)] : (inline ?? value ?? "");
    }
    if (header) {
      if (cells.A !== "MB_CODE_2021" || cells.B !== "POA_CODE_2021") throw new Error("Unexpected ABS columns");
      header = false;
      continue;
    }
    const [meshBlock, postcode] = [cells.A, cells.B];
    if (!/^\d{4}$/.test(postcode ?? "") || ABS_NOT_POSTCODES.has(postcode)) continue;
    const state = ABS_STATES[meshBlock.charAt(0)];
    if (!state) continue;
    if (!postcodes.has(postcode)) postcodes.set(postcode, new Map());
    const states = postcodes.get(postcode)!;
    states.set(state, (states.get(state) ?? 0) + 1);
  }
  return postcodes;
};

// Every outward code in Code-Point Open with the nations its postcodes lie in, and how many in each.
const readCodePoint = (folder: string): Map<string, Map<string, number>> => {
  const csv = join(folder, "Data", "CSV");
  const districts = new Map<string, Map<string, number>>();
  for (const file of readdirSync(csv).filter((name) => name.endsWith(".csv"))) {
    for (const line of readFileSync(join(csv, file), "utf8").split("\n")) {
      if (line === "") continue;
      const cells = line.split(",").map((cell) => cell.replace(/"/g, ""));
      const postcode = cells[0];
      const nation = GSS_NATIONS[cells[4]];
      if (!nation) throw new Error(`Unknown nation ${cells[4]} for ${postcode}`);
      const outward = postcode.slice(0, -3).trim();
      if (!districts.has(outward)) districts.set(outward, new Map());
      const nations = districts.get(outward)!;
      nations.set(nation, (nations.get(nation) ?? 0) + 1);
    }
  }
  return districts;
};

const ranked = (counts: Map<string, number>): string[] =>
  [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([key]) => key);

// An area's districts written short: the numbered ones as runs ("1-21,23-38"), then the lettered ones ("1A,1M").
const districtRuns = (suffixes: string[]): string => {
  const numbers = suffixes
    .filter((one) => /^\d+$/.test(one))
    .map(Number)
    .sort((a, b) => a - b);
  const runs: string[] = [];
  for (let at = 0; at < numbers.length;) {
    let end = at;
    while (end + 1 < numbers.length && numbers[end + 1] === numbers[end] + 1) end += 1;
    runs.push(at === end ? `${numbers[at]}` : `${numbers[at]}-${numbers[end]}`);
    at = end + 1;
  }
  const lettered = suffixes.filter((one) => !/^\d+$/.test(one)).sort();
  return [...runs, ...lettered].join(",");
};

// A TSDoc block for an exported table, as the Japanese generator writes them; scripts/check-docs.mjs runs the example.
const tsdoc = (summary: string, example: string, answer: string): string => {
  const lines: string[] = [];
  let line = "";
  for (const word of summary.split(" ")) {
    if (line && line.length + word.length + 1 > 112) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return [
    "/**",
    ...lines.map((text) => ` * ${text}`),
    " *",
    " * @example",
    " * ```ts",
    ` * ${example}`,
    ` * // → ${answer}`,
    " * ```",
    " */",
    "",
  ].join("\n");
};

const header = (what: string, sources: string[]): string =>
  `// Generated by scripts/countries/update-country-data.ts on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand.\n` +
  `// ${what}\n${sources.map((source) => `// Source: ${source}`).join("\n")}\n\n`;

const KUNI = "kuni 1.1.0 (MIT), https://www.npmjs.com/package/@johnmorrisdotca/kuni, from Unicode CLDR and Wikidata";

const writeAustralia = (postcodes: Map<string, Map<string, number>>): void => {
  if (!existsSync(AU_DIR)) mkdirSync(AU_DIR, { recursive: true });
  const states = australianStates
    .map((one) => ({
      code: one.shortCode,
      iso: one.code,
      name: one.name.en,
      nameJa: one.name.ja,
      kind: one.type === "territory" ? "territory" : "state",
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
  if (states.length !== 8) throw new Error(`kuni gave ${states.length} Australian states, not 8`);
  writeFileSync(
    join(AU_DIR, "states.data.ts"),
    header("The eight states and territories, by the code Australia Post writes.", [KUNI]) +
      `import type { AustralianState } from "../../types/australia";\n\n` +
      tsdoc(
        "The six states and two territories of Australia, in order of their codes, each with Australia Post's code, the ISO 3166-2 code and its name in English and in Japanese. Copied from kuni when the tables are made.",
        "AU_STATES.map((state) => state.code)",
        `["ACT","NSW","NT","QLD","SA","TAS","VIC","WA"]`,
      ) +
      `const AU_STATES: readonly AustralianState[] = ${JSON.stringify(states, null, 2)};\n\nexport { AU_STATES };\n`,
  );

  // A postcode whose area lies in more than one state, or in a state other than its block's, and the postcodes of the
  // external territories, which no state's block names.
  const crossing: Record<string, string[]> = {};
  const territories: string[] = [];
  for (const [postcode, counts] of [...postcodes].sort()) {
    const inStates = ranked(counts).filter((state) => state !== "OT");
    if (counts.has("OT")) territories.push(postcode);
    if (inStates.length > 1) crossing[postcode] = inStates;
  }
  writeFileSync(
    join(AU_DIR, "cross-border.data.ts"),
    header("Postcodes that cross a state border, and those of the external territories, from the ABS's Postal Areas.", [
      "Australian Bureau of Statistics, Australian Statistical Geography Standard (ASGS) Edition 3, July 2021 - June 2026, Postal Areas allocation file POA_2021_AUST.xlsx (CC BY 4.0)",
    ]) +
      `import type { AustralianStateCode } from "../../types/australia";\n\n` +
      tsdoc(
        "The postcodes whose area lies in more than one state or territory, each with the states it lies in, the one with most of it first. Read from the Australian Bureau of Statistics' Postal Areas (ASGS Edition 3, CC BY 4.0), which approximate Australia Post's postcodes by mesh blocks, so a state with a sliver of a postcode's area is listed too. An address naming any of these states passes the postcode check.",
        `AU_CROSS_BORDER_POSTCODES["2620"]`,
        `["NSW","ACT"]`,
      ) +
      `const AU_CROSS_BORDER_POSTCODES: Readonly<Record<string, readonly AustralianStateCode[]>> = ${JSON.stringify(crossing, null, 2)};\n\n` +
      tsdoc(
        "The postcodes the Australian Bureau of Statistics places, wholly or partly, in the Other Territories: Jervis Bay, Norfolk Island, Christmas Island and the Cocos (Keeling) Islands. Which state's code Australia Post writes beside each is not in the open data, so the validator does not judge the state given with one.",
        "AU_EXTERNAL_TERRITORY_POSTCODES",
        JSON.stringify(territories),
      ) +
      `const AU_EXTERNAL_TERRITORY_POSTCODES: readonly string[] = ${JSON.stringify(territories)};\n\nexport { AU_CROSS_BORDER_POSTCODES, AU_EXTERNAL_TERRITORY_POSTCODES };\n`,
  );
  console.log(
    `Australia: ${states.length} states, ${postcodes.size} postal areas, ${Object.keys(crossing).length} crossing a border, ${territories.length} in the external territories.`,
  );
};

const writeBritain = (districts: Map<string, Map<string, number>>): void => {
  if (!existsSync(GB_DIR)) mkdirSync(GB_DIR, { recursive: true });
  const nations = britishSubdivisions
    .filter((one) => one.type === "country")
    .map((one) => ({ code: one.shortCode, iso: one.code, name: one.name.en, nameJa: one.name.ja }))
    .sort((a, b) => a.code.localeCompare(b.code));
  if (nations.length !== 4) throw new Error(`kuni gave ${nations.length} British nations, not 4`);
  writeFileSync(
    join(GB_DIR, "nations.data.ts"),
    header("The four nations of the United Kingdom.", [KUNI]) +
      `import type { UKNation } from "../../types/united-kingdom";\n\n` +
      tsdoc(
        "The four nations of the United Kingdom, in order of their codes, each with its ISO 3166-2 code and its name in English and in Japanese. Copied from kuni when the tables are made.",
        "GB_NATIONS.map((nation) => nation.name)",
        `["England","Northern Ireland","Scotland","Wales"]`,
      ) +
      `const GB_NATIONS: readonly UKNation[] = ${JSON.stringify(nations, null, 2)};\n\nexport { GB_NATIONS };\n`,
  );

  const byArea = new Map<string, { suffixes: string[]; nations: Map<string, number> }>();
  for (const [outward, counts] of [...districts].sort()) {
    const [, area, suffix] = /^([A-Z]+)(.+)$/.exec(outward)!;
    if (!byArea.has(area)) byArea.set(area, { suffixes: [], nations: new Map() });
    const entry = byArea.get(area)!;
    entry.suffixes.push(suffix);
    for (const [nation, count] of counts) entry.nations.set(nation, (entry.nations.get(nation) ?? 0) + count);
  }
  const runs = Object.fromEntries([...byArea].map(([area, entry]) => [area, districtRuns(entry.suffixes)]));
  const areaNations = Object.fromEntries([...byArea].map(([area, entry]) => [area, ranked(entry.nations)[0]]));
  // The districts not wholly in their area's nation: those that cross a border, and those wholly on the other side of
  // it (CH5 to CH8 are in Wales, though most of the CH area is in England).
  const exceptions: Record<string, string[]> = {};
  for (const [outward, counts] of [...districts].sort()) {
    const area = /^[A-Z]+/.exec(outward)![0];
    const nations = ranked(counts);
    if (nations.length > 1 || nations[0] !== areaNations[area]) exceptions[outward] = nations;
  }
  const codePoint =
    "Ordnance Survey Code-Point Open (Open Government Licence v3.0). Contains OS data © Crown copyright and database right 2026. Contains Royal Mail data © Royal Mail copyright and database right 2026. Contains National Statistics data © Crown copyright and database right 2026.";
  writeFileSync(
    join(GB_DIR, "districts.data.ts"),
    header("The postcode districts of Great Britain and the nations they lie in, from Code-Point Open.", [codePoint]) +
      `import type { UKNationCode } from "../../types/united-kingdom";\n\n` +
      tsdoc(
        "Every postcode district in Great Britain, by area: the numbered districts as runs, then those with a letter. Read from Ordnance Survey's Code-Point Open (OGL v3; contains Royal Mail data © Royal Mail copyright and database right). Northern Ireland's BT area is not in it, so its districts are not listed.",
        `GB_POSTCODE_DISTRICTS["EC"]`,
        JSON.stringify(runs.EC),
      ) +
      `const GB_POSTCODE_DISTRICTS: Readonly<Record<string, string>> = ${JSON.stringify(runs, null, 2)};\n\n` +
      tsdoc(
        "The nation each postcode area of Great Britain delivers to, by the most of its postcodes. The districts that cross a border are listed in GB_CROSS_BORDER_DISTRICTS. From Code-Point Open (OGL v3).",
        `GB_AREA_NATIONS["CF"]`,
        `"WLS"`,
      ) +
      `const GB_AREA_NATIONS: Readonly<Record<string, UKNationCode>> = ${JSON.stringify(areaNations, null, 2)};\n\n` +
      tsdoc(
        "The postcode districts not wholly in the nation of their area, each with the nations its postcodes lie in, the one with most of them first: the districts that cross the borders of Wales and of Scotland, and those wholly across one (CH5 to CH8 are in Wales, though most of the CH area is in England). From Code-Point Open (OGL v3).",
        `[GB_DISTRICT_NATIONS["TD15"], GB_DISTRICT_NATIONS["CH5"]]`,
        `[["ENG","SCT"],["WLS"]]`,
      ) +
      `const GB_DISTRICT_NATIONS: Readonly<Record<string, readonly UKNationCode[]>> = ${JSON.stringify(exceptions, null, 2)};\n\n` +
      `export { GB_AREA_NATIONS, GB_DISTRICT_NATIONS, GB_POSTCODE_DISTRICTS };\n`,
  );
  console.log(
    `Great Britain: ${byArea.size} areas, ${districts.size} districts, ${Object.keys(exceptions).length} not wholly in their area's nation.`,
  );
};

const main = async (): Promise<void> => {
  const { abs, codepoint } = await fetchInputs();
  writeAustralia(await readAbs(resolve(abs)));
  writeBritain(readCodePoint(resolve(codepoint)));
};

await main();

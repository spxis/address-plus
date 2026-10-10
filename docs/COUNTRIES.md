# Countries Beyond the US, Canada and Japan

address-plus reads the US, Canada and Japan from its main entry point. Every other country is a module of its own,
from an entry point of its own, so it costs only the callers who import it. Australia (`/au`) and the United Kingdom
(`/gb`) are the first two, and France (`/fr`) the third. This document is the design they share, how an address finds
its country, where each country's data comes from and under what licence, and what to do to add the next one.

## The design

A country module is a `CountryModule`: its ISO 3166-1 codes, a detection function, and its parser, validator,
formatter and comparer.

```ts
interface CountryModule {
  code: string; // "AU"
  codes: readonly string[]; // ["GB", "JE", "GY", "IM"] for the British module
  name: string; // "Australia"
  detect(address: string): boolean; // whether the address is surely this country's, with no hint
  parse(address: string, options?: ParseOptions): ParsedAddress | null;
  validate(address: ParsedAddress, options?: ValidationOptions): CountryValidation;
  format(address: ParsedAddress): FormattedAddress;
  compare(first: ParsedAddress, second: ParsedAddress): CountryComparison;
}
```

Each entry point exports its module (`australia`, `unitedKingdom`) and the functions behind it, which can be called
directly (`parseAustralianAddress`, `validateUKAddress`, `formatRoyalMail` and the rest). The main entry point knows
no country module. It takes them in a new option, `countries`, on `parseLocation` and `validateAddress`:

```ts
import { parseLocation, validateAddress } from "@johnmorrisdotca/address-plus";
import { australia } from "@johnmorrisdotca/address-plus/au";
import { france } from "@johnmorrisdotca/address-plus/fr";
import { unitedKingdom } from "@johnmorrisdotca/address-plus/gb";

const countries = [australia, france, unitedKingdom];

parseLocation("3/12 Smith St, Parramatta NSW 2150", { countries }); // read as Australian
parseLocation("10 Downing Street, London SW1A 2AA", { countries }); // read as British
parseLocation("12 bis rue de la Paix, 75002 Paris", { countries }); // read as French
parseLocation("100 Queen St W, Toronto, ON M5H 2N2", { countries }); // still Canadian, unchanged
parseLocation("12 Smith St, Parramatta", { country: "AU", countries }); // the hint: always Australian
validateAddress("1 Main St, Sydney VIC 2000", { countries }).warnings[0].code; // "POSTAL_REGION_MISMATCH"
```

What the core does with them is all in `src/country/pick.ts`, about 30 lines:

1. A hint (`country: "AU"`) naming a country the core does not read picks the module whose `codes` include it. If no
   module passed has it, `parseLocation` throws a `TypeError` that says how to pass one. A hint is a decision by the
   caller, so it is never quietly ignored.
2. With no hint (or `"auto"`), each module passed is asked in order whether the address is surely its country's; the
   first that says yes reads it.
3. Otherwise the core reads the address as before: Japan, then the US and Canada.

Without `countries`, nothing changes: every case of the US, Canadian and Japanese corpora (2,723) gives the same
result with all three modules passed as without them (`src/__tests__/countries/detection.test.ts` holds that).

**The hint is the reliable path.** Detection is written to be sure rather than to be clever: it says yes only on
signs that no address of another country carries, and an address without them falls through to the core. A caller
who knows the country (a form with a country field, a list from one country) should pass it.

### Size

Measured by bundling each entry point for the browser, minified, with esbuild:

| Entry point | Before (1.4.0) | After | Gzipped before | Gzipped after |
| --- | ---: | ---: | ---: | ---: |
| `@johnmorrisdotca/address-plus` | 582.5 KB | 583.2 KB | 104.6 KB | 104.9 KB |
| `/jp` | 325.1 KB | 325.1 KB | 61.8 KB | 61.9 KB |
| `/au` | | 16.3 KB | | 7.1 KB |
| `/gb` | | 19.5 KB | | 8.5 KB |
| `/fr` | | 27.2 KB | | 8.8 KB |

The main entry point grows by 0.7 KB (the option and the picker); France added nothing to it. `/au`, `/gb` and `/fr`
carry none of the US, Canadian or Japanese tables, nor each other's; `pnpm test:package` proves it on the packed
package. `/fr`'s 6,328 postcodes are 7.5 KB of text (1.4 KB gzipped), packed as steps in base 36 and unpacked the
first time a postcode is looked up.

## How an address finds its country

| Country | Detected, with no hint, when the address | Never claimed |
| --- | --- | --- |
| Australia | ends with `Australia`, or with a state (code or name) and a four-digit postcode inside some state's block | a postcode alone; `WA` with a postcode outside Western Australia's block |
| United Kingdom | ends with the United Kingdom, a nation, Jersey, Guernsey or the Isle of Man; or holds `BFPO` and a number, or `GIR 0AA`; or holds, in its last two parts, a postcode in Royal Mail's grammar whose area Royal Mail uses | an outward code alone |
| France | ends with France, an overseas department, Monaco or an overseas collectivity; or holds `CEDEX` beside a five-digit code; or names an arrondissement of Paris, Lyon or Marseille; or its last line is a postcode whose number names a department, a collectivity or Monaco and a commune (`75008 Paris`) while the address has a French type of voie (`rue`, `avenue`, `chemin`) at the start of a street, a `BP`, a `TSA` or a `lieu-dit` | a five-digit code that follows a US state (`NY 10036`); a postcode and commune with no French sign (`10115 Berlin`); a number that names no department (`96000`, `99999`) |
| Japan (core) | is in Japanese script, ends with Japan, or names a prefecture beside a Japanese postal code or a romaji designator | an address that only mentions a Japanese place |
| US and Canada (core) | everything else, by the state or province and the ZIP or postal code | |

The cases that look alike, and why they cannot be confused:

- **A British postcode and a Canadian postal code.** Both may start with a letter, a digit and a letter (`W1A`, `M5V`).
  A Canadian code ends in a digit (`M5V 1A1`: letter, digit, letter, digit, letter, digit); a British inward code is a
  digit and two letters (`0AX`). No string is both, so detection needs no guess.
- **An Australian postcode and a US ZIP code.** Four digits are not a ZIP code, but a ZIP code typed short is four
  digits. A state code before them decides it: `NSW`, `VIC`, `QLD`, `TAS`, `SA`, `NT` and `ACT` are not US states, so
  any Australian postcode after them is Australian. `WA` is also Washington's code, so after `WA` the postcode must be
  one of Western Australia's (6000 to 6999): `Seattle, WA 9810` stays American. `NT` is also Canada's Northwest
  Territories, whose postal codes are letters and digits, never four digits.
- **Australia's `3/12 Smith St` and Canada's `4-123 Main St`.** Both put a unit before the number, Australia with a
  slash and Canada with a hyphen, and in Australia a hyphen joins a range (`12-14`). The country is decided first, by
  the end of the address, and each country's parser reads its own form; the slash alone decides nothing, since a US
  address may hold a fraction (`123 1/2 Main St`).
- **A French postcode and a US ZIP code.** Both are five digits, and the module's hint is the only sure way to tell a
  bare one. With no hint, a ZIP code is told by where it stands: it follows its state (`Seattle, WA 98101`) and ends the
  address, while a French code comes first on the last line and a commune follows it (`75008 Paris`). That shape alone is
  not enough, since a German address has it too (`10115 Berlin`): detection also asks for a code whose number names a
  department (a code La Poste does not list, `75099`, still counts, so that a typo in a French address is read as French
  and flagged by the validator) and a French sign beside it, a type of voie at the start of a street, a box, a lieu-dit, a
  CEDEX or the country at the end. `100 Avenue of the Americas, New York, NY 10036` has the shape of a French street
  (`Avenue`) and a code that names a department (10 is the Aube) but a state before the code and no commune after it, so
  it stays American.
- **Monaco, the overseas departments and the collectivities.** Monaco (postcode 98000) and the overseas collectivities
  (97500, 97133, 97150, 98600, 987xx, 988xx) are addressed by La Poste in the same way and have postcodes in the same
  base. The French module reads them and reports `country` as `MC`, `PM`, `BL`, `MF`, `WF`, `PF` or `NC`, the way the
  British module reports `JE`; its validator says so (`OUTSIDE_FRANCE`). The overseas departments (971 to 974 and 976)
  are French regions, so their country is `FR` and their `state` is their three-digit code.
- **Jersey, Guernsey and the Isle of Man.** They use Royal Mail's postcodes (`JE2 3AB`) but are not part of the United
  Kingdom: the British module reads them and reports `country` as `JE`, `GY` or `IM`, with no nation, and its validator
  says so (`OUTSIDE_UK`).

## Subdivisions: from kuni, copied when the tables are made

Australia's states and territories and the United Kingdom's four nations, with their ISO 3166-2 codes and names in
English and Japanese, come from kuni (`@johnmorrisdotca/kuni` 1.1.0). kuni is a pinned **devDependency**:
`pnpm data:countries` copies the twelve rows into `src/constants/au/states.data.ts` and
`src/constants/gb/nations.data.ts`. The alternative, importing kuni inside the `/au` and `/gb` entries, would have
made it a runtime dependency for everyone who installs the package, to read twelve rows that change once a decade.
The package keeps its one runtime dependency (`fast-levenshtein`).

France's departments, regions and overseas collectivities are not kuni's: kuni 1.1.0 has France's regions and the
overseas territories as a whole, but not the 101 departments a postcode's first digits name. They come from INSEE's
Code officiel géographique, so `pnpm data:countries` reads two sources for France where it reads kuni for the other two.

## Data sources and licences

Every table is either generated by `pnpm data:countries` (`scripts/countries/update-country-data.ts`, which downloads
its inputs) or written by hand from rules described in our own words.

| Data | Source | Licence | Where |
| --- | --- | --- | --- |
| Australian states and British nations, English and Japanese names | kuni 1.1.0, from Unicode CLDR and Wikidata | MIT | `src/constants/au/states.data.ts`, `src/constants/gb/nations.data.ts` (generated) |
| Australia Post's blocks of postcodes for each state | Australia Post's allocation (NSW 1000 to 1999 for boxes and large receivers, 2000 to 2599, 2619 to 2899, 2921 to 2999; ACT 0200 to 0299, 2600 to 2618, 2900 to 2920; VIC 3000 to 3999, 8000 to 8999; QLD 4000 to 4999, 9000 to 9999; SA, WA and TAS their thousands; NT 0800 to 0999) | A fact, written by hand | `src/constants/au/index.ts` |
| Australian postcodes that cross a state border, and the external territories' | Australian Bureau of Statistics, Australian Statistical Geography Standard (ASGS) Edition 3, July 2021 to June 2026, Postal Areas allocation file `POA_2021_AUST.xlsx` | CC BY 4.0. Attribution: "Source: Australian Bureau of Statistics, ASGS Edition 3, Postal Areas, CC BY 4.0", kept in the generated file's header | `src/constants/au/cross-border.data.ts` (generated) |
| Australian street, unit, level and postal delivery types | AS4590 (Interchange of client information), as Australia Post's Address Presentation Standard uses it | The codes are facts; the lists are written in our own words | `src/constants/au/words.ts` |
| British postcode districts, and the nation of each area and border district | Ordnance Survey, Code-Point Open (July 2026 release) | Open Government Licence v3.0. Attribution, kept in the generated file's header: "Contains OS data © Crown copyright and database right 2026. Contains Royal Mail data © Royal Mail copyright and database right 2026. Contains National Statistics data © Crown copyright and database right 2026." | `src/constants/gb/districts.data.ts` (generated) |
| Royal Mail's postcode grammar, its postcode areas and the towns they are named for | Royal Mail, through the UPU's addressing sheet for the United Kingdom | The grammar and the list are facts, written in our own words | `src/constants/gb/index.ts` |
| British thoroughfare descriptors and counties | Royal Mail's addressing guidance; the former postal, ceremonial and traditional counties | Written in our own words | `src/constants/gb/words.ts` |
| Every French postcode (6,328, France, the overseas departments and collectivities, Monaco) | La Poste, Base officielle des codes postaux (`laposte-hexasmal`, updated 8 October 2026), https://data.laposte.fr/datasets/laposte-hexasmal | Licence Ouverte 2.0 (Etalab). Attribution, kept in the generated file's header: the producer, La Poste, and the dataset's name | `src/constants/fr/postcodes.data.ts` (generated) |
| France's 101 departments, their regions, and the overseas collectivities with postcodes | INSEE, Code officiel géographique 2026 (`v_departement_2026`, `v_region_2026`, `v_comer_2026`), https://www.insee.fr/fr/information/8740218 | Licence Ouverte 2.0 (Etalab). Attribution, kept in the generated file's header: INSEE | `src/constants/fr/departments.data.ts` (generated) |
| The layout of a French address: the six lines and what goes on each, and the types of voie La Poste allows abbreviated | La Poste, SP 8855 volume 2, "Adressage des plis" (version 1.9, a public technical specification that follows the norm NF Z10-011) | The layout and the list of abbreviations are facts, written in our own words. The norm NF Z10-011 is AFNOR's and sold by it: it has not been read, and nothing here is taken from it | `src/fr/format.ts`, `src/constants/fr/words.ts` |
| French types of voie in full, apartment, floor and building words, Roman numerals, overseas names | La Poste's addressing guidance and common usage | Written in our own words | `src/constants/fr/words.ts` |

What is not used, and why:

- **G-NAF** (the Geocoded National Address File), Australia's open address list: its end-user licence forbids using it
  to generate or compile addresses for sending mail, which is close enough to what this library is used for that
  nothing here comes from it.
- **Australia Post's postcode products**: they are Australia Post's, under its own terms. The Australian Bureau of
  Statistics' Postal Areas are used instead; they approximate Australia Post's postcodes by mesh blocks, so a state holding only
  a sliver of a postcode's area is listed too, which errs towards accepting an address rather than refusing one.
- **Royal Mail's Postcode Address File (PAF)**: licensed and paid for. Nothing here comes from it; the parser follows
  the PAF's shape, which Royal Mail publishes.
- **The ONS Postcode Directory (ONSPD)**: it would supply Northern Ireland's districts, which Code-Point Open leaves
  out, but its Northern Ireland postcodes (BT) may be used commercially only under a separate licence from Land &
  Property Services Northern Ireland, and its other data asks for the attribution "Contains OS data © Crown copyright
  and database right; Contains Royal Mail data © Royal Mail copyright and database right; Source: Office for National
  Statistics licensed under the Open Government Licence v.3.0". An MIT package cannot pass on the BT terms, so none of
  it is used: a BT postcode is known to be Northern Ireland's by its area, and its district is not checked.
- **La Poste's commune names and its CEDEX codes.** The base lists 39,193 lines, one for each commune and each
  postcode it has, with the commune's name. Only the postcodes are kept here (6,328 of them, 7.5 KB), so the validator
  can say whether a postcode is in use and which department it belongs to but not whether the commune written beside it
  is the one that postcode serves: measured, the 35,624 pairs of a postcode and its commune's label are 656 KB of text and 230 KB gzipped, for every user of the package whether they import `/fr` or not (npm installs the whole package), and out of date within months. The base
  has no CEDEX codes (those are in La Poste's other files, which are not open data), so the validator does not look a
  postcode up when the address has a CEDEX.
- **A postcode's department by the communes that share it.** A few postcodes serve a commune across a department's
  border (three in the metropolis: 01590 serves communes of the Jura as well as the Ain, and 94390 serves Paray-Vieille-Poste, in the Essonne); the department
  reported is the one the number names, the rule La Poste's own codes follow. Overseas, where it matters (97133 is
  Saint-Barthélemy, 97150 Saint-Martin, 98000 Monaco), the exceptions are generated from the base.
- **The Base Adresse Nationale (BAN), OpenStreetMap and OpenAddresses.** The BAN is open (Licence Ouverte 2.0) but lists
  every address of France, tens of millions, which is a street gazetteer and not a table for a parser to carry; the
  other two are ODbL or a mix of licences. None is used, and no street name of France is in the package.
- **A list of every British postcode.** Measured: Code-Point Open's 1,749,109 postcodes, packed as one bit per possible
  unit in each of their 10,875 sectors, are 776 KB of text and 304 KB gzipped. That would let a validator say whether a
  postcode exists, not only whether its district does. It is not shipped: npm installs the whole package, so every
  user would download it whether they import it or not, and it would be out of date within a month. It would fit a
  separate package, if wanted.

## What the country modules do not reach

`cleanAddress`, `cleanAddressDetailed` and the fuzzy comparer `compareAddresses` are the core's, and they read the US,
Canadian and Japanese shapes: the cleaner puts a postcode after the commune, as a US address has it, which turns
`12 rue de la paix, 75002 paris` into `12 Rue De La Paix, Paris 75002`, and is no longer a French address. A French
address is compared with `compareFrenchAddresses`, and written with `formatLaPoste`. The demo's Clean panel has no French
example for that reason.

## The fields each country fills

The shared fields keep their meaning in every country: `number`, `street`, `type`, `secUnitType`, `secUnitNum`,
`city`, `state`, `zip`, `zipValid`, `country`.

| Field | Australia | United Kingdom | France |
| --- | --- | --- | --- |
| `number` | street number: `12`, `12A`, `12-14` | building number: `10`, `22B`, `100-106` | the street number: `12`, `12-14` |
| `street`, `type` | `Smith`, `St` (AS4590's abbreviation, in proper case) | `High`, `Street` (the descriptor in full, as Royal Mail writes it) | `de la Paix`, `Rue` (the type in full, first in French; the name keeps its words as written) |
| `suffix` | `N`, `NE`, `EX`, `UP` (AS4590's street suffixes) | |  |
| `secUnitType`, `secUnitNum` | `Unit 3` (from `3/12` too), `Shop 5`; or a postal delivery, `PO Box 37`, `Locked Bag 801`, `Care PO` | `Flat 2`, `Flat 2/1`, `Studio J`; or `PO Box 111` | `Appartement 12`, `Porte 3`, `Bureau 21` |
| `floorType`, `floor` | `Level` and `6`, `Ground Floor` | `Floor` and `4`, `Ground Floor` | `Étage` and `3`, `Rez-de-chaussée` |
| `lot` | `12` in `Lot 12 Smith Rd` | |  |
| `building` | a building's name on a line of its own | the building's name, or an organisation's | a residence, a building, a tower, a zone: `Résidence Les Lilas`, `Zone industrielle Nord`; and any name before the street that is none of these |
| `subBuilding` | | a named part of a building: `Basement Flat` |  |
| `dependentThoroughfare` | | `Seastone Cottages` in `1A Seastone Cottages, Station Road` |  |
| `locality`, `doubleDependentLocality` | | the dependent locality and the one above it |  |
| `city` | the suburb or town | the post town | the commune: `Paris`, `Lyon` |
| `county` | | a county, when written |  |
| `state` | `NSW` | | the department's code: `75`, `2A`, `971`; absent for Monaco and the collectivities |
| `nation` | | `ENG`, `SCT`, `WLS` or `NIR`, from the postcode |  |
| `zip` | `2150` | `SW1A 2AA` (capitals, one space) | `75002` |
| `bfpo` | | `105` in `BFPO 105` |  |
| `country` | `AU` | `GB`, or `JE`, `GY`, `IM` | `FR`, or `MC`, `PM`, `BL`, `MF`, `WF`, `PF`, `NC` |

France fills nine fields of its own beside these (`FrenchAddressFields`): `numberExtension` (`bis`, `ter`, `quater`, or the
B of `12 B`), `staircase`, `entrance`, `lieuDit`, `postalBoxType` (`BP`, `CS`, `TSA`) with `postalBoxNum`, `cedex`
(`CEDEX 09`, or `CEDEX`), `arrondissement` (the number: 8 for `Paris 8e`) and `careOf` (the "chez" line). A `lieuDit` is
also what La Poste's fifth line holds when it names the commune a box or a hamlet is in.

## Adding a country

1. Write its types in `src/types/<country>.ts` (its own fields, its subdivisions) and add its fields to `ParsedAddress`
   and its codes to `ParseOptions.country` and `ParsedAddress.country`.
2. Put its tables in `src/constants/<code>/`, generated by `pnpm data:countries` where they come from data (with the
   source and licence in the generated file's header), by hand where they are rules.
3. Write `src/<code>/`: `parse.ts`, `validate.ts`, `format.ts`, `compare.ts`, and `index.ts` exporting the module and
   everything a caller needs. Import nothing from the core's parser or tables; `src/country/shared.ts` holds what the
   modules share.
4. Write `detect` to say yes only on signs no other country's address carries, and add a row to the table above with
   what it never claims.
5. Add the entry to `tsup.config.ts` and `package.json`'s `exports`, and to the lists in `scripts/check-package.mjs`
   (with a word only its tables carry) and `scripts/check-docs.mjs`.
6. Write its corpus under `test-data/corpus/<code>/`, its core fields and hint in
   `src/__tests__/corpus/corpus-support.ts`, and its suite beside `australia.test.ts`; the detection suite then holds it
   to the US, Canadian and Japanese corpora.
7. Document it: a section in `docs/TEST_COVERAGE.md`, a row in each table here, a short section in the README, the
   changelog, and the demo's country choices and examples.

The survey that chose Australia and the United Kingdom first named France and Germany next. France came third, with
the changes it needed from the template above: a third entry point, a second source of tables (INSEE beside kuni), a
validator that skips the base for an address with a CEDEX, and territories with country codes of their own.

# Test Coverage: the US and Canadian Address Corpora

This document says what address shapes the US and Canadian postal authorities define, which of them the
hand-written tests already exercised, what the corpus under `test-data/corpus/` adds, and, last, what the
parser gets wrong today. That last section is the brief for the fixing pass.

## In numbers

| | Cases | Pass today | Todo (wrong today) |
| --- | ---: | ---: | ---: |
| United States (`test-data/corpus/us/`, 14 files) | 1,087 | 938 | 149 |
| Canada (`test-data/corpus/canada/`, 10 files) | 513 | 363 | 150 |
| Total | 1,600 | 1,301 | 299 |

Before the corpus, `test-data/` held about 440 address inputs written by hand (the 600 test cases count
the function tests in TypeScript too). They exercised 34 distinct street types, 13 unit designators and
no military, urbanization, private mailbox, trailing-country or province-in-parentheses address at all.

Field by field, over every field value a corpus case names:

| | address-plus right | parse-address right |
| --- | ---: | ---: |
| United States (6,644 field values) | 6,295 (94.7%) | 6,261 (94.2%) |
| Canada (3,155 field values) | 2,836 (89.9%) | 1,209 (38.3%) |

## How the corpus works

### A case

Every corpus file has the standard test-file shape (`schemas/test-file.json`): a `name`, a `description`
that also states the licence of what the file draws on, and `tests`, one array per shape group. Each case:

```json
{
  "name": "prefix NE",
  "description": "Predirectional NE before the street name",
  "input": "679 NE Magnolia St, Seattle, WA 98101",
  "expected": { "number": "679", "prefix": "NE", "street": "Magnolia", "type": "St", "city": "Seattle", "state": "WA", "zip": "98101", "country": "US" },
  "source": "USPS Publication 28, Postal Addressing Standards (US government work, public domain), predirectional"
}
```

- `expected: null` means `parseLocation` must return `null`.
- A field set to `null` must be absent from the result.
- `ignoreCase` lists fields compared without regard to letter case. It is used only where the input is all
  lowercase or all capitals, for the free-text fields `street`, `city` and `station`; normalized fields
  (`type`, `state`, `prefix`, `secUnitType`) are always compared exactly.
- `partial: true` turns off the absence check below. It is used only where a part of the address has no
  field yet (a military delivery line, a compartment number) or how a part should split is unsettled.
- `todo: true` with a one-line `todoNote` marks a case the parser gets wrong today. The note says what
  comes out instead, field by field, for example `type: "Crt" (want "Ct")`.

### The judge

`src/__tests__/corpus/corpus-support.ts` holds the one rule every suite uses. Each field the case names must
equal the result's field. And, unless the case is `partial`, each **core field** the case does not name
must be absent from the result: `number`, `prefix`, `street`, `type`, `suffix`, `secUnitType`,
`secUnitNum`, `city`, `state`, `zip`, `plus4`, `country`. A parser that invents a prefix, a unit or a city
fails as surely as one that loses it. Other fields (`unit`, `zipValid`, `place`, `rr`, `station` and the
rest) are checked only when named.

### The suites

- `src/__tests__/corpus/us.test.ts` and `canada.test.ts` read every file in their folder, so a new file
  needs no code. A case is an `it`; a todo case is an `it.todo` whose title carries its note, so the suite
  stays green and every gap is listed in the test output. Each file has one more test, "has no todo case
  that now passes", which fails as soon as the parser fixes a todo case: the flag must come off, so the
  list of gaps never overstates them.
- `src/__tests__/corpus/mark-todo.test.ts` rewrites every todo flag and note from the parser's current
  output. It runs only when asked:
  `CORPUS_MARK=1 pnpm exec vitest run src/__tests__/corpus/mark-todo.test.ts && pnpm exec prettier --write test-data/corpus`.
  Use it after a fix; read the diff, since a case leaving todo is the fix working and a case entering todo
  is a regression.
- `src/__tests__/corpus/parse-address-parity.test.ts` is described under "Parity with parse-address".

### Conventions the expected values follow

Expected values are built from the parts each input is assembled from, never read back from the parser.
Where the library has a documented convention, the corpus follows it:

- `type` is the USPS standard abbreviation in proper case (`St`, `Xing`, `Holw`), in both countries.
  Where USPS Publication 28 Appendix C1 lacks the word, it is Canada Post's abbreviation (`Conc`, `Ch`,
  `Crois`, `Mtée`). Canadian spellings count as the same word (`Centre` is `Ctr`, `Harbour` is `Hbr`).
  This matches the library's existing tests (a Canadian `Trail` is `Trl`).
- French street types come before the name and are reported the same way (`rue Principale` is type
  `Rue`, street `Principale`). Words both languages share take the English abbreviation (`avenue` is
  `Ave`, `boulevard` is `Blvd`), as the library's own parked cases expect.
- `prefix` and `suffix` are the abbreviation (`N`, `NE`); French `Ouest` is `O`, and the compound French
  directionals are Canada Post's `NO` and `SO`.
- `secUnitType` is the designator's full word in proper case (`Apartment`, `Suite`, `Hangar`), `#` for a
  pound sign, `PO Box` for any spelling of a post office box (Pub 28 standardizes `BOX` alone to
  `PO BOX`) and `CP` for any spelling of the French case postale. French unit words stay French
  (`Appartement`, `Bureau`, `Unité`). A Canadian unit-civic pair with no designator (`4-123 Main St`)
  reports `Unit`.
- `number` keeps a fraction (`123 1/2`, per the README) and a letter (`123A`).
- A route-numbered road keeps its qualifier and number in `street` with the road word abbreviated and
  no `type` (`US Hwy 431`, `County Rd 45`), as `parser.ts` does on purpose. A Canadian highway follows
  Canada Post instead: `Hwy 7` is type `Hwy`, street `7`, as for a French type.
- Rural routes report `rr` (the number) and `ruralRoute` (`RR 2`); a highway contract route reports
  `ruralRoute: "HC 68"`; the box on a route is `secUnitType: "Box"`. General delivery reports
  `generalDelivery: true` and `street: "General Delivery"`. A Puerto Rico urbanization goes in `locality`.
- Postal codes are reported in capitals with one space (`M5H 2N2`); ZIP+4 is split into `zip` and `plus4`.
- `country` is `US` or `CA` whenever a state, province or postal code says so.

## Sources and licences

| Source | Licence | Used for |
| --- | --- | --- |
| USPS Publication 28, Postal Addressing Standards | US government work, public domain | Appendix B (state and territory codes), C1 (street suffixes), C2 (secondary unit designators), and the rules for directionals, numbers, PO boxes, PMB, rural and highway contract routes, general delivery, military and Puerto Rico addresses. Inputs are constructed. |
| Canada Post Addressing Guidelines | Rules described in our own words; nothing copied | Street types in both languages, unit and civic number order, French addresses, postal codes, province symbols, rural routes, site and compartment, general delivery, PO boxes and stations. Every input is constructed. |
| parse-address `test.js` (github.com/hassansin/parse-address) | ISC | All 65 street-address cases, converted to this library's field names (`us/parse-address-suite.json`). Six are adjusted where address-plus departs from parse-address on purpose, each saying why in its description. The eight intersection cases are left out. |
| libpostal `test/test_parser.c` (github.com/openvenues/libpostal) | MIT | All 40 US street addresses and the 3 Canadian ones, their labelled components converted to this library's fields. libpostal's fixtures hold only these; its large training data comes from OpenStreetMap (ODbL) and OpenAddresses and is not used. |

One caution on parse-address: it is a port of the Perl module Geo::StreetAddress::US, and many of its
test inputs trace back to that module, which Perl distributes under the Artistic License or the GPL at the
user's choice. The cases are short factual address strings and are used here under parse-address's ISC
licence, but if the GPL is to be ruled out entirely, `us/parse-address-suite.json` is the one file to
review.

## Gap analysis: United States

The authority is USPS Publication 28. "Before" counts the hand-written inputs in `test-data/` (us, core,
canada and todo) that show the shape.

| Shape (Pub 28) | Before | Corpus file and group | Cases | Todo |
| --- | ---: | --- | ---: | ---: |
| Every primary street suffix (Appendix C1), in full | 34 types in all | `street-suffixes` fullWord | 206 | 2 |
| Every standard suffix abbreviation | (included above) | `street-suffixes` abbreviation | 186 | 3 |
| Common suffix spellings C1 maps (AV, BOULV, STR, HIWAY) | few | `street-suffixes` variantSpelling | 30 | 0 |
| Predirectionals, 8 directions, abbreviated, in full, dotted | some | `directionals` prefix | 24 | 0 |
| Postdirectionals, 8 directions, with and without a comma | some | `directionals` suffix | 24 | 0 |
| Pre- and postdirectional together | 0 | `directionals` prefixAndSuffix | 4 | 0 |
| Directional word as the street name (North St) | 1 | `directionals` directionalAsName | 11 | 6 |
| Every secondary unit designator (Appendix C2), abbreviated | 13 designators | `secondary-units` abbreviated | 24 | 8 |
| Designators in full | | `secondary-units` fullWord | 16 | 4 |
| Designator after a comma | | `secondary-units` afterComma | 24 | 17 |
| `#` as the designator | few | `secondary-units` poundSign | 4 | 0 |
| Unit variants (Apt #, Apt., lettered, Florida FL) and unit first | few | `secondary-units` variants | 14 | 5 |
| Fractional numbers | 2 | `primary-numbers` fractions | 5 | 0 |
| Numbers with a letter (123A) | 0 | `primary-numbers` lettered | 4 | 4 |
| Number ranges (912-914) | few | `primary-numbers` ranges | 3 | 0 |
| Queens and Hawaii hyphenated numbers | 2 | `primary-numbers` hyphenated | 6 | 0 |
| Utah grid (48 S 400 E) | 6 | `primary-numbers` grid | 6 | 0 |
| Wisconsin grid (W204N11912) | 5 | `primary-numbers` wisconsinGrid | 5 | 0 |
| Numbers spelled out (One Microsoft Way) | few | `primary-numbers` written | 3 | 3 |
| Ordinal and spelled-out numbered streets | some | `street-names` ordinal | 22 | 0 |
| Bare-number streets (83 St) | 0 | `street-names` numeric | 4 | 0 |
| Route-numbered roads (US Hwy 431, County Rd 45) | 6 | `street-names` routeNumbered | 6 | 0 |
| Suffix words used as the name (Park Ave, Court St) | few | `street-names` suffixWordAsName | 8 | 0 |
| Streets with no suffix (Broadway, Avenue A) | few | `street-names` noSuffix | 5 | 3 |
| Names of several words, apostrophes, St. for Saint | some | `street-names` multiword | 10 | 3 |
| PO Box spellings (P.O., Post Office Box, POBox, Box, POB) | 9 | `po-box-and-rural` poBox | 12 | 3 |
| Private mailbox (PMB) | 0 | `po-box-and-rural` privateMailbox | 3 | 3 |
| Rural route (RR, R.R., Rural Route, RFD) | 4 | `po-box-and-rural` ruralRoute | 7 | 7 |
| Highway contract route (HC, Star Route) | 1 | `po-box-and-rural` highwayContract | 4 | 4 |
| General delivery | 5 | `po-box-and-rural` generalDelivery | 6 | 1 |
| Military: APO, FPO, DPO with AA, AE, AP | 0 | `military` | 14 | 14 |
| Puerto Rico urbanizations and Spanish-order streets | 0 | `territories` puertoRico | 7 | 4 |
| Guam, Virgin Islands, American Samoa, Northern Marianas, freely associated states | 0 | `territories` islands | 11 | 1 |
| Every state, DC and territory by code, by name, without commas | most codes | `states` | 168 | 2 |
| ZIP, ZIP+4 with hyphen, run together, with spaces; leading zeros | 30 with hyphen | `zip-codes` | 18 | 1 |
| Lowercase and capitals | 10 lowercase, 0 capitals | `formatting` letterCase | 16 | 0 |
| Punctuation variants | some | `formatting` punctuation | 6 | 2 |
| No commas, extra spaces | some | `formatting` spacing | 16 | 4 |
| Multiline (LF and CRLF), unit on its own line | 4 | `formatting` multiline | 19 | 1 |
| Trailing country (USA, United States, U.S.A.) | 0 | `formatting` trailingCountry | 12 | 11 |
| parse-address's own suite | 23 in compatibility.json | `parse-address-suite` | 65 | 9 |
| libpostal's US fixtures | 0 | `libpostal-fixtures` | 40 | 23 |
| Inputs that are not addresses | 7 | `null-cases` | 9 | 1 |

Not covered, on purpose: intersections (`parseIntersection` has its own suite), strict mode and postal
validation (their own suites), and addresses with a recipient or attention line, which Pub 28 places above
the delivery address and this parser does not model.

## Gap analysis: Canada

The authority is Canada Post's Addressing Guidelines.

| Shape (Canada Post) | Before | Corpus file and group | Cases | Todo |
| --- | ---: | --- | ---: | ---: |
| English street types in full (116 types) | a dozen | `street-types` english | 116 | 7 |
| English types by Canada Post's abbreviation | few | `street-types` englishAbbreviation | 48 | 6 |
| French street types before the name (29 types) | Rue, Ch, Place, Promenade, Square | `street-types` french | 29 | 20 |
| French types abbreviated (av., boul., ch., crois., imp.) | 1 | `street-types` frenchAbbreviation | 5 | 5 |
| Civic number with a letter or a half (123A, 123 1/2) | 0 | `civic-numbers` civicSuffix | 6 | 3 |
| Unit before the civic number (4-123, Unit 4-123, #4-123, Apt 4, ...) | 0 (the hyphenated inputs there are expected to be ranges) | `civic-numbers` unitBeforeCivic | 24 | 24 |
| Unit after the street, with and without a comma | some | `civic-numbers` unitAfterStreet | 18 | 3 |
| French comma after the civic number (123, rue Principale) | 4 | `french` civicNumberComma | 24 | 17 |
| Province in parentheses (Montréal (Québec)) | 0 | `french` provinceInParentheses | 7 | 7 |
| French directionals (Est, Ouest, Nord-Ouest, O.) | few | `french` directionals | 10 | 2 |
| French unit words (app., appartement, bureau, unité) | 2 | `french` units | 8 | 8 |
| Saint abbreviated (St-Laurent, Ste-Foy) | few | `french` saints | 4 | 0 |
| Postal code with and without the space, lowercase, hyphen, province run in | 4 unspaced | `postal-codes` formats | 9 | 1 |
| Every first letter Canada Post assigns, rural codes | some | `postal-codes` firstLetter | 20 | 0 |
| X codes split between NT and NU, and with no province | 7 X codes | `postal-codes` northwestTerritoriesAndNunavut | 8 | 0 |
| Every province and territory by code | most | `provinces` code | 13 | 0 |
| By English name | some | `provinces` englishName | 13 | 0 |
| By French name | 0 | `provinces` frenchName | 7 | 1 |
| Without commas | some | `provinces` noCommas | 13 | 2 |
| Old and informal abbreviations (PQ, Que., NF, P.E.I.) | 0 | `provinces` alternative | 17 | 4 |
| Rural routes (RR 2, R.R. 2, civic on a rural route) | 4 | `rural-and-postal` ruralRoute | 7 | 7 |
| Site and compartment | 1 | `rural-and-postal` siteAndCompartment | 3 | 3 |
| General delivery, GD, poste restante | 5 | `rural-and-postal` generalDelivery | 5 | 2 |
| PO Box and CP with station, succursale, RPO | 8 | `rural-and-postal` postOfficeBox | 10 | 4 |
| Numbered highways and Quebec routes | some | `highways-and-concessions` highways | 7 | 4 |
| Concession and lot, lines, numbered rural roads | 0 | `highways-and-concessions` ruralRoads | 10 | 1 |
| Lowercase and capitals | few | `formatting` letterCase | 16 | 0 |
| No commas, postal code unspaced | some | `formatting` spacing | 16 | 2 |
| Canada Post's printed block, two lines | few | `formatting` multiline | 16 | 0 |
| Trailing Canada, after a comma and on its own line | 0 | `formatting` trailingCountry | 16 | 16 |
| libpostal's Canadian fixtures | 0 | `libpostal-fixtures` | 3 | 1 |
| Inputs that are not addresses | 7 | `null-cases` | 5 | 0 |

## Parity with parse-address

`parse-address-parity.test.ts` runs every corpus input through `parse-address` and through `parseLocation`
and compares the eleven fields both report, on a common spelling (case folded, `Apt` and `Apartment` the
same unit). The figures are in `test-data/corpus/parity.json` and in the test's title:

- **Raw parity: 7,310 of 9,752 fields agree (75.0%)**, and 902 of 1,600 inputs agree on every field.
  This is reported, not held: 206 field values are wrong in the same way in both parsers, and fixing
  any of them lowers raw parity.
- **Compatibility: of the 7,549 field values parse-address gets right, address-plus also gets 7,266 right
  (96.3%).** This is the gate. It may only rise; after an improvement, record it with
  `CORPUS_PARITY_RECORD=1 pnpm exec vitest run src/__tests__/corpus/parse-address-parity.test.ts`.

The 283 field values parse-address gets right and address-plus does not are the drop-in regressions. The
largest groups: secondary units DEPT, HNGR, KEY, PIER, SLIP, SPC, STOP and TRLR, and units after a comma
(69 fields); a trailing country, semicolons and a unit on the line above (43); libpostal's venue-name and
floor-first lines (29); the parse-address suite itself (23, listed under its causes below); directional
words used as the street name (12); PMB, POB and PO Box ZIP+4 (13).

## What the parser gets wrong today

Each todo case is counted once, under its first cause in this list; a case can suffer from more than one.
Counts are cases (US + Canada). Inputs are quoted exactly; outputs leave out `zipValid`, `unit` and
`country`. The pointers say where the behaviour lives, as a starting point only.

### 1. Secondary unit designators missing from the unit pattern: 32 (US 26, CA 6)

`UNIT_TYPE_KEYWORDS` in `src/patterns/address-patterns.ts` lacks DEPT, HNGR, KEY, PIER, SLIP, SPC/SPACE,
STOP and TRLR/TRAILER, though `SECONDARY_UNIT_TYPES` knows most of them; it also lacks the French app.,
appartement, bureau and unité, and does not accept a period (`Apt.`), `Apt #` or `Apt No.`. The unit then
stays inside the street. `SECONDARY_UNIT_TYPES` spells HNGR as `Hanger` (USPS: Hangar).

- `7055 Sycamore St Dept 2, Boston, MA 02108` gives street `Sycamore St Dept 2`, no type, no unit.
- `444 South 5th St Apt. 3A Brooklyn, N.Y. 11211` gives street `5th St Apt. 3A Brooklyn`.
- `123 Main St Apt #456 Oakland CA 94789` gives street `Main St Apt`, unit `#` `456`.

### 2. A trailing country stops the last line being read: 28 (US 12, CA 16)

Nothing removes `USA`, `United States`, `U.S.A.` or `Canada` from the end, so the last comma part holds no
ZIP and everything after the street becomes the city.

- `742 Evergreen Ter, Springfield, IL 62704, USA` gives city `Springfield, IL 62704, USA`, no state or ZIP.
- `301 Front St W\nToronto ON  M5V 2T6\nCANADA` gives city `Toronto ON  M5V 2T6, CANADA`.
- `123 Main St, Springfield, IL 62701\nUnited States of America` gives city `Springfield, IL 62701, United States of America`.

### 3. Rural route and highway contract addresses not recognised: 22 (US 11, CA 11)

RR, R.R., Rural Route, RFD, HC, Highway Contract, Star Route and SITE/COMP are not parsed; `rr`,
`ruralRoute` and `site` exist on `ParsedAddress` but only the PO box parser fills `rr`, and only after a box.

- `RR 2 Box 152, Fargo, ND 58102` gives street `RR 2 Box 152`.
- `1234 River Rd RR 2, Lakefield ON K0L 2H0` gives street `Rd Rr 2`, type `Riv`.
- `Site 6 Comp 10 RR 8, Millarville AB T0L 1K0` gives no `site` and no `rr`.

### 4. Canadian unit-civic pair not split: 22 (CA 22)

Canada Post writes the unit first, joined by a hyphen (`4-123 Main St`). The parser reads `4-123` as a
number range, and with a designator (`Unit 4-123`) moves the designator to `place`.

- `4-123 Main St, Toronto ON M5H 2N2` gives number `4-123`, no unit.
- `Unit 4-123 Main St, Toronto ON M5H 2N2` gives number `123`, place `Unit 4`, no unit.
- `Apt 4, 123 Main St, Toronto ON M5H 2N2` gives street `4`, city `123 Main St`.

See the open question on ranges below: `canada/basic.json` expects `53-55 Water Street` to be a range.

### 5. Street type table gaps and inconsistencies: 18 (US 3, CA 15)

`normalizeStreetType` (`src/utils/street-type-normalizer.ts`) maps a word through the US table, then the
Canadian one, so the same type comes out differently by spelling: `Park` gives `Park` but `Pk` gives `Pk`
(also `Landng`, `Villge`, `Exten`, `Crnrs`, `Cross`, `Harbr`). Uppercase `CT` comes out `Crt`. Canada Post's
Circuit, Cul-de-sac and Diversion are known only abbreviated; croissant, terrasse and cercle get English
forms; the suffix EST (Estate) is read as the directional E; French Nord-Ouest and Sud-Ouest give `NW` and
`SW`, not Canada Post's `NO` and `SO`.

- `4090 Magnolia Ct, Anchorage, AK 99501` gives type `Crt`.
- `5074 Willow Est, Atlanta, GA 30303` gives suffix `E`, no type.
- `2354 Cedarvale Pk, London, ON N6A 4L9` gives type `Pk` where `Cedarvale Park` gives `Park`.

### 6. A unit in a comma part of its own: 16 (US 12, CA 4)

A designator with no number (BSMT, FRNT, LBBY, LOWR, OFC, PH, REAR, SIDE, UPPR) in its own comma part is
dropped; before a Canadian postal code, the comma part before the last is taken as the city
unconditionally, so a unit there becomes the city; a floor written number first is not a unit.

- `5707 Hawthorne St, Bsmt, Austin, TX 78701` gives no unit.
- `123 Main St, Unit 4, Toronto ON M5H 2N2` gives city `Unit 4`.
- `Planned Parenthood, 44 Court St, 6th Floor, Brooklyn 11201` gives city `6th Floor`, state `BROOKLYN`.

### 7. Street and place names re-cased: 15 (US 2, CA 13)

`capitalizeStreetName` capitalizes French particles that Canada Post keeps in lowercase, and lowercases
letters after an apostrophe.

- `2 rue des Jardins, Québec QC G1R 4S9` gives street `Des Jardins`.
- `900 place d'Youville, Québec QC G1R 3P7` gives street `D'youville`.
- `1 O'Farrell St, San Francisco, CA 94108` gives street `O'farrell`.

### 8. APO, FPO and DPO not recognised: 14 (US 14)

AA, AE and AP are not state codes, and APO, FPO and DPO are not read as the city.

- `PSC 802 Box 74, APO AE 09499` gives street `PSC 802 Box 74`, state `APO AE`, no city.
- `Unit 2050 Box 4190, APO AP 96278` gives unit `Unit 2050`, street `Box 4190`, state `APO AP`.
- `USS George Washington CVN 73, FPO AP 96616` gives state `FPO AP`, no city.

### 9. French street types: abbreviations with a period and missing types: 14 (CA 14)

`av.`, `boul.`, `ch.`, `crois.` and `imp.` are not recognised with their period, and carré, cours,
rond-point, allée, quai, parc, pointe and île are not in the tables at all; the type then stays in the street.

- `1100 boul. René-Lévesque O., Montréal QC H3B 4N4` gives street `boul. René-Lévesque`, no type.
- `4745 carré Sainte-Catherine, Montréal QC H2Y 1C6` gives street `carré Sainte-Catherine`.
- `1744 quai de la Montagne, Trois-Rivières QC G9A 5H3` gives street `quai de la Montagne`.

### 10. French civic number followed by a comma: 13 (CA 13)

Canada Post's French form puts a comma after the civic number. The parser splits on it, so the number
becomes the street and the street the city. With an accented city it also finds the state AL (next item).

- `275, rue Notre-Dame Est, Montréal QC H2Y 1C6` gives street `275`, city `rue Notre-Dame Est`, state `AL`.
- `2, rue des Jardins, Québec QC G1R 4S9` gives street `2`, city `rue des Jardins`.
- `1, promenade Sussex, Ottawa ON K1A 0A2` gives street `1`, city `promenade Sussex`.

Hidden inside this and the next items: **accented letters break word boundaries.** `\b` in the state
patterns treats `é` as a non-word character, so the `al` at the end of `Montréal` is read as Alabama
(7 corpus cases come out with state `AL`), and `CITY_PATTERNS` in `src/patterns/location-patterns.ts`
match `[A-Za-z]` only, so `Québec` and `Montréal` cannot be found as a city without a comma.

### 11. City with no comma before it: 12 (US 7, CA 5)

Without a comma the city is found by `CITY_PATTERNS` (one or two ASCII words), so a city of three words,
with an accent, an apostrophe or a suffix word is swallowed by the street, or a unit before it is.

- `1600 Amphitheatre Pkwy Mountain View CA 94043` gives street `Amphitheatre Pkwy Mountain`, type `Vw`.
- `1005 N Gravenstein Hwy Suite 500 Sebastopol, CA` gives street `Gravenstein Hwy Suite 500 Sebastopol`.
- `3127 Birchwood St Québec QC G1R 4S9` gives street `Birchwood St Québec`.

### 12. A directional word that is the whole street name: 8 (US 8)

Pub 28 treats a directional that is the only word before the suffix as the street name. The parser takes
it as a predirectional and the suffix as the street.

- `100 South St, Philadelphia, PA` gives prefix `S`, street `St` (parse-address gets this right).
- `1663 Northwest Hwy, Nashville, TN 37219` gives prefix `NW`, street `Hwy`.
- `1011 South Dr, Indiana, Pennsylvania 15705` gives prefix `S`, street `Dr`.

### 13. Civic number with a trailing letter: 8 (US 5, CA 3)

`123A`, `2455-B` and `4A-123` are not read as numbers; the number pattern accepts `\w\d+\w\d+` (the
Wisconsin form) but not a number followed by one letter.

- `123A Maple Ave, Seattle, WA 98101` gives street `123a Maple`, no number.
- `2455-B W BENCH RD OTHELLO WA 99344` gives street `2455-B W Bench`.
- `123A Main St, Toronto ON M5H 2N2` gives street `123a Main`.

### 14. Post office box variants: 8 (US 3, CA 5)

`Box` alone stays `Box` and `case postale` stays `Case Postale`; `POB` is unknown; a PO box's ZIP+4 is
not split; `STN` and `Stn` are not read as a station; `GD` and `poste restante` are not general delivery.

- `PO Box 1, Seattle, WA 98103-0001` gives zip `98103-0001`, no plus4.
- `PO BOX 4001 STN A\nTORONTO ON  M5W 1H8` gives city `STN A\nTORONTO ON`, no station or state.
- `Poste restante, Gatineau QC J8X 3Y9` gives street `Poste restante`, no general delivery.

### 15. Province in parentheses: 8 (CA 8)

The traditional French form `Montréal (Québec)` is not read; the parentheses stay in the city and, for
Montréal, the state comes out AL.

- `275 rue Notre-Dame Est, Montréal (Québec) H2Y 1C6` gives city `Montréal (Québec)`, state `AL`.
- `25 rue Laurier, Gatineau (Québec) J8X 3Y9` gives city `Gatineau (Québec)`.
- `110 avenue Laurier Ouest, Ottawa (Ontario) K1P 1J1` gives street `Laurier Ouest`, no suffix.

### 16. Unit written before the street line: 6 (US 3, CA 3)

- `Apt 4B, 1582 Elm St, Nashville, TN 37219` gives street `4B`, no number.
- `Apt 4\n123 Main St\nSpringfield, IL 62701` gives street `4`.
- `Apt 4, 123 Main St, Vancouver BC V5Y 1V4` gives street `4`, city `123 Main St`.

### 17. Street suffixes that are also unit words: 6 (US 3, CA 3)

KEY, TRAILER (TRLR), FRONT and GATE are suffixes in Pub 28 or Canada Post's list; after a street name and
before a comma they are read as units.

- `4993 Magnolia Key, Anchorage, AK 99501` gives unit `Key`, no type.
- `3081 Birchwood Gate, Ottawa ON K1P 1J1` gives unit `Gate`.

### 18. A comma between state and ZIP: 5 (US 4, CA 1)

- `1400 West Transport Road, Fayetteville, AR, 72704` gives city `AR`, no state.
- `10 Amelia Village Circle, Fernandina Beach, FL, 32034` gives unit `Floor`, no city or state.
- `1486 Bay St, Toronto ON, M5H 2N2` gives city `Toronto ON`.

### 19. A suffix or unit word inside a name: 5 (US 5)

- `100 Avenue A, New York, NY 10009` gives type `Ave`, street `A`.
- `1 Bowling Green, New York, NY 10004` gives street `Bowling`, type `Grn`.
- `77 Old Post Office Rd, Bristol, VT 05443` gives street `Old Post`, unit `Office` `Rd`.

### 20. Province spellings not recognised: 5 (CA 5)

`Île-du-Prince-Édouard`, `PQ`, `Que.`, `NF` and `Nfld.` come out as written, in capitals.

- `759 Water St, Québec, PQ G1R 4S9` gives state `PQ`.
- `4604 Frontenac St, Charlottetown, Île-du-Prince-Édouard C1A 4B7` gives state `ÎLE-DU-PRINCE-ÉDOUARD`.

### Smaller causes

| Cause | Cases | Example and what comes out |
| --- | ---: | --- |
| A place name before the number with no comma | 4 | `Barboncino 781 Franklin Ave Crown Heights Brooklyn NYC NY 11216 USA` gives street `Barboncino 781 Franklin Ave Crown Heights Brooklyn NYC NY 11216`, city `USA` |
| Puerto Rico urbanization goes to `place`, not `locality` | 4 | `URB Las Gladiolas, 150 Calle A, San Juan, PR 00926` gives place `URB Las Gladiolas` |
| Runs of spaces kept inside the street | 3 | `  4059  Mt  Lee  Dr ,  Hollywood ,  CA   90068  ` gives street `Mt  Lee` |
| Private mailbox (PMB) not a unit | 3 | `123 Willow St PMB 456, Denver, CO 80202` gives street `Willow St PMB 456` |
| Number spelled out | 3 | `One Microsoft Way, Redmond, WA 98052` gives place `One Microsoft Way`, street `Redmond` |
| Semicolons or a dash as separators | 2 | `123 Main Street; Springfield; IL 62701` gives street `Main Street; Springfield;` |
| Floor written number first | 2 | `30 W 26th St 6th Fl` gives street `26th St 6th`, state `FL` |
| State with periods loses the city | 2 | `1600 Pennsylvania Ave NW, Washington D.C. 20500` gives no city |
| Numbered highway with a directional | 2 | `1234 Hwy 7 E, Peterborough ON K9J 6X3` gives street `7 E`, no suffix |
| Utah grid address with a unit | 1 | `550 S 400 E #3206, Salt Lake City UT 84111` gives no unit (the author's parked case) |
| FL read as a floor after General Delivery | 1 | `General Delivery, Tampa FL 33602` gives unit `Floor` `33602` |
| Other single cases | 7 | `321 S. Washington` gives street `S.`, state `WA`; `30 w 26 st` gives suffix `ST`; `N/A` parses to street `N/A`; `'45 Quaker Ave, Ste 105'` keeps the quotes; `Canal Rd, Deltona FL` loses city and state; `4411 Stone Way North Seattle, King County, WA 98103` takes the county as the city; `Lot 12, Concession 4, Smiths Falls ON K7A 4S5` gives city `Concession 4` |

## Open questions for the fixing pass

These are decisions, not bugs; the corpus takes one side of each, stated here so it can be changed in
one place if the author decides otherwise.

1. **A Canadian `53-55` is a range or a unit-civic pair?** Canada Post's rule is unit, hyphen, civic, and
   the corpus expects `4-123 Main St` to be unit 4 at 123. `canada/basic.json` and
   `canada/famous-addresses.json` expect `53-55 Water Street, Vancouver` to be the range `53-55`. The two
   cannot both hold for every input. The corpus keeps its unit-civic cases unambiguous (the unit is much
   smaller than the civic number, has a letter, or is larger than it) so a rule such as "a range when the
   second number is just above the first and of the same parity, a unit otherwise" satisfies both sets.
2. **Canada Post or USPS abbreviations for Canadian types?** The corpus follows the library's existing
   choice (USPS where the word exists). Canada Post would give `Crt`, `Lane`, `Trail`, `Terr`. If the
   library switches, the Canadian `type` values change in `canada/street-types.json` and its formatting
   cases, and `canada/special-cases.json` (`Confederation Trail` as `Trl`) changes with them.
3. **Fields for parts with none yet.** The military delivery line (PSC 802 Box 74), a site's compartment,
   a highway contract route's own field, and the urbanization (the corpus uses `locality`).
4. **Existing hand-written cases that hold today's output, not the right one.** `us/basic.json` expects
   `1005 N Gravenstein Hwy Suite 500 Sebastopol, CA` to give street `Gravenstein Hwy Suite 500 Sebastopol`
   (parse-address and the corpus expect street `Gravenstein`, unit `Suite 500`, city `Sebastopol`);
   `us/compatibility.json` expects `123 Maple Rochester, New York` to give street `Maple Rochester`;
   `canada/basic.json` expects `456 Rue Saint-Jacques Montréal QC` to give street `Saint-Jacques Montréal`.
   Fixing causes 1, 6 and 11 will break those cases, and they should then be corrected, not the fix.

## Not done here

- `pnpm typecheck` already failed before this work, in `src/__tests__/types.test-d.ts` (the `JP` country)
  and `src/__tests__/core/compatibility.test.ts` (no types for `parse-address`, possibly null
  expectations). The corpus files add no type errors.
- The corpus is US and Canada only; the Japanese module is being tested by its own work.

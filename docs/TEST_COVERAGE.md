# Test Coverage: the US and Canadian Address Corpora

This document says what address shapes the US and Canadian postal authorities define, which of them the
hand-written tests already exercised, what the corpus under `test-data/corpus/` adds, and, last, what the
parser got wrong when the corpus was written and how the fixing pass that followed dealt with each cause.

## In numbers

| | Cases | Pass today | Todo (wrong today) | Todo before the fixing pass |
| --- | ---: | ---: | ---: | ---: |
| United States (`test-data/corpus/us/`, 14 files) | 1,092 | 1,091 | 1 | 149 |
| Canada (`test-data/corpus/canada/`, 10 files) | 513 | 513 | 0 | 150 |
| Total | 1,605 | 1,604 | 1 | 299 |

Before the corpus, `test-data/` held about 440 address inputs written by hand (the 600 test cases count
the function tests in TypeScript too). They exercised 34 distinct street types, 13 unit designators and
no military, urbanization, private mailbox, trailing-country or province-in-parentheses address at all.

Field by field, over every field value a corpus case names other than `country`:

| | address-plus right | parse-address right |
| --- | ---: | ---: |
| United States (6,715 field values) | 6,714 (99.99%) | 6,350 (94.6%) |
| Canada (3,193 field values) | 3,193 (100%) | 1,215 (38.1%) |

Before the fixing pass the same count gave address-plus 94.7% in the United States and 89.9% in Canada.

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
  field here (a neighbourhood or county in libpostal's fixtures), where how a part should split is
  unsettled (a numbered concession or sideroad), or where the case asserts only what must not be invented.
  The military, compartment and highway contract cases were partial until those parts had fields.
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
  This matches the library's existing tests (a Canadian `Trail` is `Trl`). It is a known divergence
  from Canada Post, not a bug: Canada Post writes `Crt`, `Lane`, `Trail` and `Terr` where the library
  writes `Ct`, `Ln`, `Trl` and `Ter`.
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
- A hyphenated leading number is read by country. In a Canadian address (a province, a postal code or
  `country: "CA"` says so) it is Canada Post's unit-civic pair, unit first: `4-123 Main St` and
  `Unit 4-123 Main St` are unit 4 at civic 123, and so is `53-55 Water Street` (unit 53 at 55), which the
  hand-written cases in `canada/basic.json` and `canada/famous-addresses.json` used to read as a range.
  When the address names a unit elsewhere (`53-55 Water St., Suite 400`), the hyphen joins a range and the
  number stays `53-55`. In a US address a hyphenated number such as Queens' `87-11` is one number.
- `number` keeps a fraction (`123 1/2`, per the README) and a letter (`123A`).
- A route-numbered road keeps its qualifier and number in `street` with the road word abbreviated and
  no `type` (`US Hwy 431`, `County Rd 45`), as `parser.ts` does on purpose. A Canadian highway follows
  Canada Post instead: `Hwy 7` is type `Hwy`, street `7`, as for a French type.
- Rural routes report `rr` (the number) and `ruralRoute` (`RR 2`); a highway contract route reports
  `highwayContract` (the number) and `ruralRoute: "HC 68"`; the box on a route is `secUnitType: "Box"`.
  A Canadian site and compartment report `site` and `compartment`. General delivery reports
  `generalDelivery: true` and `street: "General Delivery"`. A Puerto Rico urbanization goes in `locality`.
- A military address reports its delivery line (`PSC 802 Box 74`, `USS Mitscher DDG 57`) in `military`,
  as written, APO, FPO or DPO in `city`, and AA, AE or AP in `state`.
- Postal codes are reported in capitals with one space (`M5H 2N2`); ZIP+4 is split into `zip` and `plus4`.
- `country` is `US` or `CA` whenever a state, province or postal code says so.

## Sources and licences

| Source | Licence | Used for |
| --- | --- | --- |
| USPS Publication 28, Postal Addressing Standards | US government work, public domain | Appendix B (state and territory codes), C1 (street suffixes), C2 (secondary unit designators), and the rules for directionals, numbers, PO boxes, PMB, rural and highway contract routes, general delivery, military and Puerto Rico addresses. Inputs are constructed. |
| Canada Post Addressing Guidelines | Rules described in our own words; nothing copied | Street types in both languages, unit and civic number order, French addresses, postal codes, province symbols, rural routes, site and compartment, general delivery, PO boxes and stations. Every input is constructed. |
| parse-address `test.js` (github.com/hassansin/parse-address) | ISC | The SHAPES of its 65 street-address cases, each written again as an original address (`us/parse-address-shapes.json`), and of its intersection cases (`us/intersections.json` in `test-data/`). No input is copied. Six cases keep a note where address-plus departs from parse-address on purpose, each saying why in its description. |
| Geo::StreetAddress::US `t/01_parser.t` (metacpan.org) | Artistic or GPL | Its shapes only, read to check that every one has an original case here (see "Shapes from parse-address and Geo::StreetAddress::US"); five shapes only it tests became `shape 66` to `shape 70`. No input is copied. |
| libpostal `test/test_parser.c` (github.com/openvenues/libpostal) | MIT | All 40 US street addresses and the 3 Canadian ones, their labelled components converted to this library's fields. libpostal's fixtures hold only these; its large training data comes from OpenStreetMap (ODbL) and OpenAddresses and is not used. |

The parity test (below) still runs the `parse-address` npm package live, as a dev dependency. That is fine: it is
ISC licensed, and the test only reads what the package returns for our inputs; none of its test inputs are carried.

## Shapes from parse-address and Geo::StreetAddress::US

The parse-address package's own test suite is the compatibility bar for this library, and many of its cases trace
back to the Perl module Geo::StreetAddress::US, which is distributed under the Artistic License or the GPL. No
input of that lineage is carried here. Only the shapes are taken: what each case exercises (a glued grid number, a
unit with no commas, a type spelled out, a ZIP+4 with a space) was listed, and every shape then got an original
input, with its own street names, house numbers and towns, in `us/parse-address-shapes.json`. The table says which
suite exercises each shape and which of our cases covers it.

parse-address's suite has 75 cases (65 street addresses and 10 intersections), which come to 70 distinct shapes.
Geo::StreetAddress::US's suite has 46 cases (38 street addresses and 8 intersections) and 5 inputs that must not
parse, which come to 51 shapes. Together they are 75 distinct shapes, and every one has at least one
original case here.
Its option that drops a redundant street type (`County Road 43`) is a setting, not a shape of input; the inputs it
is tested on are shapes 37 and 38.

| Shape | parse-address | Geo::StreetAddress::US | Our case(s) |
| --- | --- | --- | --- |
| Number, street, highway type, ZIP only (no city, state or commas) | yes | yes | shape 01 |
| The same with a comma before the ZIP | yes | yes | shape 02 |
| Abbreviated suffix directional, comma, ZIP only | yes | yes | shape 03 |
| Highway and suffix directional spelled out, comma, ZIP only | yes | yes | shape 04 |
| Prefix directional, full highway word, city and state, no ZIP | yes | yes | shape 05 |
| The same with a Suite unit between commas | yes | yes | shape 06 |
| Unit with no commas around it, comma only before the state | yes | yes | shape 07 |
| Extra comma between the state and the ZIP | yes | yes | shape 08 |
| No punctuation at all: prefix directional, city, state, ZIP | yes | yes | shape 09 |
| Suffix directional, no commas, city and state | yes | yes | shape 10 |
| Suffix directional followed by a comma, city and state | yes | yes | shape 11 |
| Comma, then a lone directional letter joined to the city | yes | yes | shape 12 |
| Comma, then a full direction word joined to the city | yes | yes | shape 13 |
| Abbreviated type, city and state, no commas | yes | yes | shape 14 |
| Street with no type, two-word city | yes | yes | shape 15 |
| Two-word street name, commas, city, state, ZIP | yes | yes | shape 16 |
| Two-word street name, no commas | yes | yes | shape 17 |
| A route named State Highway with a number | yes | yes | shape 18 |
| Type abbreviated with a period (Ave.) | yes | yes | shape 19 |
| Type spelled out (Avenue) | yes | yes | shape 20 |
| Grid address with directionals glued to the numbers (48S 400E) | yes | yes | shape 21 |
| Grid address with spaced directionals and a pound-sign unit | yes | yes | shape 22 |
| Grid address with an Apt unit of letter and digits | yes | yes | shape 23 |
| A direction word as the street name | yes | yes | shape 24 |
| Prefix directional written with periods (S.E.) | yes | yes | shape 25 |
| Fractional house number | yes | yes | shape 26 |
| Lowercase lone letter after the comma, joined to the city | yes | yes | shape 27 |
| State spelled out in full, no comma before the city | yes | yes | shape 28 |
| ZIP+4 with a hyphen | yes | yes | shape 29 |
| ZIP+4 run together as nine digits | yes | yes | shape 30 |
| ZIP+4 with a space | yes |  | shape 31 |
| No house number, ZIP+4 with a space | yes |  | shape 32 |
| A unit word with no number (lobby) before the ZIP | yes | yes | shape 33 |
| The same wrapped in parentheses | yes | yes | shape 34 |
| Pound-sign unit written before the house number | yes | yes | shape 35 |
| Unit designator glued to its number and written first (lt42) | yes | yes | shape 36 |
| Numbered county road | yes | yes | shape 37 |
| Numbered county highway in capitals with a letter glued to the number (60E) | yes | yes | shape 38 |
| House number, directional with a period, street only | yes | yes | shape 39 |
| Whole address in single quotes, comma before an abbreviated suite | yes | yes | shape 40 |
| Row as the street type | yes |  | shape 41 |
| Post office box spelled out in words | yes |  | shape 42 |
| Post office box with periods | yes |  | shape 43 |
| Post office box run together (POBox) | yes |  | shape 44 |
| Wisconsin grid number with commas | yes |  | shape 45 |
| Wisconsin grid number without commas | yes |  | shape 46 |
| Wisconsin grid number in lowercase | yes |  | shape 47 |
| Street type Common or Cmn (full word and abbreviation), two-word street name | yes |  | shape 48, shape 49 |
| Street type Commons or Cmns (plural, full word and abbreviation) | yes |  | shape 50, shape 51 |
| Street type Crossroad or Xrd (full word and abbreviation) | yes |  | shape 52, shape 53 |
| Street type Crossroads or Xrds (plural, full word and abbreviation) | yes |  | shape 54, shape 55 |
| Street type Fall (singular) | yes |  | shape 56 |
| Street type Falls or Fls (full word and abbreviation) | yes |  | shape 57, shape 58 |
| Street type Land | yes |  | shape 59 |
| Two-word street name with Mall as the type | yes |  | shape 60 |
| Two-word street name with Mews as the type | yes |  | shape 61 |
| Pass as the type, state spelled out as two words | yes |  | shape 62 |
| Rue as an English street type | yes |  | shape 63 |
| Run as the street type | yes |  | shape 64 |
| Wall as the street type | yes |  | shape 65 |
| A town but no state and no ZIP (no state may be invented) |  | yes | shape 66 |
| Two capital letters that are not a state code (no state may be taken) |  | yes | shape 67 |
| No house number, street and a plain five-digit ZIP |  | yes | shape 68 |
| House number led by a letter (E412) |  | yes | shape 69 |
| House number with a directional letter glued after it (412E) |  | yes | shape 70 |
| Ampersand, no types, no comma before the city (intersection) | yes | yes | intersections.json: `Larch & Bellamy Baton Rouge LA` |
| Ampersand, no types, comma before the city (intersection) | yes | yes | intersections.json: `Larch & Bellamy, Baton Rouge LA` |
| "and" between two typed streets, city and state (intersection) | yes | yes | intersections.json: `Larch St and Bellamy St Baton Rouge LA` |
| "and" between two typed streets, no city or state (intersection) | yes |  | intersections.json: `Larch St and Bellamy St` |
| Ampersand between two typed streets, city and state (intersection) | yes | yes | intersections.json: `Larch St & Bellamy St Baton Rouge LA` |
| One plural type shared by both streets (Sts) (intersection) | yes | yes | intersections.json: `Larch and Bellamy Sts Baton Rouge LA` |
| Shared plural type with a period (Sts.), ampersand (intersection) | yes | yes | intersections.json: `Larch & Bellamy Sts. Baton Rouge LA` |
| Shared plural type with a period, no city or state (intersection) | yes |  | intersections.json: `Larch and Bellamy Sts.` |
| Shared plural type spelled out (Streets) (intersection) | yes | yes | intersections.json: `Larch & Bellamy Streets Baton Rouge LA` |
| Two different full types (Avenue and Street) (intersection) | yes | yes | intersections.json: `Larch Avenue and Bellamy Street Baton Rouge LA` |

Shape cases are in `us/parse-address-shapes.json` (names like `shape 07`); the intersection shapes are in
`test-data/us/intersections.json`, because the corpus suites run `parseLocation` only and `parseIntersection` has its
own suite.

## Gap analysis: United States

The authority is USPS Publication 28. "Before" counts the hand-written inputs in `test-data/` (us, core,
canada and todo) that show the shape; the last column gives the todo cases now and, in brackets, when the
corpus was written, before the fixing pass.

| Shape (Pub 28) | Before | Corpus file and group | Cases | Todo now (before the fix) |
| --- | ---: | --- | ---: | ---: |
| Every primary street suffix (Appendix C1), in full | 34 types in all | `street-suffixes` fullWord | 206 | 0 (2) |
| Every standard suffix abbreviation | (included above) | `street-suffixes` abbreviation | 186 | 0 (3) |
| Common suffix spellings C1 maps (AV, BOULV, STR, HIWAY) | few | `street-suffixes` variantSpelling | 30 | 0 (0) |
| Predirectionals, 8 directions, abbreviated, in full, dotted | some | `directionals` prefix | 24 | 0 (0) |
| Postdirectionals, 8 directions, with and without a comma | some | `directionals` suffix | 24 | 0 (0) |
| Pre- and postdirectional together | 0 | `directionals` prefixAndSuffix | 4 | 0 (0) |
| Directional word as the street name (North St) | 1 | `directionals` directionalAsName | 11 | 0 (6) |
| Every secondary unit designator (Appendix C2), abbreviated | 13 designators | `secondary-units` abbreviated | 24 | 0 (8) |
| Designators in full | | `secondary-units` fullWord | 16 | 0 (4) |
| Designator after a comma | | `secondary-units` afterComma | 24 | 0 (17) |
| `#` as the designator | few | `secondary-units` poundSign | 4 | 0 (0) |
| Unit variants (Apt #, Apt., lettered, Florida FL) and unit first | few | `secondary-units` variants | 14 | 0 (5) |
| Fractional numbers | 2 | `primary-numbers` fractions | 5 | 0 (0) |
| Numbers with a letter (123A) | 0 | `primary-numbers` lettered | 4 | 0 (4) |
| Number ranges (912-914) | few | `primary-numbers` ranges | 3 | 0 (0) |
| Queens and Hawaii hyphenated numbers | 2 | `primary-numbers` hyphenated | 6 | 0 (0) |
| Utah grid (48 S 400 E) | 6 | `primary-numbers` grid | 6 | 0 (0) |
| Wisconsin grid (W204N11912) | 5 | `primary-numbers` wisconsinGrid | 5 | 0 (0) |
| Numbers spelled out (One Microsoft Way) | few | `primary-numbers` written | 3 | 0 (3) |
| Ordinal and spelled-out numbered streets | some | `street-names` ordinal | 22 | 0 (0) |
| Bare-number streets (83 St) | 0 | `street-names` numeric | 4 | 0 (0) |
| Route-numbered roads (US Hwy 431, County Rd 45) | 6 | `street-names` routeNumbered | 6 | 0 (0) |
| Suffix words used as the name (Park Ave, Court St) | few | `street-names` suffixWordAsName | 8 | 0 (0) |
| Streets with no suffix (Broadway, Avenue A) | few | `street-names` noSuffix | 5 | 1 (3) |
| Names of several words, apostrophes, St. for Saint | some | `street-names` multiword | 10 | 0 (3) |
| PO Box spellings (P.O., Post Office Box, POBox, Box, POB) | 9 | `po-box-and-rural` poBox | 12 | 0 (3) |
| Private mailbox (PMB) | 0 | `po-box-and-rural` privateMailbox | 3 | 0 (3) |
| Rural route (RR, R.R., Rural Route, RFD) | 4 | `po-box-and-rural` ruralRoute | 7 | 0 (7) |
| Highway contract route (HC, Star Route) | 1 | `po-box-and-rural` highwayContract | 4 | 0 (4) |
| General delivery | 5 | `po-box-and-rural` generalDelivery | 6 | 0 (1) |
| Military: APO, FPO, DPO with AA, AE, AP | 0 | `military` | 14 | 0 (14) |
| Puerto Rico urbanizations and Spanish-order streets | 0 | `territories` puertoRico | 7 | 0 (4) |
| Guam, Virgin Islands, American Samoa, Northern Marianas, freely associated states | 0 | `territories` islands | 11 | 0 (1) |
| Every state, DC and territory by code, by name, without commas | most codes | `states` | 168 | 0 (2) |
| ZIP, ZIP+4 with hyphen, run together, with spaces; leading zeros | 30 with hyphen | `zip-codes` | 18 | 0 (1) |
| Lowercase and capitals | 10 lowercase, 0 capitals | `formatting` letterCase | 16 | 0 (0) |
| Punctuation variants | some | `formatting` punctuation | 6 | 0 (2) |
| No commas, extra spaces | some | `formatting` spacing | 16 | 0 (4) |
| Multiline (LF and CRLF), unit on its own line | 4 | `formatting` multiline | 19 | 0 (1) |
| Trailing country (USA, United States, U.S.A.) | 0 | `formatting` trailingCountry | 12 | 0 (11) |
| parse-address's and Geo::StreetAddress::US's shapes, original inputs | 23 in compatibility.json | `parse-address-shapes` | 70 | 0 (8) |
| libpostal's US fixtures | 0 | `libpostal-fixtures` | 40 | 0 (23) |
| Inputs that are not addresses | 7 | `null-cases` | 9 | 0 (1) |

Not covered, on purpose: intersections (`parseIntersection` has its own suite), strict mode and postal
validation (their own suites), and addresses with a recipient or attention line, which Pub 28 places above
the delivery address and this parser does not model.

## Gap analysis: Canada

The authority is Canada Post's Addressing Guidelines.

| Shape (Canada Post) | Before | Corpus file and group | Cases | Todo now (before the fix) |
| --- | ---: | --- | ---: | ---: |
| English street types in full (116 types) | a dozen | `street-types` english | 116 | 0 (7) |
| English types by Canada Post's abbreviation | few | `street-types` englishAbbreviation | 48 | 0 (6) |
| French street types before the name (29 types) | Rue, Ch, Place, Promenade, Square | `street-types` french | 29 | 0 (20) |
| French types abbreviated (av., boul., ch., crois., imp.) | 1 | `street-types` frenchAbbreviation | 5 | 0 (5) |
| Civic number with a letter or a half (123A, 123 1/2) | 0 | `civic-numbers` civicSuffix | 6 | 0 (3) |
| Unit before the civic number (4-123, Unit 4-123, #4-123, Apt 4, ...) | 0 (`53-55 Water Street` there was expected to be a range; it is now unit 53 at 55) | `civic-numbers` unitBeforeCivic | 24 | 0 (24) |
| Unit after the street, with and without a comma | some | `civic-numbers` unitAfterStreet | 18 | 0 (3) |
| French comma after the civic number (123, rue Principale) | 4 | `french` civicNumberComma | 24 | 0 (17) |
| Province in parentheses (Montréal (Québec)) | 0 | `french` provinceInParentheses | 7 | 0 (7) |
| French directionals (Est, Ouest, Nord-Ouest, O.) | few | `french` directionals | 10 | 0 (2) |
| French unit words (app., appartement, bureau, unité) | 2 | `french` units | 8 | 0 (8) |
| Saint abbreviated (St-Laurent, Ste-Foy) | few | `french` saints | 4 | 0 (0) |
| Postal code with and without the space, lowercase, hyphen, province run in | 4 unspaced | `postal-codes` formats | 9 | 0 (1) |
| Every first letter Canada Post assigns, rural codes | some | `postal-codes` firstLetter | 20 | 0 (0) |
| X codes split between NT and NU, and with no province | 7 X codes | `postal-codes` northwestTerritoriesAndNunavut | 8 | 0 (0) |
| Every province and territory by code | most | `provinces` code | 13 | 0 (0) |
| By English name | some | `provinces` englishName | 13 | 0 (0) |
| By French name | 0 | `provinces` frenchName | 7 | 0 (1) |
| Without commas | some | `provinces` noCommas | 13 | 0 (2) |
| Old and informal abbreviations (PQ, Que., NF, P.E.I.) | 0 | `provinces` alternative | 17 | 0 (4) |
| Rural routes (RR 2, R.R. 2, civic on a rural route) | 4 | `rural-and-postal` ruralRoute | 7 | 0 (7) |
| Site and compartment | 1 | `rural-and-postal` siteAndCompartment | 3 | 0 (3) |
| General delivery, GD, poste restante | 5 | `rural-and-postal` generalDelivery | 5 | 0 (2) |
| PO Box and CP with station, succursale, RPO | 8 | `rural-and-postal` postOfficeBox | 10 | 0 (4) |
| Numbered highways and Quebec routes | some | `highways-and-concessions` highways | 7 | 0 (4) |
| Concession and lot, lines, numbered rural roads | 0 | `highways-and-concessions` ruralRoads | 10 | 0 (1) |
| Lowercase and capitals | few | `formatting` letterCase | 16 | 0 (0) |
| No commas, postal code unspaced | some | `formatting` spacing | 16 | 0 (2) |
| Canada Post's printed block, two lines | few | `formatting` multiline | 16 | 0 (0) |
| Trailing Canada, after a comma and on its own line | 0 | `formatting` trailingCountry | 16 | 0 (16) |
| libpostal's Canadian fixtures | 0 | `libpostal-fixtures` | 3 | 0 (1) |
| Inputs that are not addresses | 7 | `null-cases` | 5 | 0 (0) |

## Parity with parse-address

`parse-address-parity.test.ts` runs every corpus input through `parse-address` and through `parseLocation`
and compares the eleven fields both report, on a common spelling (case folded, `Apt` and `Apartment` the
same unit). The figures are in `test-data/corpus/parity.json` and in the test's title:

- **Raw parity: 7,568 of 9,923 fields agree (76.3%)**, and 979 of 1,605 inputs agree on every field
  (before the fixing pass: 7,326 of 9,772, 75.0%, and 904 inputs). This is reported, not held: a field
  both parsers got wrong in the same way and address-plus now gets right lowers it.
- **Compatibility: of the 7,565 field values parse-address gets right, address-plus also gets all 7,565
  right (100%)**; before the fixing pass it was 7,282 of 7,563 (96.3%). This is the gate. It may only
  rise; after an improvement, record it with
  `CORPUS_PARITY_RECORD=1 pnpm exec vitest run src/__tests__/corpus/parse-address-parity.test.ts`.

There are no drop-in regressions left: no field value parse-address gets right that address-plus does not.
The 283 there were when the corpus was written (secondary units DEPT, HNGR, KEY, PIER, SLIP, SPC, STOP and
TRLR and units after a comma, a trailing country, semicolons and a unit on the line above, libpostal's
venue-name and floor-first lines, the parse-address shapes, directional words used as the street name, PMB,
POB and PO Box ZIP+4) are all fixed.

## What the parser got wrong, and how each cause was fixed

The causes below are the brief the corpus left for the fixing pass, kept as the record of what was wrong.
The fixing pass took them in order; every one is fixed but part of cause 19, and 298 of the 299 todo cases
now assert. The table says how; the sections after it are the brief as it was written.

| Cause | Cases | Status | The fix |
| --- | ---: | --- | --- |
| 1. Unit designators missing | 32 | Fixed | Every Pub 28 designator, with `.`, `#` or `No.` before the value, and the French unit words (`UNIT_TYPE_KEYWORDS`, `src/patterns/address-patterns.ts`); HNGR is Hangar |
| 2. Trailing country | 28 | Fixed | Removed before parsing, and kept as the country (`src/utils/prepare-input.ts`) |
| 3. Rural and highway contract routes | 22 | Fixed | A parser of their own (`src/parsers/rural-route-parser.ts`), and an RR after a street or in a part of its own; new fields `highwayContract` and `compartment` |
| 4. Canadian unit-civic pair | 22 | Fixed | Split in a Canadian address only (see the conventions); a US hyphenated number stays whole |
| 5. Street type tables | 18 | Fixed | A USPS abbreviation stays itself; Canadian spellings map to the USPS word; Canada Post's own types known in full; Est is Estate outside Canada; NO and SO |
| 6. A unit in a comma part of its own | 16 | Fixed | Set aside before the city is chosen, with no-number designators and number-first floors |
| 7. Names re-cased | 15 | Fixed | A mixed-case word is kept as written; a lowercase particle stays lowercase (`src/utils/capitalization.ts`) |
| 8. APO, FPO and DPO | 14 | Fixed | A parser of its own (`src/parsers/military-parser.ts`); new field `military` |
| 9. French types with a period, missing types | 14 | Fixed | A type may end in a period; carré, cours, rond-point, allée, quai, parc, pointe and île added |
| 10. French civic number and comma; `\b` and accents | 13 | Fixed | The comma is dropped before parsing; word edges are Unicode lookarounds everywhere a state, city or type is matched (`src/patterns/word-boundary.ts`) |
| 11. City with no comma before it | 12 | Fixed | The street ends at its first type that a city can follow (`src/utils/split-city.ts`) |
| 12. Directional as the street name | 8 | Fixed | A directional followed only by a type is the name |
| 13. Number with a trailing letter | 8 | Fixed | `123A`, `2455-B`; a trailing N, S, E or W is still a directional (`412E`) |
| 14. PO box variants | 8 | Fixed | Box and POB are PO Box, case postale is CP, STN is a station, ZIP+4 split; GD and poste restante are general delivery |
| 15. Province in parentheses | 8 | Fixed | Rewritten as the code before parsing |
| 16. Unit before the street line | 6 | Fixed | Moved after the street before parsing |
| 17. Types that are also unit words | 6 | Fixed | A designator is a unit only with a value, or, with none, after a street type |
| 18. Comma between state and ZIP | 5 | Fixed | Joined before parsing |
| 19. A type or unit word inside a name | 5 | 4 fixed, 1 left | Outside Canada and Puerto Rico a type before the name is part of it (`Avenue A`, `Avenue of the Americas`); a unit needs a value, so `Old Post Office Rd` is a street. `1 Bowling Green` is left: see below |
| 20. Province spellings | 5 | Fixed | PQ, Que., NF and Nfld. added; accents no longer break the match |
| Smaller causes | 34 | Fixed | A place's name before the number; urbanization in `locality`; runs of spaces; PMB; numbers spelled out; semicolons and a spaced dash; number-first floors; D.C. with periods; Canadian highways with a direction; a unit after a grid street; FL after General Delivery; `N/A`; quotes; a street with no number; a county part |

### What is still wrong

`1 Bowling Green, New York, NY 10004` gives street `Bowling`, type `Grn`, where the corpus wants the whole
`Bowling Green` with no type. Green is a Publication 28 suffix, and nothing in the address tells this
street from `12 Maple Green`; telling them apart needs a list of named streets, which this library does
not carry. The case stays todo.

Each todo case below was counted once, under its first cause in this list; a case can suffer from more than
one. Counts are cases (US + Canada). Inputs are quoted exactly; outputs leave out `zipValid`, `unit` and
`country`. The pointers said where the behaviour lived, as a starting point only.

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

## Questions the fixing pass settled

1. **A Canadian `53-55`.** Canada Post's reading: unit 53 at civic 55, in a Canadian address, unless the
   address names a unit elsewhere. `canada/basic.json` and `canada/famous-addresses.json` were changed to
   it. See the conventions above.
2. **Canada Post or USPS abbreviations for Canadian types.** USPS, as the library always had them; Canada
   Post's `Crt`, `Lane`, `Trail` and `Terr` are a known divergence, noted in the conventions.
3. **Fields for parts with none.** `military` holds the military delivery line, `compartment` a site's
   compartment and `highwayContract` a highway contract route's number; a Puerto Rico urbanization stays
   in `locality`.
4. **Existing hand-written cases that held the old output.** Corrected to the right output wherever a
   fix changed them: among others `1005 N Gravenstein Hwy Suite 500 Sebastopol, CA` (street
   `Gravenstein`, unit `Suite 500`, city `Sebastopol`), `123 Maple Rochester, New York` (street `Maple`,
   city `Rochester`), `456 Rue Saint-Jacques Montréal QC` (street `Saint-Jacques`, city `Montréal`),
   `100 South St` (the street South), the rural route and highway contract cases, and the cleaning and
   formatting cases that wrote the unit before the number.

## Not done here

- The corpus is US and Canada only; the Japanese module is tested by its own suites.

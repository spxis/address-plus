# Changelog

All notable changes to this project are written here, in the style of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The project follows [Semantic Versioning](https://semver.org/).

## Unreleased

### Added

- A Japanese address corpus of 1,118 cases (`test-data/corpus/japan/`): 837 of the real addresses in Geolonia's normalize-japanese-addresses tests (MIT), its 38 normaliser shapes, and original cases for kanji and full-width numerals, sixteen kinds of dash, postal codes, buildings, 大字 and 郡, Kyoto's street directions, Hokkaido's grids, the twenty designated cities, Tokyo's 23 wards, romaji and unknown places. `docs/TEST_COVERAGE.md` describes it.
- TSDoc on every export, in the published type definitions, so an editor shows on hover what each function, table and type is, its parameters, what it returns (and what `null` or `undefined` means), and an example with its answer. `pnpm docs:check` runs every example against the built package. The API reference (`docs/api.md`) now lists the parameters and return value too.
- `docs/MIGRATING_FROM_PARSE_ADDRESS.md`: moving from parse-address, with every call and field mapped, the answers that differ on purpose shown side by side, and a before and after.
- `streetDirections` on a Japanese address: Kyoto's street directions (`寺町通御池上る`), apart from the town they lead to (`上本能寺前町`). `formatJapanese` and `formatJapaneseEnglish` write them back before the town.

### Changed

- Two numbers straight after a Japanese town are ban and go, not chome and ban: `寿町2-31` is 2番31号, and `丸の内1-2` now gives ban 1 and go 2 where it gave chome 1 and ban 2. A chome written as such (`1丁目2-3`) is unchanged, as are three numbers. In Geolonia's test set 899 of 907 such pairs are ban and go. The same in romaji (`58-9 Shirakaba-cho`).
- Three numbers after a town named with 大字 or 字, or whose first number is 100 or more, are ban, go and a room.
- A Kyoto town written with its street directions (`寺町通御池上る上本能寺前町`) now has the town `上本能寺前町`; the directions are in `streetDirections`.
- `Urawa-shi` and other romaji names of a city merged away are no longer taken for the ward that kept the name (浦和区); they stay unidentified, as in Japanese script.

### Fixed

- Japanese: 丁 for 丁目 (`3丁1番9号`); a town named with 番町 or 番丁 (`和歌山市7番町`, `学校町通1番町`); a room after a further dash (`6番23-2`, `1番2-403号`); a lettered go (`14-イ22`); kanji numerals before a dash (`四-2-27`, `一-二-三`) or 号室 (`一〇一号室`); `二階堂` read as a town, not a second floor; the dashes `─`, `━`, `⁃` and `˗`.
- Japanese: spaces inside a municipality (`京都市 下京区`, `上北郡 横浜町`) or a town (`藤橋町 亥`); 巿 typed for 市; `ヶ`, `驒`, `﨑` and `髙` written for `ケ`, `騨`, `崎` and `高` in a municipality's name; a short prefecture before a city (`千葉市川市`); a ward with only its prefecture (`大阪府北区`); a prefecture alone without its designator (`東京`).
- Romaji Japanese: an address on several lines, in Japanese order without commas (`Tokyo-to Chiyoda-ku Marunouchi 1-2-3`), with 〒 before it, or with `Chiyoda City` and no `-ku`; a misspelt prefecture after the municipality is no longer read as the building.
- A US address whose street number matches a prefecture's JIS code (`Fl 34`) is no longer taken for a Japanese one.
- `cleanAddress` and `cleanAddressDetailed` write a Japanese address the way Japan Post asks, on one line (`〒100-0005 東京都千代田区丸の内1-2-3`), where they gave a mangled US-style line (`1-2-3 丸の内, 千代田区 13 100-0005`).
- `parseIntersection` takes the whole city after the second street when there is no comma: `Main St and Pine St Tacoma WA` gives the city `Tacoma`, not `St Tacoma`, and `Salt Lake City` keeps all three words.

## 1.3.0 - 2026-10-09

### Added

- `docs/TEST_COVERAGE.md` lists every shape of address that parse-address's and Geo::StreetAddress::US's test suites exercise, each with an original case in the corpus that covers it. The corpus no longer carries any input of those suites: their 65 street-address cases are rewritten as original addresses of the same shapes (`test-data/corpus/us/parse-address-shapes.json`), five shapes only the Perl module tests are added, and the intersection cases use original streets.

### Changed

- In a Canadian address a hyphenated leading number is Canada Post's unit and civic number, unit first: `4-123 Main St`, `Unit 4-123 Main St` and `53-55 Water Street` are unit 4 at 123 and unit 53 at 55. In a US address a hyphenated number such as Queens' `87-11` stays whole, and so does a Canadian one when the address names a unit elsewhere.
- New fields on `ParsedAddress`: `military` (the military delivery line, such as `PSC 802 Box 74`, with APO, FPO or DPO as the city and AA, AE or AP as the state), `compartment` (a Canadian site's compartment) and `highwayContract` (a highway contract route's number).
- `formatAddress` and `cleanAddress` write the unit after the street; `formatCanadaPost` joins it to the civic number, unit first (`4-123 MAIN ST`).
- A type written before the name is a type only in Canada and Puerto Rico; elsewhere it is part of the name (`Avenue of the Americas`).
- Street names keep the letters they were written with when mixed case (`O'Farrell`, `De La Vina`), and a lowercase French particle stays lowercase (`rue des Jardins` gives `des Jardins`).
- Case postale is reported as `CP`, and Box and POB as `PO Box`.

### Fixed

- Every USPS secondary unit designator is read (DEPT, HNGR, KEY, PIER, SLIP, SPC, STOP, TRLR and the rest), with a period, `#` or `No.` before its value, as are the French app., appartement, bureau and unité; HNGR is Hangar.
- A trailing USA, United States or Canada no longer stops the city, state and ZIP being read.
- Rural routes (RR, R.R., Rural Route, RFD), highway contract routes (HC, Star Route) and Canadian site and compartment addresses are read.
- A Canadian unit and civic number joined by a hyphen are split into the unit and the number.
- Street types: CT is Ct, Pk is Park, Landng, Villge, Exten, Crnrs, Cross and Harbour map to the USPS words, Canada Post's Circuit, Cul-de-sac and Diversion are known in full, Est is Estate outside Canada, and French Nord-Ouest and Sud-Ouest are NO and SO.
- A unit in a comma part of its own is read as the unit, not as the city.
- Street names are no longer lowercased and re-capitalized (O'farrell, D'youville, Des Jardins).
- APO, FPO and DPO addresses are read.
- French types with a period (av., boul., ch., crois., imp.) and carré, cours, rond-point, allée, quai, parc, pointe and île are read.
- Canada Post's comma after a French civic number (`275, rue Notre-Dame Est`) is read, and an accented city no longer hides a state: the "al" ending Montréal was read as Alabama, because `\b` treated accented letters as word breaks.
- A city with no comma before it is found after the street (`1600 Amphitheatre Pkwy Mountain View CA`, `8605 Sycamore St Salt Lake City UT`).
- A directional that is the whole street name (North St, Northwest Hwy) is the name, not a predirectional.
- A civic number with a letter (`123A`, `2455-B`) is read as the number.
- Post office box variants: Box alone, POB, case postale, STN, a PO box's ZIP+4, GD and poste restante.
- A province in parentheses (`Montréal (Québec)`) is read as the province.
- A unit written on the line above the street is read as the unit.
- Street suffixes that are also unit words (Key, Trailer, Front, Gate) are read as the type when no value follows.
- A comma between the state and the ZIP no longer makes the state the city.
- `Avenue A`, `Avenue of the Americas` and `Old Post Office Rd` keep their whole names.
- PQ, Que., NF, Nfld. and Île-du-Prince-Édouard are read as provinces.
- Smaller faults: a place's name before the number, a Puerto Rico urbanization (now `locality`), runs of spaces, PMB, numbers spelled out, semicolons and a spaced dash as separators, number-first floors, D.C. with periods, a Canadian highway's direction, a unit after a grid street, FL after General Delivery, `N/A`, quotes round the address, a street with no number and a county read as the city.
- `cleanAddressDetailed` and `formatAddress` no longer put the unit before the number ("Apartment 4 123 Main St").
- Title case no longer damages postal codes, directionals and PO Box ("M5h 2n2", "Nw", "Po Box"), nor turns "de la" into DE LA.
- `normalizeRegion` no longer fuzzy-matches loosely (Osaka gave AK, Tokyo OH, Kyoto CO): the whole input must be close to a whole name, and a Japanese prefecture's name never matches.
- `getZipPrefixesForState` and `getPostalPrefixesForProvince` accept a name ("New York", "Quebec").

## 1.2.0 - 2026-10-09

### Added

- Japanese addresses: `parseLocation` recognises an address written in Japanese (`〒100-0005 東京都千代田区丸の内1丁目2番3号 サンプルビル5階`) or in romaji (`1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan`) and reads it into the postal code, prefecture, municipality, town, chome, ban, go, building, floor and room, with the prefecture's and municipality's JIS codes and romaji. US and Canadian addresses that only mention a Japanese place, such as `100 Tokyo Ave`, are still read as US and Canadian.
- `country: "JP"` in the parse and validation options, to skip the detection and read an address as Japanese.
- The shared fields are filled for a Japanese address too (state, city, street, number, zip, place), so formatting, comparison and validation treat it like any other address.
- Full-width digits and letters, every kind of dash, kanji numerals (一丁目二番三号), `1の2の3`, a postal code with or without its hyphen, and 日本 or Japan at either end are all read; kanji numerals that belong to a name, such as 三番町 or 麻布十番, are left alone.
- The twenty designated cities can be named without their ward (大阪市, Sapporo), and towns and villages without their district (当別町 for 石狩郡当別町).
- `parseJapaneseAddress`, `looksJapanese`, `normalizeJapaneseAddressText` and `kanjiNumeralsToDigits`.
- `formatJapanese` writes an address in Japanese order, as on an envelope, with the block as `1-2-3` or `1丁目2番3号` (`12番地3` for a land lot in a 大字 town); `formatJapaneseEnglish` writes it in English order.
- `validateAddress` checks a Japanese address against the tables: `POSTAL_REGION_MISMATCH` when the postal code delivers to another prefecture, `MUNICIPALITY_PREFECTURE_MISMATCH`, `UNRECOGNIZED_MUNICIPALITY`, `AMBIGUOUS_MUNICIPALITY` (such as 府中市, in Tokyo and in Hiroshima), `UNRECOGNIZED_POSTAL_CODE` and `INVALID_POSTAL_FORMAT`; `validateJapaneseAddress` runs those checks on a parsed address.
- Lookups over the 47 prefectures, the 1,894 municipalities and the postal codes: `findPrefecture`, `findMunicipalitiesByName`, `findMunicipalitiesByRomaji`, `findMunicipalityByCode`, `municipalitiesOf`, `getPrefectureFromJapanesePostalCode`, `getPostalPrefixesForPrefecture`, and the tables themselves.
- A second entry point, `@johnmorrisdotca/address-plus/jp`, for the Japanese module on its own.
- `pnpm data:jp` regenerates the Japanese tables from Geolonia's address data and Japan Post's postal file.

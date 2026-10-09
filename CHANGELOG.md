# Changelog

All notable changes to this project are written here, in the style of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The project follows [Semantic Versioning](https://semver.org/).

## Unreleased

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

# API reference

Every export of every entry point of @johnmorrisdotca/address-plus 1.2.0, with its signature, its comment and, for each function, one example with the answer it gives. Made from the source by `pnpm docs:make`; the same reference is on the demo site at https://johnmorrisdotca.github.io/address-plus/api.html.

## @johnmorrisdotca/address-plus

### AddressAbbreviations

type

```ts
interface AddressAbbreviations {
  streetTypes: Record<string, string>; // Street type abbreviation mappings
  directions: Record<string, string>; // Directional abbreviation mappings
  states: Record<string, string>; // State abbreviation mappings
  provinces: Record<string, string>; // Province abbreviation mappings
  unitTypes: Record<string, string>; // Unit type abbreviation mappings
}
```

Address component abbreviations

### AddressComparisonOptions

type

```ts
interface AddressComparisonOptions {
  ignoreCase?: boolean; // Whether to ignore case when comparing text
  ignorePunctuation?: boolean; // Whether to ignore punctuation marks
  normalizeStreetTypes?: boolean; // Whether to normalize street type abbreviations
  normalizeDirections?: boolean; // Whether to normalize directional abbreviations
  normalizeStates?: boolean; // Whether to normalize state/province names
  fuzzyMatching?: boolean; // Whether to use fuzzy string matching
  strictPostalCode?: boolean; // Whether postal codes must match exactly
  requireExactMatch?: boolean; // Whether all fields must match exactly
}
```

Address comparison options

### AddressComparisonResult

type

```ts
interface AddressComparisonResult {
  isSame: boolean; // Whether addresses are considered the same
  matchType: AddressMatchType; // Type of match found
  similarity: AddressSimilarityResult; // Detailed similarity analysis
  normalizedAddress1: ParsedAddress; // First address after normalization
  normalizedAddress2: ParsedAddress; // Second address after normalization
}
```

Address comparison result

### AddressComparisonTestCase

type

```ts
interface AddressComparisonTestCase extends TestCaseBase {
  input: {
    address1: string;
    address2: string;
  }; // Two addresses to compare
  expected: {
    isSame?: boolean;
    similarity?: number;
    differences?: string[];
    [key: string]: unknown;
  }; // Expected comparison results
}
```

Address comparison test cases

### AddressDifference

type

```ts
interface AddressDifference {
  field: keyof ParsedAddress; // Which address field differs
  value1: string | undefined; // Value from first address
  value2: string | undefined; // Value from second address
  type: "missing" | "different" | "similar" | "typo"; // Type of difference
  confidence: number; // Confidence in the difference assessment
}
```

Address difference details

### AddressFormattingOptions

type

```ts
interface AddressFormattingOptions {
  includeCountry?: boolean; // Whether to include country in formatted address
  includeSecondaryUnit?: boolean; // Whether to include unit/suite information
  upperCase?: boolean; // Whether to format in uppercase
  separator?: string; // Line separator for multi-line formatting
  abbreviateStreetTypes?: boolean; // Whether to abbreviate street types (Street -> St)
  abbreviateDirections?: boolean; // Whether to abbreviate directions (North -> N)
  abbreviateStates?: boolean; // Whether to abbreviate state/province names
  usePlusCode?: boolean; // Whether to include Plus Code in formatting
}
```

Types for address formatting functions Address formatting options

### AddressFormattingTestCase

type

```ts
interface AddressFormattingTestCase extends TestCaseBase {
  input: string; // Input address to format
  expected: string; // Expected formatted address string
  options?: {
    format?: string;
    abbreviate?: boolean;
    [key: string]: unknown;
  }; // Optional formatting configuration
}
```

Address formatting test cases

### AddressMatchType

type

```ts
type AddressMatchType = "exact" | "strong" | "moderate" | "weak" | "none";
```

Address match types

### AddressParser

type

```ts
interface AddressParser {
  parseAddress(address: string, options?: ParseOptions): ParsedAddress | null;
  parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null;
  parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null;
  parseLocation(address: string, options?: ParseOptions): ParsedAddress | null;
}
```

Main address parser interface providing all parsing methods

### AddressParsingTestCase

type

```ts
interface AddressParsingTestCase extends TestCaseBase {
  input: string; // Input address string to parse
  expected: {
    number?: string;
    prefix?: string;
    street?: string;
    type?: string;
    suffix?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    [key: string]: unknown;
  }; // Expected parsed address components
  options?: {
    strict?: boolean;
    country?: string;
    [key: string]: unknown;
  }; // Optional parsing configuration
}
```

Address parsing test cases

### AddressSimilarityResult

type

```ts
interface AddressSimilarityResult {
  score: number; // 0-1 similarity score
  isMatch: boolean; // Whether addresses are considered a match
  confidence: number; // 0-1 confidence in the match
  details: {
    streetScore: number; // Street name similarity score
    cityScore: number; // City name similarity score
    stateScore: number; // State/province similarity score
    postalScore: number; // Postal code similarity score
    overallScore: number; // Combined overall similarity score
  };
  differences: AddressDifference[];
  suggestions?: string[];
}
```

Address similarity result

### AddressValidationResult

type

```ts
interface AddressValidationResult {
  isValid: boolean; // Whether the address passed validation
  confidence: number; // 0-1 score indicating parsing confidence
  completeness: number; // 0-1 score indicating how complete the address is
  errors: ValidationError[]; // List of validation errors found
  warnings: ValidationError[]; // List of validation warnings
  suggestions: string[]; // Suggestions for improving the address
  parsedAddress: import("./parsed-address").ParsedAddress | null; // Parsed address result or null if parsing failed
}
```

### AddressValidationTestCase

type

```ts
interface AddressValidationTestCase extends TestCaseBase {
  input: string; // Input address string to validate
  expected: {
    isValid: boolean;
    confidence?: number;
    completeness?: number;
    errors?: string[];
    warnings?: string[];
    [key: string]: unknown;
  }; // Expected validation results
}
```

Address validation test cases

### BatchParseError

type

```ts
interface BatchParseError {
  index: number; // Index of the failed address in the input array
  error: string; // Error message describing what went wrong
  input: string; // Original input that failed to parse
}
```

Error information for failed address parsing

### BatchParseOptions

type

```ts
interface BatchParseOptions extends ParseOptions {
  stopOnError?: boolean; // Whether to stop processing on first error (default: false)
  parallel?: boolean; // Process addresses in parallel where possible (default: false)
  chunkSize?: number; // Size of chunks for parallel processing (default: 100)
  includeStats?: boolean; // Include performance statistics in result (default: true)
}
```

Extended options for batch processing operations

### BatchParseResult

type

```ts
interface BatchParseResult<T = ParsedAddress | ParsedIntersection> {
  results: (T | null)[]; // Array of parsed results (null for failed parses)
  errors: BatchParseError[]; // Array of errors that occurred during parsing
  stats: BatchParseStats; // Performance and processing statistics
}
```

Complete result of a batch parsing operation

### BatchParseStats

type

```ts
interface BatchParseStats {
  total: number; // Total number of addresses processed
  successful: number; // Number of successfully parsed addresses
  failed: number; // Number of failed parsing attempts
  duration: number; // Total processing time in milliseconds
  averagePerAddress: number; // Average processing time per address in milliseconds
  addressesPerSecond: number; // Addresses processed per second
}
```

Performance statistics for batch operations

### BatchProcessingTestCase

type

```ts
interface BatchProcessingTestCase extends TestCaseBase {
  input: string[]; // Array of input addresses
  expected: {
    results?: unknown[];
    statistics?: {
      total: number;
      successful: number;
      failed: number;
    };
    errors?: Array<{
      index: number;
      error: string;
    }>;
    [key: string]: unknown;
  }; // Expected batch processing results
}
```

Batch processing test cases

### buildRegexFromDict

function

```ts
buildRegexFromDict(dict: Record<string, string>, capture?: boolean): RegExp
```

Build regex patterns from dictionary. Keys match as whole words in any alphabet, so "québec" is found at the start of a string and "al" is not found inside "Montréal".

```js
buildRegexFromDict({ street: "St", avenue: "Ave" }).test("avenue")
// true
```

### CA_PROVINCE_ALTERNATIVES

const

```ts
CA_PROVINCE_ALTERNATIVES: Record<string, string>
```

Common shortened forms, abbreviations, and alternative names for Canadian provinces

### CA_PROVINCE_NAMES

const

```ts
CA_PROVINCE_NAMES: Record<string, string>
```

Combined official Canadian province and territory names (English and French)

### CA_PROVINCE_NAMES_EN

const

```ts
CA_PROVINCE_NAMES_EN: Record<string, string>
```

Canadian provinces and territories mapping Official Canadian province and territory names in English mapped to their abbreviations

### CA_PROVINCE_NAMES_FR

const

```ts
CA_PROVINCE_NAMES_FR: Record<string, string>
```

Official Canadian province and territory names in French mapped to their abbreviations

### CA_PROVINCES

const

```ts
CA_PROVINCES: Record<string, string>
```

Combined mapping of all Canadian province names and alternatives to their abbreviations

### CA_REGIONS

const

```ts
CA_REGIONS: Region[]
```

Array of Canadian provinces and territories as Region objects for fuzzy matching

### CA_STREET_TYPES

const

```ts
CA_STREET_TYPES: Record<string, string>
```

Canadian Street Types (Canada Post official abbreviations) - bilingual Includes both English and French terms for comprehensive address parsing Mapping of Canadian street types and their variations to official Canada Post abbreviations Includes both English and French terms Where USPS Publication 28 has the same word, the library reports the USPS abbreviation (Court is Ct, not Canada Post's Crt; Park is Park): see the conventions in docs/TEST_COVERAGE.md. The words Pub 28 lacks keep Canada Post's abbreviation.

### CanadaPostFormattingOptions

type

```ts
interface CanadaPostFormattingOptions {
  includeDeliveryLine?: boolean; // Whether to include delivery line
  includeLastLine?: boolean; // Whether to include city/province/postal line
  bilingualLabels?: boolean; // Whether to include bilingual labels
  standardizeCase?: boolean; // Whether to standardize case per Canada Post guidelines
}
```

Canada Post formatting options

### CANADIAN_POSTAL_CODE_PATTERN

const

```ts
CANADIAN_POSTAL_CODE_PATTERN: RegExp
```

Canadian postal code patterns

### CANADIAN_POSTAL_LIBERAL_PATTERN

const

```ts
CANADIAN_POSTAL_LIBERAL_PATTERN: RegExp
```

Liberal Canadian postal code pattern for broader matching

### capitalizeStreetName

function

```ts
capitalizeStreetName(text: string): string
```

Capitalize a street name. A word written in mixed case is kept as written ("O'Farrell", "De La Vina", "d'Youville", "McKinley"); a word written all in lowercase or all in capitals is title-cased, except a lowercase particle, which stays lowercase ("rue des Jardins" gives "des Jardins").

```js
capitalizeStreetName("o'brien")
// "O'Brien"
```

### capitalizeWords

function

```ts
capitalizeWords(text: string): string
```

Capitalize the first letter of each word in a string

```js
capitalizeWords("new york city")
// "New York City"
```

### CITY_PATTERNS

const

```ts
CITY_PATTERNS: { readonly BASIC_CITY: RegExp; readonly MULTI_WORD_CITY: RegExp; readonly SINGLE_WORD_CITY: RegExp; readonly TWO_WORD_CITY: RegExp; }
```

### cleanAddress

function

```ts
cleanAddress(addressString: string, options?: CleanAddressOptions): string
```

Clean and normalize an address string with various formatting options

```js
cleanAddress("350 FIFTH AVENUE, NEW YORK, NY 10118")
// "350 Fifth Ave, New York NY 10118"
```

### cleanAddressDetailed

function

```ts
cleanAddressDetailed(addressString: string, options?: CleanAddressOptions): CleanAddressResult
```

Clean and normalize an address string with detailed change tracking

```js
cleanAddressDetailed("742 evergreen terrace,springfield ,  il 62704")
// {"cleanedAddress":"742 Evergreen Ter, Springfield IL 62704","wasModified":true,"changes":["Applied smart title case"]}
```

### CleanAddressOptions

type

```ts
interface CleanAddressOptions extends AddressFormattingOptions {
  format?: "standard" | "usps" | "canada-post"; // Desired output format
  removeExtraSpaces?: boolean; // Whether to remove redundant spaces
  standardizeCase?: "upper" | "lower" | "title" | "none"; // Case standardization option
  expandAbbreviations?: boolean; // Whether to expand abbreviations to full forms
}
```

Clean address options

### CleanAddressResult

type

```ts
interface CleanAddressResult {
  cleanedAddress: string; // The cleaned address string
  wasModified: boolean; // Whether any modifications were made
  changes: string[]; // List of changes made to the address
}
```

Clean address result

### CleanAddressTestCase

type

```ts
interface CleanAddressTestCase extends TestCaseBase {
  input: string; // Input address string to clean
  expected: {
    cleaned: string;
    changes?: string[];
    [key: string]: unknown;
  }; // Expected cleaned address and changes
  options?: {
    format?: string;
    abbreviate?: boolean;
    [key: string]: unknown;
  }; // Optional cleaning configuration
}
```

Clean address test cases

### COMMON_PARSER_PATTERNS

const

```ts
COMMON_PARSER_PATTERNS: { readonly ZIP_AT_END: (zipPattern: string) => RegExp; readonly STATE_AT_END: (statePattern: string) => RegExp; readonly CITY_STATE_PATTERN: (stateAbbrevPattern: string) => RegExp; readonly POSTAL_AT_END: (postalPattern: string) => RegExp; }
```

Common parsing patterns

### COMMON_STREET_NAMES_PATTERN

const

```ts
COMMON_STREET_NAMES_PATTERN: RegExp
```

Common street names that should not be captured as part of city names

### compareAddresses

function

```ts
compareAddresses(address1: ParsedAddress, address2: ParsedAddress, options?: AddressComparisonOptions): AddressComparisonResult
```

Compare two addresses and determine if they are the same

```js
compareAddresses(parseLocation("123 Main Street, Anytown, NY 12345"), parseLocation("123 Main St, Anytown, New York 12345")).matchType
// "exact"
```

### CONNECTOR_WORDS

const

```ts
CONNECTOR_WORDS: Set<string>
```

Connector words to ignore when checking Title Case in facility names

### COUNTRIES

const

```ts
COUNTRIES: { readonly CANADA: "CA"; readonly JAPAN: "JP"; readonly UNITED_STATES: "US"; }
```

Country codes used in address parsing Country codes used in address parsing

### CountryCode

type

```ts
type CountryCode = (typeof COUNTRIES)[keyof typeof COUNTRIES];
```

Type for country codes

### default

const

```ts
default: AddressParser
```

Default export for API compatibility with parse-address Usage: import parser from 'address-plus'; parser.parseLocation('123 Main St, New York, NY 10001')  Or: import { parseLocation } from 'address-plus';

```js
parser.parseLocation("123 Main St, New York, NY 10001").zip
// "10001"
```

### detectCountry

function

```ts
detectCountry(address: ParsedAddress): "US" | "CA" | undefined
```

Detect country from address components

```js
detectCountry({ zip: "M5H 2N2" })
// "CA"
```

### DIRECTION_EXPANSIONS

const

```ts
DIRECTION_EXPANSIONS: Record<string, string>
```

Direction expansions (reverse mapping from abbreviations to full names)

### DIRECTIONAL_MAP

const

```ts
DIRECTIONAL_MAP: Record<string, string>
```

Directional abbreviations for US and Canadian addresses Mapping of directional words to their standard abbreviations Supports both English and French (for Canada)

### FACILITY_DELIMITER_PATTERN

const

```ts
FACILITY_DELIMITER_PATTERN: RegExp
```

Facility delimiter pattern for inline address parsing

### FACILITY_DELIMITER_PATTERNS

const

```ts
FACILITY_DELIMITER_PATTERNS: { readonly PARENTHETICAL: RegExp; readonly DELIMITED: RegExp; readonly TRAILING_ISLAND: RegExp; }
```

Facility delimiter patterns for inline address parsing

### FACILITY_INDICATORS

const

```ts
FACILITY_INDICATORS: readonly ["center", "centre", "building", "tower", "plaza", "square", "garden", "gardens", "park", "university", "college", "school", "hospital", "library", "museum", "station", "airport", "mall", "market", "stadium", "arena", "theater", "theatre", "hotel", "resort", "memorial", "monument", "bridge", "tunnel", "complex"]
```

Common facility type keywords used for identifying facility names

### FACILITY_PATTERNS

const

```ts
FACILITY_PATTERNS: RegExp[]
```

Combined facility patterns for English and French

### findMunicipalitiesByName

function

```ts
findMunicipalitiesByName(name: string, prefectureCode?: string): JapaneseMunicipality[]
```

The municipalities a Japanese name could mean, narrowed to one prefecture when it is known. @example findMunicipalitiesByName("府中市") → [Tokyo's 府中市, Hiroshima's 府中市]; findMunicipalitiesByName("当別町") → [石狩郡当別町]

```js
findMunicipalitiesByName("府中市").map((one) => one.code + " " + one.romaji)
// ["13206 Fuchu-shi","34208 Fuchu-shi"]
```

### findMunicipalitiesByRomaji

function

```ts
findMunicipalitiesByRomaji(text: string, prefectureCode?: string): JapaneseMunicipality[]
```

The municipalities a romaji name could mean, narrowed to one prefecture when it is known. When the full name finds nothing, a town written without its district (Tobetsu-cho) is looked up without it, and then a ward written without its city (Kita-ku), which can mean several. @example findMunicipalitiesByRomaji("Chiyoda-ku", "13") → [千代田区]; findMunicipalitiesByRomaji("Chuo-ku, Sapporo") → [札幌市中央区]

```js
findMunicipalitiesByRomaji("Chiyoda", "13").map((one) => one.name)
// ["千代田区"]
```

### findMunicipalityByCode

function

```ts
findMunicipalityByCode(code: string): JapaneseMunicipality | null
```

The municipality with a JIS code, a designated city's included.

```js
findMunicipalityByCode("13101")
// {"code":"13101","prefecture":"13","name":"千代田区","kana":"チヨダク","romaji":"Chiyoda-ku"}
```

### findPrefecture

function

```ts
findPrefecture(text: string): JapanesePrefecture | null
```

The prefecture a name, reading, romaji or JIS code refers to, or null. @example findPrefecture("東京都") → Tokyo; findPrefecture("Osaka Prefecture") → Osaka; findPrefecture("13") → Tokyo

```js
findPrefecture("Osaka")
// {"code":"27","name":"大阪府","kana":"オオサカフ","romaji":"Osaka-fu"}
```

### formatAddress

function

```ts
formatAddress(address: ParsedAddress, options?: AddressFormattingOptions): FormattedAddress
```

Format address using standard conventions

```js
formatAddress(parseLocation("123 Main Street, Anytown, NY 12345")).singleLine
// "123 Main St, Anytown NY 12345"
```

### formatCanadaPost

function

```ts
formatCanadaPost(address: ParsedAddress, options?: CanadaPostFormattingOptions): FormattedAddress
```

Format address using Canada Post standards

```js
formatCanadaPost(parseLocation("100 Queen Street West, Toronto, Ontario M5H 2N2")).lines
// ["100 QUEEN ST W","TORONTO ON M5H 2N2"]
```

### formatJapanese

function

```ts
formatJapanese(address: ParsedAddress, options?: JapaneseFormattingOptions): string
```

Three lines, as an envelope is addressed: 〒100-0005, then 東京都千代田区丸の内1-2-3, then サンプルビル5階501号室. The prefecture and municipality are always in kanji, from the tables. A town or building parsed from romaji has no kanji to write, so it keeps its romaji, set off by spaces so the scripts do not run together: 東京都千代田区 Marunouchi 1-2-3, then Sample Bldg 5階.

```js
formatJapanese(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { blockStyle: "markers" })
// "〒100-0005\n東京都千代田区丸の内1丁目2番3号"
```

### formatJapaneseEnglish

function

```ts
formatJapaneseEnglish(address: ParsedAddress, options?: JapaneseEnglishFormattingOptions): string
```

Sample Bldg 5F, Room 501, 1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan The prefecture and municipality are always romaji, from the tables (a municipality the tables do not know keeps the name it was written with). The town and building are written as they were parsed: romaji when the address came in romaji, and Japanese when it came in Japanese, since the tables hold no romaji for towns, and a reading guessed from kanji would often be wrong.

```js
formatJapaneseEnglish(parseLocation("1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005"))
// "1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan"
```

### FormattedAddress

type

```ts
interface FormattedAddress {
  lines: string[]; // Individual address lines
  singleLine: string; // Single-line representation
  deliveryLine?: string; // Street address line
  lastLine?: string; // City/state/postal line
  country?: string; // Country designation
  format: "standard" | "usps" | "canada-post" | "international"; // Formatting standard used
}
```

Formatted address result

### formatUSPS

function

```ts
formatUSPS(address: ParsedAddress, options?: USPSFormattingOptions): FormattedAddress
```

Format address using USPS standards

```js
formatUSPS(parseLocation("123 Main Street Apt 4, Anytown, NY 12345")).lines
// ["123 MAIN ST APT 4","ANYTOWN NY 12345"]
```

### FRENCH_PREPOSITIONS

const

```ts
FRENCH_PREPOSITIONS: Map<string, string>
```

French prepositions for proper street name capitalization

### FuzzyMatchOptions

type

```ts
interface FuzzyMatchOptions {
  threshold: number; // 0-1 minimum similarity threshold
  maxDistance: number; // Maximum edit distance for string matching
  enableSoundex?: boolean; // Use soundex for phonetic matching
  enableMetaphone?: boolean; // Use metaphone for phonetic matching
}
```

Fuzzy matching options

### GENERAL_DELIVERY_PATTERNS

const

```ts
GENERAL_DELIVERY_PATTERNS: { readonly STANDARD: RegExp; readonly WITH_CITY: RegExp; }
```

General delivery address patterns

### getAddressAbbreviations

function

```ts
getAddressAbbreviations(): AddressAbbreviations
```

Get all available abbreviations for address formatting

```js
getAddressAbbreviations().streetTypes.avenue
// "Ave"
```

### getAddressSimilarity

function

```ts
getAddressSimilarity(address1: ParsedAddress, address2: ParsedAddress, options?: AddressComparisonOptions): AddressSimilarityResult
```

Get detailed similarity analysis between two addresses

```js
getAddressSimilarity(parseLocation("123 Main Street, Anytown, NY 12345"), parseLocation("125 Main Street, Anytown, NY 12345")).differences
// [{"field":"number","value1":"123","value2":"125","type":"typo","confidence":0.6}]
```

### getPostalPrefixesForPrefecture

function

```ts
getPostalPrefixesForPrefecture(prefecture: string): string[]
```

The three-digit postal prefixes a prefecture's codes begin with, the reverse of the lookup above. The prefecture may be given by JIS code, name or romaji, as findPrefecture reads it. A prefix on a border is listed under the prefecture most of its codes belong to. @example getPostalPrefixesForPrefecture("47") → ["900", "901", …, "907"]; getPostalPrefixesForPrefecture("沖縄県") → the same

```js
getPostalPrefixesForPrefecture("47")
// ["900","901","902","903","904","905","906","907"]
```

### getPostalPrefixesForProvince

function

```ts
getPostalPrefixesForProvince(province: string): string[]
```

The postal code prefixes a province or territory uses, the reverse of getProvinceFromPostalCode. Every code starting with one of them belongs to that province. @param province - Province abbreviation (e.g., "QC") @returns Prefixes (e.g., ["G", "H", "J"]), or an empty array for an unknown province @example getPostalPrefixesForProvince('NU') → ['X0A', 'X0B', 'X0C']

```js
getPostalPrefixesForProvince("ON")
// ["K","L","M","N","P"]
```

### getPrefectureFromJapanesePostalCode

function

```ts
getPrefectureFromJapanesePostalCode(postalCode: string): string | null
```

The JIS code of the prefecture a postal code delivers to, or null for a malformed code or one no prefix in the table covers. Hyphens and full-width digits are accepted. @example getPrefectureFromJapanesePostalCode("100-0005") → "13"; getPrefectureFromJapanesePostalCode("498-0000") → "23"

```js
getPrefectureFromJapanesePostalCode("530-0001")
// "27"
```

### getProvinceFromPostalCode

function

```ts
getProvinceFromPostalCode(postalCode: string): string | null
```

Extract province from Canadian postal code @param postalCode - Canadian postal code (e.g., "M5V 3A8", "K1A 0A6") @returns Province abbreviation (e.g., "ON", "QC") or null if not Canadian

```js
getProvinceFromPostalCode("H3G 1P1")
// "QC"
```

### getStateFromZip

function

```ts
getStateFromZip(zip: string | number): StateCode | undefined
```

Resolve a US ZIP code (5-digit or ZIP+4) to a 2-letter state/territory code.

```js
getStateFromZip("98101")
// "WA"
```

### getValidationErrors

function

```ts
getValidationErrors(addressString: string, options?: ValidationOptions): ValidationError[]
```

Get only validation errors without full validation result

```js
getValidationErrors("123 Main St", { requirePostalCode: true })
// [{"field":"zip","code":"MISSING_POSTAL_CODE","message":"Postal/ZIP code is required","severity":"error"},{"field":"address","code":"INCOMPLETE_ADDRESS","message":"Address appears incomplete - missing city, state, and postal code","severity":"warning"},{"field":"zip","code":"MISSING_POSTAL_CODE","message":"Postal/ZIP code not specified","severity":"warning"}]
```

### getZipPrefixesForState

function

```ts
getZipPrefixesForState(state: string): string[]
```

The ZIP code prefixes a state or territory uses, the reverse of getStateFromZip. Three digits where a whole block of a hundred belongs to it, five where only part of one does (Guam's 96910–96932, for one). Every ZIP starting with one of them resolves to that state. @param state - State or territory abbreviation (e.g., "MA") @returns Prefixes in ascending order (e.g., ["010", …, "027"]), or an empty array for an unknown state @example getZipPrefixesForState('RI') → ['028', '029']

```js
getZipPrefixesForState("WA")
// ["980","981","982","983","984","985","986","987","988","989","990","991","992","993","994"]
```

### hasValidAddressComponents

function

```ts
hasValidAddressComponents(address: string): boolean
```

Check if input contains recognizable address components

```js
hasValidAddressComponents("123 Main St, Anytown, NY 12345")
// true
```

### INTERSECTION_PATTERNS

const

```ts
INTERSECTION_PATTERNS: { readonly BASIC_CITY: RegExp; readonly CITY_WITH_COMMA: RegExp; readonly STREET_WITH_TYPE: (directionalPattern: string, streetTypePattern: string) => RegExp; readonly STREET_SIMPLE: (directionalPattern: string) => RegExp; }
```

Intersection parser patterns

### ISLAND_TYPE_PATTERN

const

```ts
ISLAND_TYPE_PATTERN: RegExp
```

Island type variations for special facility handling

### isSameAddress

function

```ts
isSameAddress(address1: ParsedAddress, address2: ParsedAddress, options?: AddressComparisonOptions): boolean
```

Simple boolean check if two addresses are the same

```js
isSameAddress(parseLocation("東京都千代田区丸の内1丁目2番3号"), parseLocation("東京都千代田区丸の内１－２－３"))
// true
```

### isValidAddress

function

```ts
isValidAddress(addressString: string, options?: ValidationOptions): boolean
```

Simple boolean check for address validity

```js
isValidAddress("123 Main St, Seattle, NY 98101", { strictPostalValidation: true })
// false
```

### JapaneseAddressFields

type

```ts
interface JapaneseAddressFields {
  postalCode?: string; // 〒 code as NNN-NNNN
  prefecture?: string; // 東京都
  prefectureCode?: string; // JIS code: "13"
  prefectureRomaji?: string; // Tokyo
  municipality?: string; // 千代田区
  municipalityCode?: string; // JIS code: "13101"
  municipalityRomaji?: string; // Chiyoda-ku
  town?: string; // 丸の内 (大字・町名), without the chome
  chome?: string; // 丁目: "1"
  ban?: string; // 番 (番地): "2"
  go?: string; // 号: "3"
  block?: string; // The numbered block as one string: "1-2-3"
  building?: string; // サンプルビル
  floor?: string; // 階: "5"
  room?: string; // 号室: "501"
}
```

What parseLocation returns for a Japanese address, on top of the shared ParsedAddress fields. Every field is the normalised form: full-width and kanji numerals become ASCII digits, and the block is split into its parts whichever way it was written (1丁目2番3号, 1-2-3, １－２－３).

### JapaneseEnglishFormattingOptions

type

```ts
interface JapaneseEnglishFormattingOptions {
  includeCountry?: boolean; // ", Japan" at the end; default true
  includePostalCode?: boolean; // Default true
}
```

### JapaneseFormattingOptions

type

```ts
interface JapaneseFormattingOptions {
  blockStyle?: "hyphen" | "markers"; // 1-2-3 (default) or 1丁目2番3号
  includePostalCode?: boolean; // 〒100-0005 on its own line; default true
  multiline?: boolean; // Lines joined with newlines (default) or one line with spaces
}
```

### JapaneseMunicipality

type

```ts
interface JapaneseMunicipality {
  code: string; // JIS X 0402 code, five digits; the first two are the prefecture's
  prefecture: string; // The prefecture's JIS code
  name: string; // Official name, with the district for towns and villages in one: 千代田区, 札幌市中央区, 石狩郡当別町
  kana: string; // Reading in katakana
  romaji: string; // Romaji with designators hyphenated on: Chiyoda-ku, Sapporo-shi Chuo-ku, Ishikari-gun Tobetsu-cho
}
```

### JapanesePrefecture

type

```ts
interface JapanesePrefecture {
  code: string; // JIS X 0401 code, "01" (Hokkaido) to "47" (Okinawa)
  name: string; // Official name with its designator: 東京都, 大阪府, 北海道, 愛知県
  kana: string; // Reading in katakana: トウキョウト
  romaji: string; // Romaji with the designator hyphenated on: Tokyo-to
}
```

Japanese addresses: a prefecture, a municipality, then the town and the numbered block within it.

### JapaneseValidation

type

```ts
interface JapaneseValidation {
  errors: ValidationError[];
  warnings: ValidationError[];
}
```

### JP_DESIGNATED_CITIES

const

```ts
JP_DESIGNATED_CITIES: readonly JapaneseMunicipality[]
```

The twenty designated cities (政令指定都市) as municipalities of their own. Geolonia lists only their wards, but addresses often name the city alone (大阪市, Sapporo), and the city has a JIS code of its own: its wards' codes with the last digit 0 (札幌市 01100, its wards 01101 to 01110; 川崎市 14130).

### JP_MUNICIPALITIES

const

```ts
JP_MUNICIPALITIES: readonly JapaneseMunicipality[]
```

### JP_POSTAL_EXCEPTIONS

const

```ts
JP_POSTAL_EXCEPTIONS: Readonly<Record<string, string>>
```

### JP_POSTAL_PREFIXES

const

```ts
JP_POSTAL_PREFIXES: Readonly<Record<string, string>>
```

Generated by scripts/jp/update-jp-data.ts on 2026-10-09. Do not edit by hand. Which prefecture (JIS code) a postal code delivers to: by its first three digits, and for the 236 codes on the far side of a prefix that straddles a border, by the whole code. From 120665 postal codes. Source: Japan Post KEN_ALL.CSV through jp-postal (MIT), https://www.npmjs.com/package/jp-postal

### JP_PREFECTURES

const

```ts
JP_PREFECTURES: readonly JapanesePrefecture[]
```

### kanjiNumeralsToDigits

function

```ts
kanjiNumeralsToDigits(text: string): string
```

Kanji numerals that stand for block, floor or room numbers become digits: 一丁目二番三号 → 1丁目2番3号. A numeral that is part of a name stays: 北一条西, 三番町, 麻布十番, 一ノ瀬.

```js
kanjiNumeralsToDigits("二丁目十五番")
// "2丁目15番"
```

### looksJapanese

function

```ts
looksJapanese(text: string): boolean
```

Whether the text is a Japanese address, in either script. Romaji counts when it ends with Japan, or names a prefecture beside a Japanese postal code (NNN-NNNN) or a hyphenated designator (-ku, -shi). US and Canadian addresses that only mention a Japanese name (100 Tokyo Ave) do not count.

```js
looksJapanese("1-2-3 Marunouchi, Chiyoda-ku, Tokyo")
// true
```

### municipalitiesOf

function

```ts
municipalitiesOf(prefectureCode: string): readonly JapaneseMunicipality[]
```

All municipalities of a prefecture, by JIS code, the designated cities included.

```js
municipalitiesOf("47").length
// 41
```

### MUSIC_SQUARE_EAST_PATTERN

const

```ts
MUSIC_SQUARE_EAST_PATTERN: RegExp
```

Pattern for Music Square East special case

### normalizeJapaneseAddressText

function

```ts
normalizeJapaneseAddressText(text: string): string
```

The whole text made uniform: widths folded, spaces tidied, numerals as digits, and 1の2の3 or １－２－３ written 1-2-3. The postal mark 〒 is kept, since it tells the parser where the code is. @example normalizeJapaneseAddressText("〒１００-０００５ 東京都千代田区丸の内一丁目二番三号") → "〒100-0005 東京都千代田区丸の内1丁目2番3号"

```js
normalizeJapaneseAddressText("東京都千代田区丸の内１－２－３")
// "東京都千代田区丸の内1-2-3"
```

### normalizeRegion

function

```ts
normalizeRegion(input: string): { abbr: string; country: "CA" | "US"; } | null
```

Region normalization utilities for fuzzy matching Normalizes a region input string to find the best matching state/province Supports exact matches and fuzzy matching for misspellings @param input - The input string to normalize (state/province name or abbreviation) @returns Object with abbreviation and country, or null if no match found @example normalizeRegion('Calfornia') → { abbr: 'CA', country: 'US' }

```js
normalizeRegion("British Columbia")
// {"abbr":"BC","country":"CA"}
```

### normalizeStateProvinceName

function

```ts
normalizeStateProvinceName(stateName: string): string | undefined
```

Combined US and Canadian state/province normalization function Converts full state/province names to standard abbreviations (lowercase output)

```js
normalizeStateProvinceName("Nova Scotia")
// "ns"
```

### normalizeText

function

```ts
normalizeText(text: string): string
```

Normalize text for consistent parsing

```js
normalizeText("  123   Main  St  ")
// "123 main st"
```

### PARENTHETICAL_PATTERN

const

```ts
PARENTHETICAL_PATTERN: RegExp
```

Pattern for extracting parenthetical information Matches content within parentheses

### parseAddress

function

```ts
parseAddress(address: string, options?: ParseOptions): ParsedAddress | null
```

Parse address (compatibility alias)

```js
parseAddress("1600 Pennsylvania Ave NW, Washington, DC 20500")
// {"number":"1600","street":"Pennsylvania","type":"Ave","suffix":"NW","city":"Washington","state":"DC","zip":"20500","zipValid":true,"country":"US"}
```

### parseAddresses

function

```ts
parseAddresses(addresses: string[], options?: ParseOptions): (ParsedAddress | null)[]
```

Parse multiple addresses using the parseAddress function with detailed results  @param addresses Array of address strings to parse @param options Batch parsing options @returns Array of parsed address results (null for failed parses)

```js
parseAddresses(["10 Main St, Anytown, NY 12345", "PO Box 12, Springfield, IL 62701"]).map((one) => one?.city)
// ["Anytown","Springfield"]
```

### parseAddressesBatch

function

```ts
parseAddressesBatch(addresses: string[], options?: BatchParseOptions): BatchParseResult<ParsedAddress>
```

Parse multiple addresses using parseAddress with full batch processing features  @param addresses Array of address strings to parse @param options Extended batch parsing options @returns Complete batch processing result with errors and statistics

```js
parseAddressesBatch(["10 Main St, Anytown, NY 12345", "PO Box 12, Springfield, IL 62701"]).stats.successful
// 2
```

### ParsedAddress

type

```ts
interface ParsedAddress extends JapaneseAddressFields {
  city?: string; // City name, or the municipality in Japan; APO, FPO or DPO in a military address
  compartment?: string; // Compartment on a Canadian rural route (the 10 in "SITE 6 COMP 10 RR 8")
  country?: "CA" | "US" | "JP"; // Detected country
  fraction?: string; // Fractional address number (e.g., 1/2 in "123 1/2 Main St")
  generalDelivery?: boolean; // General delivery indicator
  highwayContract?: string; // Highway contract route number (the 68 in "HC 68 BOX 23A"); ruralRoute holds "HC 68"
  locality?: string; // Sub-city locality (borough, district, neighborhood), or a Puerto Rico urbanization
  military?: string; // Military delivery line ("PSC 802 Box 74", "Unit 2050 Box 4190"); state is AA, AE or AP
  number?: string; // Street number
  place?: string; // Place name (landmark, POI, building, monument, etc.)
  plus4?: string; // Extended ZIP+4 code
  postalValid?: boolean; // Postal code validation status
  postalType?: "zip" | "postal"; // Postal code type (zip or postal)
  prefix?: string; // Directional prefix (N, S, E, W, etc.)
  rpo?: string; // Retail Postal Outlet (Canada Post) identifier
  rr?: string; // Rural Route number (RR/R.R.)
  ruralRoute?: string; // Rural route or similar
  secUnitNum?: string; // Secondary unit number
  secUnitType?: string; // Secondary unit type (apt, suite, etc.)
  secondary?: string; // Legacy properties for backward compatibility
  site?: string; // Site number on a Canadian rural route (the 6 in "SITE 6 COMP 10 RR 8")
  state?: string; // State/Province code; AA, AE or AP for a military address
  station?: string; // Station or Succursale identifier (e.g., Station A, Succ. Centre-ville)
  street?: string; // Street name
  suffix?: string; // Directional suffix
  type?: string; // Street type/suffix (St, Ave, Rd, etc.)
  unit?: string; // Legacy unit property for backward compatibility
  zip?: string; // ZIP or postal code
  zipValid?: boolean; // ZIP/postal code format validation (true if format is valid)
}
```

### ParsedIntersection

type

```ts
interface ParsedIntersection {
  street1?: string; // First street
  type1?: string; // First street type
  prefix1?: string; // First street prefix
  suffix1?: string; // First street suffix
  street2?: string; // Second street
  type2?: string; // Second street type
  prefix2?: string; // Second street prefix
  suffix2?: string; // Second street suffix
  city?: string; // City
  state?: string; // State/Province
  zip?: string; // ZIP/Postal code
  plus4?: string; // Extended ZIP+4 code
  country?: "CA" | "US"; // Country
  postalValid?: boolean; // Postal code validation status
  postalType?: "zip" | "postal"; // Postal code type (zip or postal)
}
```

Parsed intersection result containing two streets and location info

### parseDirectional

function

```ts
parseDirectional(text: string): { direction: string | undefined; remaining: string; }
```

Extract and normalize directional

```js
parseDirectional("NW Main St")
// {"direction":"NW","remaining":"Main St"}
```

### parseFacility

function

```ts
parseFacility(text: string): { facility: string | undefined; remaining: string; }
```

Extract facility names Parse facility information from address

```js
parseFacility("Empire State Building, 350 5th Ave")
// {"facility":"Empire State Building","remaining":", 350 5th Ave"}
```

### parseInformalAddress

function

```ts
parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null
```

Parse informal addresses as a fallback when standard parsing fails

```js
parseInformalAddress("Main St near the post office, Anytown NY")
// {"street":"Main St near the post office"}
```

### parseInformalAddresses

function

```ts
parseInformalAddresses(addresses: string[], options?: ParseOptions): (ParsedAddress | null)[]
```

Parse multiple addresses using the parseInformalAddress function  @param addresses Array of address strings to parse @param options Batch parsing options @returns Array of parsed address results (null for failed parses)

```js
parseInformalAddresses(["Main St, Anytown NY"]).length
// 1
```

### parseInformalAddressesBatch

function

```ts
parseInformalAddressesBatch(addresses: string[], options?: BatchParseOptions): BatchParseResult<ParsedAddress>
```

Parse multiple addresses using parseInformalAddress with full batch processing features  @param addresses Array of address strings to parse @param options Extended batch parsing options @returns Complete batch processing result with errors and statistics

```js
parseInformalAddressesBatch(["Main St, Anytown NY"]).stats.successful
// 1
```

### parseIntersection

function

```ts
parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null
```

Parse intersection addresses (e.g., "Main St & Elm Ave")

```js
parseIntersection("Hollywood Blvd and Vine St, Los Angeles, CA")
// {"state":"CA","city":"Los Angeles","street1":"Hollywood","type1":"Blvd","street2":"Vine","type2":"St"}
```

### parseIntersections

function

```ts
parseIntersections(addresses: string[], options?: ParseOptions): (ParsedIntersection | null)[]
```

Parse multiple intersection addresses  @param addresses Array of intersection strings to parse @param options Batch parsing options @returns Array of parsed intersection results (null for failed parses)

```js
parseIntersections(["Yonge St and Bloor St, Toronto, ON"])
// [{"state":"ON","city":"Toronto","street1":"Yonge","type1":"St","street2":"Bloor","type2":"St"}]
```

### parseIntersectionsBatch

function

```ts
parseIntersectionsBatch(addresses: string[], options?: BatchParseOptions): BatchParseResult<ParsedIntersection>
```

Parse multiple intersections with full batch processing features  @param addresses Array of intersection strings to parse @param options Extended batch parsing options @returns Complete batch processing result with errors and statistics

```js
parseIntersectionsBatch(["Yonge St and Bloor St, Toronto, ON"]).stats.successful
// 1
```

### parseJapaneseAddress

function

```ts
parseJapaneseAddress(text: string, options?: ParseOptions): ParsedAddress | null
```

A Japanese address in either script, or null when nothing in it names a place in Japan. @example parseJapaneseAddress("東京都千代田区丸の内1-2-3") → { prefecture: "東京都", municipality: "千代田区", town: "丸の内", chome: "1", ban: "2", go: "3", … }

```js
parseJapaneseAddress("〒100-0005 東京都千代田区丸の内1丁目2番3号 サンプルビル5階501号室")
// {"country":"JP","postalCode":"100-0005","zip":"100-0005","zipValid":true,"postalType":"postal","prefecture":"東京都","prefectureCode":"13","prefectureRomaji":"Tokyo","state":"13","municipality":"千代田区","city":"千代田区","municipalityCode":"13101","municipalityRomaji":"Chiyoda-ku","town":"丸の内","street":"丸の内","chome":"1","ban":"2","go":"3","block":"1-2-3","number":"1…
```

### parseLocation

function

```ts
parseLocation(address: string, options?: ParseOptions): ParsedAddress | null
```

Parse a location string into address components

```js
parseLocation("1234 rue Sainte-Catherine O, Montréal, QC H3G 1P1")
// {"number":"1234","suffix":"O","type":"Rue","street":"Sainte-Catherine","city":"Montréal","state":"QC","zip":"H3G 1P1","zipValid":true,"country":"CA"}
```

### parseLocations

function

```ts
parseLocations(addresses: string[], options?: ParseOptions): (ParsedAddress | null)[]
```

Parse multiple addresses using the main parseLocation function  @param addresses Array of address strings to parse @param options Batch parsing options @returns Array of parsed address results (null for failed parses)  @example ```typescript const addresses = [ "123 Main St, New York NY 10001", "456 Oak Ave, Los Angeles CA 90210", "789 Pine Rd, Chicago IL 60601" ];  const results = parseLocations(addresses); console.log(`Processed ${results.length} addresses`); ```

```js
parseLocations(["100 Queen St W, Toronto, ON M5H 2N2", "大阪府大阪市北区梅田3-1-1"]).map((one) => one?.country)
// ["CA","JP"]
```

### parseLocationsBatch

function

```ts
parseLocationsBatch(addresses: string[], options?: BatchParseOptions): BatchParseResult<ParsedAddress>
```

Parse multiple addresses with full batch processing features including error tracking and statistics  @param addresses Array of address strings to parse @param options Extended batch parsing options @returns Complete batch processing result with errors and statistics  @example ```typescript const addresses = [ "123 Main St, New York NY 10001", "invalid address", "456 Oak Ave, Los Angeles CA 90210" ];  const result = parseLocationsBatch(addresses, { stopOnError: false, includeStats: true });  console.log(`Processed ${result.stats.total} addresses`); console.log(`Success rate: ${result.stats.successful}/${result.stats.total}`); console.log(`Errors: ${result.errors.length}`); console.log(`Average time per address: ${result.stats.averagePerAddress}ms`); ```

```js
parseLocationsBatch(["100 Queen St W, Toronto, ON M5H 2N2", "大阪府大阪市北区梅田3-1-1"]).stats.successful
// 2
```

### ParseOptions

type

```ts
interface ParseOptions {
  country?: "CA" | "US" | "JP" | "auto"; // Country to optimize parsing for; JP skips the detection and parses as Japanese
  normalize?: boolean; // Whether to normalize street types and directions
  validatePostalCode?: boolean; // Whether to validate postal/ZIP codes
  language?: "auto" | "en" | "fr"; // Language preference for bilingual parsing (Canada)
  extractFacilities?: boolean; // Whether to extract facility names
  parseParenthetical?: boolean; // Whether to parse parenthetical information
  strict?: boolean; // Whether to only extract valid ZIP/postal codes (strict mode) - true: Only extract codes that pass format validation, false (default): Extract all codes but indicate validity with zipValid field
  useSnakeCase?: boolean; // Whether to return field names in snake_case format for backward compatibility - true: Return snake_case field names (sec_unit_type, sec_unit_num, etc.), false (default): Return camelCase field names (secUnitType, secUnitNum, etc.)
}
```

Options to control address parsing behavior

### parseParenthetical

function

```ts
parseParenthetical(text: string): { secondary: string | undefined; remaining: string; }
```

Parse parenthetical information

```js
parseParenthetical("123 Main St (Rear Entrance)")
// {"secondary":"Rear Entrance","remaining":"123 Main St"}
```

### parsePostalCode

function

```ts
parsePostalCode(text: string): { zip: string | undefined; plus4: string | undefined; remaining: string; detectedCountry?: "US" | "CA"; detectedProvince?: string; }
```

Extract postal code (ZIP or Canadian postal code)

```js
parsePostalCode("Toronto ON M5H 2N2")
// {"zip":"M5H 2N2","remaining":"Toronto ON","detectedCountry":"CA","detectedProvince":"ON"}
```

### parseSecondaryUnit

function

```ts
parseSecondaryUnit(text: string): { unit: string | undefined; secUnitType: string | undefined; secUnitNum: string | undefined; remaining: string; }
```

Parse secondary unit information (apartment, suite, etc.)

```js
parseSecondaryUnit("123 Main St Apt 4")
// {"unit":"Apartment 4","secUnitType":"Apartment","secUnitNum":"4","remaining":"123 Main St"}
```

### parseStateProvince

function

```ts
parseStateProvince(text: string): { state: string | undefined; remaining: string; detectedCountry?: "US" | "CA"; }
```

Extract state or province

```js
parseStateProvince("Anytown NY")
// {"state":"NY","remaining":"Anytown","detectedCountry":"US"}
```

### parseStreetNumber

function

```ts
parseStreetNumber(text: string): { number: string | undefined; remaining: string; }
```

Extract street number (including fractional)

```js
parseStreetNumber("123 Main St")
// {"number":"123","remaining":"Main St"}
```

### parseStreetType

function

```ts
parseStreetType(text: string, country?: "US" | "CA"): { type: string | undefined; remaining: string; }
```

Extract and normalize street type

```js
parseStreetType("Main Street")
// {"type":"st","remaining":"Main"}
```

### PO_BOX_PATTERNS

const

```ts
PO_BOX_PATTERNS: { readonly US_PO_BOX: RegExp; readonly STATION_PATTERN: RegExp; readonly LEADING_BOX_NUMBER: RegExp; readonly TRAILING_COMMA: RegExp; }
```

Regex patterns for parser functions These patterns are used by specific parsers and should not be confused with base patterns PO Box parser patterns

### POSTAL_CODE_TO_PROVINCE

const

```ts
POSTAL_CODE_TO_PROVINCE: Record<string, string>
```

Map postal code first letter to province abbreviation Canadian postal codes follow the pattern: Letter-Digit-Letter Digit-Letter-Digit The first letter indicates the province/territory

### PostalValidationResult

type

```ts
interface PostalValidationResult {
  isValid: boolean;
  type: "zip" | "postal" | null;
  formatted?: string;
  message?: string;
}
```

Postal code validation result

### PROVINCE_EXPANSIONS

const

```ts
PROVINCE_EXPANSIONS: Record<string, string>
```

Combined expansions - defaults to English but includes French options

### PROVINCE_EXPANSIONS_EN

const

```ts
PROVINCE_EXPANSIONS_EN: Record<string, string>
```

Canadian province expansions (reverse mapping from abbreviations to full names) Supports both English and French province names

### PROVINCE_EXPANSIONS_FR

const

```ts
PROVINCE_EXPANSIONS_FR: Record<string, string>
```

### Region

type

```ts
type Region = {
  abbr: string;
  country: "CA" | "US";
  name: string;
};
```

Represents a geographic region (state or province) with standardized fields

### SECONDARY_UNIT_PATTERN

const

```ts
SECONDARY_UNIT_PATTERN: RegExp
```

Secondary unit parsing patterns A unit at the end of a street line: group 1 is the street before it, group 2 the unit text.

### SECONDARY_UNIT_TYPES

const

```ts
SECONDARY_UNIT_TYPES: Record<string, string>
```

Secondary unit types and abbreviations Mapping of secondary unit types to their standardized proper case forms: USPS Publication 28 Appendix C2's words in full, and Canada Post's French unit words, which stay French.

### setValidatedPostalCode

function

```ts
setValidatedPostalCode(result: ParsedAddress | ParsedIntersection, zipCode: string, options: ParseOptions): void
```

Validate and set postal code if validation is enabled

```js
const parsed = { city: "Toronto", state: "ON" };
setValidatedPostalCode(parsed, "m5h2n2", {});
parsed
// {"city":"Toronto","state":"ON","zip":"M5H 2N2"}
```

### StateCode

type

```ts
type StateCode =
  | "AL"
  | "AK"
  | "AZ"
  | "AR"
  | "CA"
  | "CO"
  | "CT"
  | "DC"
  | "DE"
  | "FL"
  | "GA"
  | "HI"
  | "ID"
  | "IL"
  | "IN"
  | "IA"
  | "KS"
  | "KY"
  | "LA"
  | "ME"
  | "MD"
  | "MA"
  | "MI"
  | "MN"
  | "MS"
  | "MO"
  | "MT"
  | "NE"
  | "NV"
  | "NH"
  | "NJ"
  | "NM"
  | "NY"
  | "NC"
  | "ND"
  | "OH"
  | "OK"
  | "OR"
  …
```

### STREET_NAME_ACRONYMS

const

```ts
STREET_NAME_ACRONYMS: Map<string, string>
```

Acronyms that should be capitalized specially in street names

### STREET_TYPE_DETECTION_PATTERN

const

```ts
STREET_TYPE_DETECTION_PATTERN: RegExp
```

Pattern for detecting common street types in addresses Used to determine if parsed address has valid street component

### STREET_TYPE_EXPANSIONS

const

```ts
STREET_TYPE_EXPANSIONS: Record<string, string>
```

Street type expansions (reverse mapping from abbreviations to full names)

### STREET_TYPE_PROPER_CASE

const

```ts
STREET_TYPE_PROPER_CASE: Record<string, string>
```

Street type proper case mapping (USPS standards) Maps lowercase abbreviations to their proper case equivalents Used for standardizing street type formatting in parsed addresses

### SubRegion

type

```ts
interface SubRegion {
  name: string; // Primary normalized name (lowercase, trimmed)
  parentCity: string; // Parent city name (empty if not applicable)
  state: string; // State/province code (e.g., "NY", "QC")
  country: "US" | "CA"; // Country code
  type: "borough" | "parish" | "district" | "ward" | "arrondissement" | "quadrant"; // Administrative type
  aliases?: string[]; // Alternative names, abbreviations, bilingual variants, no-space versions
}
```

Sub-region type definition for address parsing Represents administrative subdivisions like boroughs, parishes, districts, etc.

### TERRITORY_POSTAL_PREFIXES

const

```ts
TERRITORY_POSTAL_PREFIXES: Record<string, string[]>
```

The territories share X, so each one's codes are named by their first three characters.

### TERRITORY_POSTAL_RANGES

const

```ts
TERRITORY_POSTAL_RANGES: { pattern: RegExp; province: string; }[]
```

More specific postal code ranges for territories These ranges help distinguish between NT, NU, and YT within X prefix

### TestCase

type

```ts
type TestCase =
  | AddressParsingTestCase
  | AddressFormattingTestCase
  | AddressValidationTestCase
  | AddressComparisonTestCase
  | CleanAddressTestCase
  | BatchProcessingTestCase;
```

Union type for all test cases

### TestCaseBase

type

```ts
interface TestCaseBase {
  name?: string; // Human-readable name or description of what this test case validates
  description?: string; // Human-readable description of what this test case validates (alternative to name)
  input: unknown; // The input data for the test
  expected: unknown; // The expected output/result of the test
  options?: Record<string, unknown>; // Optional configuration or parsing options for the test
}
```

Schema definitions for JSON test case files Provides type safety and consistency for all test data structures Base schema for individual test cases

### UNIT_TYPE_KEYWORDS

const

```ts
UNIT_TYPE_KEYWORDS: string
```

Address-specific patterns for components, units, and facilities Secondary unit designators that take a number or letter after them (USPS Publication 28 Appendix C2, Canada Post's English and French unit words, and a few spellings people write). Longest first, so "apartment" is tried before "apt" and "suite" before "su".

### UNIT_TYPE_NUMBER_PATTERN

const

```ts
UNIT_TYPE_NUMBER_PATTERN: RegExp
```

Pattern for extracting unit type and number from a unit's text. Groups: 1 designator and 2 value ("apt 123", "Apt. #4B"), 3 and 4 a lot run together ("lt42"), 5 the value after a bare "#".

### US_REGIONS

const

```ts
US_REGIONS: Region[]
```

Array of US states and territories as Region objects for fuzzy matching

### US_STATE_ALTERNATIVES

const

```ts
US_STATE_ALTERNATIVES: Record<string, string>
```

Common shortened forms, abbreviations, and alternative names for US states

### US_STATE_EXPANSIONS

const

```ts
US_STATE_EXPANSIONS: Record<string, string>
```

US state expansions (reverse mapping from abbreviations to full names)

### US_STATE_NAMES

const

```ts
US_STATE_NAMES: Record<string, string>
```

US States and territories mapping Official US state and territory names mapped to their abbreviations

### US_STATES

const

```ts
US_STATES: Record<string, string>
```

Combined mapping of all US state names and alternatives to their abbreviations

### US_STREET_TYPES

const

```ts
US_STREET_TYPES: Record<string, string>
```

US Street Types (USPS official abbreviations) Mapping of US street types and their variations to official USPS abbreviations

### USPSFormattingOptions

type

```ts
interface USPSFormattingOptions {
  includeDeliveryLine?: boolean; // Whether to include delivery line
  includeLastLine?: boolean; // Whether to include city/state/ZIP line
  includeBarcode?: boolean; // Whether to include postal barcode
  standardizeCase?: boolean; // Whether to standardize case per USPS guidelines
}
```

USPS formatting options

### validateAddress

function

```ts
validateAddress(addressString: string, options?: ValidationOptions): AddressValidationResult
```

Validates an address string and returns detailed validation results

```js
validateAddress("〒530-0001 東京都千代田区丸の内1-2-3").warnings
// [{"code":"POSTAL_REGION_MISMATCH","field":"zip","message":"Postal code 530-0001 belongs to 大阪府, not 東京都","severity":"warning"}]
```

### validateJapaneseAddress

function

```ts
validateJapaneseAddress(address: ParsedAddress, options?: ValidationOptions): JapaneseValidation
```

Errors and warnings for a parsed Japanese address. @example validateJapaneseAddress(parseJapaneseAddress("〒530-0001 東京都千代田区丸の内1-2-3")) → one POSTAL_REGION_MISMATCH warning

```js
validateJapaneseAddress(parseLocation("〒530-0001 東京都千代田区丸の内1-2-3"), { strictPostalValidation: true })
// {"errors":[{"code":"POSTAL_REGION_MISMATCH","field":"zip","message":"Postal code 530-0001 belongs to 大阪府, not 東京都","severity":"error"}],"warnings":[]}
```

### validatePostalCode

function

```ts
validatePostalCode: (code: string) => PostalValidationResult
```

Validate if a postal code or ZIP code is in the correct format

```js
validatePostalCode("K1A 0B1")
// {"isValid":true,"type":"postal","formatted":"K1A 0B1","message":"Valid Canadian postal code format"}
```

### VALIDATION_PATTERNS

const

```ts
VALIDATION_PATTERNS: { readonly HAS_LETTERS: RegExp; readonly ALPHANUMERIC: RegExp; readonly HAS_DIGITS: RegExp; readonly HOUSE_NUMBER_START: RegExp; readonly STARTS_WITH_NUMBER: RegExp; readonly WHITESPACE_SPLIT: RegExp; readonly TITLE_CASE: RegExp; readonly NUMERIC_ONLY: RegExp; readonly NON_WORD: RegExp; readonly REGEX_ESCAPE: RegExp; readonly NORMALIZE_SPACES: RegExp; readonly PO_BOX_NORMALIZE: RegExp; }
```

Core validation and formatting patterns used throughout address parsing Basic validation patterns for text analysis

### ValidationError

type

```ts
interface ValidationError {
  field: string; // Field name where error occurred
  code: string; // Error code identifier
  message: string; // Human-readable error message
  severity: "error" | "warning" | "info"; // Severity level of the validation issue
}
```

Types for address validation results and confidence scoring

### ValidationOptions

type

```ts
interface ValidationOptions {
  requireStreetNumber?: boolean; // Whether street number is required
  requireStreetName?: boolean; // Whether street name is required
  requireCity?: boolean; // Whether city is required
  requireState?: boolean; // Whether state/province is required
  requirePostalCode?: boolean; // Whether postal code is required
  allowPOBox?: boolean; // Whether PO Box addresses are allowed
  allowRuralRoute?: boolean; // Whether rural route addresses are allowed
  allowGeneralDelivery?: boolean; // Whether general delivery addresses are allowed
  strictPostalValidation?: boolean; // Whether to use strict postal code validation
  country?: "CA" | "US" | "JP" | "auto"; // Country context for validation rules
}
```

### WRITTEN_NUMBERS

const

```ts
WRITTEN_NUMBERS: string
```

### ZIP_CODE_PATTERN

const

```ts
ZIP_CODE_PATTERN: RegExp
```

Geographic and postal code patterns for location parsing US ZIP code patterns

### ZIP_CODE_REGEX_PATTERN

const

```ts
ZIP_CODE_REGEX_PATTERN: string
```

US ZIP code pattern for string interpolation

### ZIP_VALIDATION_PATTERNS

const

```ts
ZIP_VALIDATION_PATTERNS: { readonly POTENTIAL_ZIP: RegExp; }
```

ZIP code validation patterns


## @johnmorrisdotca/address-plus/jp

### findMunicipalitiesByName

function

```ts
findMunicipalitiesByName(name: string, prefectureCode?: string): JapaneseMunicipality[]
```

The municipalities a Japanese name could mean, narrowed to one prefecture when it is known. @example findMunicipalitiesByName("府中市") → [Tokyo's 府中市, Hiroshima's 府中市]; findMunicipalitiesByName("当別町") → [石狩郡当別町]

```js
findMunicipalitiesByName("府中市").map((one) => one.code + " " + one.romaji)
// ["13206 Fuchu-shi","34208 Fuchu-shi"]
```

### findMunicipalitiesByRomaji

function

```ts
findMunicipalitiesByRomaji(text: string, prefectureCode?: string): JapaneseMunicipality[]
```

The municipalities a romaji name could mean, narrowed to one prefecture when it is known. When the full name finds nothing, a town written without its district (Tobetsu-cho) is looked up without it, and then a ward written without its city (Kita-ku), which can mean several. @example findMunicipalitiesByRomaji("Chiyoda-ku", "13") → [千代田区]; findMunicipalitiesByRomaji("Chuo-ku, Sapporo") → [札幌市中央区]

```js
findMunicipalitiesByRomaji("Chiyoda", "13").map((one) => one.name)
// ["千代田区"]
```

### findMunicipalityByCode

function

```ts
findMunicipalityByCode(code: string): JapaneseMunicipality | null
```

The municipality with a JIS code, a designated city's included.

```js
findMunicipalityByCode("13101")
// {"code":"13101","prefecture":"13","name":"千代田区","kana":"チヨダク","romaji":"Chiyoda-ku"}
```

### findPrefecture

function

```ts
findPrefecture(text: string): JapanesePrefecture | null
```

The prefecture a name, reading, romaji or JIS code refers to, or null. @example findPrefecture("東京都") → Tokyo; findPrefecture("Osaka Prefecture") → Osaka; findPrefecture("13") → Tokyo

```js
findPrefecture("Osaka")
// {"code":"27","name":"大阪府","kana":"オオサカフ","romaji":"Osaka-fu"}
```

### formatJapanese

function

```ts
formatJapanese(address: ParsedAddress, options?: JapaneseFormattingOptions): string
```

Three lines, as an envelope is addressed: 〒100-0005, then 東京都千代田区丸の内1-2-3, then サンプルビル5階501号室. The prefecture and municipality are always in kanji, from the tables. A town or building parsed from romaji has no kanji to write, so it keeps its romaji, set off by spaces so the scripts do not run together: 東京都千代田区 Marunouchi 1-2-3, then Sample Bldg 5階.

```js
formatJapanese(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { blockStyle: "markers" })
// "〒100-0005\n東京都千代田区丸の内1丁目2番3号"
```

### formatJapaneseEnglish

function

```ts
formatJapaneseEnglish(address: ParsedAddress, options?: JapaneseEnglishFormattingOptions): string
```

Sample Bldg 5F, Room 501, 1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan The prefecture and municipality are always romaji, from the tables (a municipality the tables do not know keeps the name it was written with). The town and building are written as they were parsed: romaji when the address came in romaji, and Japanese when it came in Japanese, since the tables hold no romaji for towns, and a reading guessed from kanji would often be wrong.

```js
formatJapaneseEnglish(parseLocation("1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005"))
// "1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan"
```

### getPostalPrefixesForPrefecture

function

```ts
getPostalPrefixesForPrefecture(prefecture: string): string[]
```

The three-digit postal prefixes a prefecture's codes begin with, the reverse of the lookup above. The prefecture may be given by JIS code, name or romaji, as findPrefecture reads it. A prefix on a border is listed under the prefecture most of its codes belong to. @example getPostalPrefixesForPrefecture("47") → ["900", "901", …, "907"]; getPostalPrefixesForPrefecture("沖縄県") → the same

```js
getPostalPrefixesForPrefecture("47")
// ["900","901","902","903","904","905","906","907"]
```

### getPrefectureFromJapanesePostalCode

function

```ts
getPrefectureFromJapanesePostalCode(postalCode: string): string | null
```

The JIS code of the prefecture a postal code delivers to, or null for a malformed code or one no prefix in the table covers. Hyphens and full-width digits are accepted. @example getPrefectureFromJapanesePostalCode("100-0005") → "13"; getPrefectureFromJapanesePostalCode("498-0000") → "23"

```js
getPrefectureFromJapanesePostalCode("530-0001")
// "27"
```

### JapaneseAddressFields

type

```ts
interface JapaneseAddressFields {
  postalCode?: string; // 〒 code as NNN-NNNN
  prefecture?: string; // 東京都
  prefectureCode?: string; // JIS code: "13"
  prefectureRomaji?: string; // Tokyo
  municipality?: string; // 千代田区
  municipalityCode?: string; // JIS code: "13101"
  municipalityRomaji?: string; // Chiyoda-ku
  town?: string; // 丸の内 (大字・町名), without the chome
  chome?: string; // 丁目: "1"
  ban?: string; // 番 (番地): "2"
  go?: string; // 号: "3"
  block?: string; // The numbered block as one string: "1-2-3"
  building?: string; // サンプルビル
  floor?: string; // 階: "5"
  room?: string; // 号室: "501"
}
```

What parseLocation returns for a Japanese address, on top of the shared ParsedAddress fields. Every field is the normalised form: full-width and kanji numerals become ASCII digits, and the block is split into its parts whichever way it was written (1丁目2番3号, 1-2-3, １－２－３).

### JapaneseEnglishFormattingOptions

type

```ts
interface JapaneseEnglishFormattingOptions {
  includeCountry?: boolean; // ", Japan" at the end; default true
  includePostalCode?: boolean; // Default true
}
```

### JapaneseFormattingOptions

type

```ts
interface JapaneseFormattingOptions {
  blockStyle?: "hyphen" | "markers"; // 1-2-3 (default) or 1丁目2番3号
  includePostalCode?: boolean; // 〒100-0005 on its own line; default true
  multiline?: boolean; // Lines joined with newlines (default) or one line with spaces
}
```

### JapaneseMunicipality

type

```ts
interface JapaneseMunicipality {
  code: string; // JIS X 0402 code, five digits; the first two are the prefecture's
  prefecture: string; // The prefecture's JIS code
  name: string; // Official name, with the district for towns and villages in one: 千代田区, 札幌市中央区, 石狩郡当別町
  kana: string; // Reading in katakana
  romaji: string; // Romaji with designators hyphenated on: Chiyoda-ku, Sapporo-shi Chuo-ku, Ishikari-gun Tobetsu-cho
}
```

### JapanesePrefecture

type

```ts
interface JapanesePrefecture {
  code: string; // JIS X 0401 code, "01" (Hokkaido) to "47" (Okinawa)
  name: string; // Official name with its designator: 東京都, 大阪府, 北海道, 愛知県
  kana: string; // Reading in katakana: トウキョウト
  romaji: string; // Romaji with the designator hyphenated on: Tokyo-to
}
```

Japanese addresses: a prefecture, a municipality, then the town and the numbered block within it.

### JapaneseValidation

type

```ts
interface JapaneseValidation {
  errors: ValidationError[];
  warnings: ValidationError[];
}
```

### JP_DESIGNATED_CITIES

const

```ts
JP_DESIGNATED_CITIES: readonly JapaneseMunicipality[]
```

The twenty designated cities (政令指定都市) as municipalities of their own. Geolonia lists only their wards, but addresses often name the city alone (大阪市, Sapporo), and the city has a JIS code of its own: its wards' codes with the last digit 0 (札幌市 01100, its wards 01101 to 01110; 川崎市 14130).

### JP_MUNICIPALITIES

const

```ts
JP_MUNICIPALITIES: readonly JapaneseMunicipality[]
```

### JP_POSTAL_EXCEPTIONS

const

```ts
JP_POSTAL_EXCEPTIONS: Readonly<Record<string, string>>
```

### JP_POSTAL_PREFIXES

const

```ts
JP_POSTAL_PREFIXES: Readonly<Record<string, string>>
```

Generated by scripts/jp/update-jp-data.ts on 2026-10-09. Do not edit by hand. Which prefecture (JIS code) a postal code delivers to: by its first three digits, and for the 236 codes on the far side of a prefix that straddles a border, by the whole code. From 120665 postal codes. Source: Japan Post KEN_ALL.CSV through jp-postal (MIT), https://www.npmjs.com/package/jp-postal

### JP_PREFECTURES

const

```ts
JP_PREFECTURES: readonly JapanesePrefecture[]
```

### kanjiNumeralsToDigits

function

```ts
kanjiNumeralsToDigits(text: string): string
```

Kanji numerals that stand for block, floor or room numbers become digits: 一丁目二番三号 → 1丁目2番3号. A numeral that is part of a name stays: 北一条西, 三番町, 麻布十番, 一ノ瀬.

```js
kanjiNumeralsToDigits("二丁目十五番")
// "2丁目15番"
```

### looksJapanese

function

```ts
looksJapanese(text: string): boolean
```

Whether the text is a Japanese address, in either script. Romaji counts when it ends with Japan, or names a prefecture beside a Japanese postal code (NNN-NNNN) or a hyphenated designator (-ku, -shi). US and Canadian addresses that only mention a Japanese name (100 Tokyo Ave) do not count.

```js
looksJapanese("1-2-3 Marunouchi, Chiyoda-ku, Tokyo")
// true
```

### municipalitiesOf

function

```ts
municipalitiesOf(prefectureCode: string): readonly JapaneseMunicipality[]
```

All municipalities of a prefecture, by JIS code, the designated cities included.

```js
municipalitiesOf("47").length
// 41
```

### normalizeJapaneseAddressText

function

```ts
normalizeJapaneseAddressText(text: string): string
```

The whole text made uniform: widths folded, spaces tidied, numerals as digits, and 1の2の3 or １－２－３ written 1-2-3. The postal mark 〒 is kept, since it tells the parser where the code is. @example normalizeJapaneseAddressText("〒１００-０００５ 東京都千代田区丸の内一丁目二番三号") → "〒100-0005 東京都千代田区丸の内1丁目2番3号"

```js
normalizeJapaneseAddressText("東京都千代田区丸の内１－２－３")
// "東京都千代田区丸の内1-2-3"
```

### ParsedAddress

type

```ts
interface ParsedAddress extends JapaneseAddressFields {
  city?: string; // City name, or the municipality in Japan; APO, FPO or DPO in a military address
  compartment?: string; // Compartment on a Canadian rural route (the 10 in "SITE 6 COMP 10 RR 8")
  country?: "CA" | "US" | "JP"; // Detected country
  fraction?: string; // Fractional address number (e.g., 1/2 in "123 1/2 Main St")
  generalDelivery?: boolean; // General delivery indicator
  highwayContract?: string; // Highway contract route number (the 68 in "HC 68 BOX 23A"); ruralRoute holds "HC 68"
  locality?: string; // Sub-city locality (borough, district, neighborhood), or a Puerto Rico urbanization
  military?: string; // Military delivery line ("PSC 802 Box 74", "Unit 2050 Box 4190"); state is AA, AE or AP
  number?: string; // Street number
  place?: string; // Place name (landmark, POI, building, monument, etc.)
  plus4?: string; // Extended ZIP+4 code
  postalValid?: boolean; // Postal code validation status
  postalType?: "zip" | "postal"; // Postal code type (zip or postal)
  prefix?: string; // Directional prefix (N, S, E, W, etc.)
  rpo?: string; // Retail Postal Outlet (Canada Post) identifier
  rr?: string; // Rural Route number (RR/R.R.)
  ruralRoute?: string; // Rural route or similar
  secUnitNum?: string; // Secondary unit number
  secUnitType?: string; // Secondary unit type (apt, suite, etc.)
  secondary?: string; // Legacy properties for backward compatibility
  site?: string; // Site number on a Canadian rural route (the 6 in "SITE 6 COMP 10 RR 8")
  state?: string; // State/Province code; AA, AE or AP for a military address
  station?: string; // Station or Succursale identifier (e.g., Station A, Succ. Centre-ville)
  street?: string; // Street name
  suffix?: string; // Directional suffix
  type?: string; // Street type/suffix (St, Ave, Rd, etc.)
  unit?: string; // Legacy unit property for backward compatibility
  zip?: string; // ZIP or postal code
  zipValid?: boolean; // ZIP/postal code format validation (true if format is valid)
}
```

### parseJapaneseAddress

function

```ts
parseJapaneseAddress(text: string, options?: ParseOptions): ParsedAddress | null
```

A Japanese address in either script, or null when nothing in it names a place in Japan. @example parseJapaneseAddress("東京都千代田区丸の内1-2-3") → { prefecture: "東京都", municipality: "千代田区", town: "丸の内", chome: "1", ban: "2", go: "3", … }

```js
parseJapaneseAddress("〒100-0005 東京都千代田区丸の内1丁目2番3号 サンプルビル5階501号室")
// {"country":"JP","postalCode":"100-0005","zip":"100-0005","zipValid":true,"postalType":"postal","prefecture":"東京都","prefectureCode":"13","prefectureRomaji":"Tokyo","state":"13","municipality":"千代田区","city":"千代田区","municipalityCode":"13101","municipalityRomaji":"Chiyoda-ku","town":"丸の内","street":"丸の内","chome":"1","ban":"2","go":"3","block":"1-2-3","number":"1…
```

### ParseOptions

type

```ts
interface ParseOptions {
  country?: "CA" | "US" | "JP" | "auto"; // Country to optimize parsing for; JP skips the detection and parses as Japanese
  normalize?: boolean; // Whether to normalize street types and directions
  validatePostalCode?: boolean; // Whether to validate postal/ZIP codes
  language?: "auto" | "en" | "fr"; // Language preference for bilingual parsing (Canada)
  extractFacilities?: boolean; // Whether to extract facility names
  parseParenthetical?: boolean; // Whether to parse parenthetical information
  strict?: boolean; // Whether to only extract valid ZIP/postal codes (strict mode) - true: Only extract codes that pass format validation, false (default): Extract all codes but indicate validity with zipValid field
  useSnakeCase?: boolean; // Whether to return field names in snake_case format for backward compatibility - true: Return snake_case field names (sec_unit_type, sec_unit_num, etc.), false (default): Return camelCase field names (secUnitType, secUnitNum, etc.)
}
```

Options to control address parsing behavior

### validateJapaneseAddress

function

```ts
validateJapaneseAddress(address: ParsedAddress, options?: ValidationOptions): JapaneseValidation
```

Errors and warnings for a parsed Japanese address. @example validateJapaneseAddress(parseJapaneseAddress("〒530-0001 東京都千代田区丸の内1-2-3")) → one POSTAL_REGION_MISMATCH warning

```js
validateJapaneseAddress(parseLocation("〒530-0001 東京都千代田区丸の内1-2-3"), { strictPostalValidation: true })
// {"errors":[{"code":"POSTAL_REGION_MISMATCH","field":"zip","message":"Postal code 530-0001 belongs to 大阪府, not 東京都","severity":"error"}],"warnings":[]}
```

### ValidationError

type

```ts
interface ValidationError {
  field: string; // Field name where error occurred
  code: string; // Error code identifier
  message: string; // Human-readable error message
  severity: "error" | "warning" | "info"; // Severity level of the validation issue
}
```

Types for address validation results and confidence scoring

### ValidationOptions

type

```ts
interface ValidationOptions {
  requireStreetNumber?: boolean; // Whether street number is required
  requireStreetName?: boolean; // Whether street name is required
  requireCity?: boolean; // Whether city is required
  requireState?: boolean; // Whether state/province is required
  requirePostalCode?: boolean; // Whether postal code is required
  allowPOBox?: boolean; // Whether PO Box addresses are allowed
  allowRuralRoute?: boolean; // Whether rural route addresses are allowed
  allowGeneralDelivery?: boolean; // Whether general delivery addresses are allowed
  strictPostalValidation?: boolean; // Whether to use strict postal code validation
  country?: "CA" | "US" | "JP" | "auto"; // Country context for validation rules
}
```

# API reference

Every export of every entry point of @johnmorrisdotca/address-plus 1.3.0, with its signature, its TSDoc (what it does, each parameter, what it returns) and one example with the answer it gives. Made from the source by `pnpm docs:make`, and `pnpm docs:check` holds every example's answer to the built package; the same reference is on the demo site at https://johnmorrisdotca.github.io/address-plus/api.html. Editors show the same TSDoc on hover, from the published type definitions.

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

What `getAddressAbbreviations` returns: one map per kind of abbreviation.

```js
Object.keys(getAddressAbbreviations())
// ["streetTypes","directions","states","provinces","unitTypes"]
```

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

Options for comparing addresses: what to normalize before comparing, whether to allow small typos, and whether every field must match exactly.

```js
isSameAddress(parseLocation("123 Main St, Anytown, NY 12345"), parseLocation("123 Main Stret, Anytown, NY 12345"), { fuzzyMatching: false })
// false
```

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

What `compareAddresses` returns: the verdict, the match type and the similarity.

```js
compareAddresses(parseLocation("123 Main St, Anytown, NY 12345"), parseLocation("123 Main Street, Anytown, NY 12345")).isSame
// true
```

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

A comparison case in the package's JSON test files: two addresses and the match expected.

```js
({ input: ["123 Main St", "123 Main Street"], expected: { isSame: true } }).expected.isSame
// true
```

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

One part on which two addresses differ, with both values and the kind of difference.

```js
getAddressSimilarity(parseLocation("123 Main St, Anytown, NY 12345"), parseLocation("125 Main St, Anytown, NY 12345")).differences[0]
// {"field":"number","value1":"123","value2":"125","type":"typo","confidence":0.6}
```

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

Options for `formatAddress` and `cleanAddress`: what to abbreviate, capitals, the unit, the country and the line separator.

```js
formatAddress(parseLocation("123 Main Street, Anytown, NY 12345"), { upperCase: true }).singleLine
// "123 MAIN ST, ANYTOWN NY 12345"
```

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

A formatting case in the package's JSON test files: an address and the text expected.

```js
({ input: "123 main st", expected: "123 Main St" }).expected
// "123 Main St"
```

### AddressMatchType

type

```ts
type AddressMatchType = "exact" | "strong" | "moderate" | "weak" | "none";
```

How strongly two addresses match, from `exact` to `none`.

```js
compareAddresses(parseLocation("123 Main St, Anytown, NY 12345"), parseLocation("456 Oak Ave, Portland, OR 97201")).matchType
// "none"
```

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

The shape of the default export: the four parsers parse-address's users call on one object.

```js
Object.keys(parser)
// ["parseLocation","parseIntersection","parseInformalAddress","parseAddress"]
```

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

A parsing case in the package's JSON test files: an address and the fields expected from it.

```js
({ input: "123 Main St, Anytown, NY 12345", expected: { number: "123", state: "NY" } }).expected.state
// "NY"
```

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

How alike two addresses are: an overall score from 0 to 1, a score for each part, and the differences.

```js
getAddressSimilarity(parseLocation("123 Main St, Anytown, NY 12345"), parseLocation("123 Main Street, Anytown, NY 12345")).score
// 1
```

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

What `validateAddress` returns.

```js
validateAddress("1600 Pennsylvania Ave NW, Washington, DC 20500").isValid
// true
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

A validation case in the package's JSON test files: an address and the verdict and codes expected.

```js
({ input: "123 Main St", expected: { isValid: false } }).expected.isValid
// false
```

### BatchParseError

type

```ts
interface BatchParseError {
  index: number; // Index of the failed address in the input array
  error: string; // Error message describing what went wrong
  input: string; // Original input that failed to parse
}
```

One address a batch could not parse: its index, the input and the reason.

```js
parseLocationsBatch([""]).errors[0].index
// 0
```

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

Options for the batch parsers: the parse options, plus whether to stop at the first error and whether to include the statistics.

```js
parseLocationsBatch(["123 Main St, Anytown, NY 12345"], { country: "US" }).stats.total
// 1
```

### BatchParseResult

type

```ts
interface BatchParseResult<T = ParsedAddress | ParsedIntersection> {
  results: (T | null)[]; // Array of parsed results (null for failed parses)
  errors: BatchParseError[]; // Array of errors that occurred during parsing
  stats: BatchParseStats; // Performance and processing statistics
}
```

What a batch parser returns: the results in order, the errors and the statistics.

```js
parseLocationsBatch(["123 Main St, Anytown, NY 12345"]).results.length
// 1
```

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

The counts and timing of a batch: how many were parsed, how many failed, and how long it took.

```js
parseLocationsBatch(["123 Main St, Anytown, NY 12345", ""]).stats.failed
// 1
```

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

A batch case in the package's JSON test files: several addresses and the counts expected.

```js
({ input: ["123 Main St"], expected: { successful: 1 } }).expected.successful
// 1
```

### buildRegexFromDict

function

```ts
buildRegexFromDict(dict: Record<string, string>, capture?: boolean): RegExp
```

A regular expression matching any key of a dictionary as a whole word, longest first. Words match in any alphabet, so `québec` is found at the start of a string and `al` is not found inside `Montréal`.

- `dict`: The dictionary whose keys are matched.
- `capture`: Whether to wrap the alternatives in a capturing group; default `true`.
- Returns: The expression, case-insensitive.

```js
buildRegexFromDict({ street: "St", avenue: "Ave" }).test("avenue")
// true
```

### CA_PROVINCE_ALTERNATIVES

const

```ts
CA_PROVINCE_ALTERNATIVES: Record<string, string>
```

Other ways Canadian provinces are written (old and informal abbreviations such as `PQ`, `Que.`, `Nfld.`), in lower case, to their codes.

```js
CA_PROVINCE_ALTERNATIVES["pq"]
// "QC"
```

### CA_PROVINCE_NAMES

const

```ts
CA_PROVINCE_NAMES: Record<string, string>
```

Every Canadian province and territory by its English or French name, to its code.

```js
CA_PROVINCE_NAMES["québec"]
// "QC"
```

### CA_PROVINCE_NAMES_EN

const

```ts
CA_PROVINCE_NAMES_EN: Record<string, string>
```

Every Canadian province and territory by its English name in lower case, to its two-letter code.

```js
CA_PROVINCE_NAMES_EN["british columbia"]
// "BC"
```

### CA_PROVINCE_NAMES_FR

const

```ts
CA_PROVINCE_NAMES_FR: Record<string, string>
```

Every Canadian province and territory by its French name in lower case, to its two-letter code.

```js
CA_PROVINCE_NAMES_FR["colombie-britannique"]
// "BC"
```

### CA_PROVINCES

const

```ts
CA_PROVINCES: Record<string, string>
```

Every name and other spelling of a Canadian province, to its code: the names and the alternatives together.

```js
CA_PROVINCES["nfld"]
// "NL"
```

### CA_REGIONS

const

```ts
CA_REGIONS: Region[]
```

Every name and other spelling of a Canadian province or territory as a `Region` object, for fuzzy matching by `normalizeRegion`.

```js
CA_REGIONS.filter((region) => region.abbr === "QC").map((region) => region.name)
// ["quebec","québec","pq","que"]
```

### CA_STREET_TYPES

const

```ts
CA_STREET_TYPES: Record<string, string>
```

Every street type Canada Post lists, in English and French, with common spellings, in lower case, to the abbreviation the parser reports. Where USPS Publication 28 has the same word, the USPS abbreviation is used (Court is `Ct`, not Canada Post's `Crt`; see the conventions in docs/TEST_COVERAGE.md); the words Publication 28 lacks keep Canada Post's abbreviation.

```js
CA_STREET_TYPES["croissant"]
// "crois"
```

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

Options for `formatCanadaPost`: which lines to include, bilingual labels, and whether to set the letter case the Canada Post way.

```js
formatCanadaPost(parseLocation("100 Queen St W, Toronto, ON M5H 2N2"), { includeDeliveryLine: false }).lines
// ["TORONTO ON M5H 2N2"]
```

### CANADIAN_POSTAL_CODE_PATTERN

const

```ts
CANADIAN_POSTAL_CODE_PATTERN: RegExp
```

A Canadian postal code with the letters Canada Post assigns, with or without its space.

```js
CANADIAN_POSTAL_CODE_PATTERN.test("M5H 2N2")
// true
```

### CANADIAN_POSTAL_LIBERAL_PATTERN

const

```ts
CANADIAN_POSTAL_LIBERAL_PATTERN: RegExp
```

A Canadian postal code of any letters, for finding one before it is checked.

```js
CANADIAN_POSTAL_LIBERAL_PATTERN.test("m5h2n2")
// true
```

### capitalizeStreetName

function

```ts
capitalizeStreetName(text: string): string
```

Capitalizes a street name the way it is signed. A word written in mixed case is kept as written (`O'Farrell`, `McKinley`, `d'Youville`); a word all in lower case or all in capitals is title-cased, except a French particle written in lower case, which stays so (`rue des Jardins`).

- `text`: The street name.
- Returns: The name capitalized.

```js
capitalizeStreetName("o'brien")
// "O'Brien"
```

### capitalizeWords

function

```ts
capitalizeWords(text: string): string
```

Capitalizes the first letter of each word.

- `text`: The text.
- Returns: The text with each word's first letter in capitals and the rest as written.

```js
capitalizeWords("new york city")
// "New York City"
```

### CITY_PATTERNS

const

```ts
CITY_PATTERNS: { readonly BASIC_CITY: RegExp; readonly MULTI_WORD_CITY: RegExp; readonly SINGLE_WORD_CITY: RegExp; readonly TWO_WORD_CITY: RegExp; }
```

Patterns for a city of one or more words at the end of a text, after a space, used where no comma marks it. A word is letters of any alphabet, with apostrophes and hyphens inside it.

```js
CITY_PATTERNS.SINGLE_WORD_CITY.exec("Pine St Tacoma")?.[1]
// "Tacoma"
```

### cleanAddress

function

```ts
cleanAddress(addressString: string, options?: CleanAddressOptions): string
```

Tidies an address typed in a hurry: spaces, commas, letter case, the street type and the state, without changing what it says.

- `addressString`: The address as typed.
- `options`: What to tidy and the letter case to set (see `CleanAddressOptions`).
- Returns: The tidied address; the input, trimmed, when it cannot be parsed.

```js
cleanAddress("350 FIFTH AVENUE, NEW YORK, NY 10118")
// "350 Fifth Ave, New York NY 10118"
```

### cleanAddressDetailed

function

```ts
cleanAddressDetailed(addressString: string, options?: CleanAddressOptions): CleanAddressResult
```

Tidies an address like `cleanAddress`, and says what it changed.

- `addressString`: The address as typed.
- `options`: What to tidy and the letter case to set (see `CleanAddressOptions`).
- Returns: The tidied address, the input, whether anything changed, and a line for each change.

```js
cleanAddressDetailed("742 evergreen terrace,springfield ,  il 62704").cleanedAddress
// "742 Evergreen Ter, Springfield IL 62704"
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

Options for `cleanAddress`: which tidying to do, and the letter case to set.

```js
cleanAddress("123 main st, anytown, ny 12345", { standardizeCase: "upper" })
// "123 MAIN ST, ANYTOWN NY 12345"
```

### CleanAddressResult

type

```ts
interface CleanAddressResult {
  cleanedAddress: string; // The cleaned address string
  wasModified: boolean; // Whether any modifications were made
  changes: string[]; // List of changes made to the address
}
```

What `cleanAddressDetailed` returns: the tidied address and what changed.

```js
cleanAddressDetailed("123 main st, anytown, ny 12345").wasModified
// true
```

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

A cleaning case in the package's JSON test files: an address and the tidied text expected.

```js
({ input: "123 MAIN ST", expected: "123 Main St" }).expected
// "123 Main St"
```

### COMMON_PARSER_PATTERNS

const

```ts
COMMON_PARSER_PATTERNS: { readonly ZIP_AT_END: (zipPattern: string) => RegExp; readonly STATE_AT_END: (statePattern: string) => RegExp; readonly CITY_STATE_PATTERN: (stateAbbrevPattern: string) => RegExp; readonly POSTAL_AT_END: (postalPattern: string) => RegExp; }
```

Pattern builders the parsers share: a ZIP, a state or a postal code at the end of a text, and a city before a state. Each takes the source of a pattern wrapped in one pair of parentheses or anchors, which it strips.

```js
COMMON_PARSER_PATTERNS.ZIP_AT_END("(\\d{5})").exec("Tacoma WA 98402")?.[1]
// "98402"
```

### COMMON_STREET_NAMES_PATTERN

const

```ts
COMMON_STREET_NAMES_PATTERN: RegExp
```

Street names common enough that they must not be taken as part of a city's name.

```js
COMMON_STREET_NAMES_PATTERN.test("Main")
// true
```

### compareAddresses

function

```ts
compareAddresses(address1: ParsedAddress, address2: ParsedAddress, options?: AddressComparisonOptions): AddressComparisonResult
```

Compares two parsed addresses field by field, allowing for abbreviations (Street and St), state names and codes, letter case and small typos.

- `address1`: The first address, as `parseLocation` returns it.
- `address2`: The second address.
- `options`: How to compare: which parts to ignore and how close a fuzzy match must be (see `AddressComparisonOptions`).
- Returns: Whether they are the same place, how strong the match is (`exact` to `none`), the similarity score from 0 to 1 and every difference found.

```js
compareAddresses(parseLocation("123 Main Street, Anytown, NY 12345"), parseLocation("123 Main St, Anytown, New York 12345")).matchType
// "exact"
```

### CONNECTOR_WORDS

const

```ts
CONNECTOR_WORDS: Set<string>
```

Small words (`of`, `the`, `and`) that may be in lower case inside a facility's name written in title case.

```js
CONNECTOR_WORDS.has("of")
// true
```

### COUNTRIES

const

```ts
COUNTRIES: { readonly CANADA: "CA"; readonly JAPAN: "JP"; readonly UNITED_STATES: "US"; }
```

The country codes the parser reports: `US`, `CA` and `JP`.

```js
COUNTRIES.JAPAN
// "JP"
```

### CountryCode

type

```ts
type CountryCode = (typeof COUNTRIES)[keyof typeof COUNTRIES];
```

A country code the parser reports: `US`, `CA` or `JP`.

```js
parseLocation("100 Queen St W, Toronto, ON M5H 2N2")?.country
// "CA"
```

### default

const

```ts
default: AddressParser
```

The default export, shaped like parse-address's module: `parseLocation`, `parseAddress`, `parseIntersection` and `parseInformalAddress` on one object, so `import parser from "@johnmorrisdotca/address-plus"` works where parse-address was imported. Named imports work too.

```js
parser.parseLocation("123 Main St, New York, NY 10001").zip
// "10001"
```

### detectCountry

function

```ts
detectCountry(address: ParsedAddress): "US" | "CA" | undefined
```

Which country a parsed address is in, from its postal code, then its state or province.

- `address`: The parsed address, or any object with its `zip` and `state`.
- Returns: `US` or `CA`, or `undefined` when nothing says.

```js
detectCountry({ zip: "M5H 2N2" })
// "CA"
```

### DIRECTION_EXPANSIONS

const

```ts
DIRECTION_EXPANSIONS: Record<string, string>
```

Each directional abbreviation in lower case, to the word in full.

```js
DIRECTION_EXPANSIONS["ne"]
// "Northeast"
```

### DIRECTIONAL_MAP

const

```ts
DIRECTIONAL_MAP: Record<string, string>
```

Each directional word, in English or French, in lower case, to its abbreviation (`northwest` and `nord-ouest` to `NW` and `NO`).

```js
DIRECTIONAL_MAP["northwest"]
// "NW"
```

### FACILITY_DELIMITER_PATTERN

const

```ts
FACILITY_DELIMITER_PATTERN: RegExp
```

A facility's name followed by a comma or a dash and then the address.

```js
FACILITY_DELIMITER_PATTERN.test("City Hall - 100 Queen St W")
// true
```

### FACILITY_DELIMITER_PATTERNS

const

```ts
FACILITY_DELIMITER_PATTERNS: { readonly PARENTHETICAL: RegExp; readonly DELIMITED: RegExp; readonly TRAILING_ISLAND: RegExp; }
```

The ways a facility's name is set off from an address: in parentheses, before a delimiter, or as a trailing island.

```js
FACILITY_DELIMITER_PATTERNS.PARENTHETICAL.test("(City Hall)")
// true
```

### FACILITY_INDICATORS

const

```ts
FACILITY_INDICATORS: readonly ["center", "centre", "building", "tower", "plaza", "square", "garden", "gardens", "park", "university", "college", "school", "hospital", "library", "museum", "station", "airport", "mall", "market", "stadium", "arena", "theater", "theatre", "hotel", "resort", "memorial", "monument", "bridge", "tunnel", "complex"]
```

Words that mark a place's name as a facility (`center`, `tower`, `hospital`, `université`), in lower case.

```js
FACILITY_INDICATORS.includes("hospital")
// true
```

### FACILITY_PATTERNS

const

```ts
FACILITY_PATTERNS: RegExp[]
```

The patterns that find a facility's name, in English and French.

```js
FACILITY_PATTERNS.some((pattern) => pattern.test("Empire State Building"))
// true
```

### findMunicipalitiesByName

function

```ts
findMunicipalitiesByName(name: string, prefectureCode?: string): JapaneseMunicipality[]
```

The municipalities a Japanese name could mean: several when the name is shared (`府中市` is in Tokyo and in Hiroshima). A town or village may be named without its district (`当別町`).

- `name`: The municipality's name in Japanese.
- `prefectureCode`: A prefecture's JIS code, to look in that prefecture only.
- Returns: Every match, an empty array when there is none.

```js
findMunicipalitiesByName("府中市").map((one) => one.code + " " + one.romaji)
// ["13206 Fuchu-shi","34208 Fuchu-shi"]
```

### findMunicipalitiesByRomaji

function

```ts
findMunicipalitiesByRomaji(text: string, prefectureCode?: string): JapaneseMunicipality[]
```

The municipalities a romaji name could mean, written with or without macrons and designators (`Chiyoda-ku`, `Chiyoda City`, `Sapporo-shi Chuo-ku`, `Chuo-ku, Sapporo`). A town written without its district, and then a ward written without its city, are looked up when the full name finds nothing.

- `text`: The name in romaji.
- `prefectureCode`: A prefecture's JIS code, to look in that prefecture only.
- Returns: Every match, an empty array when there is none.

```js
findMunicipalitiesByRomaji("Chuo-ku, Sapporo").map((one) => one.name)
// ["札幌市中央区"]
```

### findMunicipalityByCode

function

```ts
findMunicipalityByCode(code: string): JapaneseMunicipality | null
```

The municipality with a JIS X 0402 code, a designated city's own code included.

- `code`: The five-digit code.
- Returns: The municipality, or `null` for a code the tables do not have.

```js
findMunicipalityByCode("13101")?.name
// "千代田区"
```

### findPrefecture

function

```ts
findPrefecture(text: string): JapanesePrefecture | null
```

The prefecture a name, reading, romaji spelling or JIS code refers to: `東京都`, `東京`, `トウキョウト`, `Tokyo`, `Osaka Prefecture`, `13`.

- `text`: The name, reading or code; letter case and macrons do not matter.
- Returns: The prefecture, or `null` when the text names none.

```js
findPrefecture("Osaka Prefecture")?.name
// "大阪府"
```

### formatAddress

function

```ts
formatAddress(address: ParsedAddress, options?: AddressFormattingOptions): FormattedAddress
```

Writes a parsed address back out as lines and as one line, with abbreviations or in full.

- `address`: The address, as `parseLocation` returns it.
- `options`: How to write it: abbreviated or in full, the letter case, the country (see `AddressFormattingOptions`).
- Returns: The address as an array of lines and as one line.

```js
formatAddress(parseLocation("123 Main Street, Anytown, NY 12345")).singleLine
// "123 Main St, Anytown NY 12345"
```

### formatCanadaPost

function

```ts
formatCanadaPost(address: ParsedAddress, options?: CanadaPostFormattingOptions): FormattedAddress
```

Writes a parsed address the way Canada Post asks: capitals, the unit before the civic number joined by a hyphen, and the postal code two spaces after the province.

- `address`: The address, as `parseLocation` returns it.
- `options`: Canada Post settings (see `CanadaPostFormattingOptions`).
- Returns: The address as lines and as one line.

```js
formatCanadaPost(parseLocation("100 Queen Street West, Toronto, Ontario M5H 2N2")).lines
// ["100 QUEEN ST W","TORONTO ON M5H 2N2"]
```

### formatJapanese

function

```ts
formatJapanese(address: ParsedAddress, options?: JapaneseFormattingOptions): string
```

Writes a Japanese address in Japanese order, as an envelope is addressed: `〒100-0005`, then `東京都千代田区丸の内1-2-3`, then `サンプルビル5階501号室`. The prefecture and municipality are always in kanji, from the tables. A town or building parsed from romaji keeps its romaji, set off by spaces so the scripts do not run together. Kyoto's street directions are written before the town.

- `address`: The address, as `parseLocation` returns it for a Japanese address.
- `options`: The block's style (`1-2-3` or `1丁目2番3号`), the postal code, and lines or one line (see `JapaneseFormattingOptions`).
- Returns: The address as text, its lines joined with newlines unless `options.multiline` is `false`; an empty string when the address has none of the parts.

```js
formatJapanese(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { blockStyle: "markers", multiline: false })
// "〒100-0005 東京都千代田区丸の内1丁目2番3号"
```

### formatJapaneseEnglish

function

```ts
formatJapaneseEnglish(address: ParsedAddress, options?: JapaneseEnglishFormattingOptions): string
```

Writes a Japanese address in English order, as a form from abroad expects: building, room, block, town, municipality, prefecture, postal code, Japan. The prefecture and municipality are always romaji, from the tables; the town and building are written as they were parsed, since the tables hold no romaji for towns.

- `address`: The address, as `parseLocation` returns it for a Japanese address.
- `options`: Whether to end with the postal code and with Japan (see `JapaneseEnglishFormattingOptions`).
- Returns: The address as one line, its parts joined by commas.

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

A formatted address: its lines, and the same on one line.

```js
formatUSPS(parseLocation("123 Main St, Anytown, NY 12345"))
// {"lines":["123 MAIN ST","ANYTOWN NY 12345"],"singleLine":"123 Main St, Anytown NY 12345","deliveryLine":"123 Main St","lastLine":"Anytown NY 12345","country":"US","format":"usps"}
```

### formatUSPS

function

```ts
formatUSPS(address: ParsedAddress, options?: USPSFormattingOptions): FormattedAddress
```

Writes a parsed address the way USPS Publication 28 asks: capitals, standard abbreviations, the unit on the street line, and the city, state and ZIP+4 on the last.

- `address`: The address, as `parseLocation` returns it.
- `options`: USPS settings (see `USPSFormattingOptions`).
- Returns: The address as lines and as one line.

```js
formatUSPS(parseLocation("123 Main Street Apt 4, Anytown, NY 12345")).lines
// ["123 MAIN ST APT 4","ANYTOWN NY 12345"]
```

### FRENCH_PREPOSITIONS

const

```ts
FRENCH_PREPOSITIONS: Map<string, string>
```

French particles that can open a street name, each with the space after it, to the way it is written there (`de la ` as `De la `).

```js
FRENCH_PREPOSITIONS.get("de la ")
// "De la "
```

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

Settings for fuzzy string matching: the lowest similarity that counts, the largest edit distance, and phonetic matching.

```js
({ threshold: 0.8, maxDistance: 2 }).maxDistance
// 2
```

### GENERAL_DELIVERY_PATTERNS

const

```ts
GENERAL_DELIVERY_PATTERNS: { readonly STANDARD: RegExp; readonly WITH_CITY: RegExp; }
```

General delivery written alone or before a city.

```js
GENERAL_DELIVERY_PATTERNS.STANDARD.test("General Delivery")
// true
```

### getAddressAbbreviations

function

```ts
getAddressAbbreviations(): AddressAbbreviations
```

Every abbreviation the formatters use: street types, directionals, secondary units, states and provinces.

- Returns: One map per kind, each from the full word to its abbreviation.

```js
getAddressAbbreviations().streetTypes.avenue
// "Ave"
```

### getAddressSimilarity

function

```ts
getAddressSimilarity(address1: ParsedAddress, address2: ParsedAddress, options?: AddressComparisonOptions): AddressSimilarityResult
```

The similarity of two parsed addresses, part by part, without a verdict: the score and each part's score, and the differences.

- `address1`: The first address, as `parseLocation` returns it.
- `address2`: The second address.
- `options`: How to compare (see `AddressComparisonOptions`).
- Returns: The overall score from 0 to 1, the street, city, state and postal scores, and each difference with its kind.

```js
getAddressSimilarity(parseLocation("123 Main Street, Anytown, NY 12345"), parseLocation("125 Main Street, Anytown, NY 12345")).differences
// [{"field":"number","value1":"123","value2":"125","type":"typo","confidence":0.6}]
```

### getPostalPrefixesForPrefecture

function

```ts
getPostalPrefixesForPrefecture(prefecture: string): string[]
```

The three-digit postal prefixes a prefecture's codes begin with, the reverse of `getPrefectureFromJapanesePostalCode`. A prefix on a border is listed under the prefecture most of its codes belong to.

- `prefecture`: The prefecture, by JIS code, name or romaji, as `findPrefecture` reads it.
- Returns: The prefixes in ascending order, an empty array for an unknown prefecture.

```js
getPostalPrefixesForPrefecture("沖縄県")
// ["900","901","902","903","904","905","906","907"]
```

### getPostalPrefixesForProvince

function

```ts
getPostalPrefixesForProvince(province: string): string[]
```

The postal code prefixes a province or territory uses, the reverse of `getProvinceFromPostalCode`. Every code starting with one of them belongs to that province.

- `province`: The province or territory's two-letter code.
- Returns: The prefixes, a letter or, for the territories, three characters; an empty array for an unknown code.

```js
getPostalPrefixesForProvince("NU")
// ["X0A","X0B","X0C"]
```

### getPrefectureFromJapanesePostalCode

function

```ts
getPrefectureFromJapanesePostalCode(postalCode: string): string | null
```

The prefecture a Japanese postal code delivers to, from Japan Post's data: by its first three digits, and for the codes on the far side of a prefix that straddles a border, by the whole code.

- `postalCode`: The seven-digit code, with or without its hyphen, in either width.
- Returns: The prefecture's JIS code, or `null` for a malformed code or one no Japanese code begins like.

```js
getPrefectureFromJapanesePostalCode("530-0001")
// "27"
```

### getProvinceFromPostalCode

function

```ts
getProvinceFromPostalCode(postalCode: string): string | null
```

The province or territory a Canadian postal code is in, from its first letter, and for the X codes of the north, its first three characters.

- `postalCode`: The postal code, with or without its space.
- Returns: The two-letter code, or `null` for a code that is not Canadian.

```js
getProvinceFromPostalCode("H3G 1P1")
// "QC"
```

### getStateFromZip

function

```ts
getStateFromZip(zip: string | number): StateCode | undefined
```

The state or territory a US ZIP code is in.

- `zip`: A five-digit ZIP or a ZIP+4, as a string or a number (a number loses its leading zeros, which are put back).
- Returns: The two-letter code, or `undefined` for a ZIP no state uses or a malformed one.

```js
getStateFromZip("98101")
// "WA"
```

### getValidationErrors

function

```ts
getValidationErrors(addressString: string, options?: ValidationOptions): ValidationError[]
```

The errors `validateAddress` finds, without the rest of its result.

- `addressString`: The address as one string.
- `options`: What to require and how strict to be (see `ValidationOptions`).
- Returns: The errors, each with its field, code and message; an empty array when there are none.

```js
getValidationErrors("123 Main St, Seattle, NY 98101", { strictPostalValidation: true }).map((error) => error.code)
// ["POSTAL_REGION_MISMATCH"]
```

### getZipPrefixesForState

function

```ts
getZipPrefixesForState(state: string): string[]
```

The ZIP code prefixes a state or territory uses, the reverse of `getStateFromZip`: three digits where a whole block of a hundred belongs to it, five where only part of one does. Every ZIP starting with one of them resolves to that state.

- `state`: The state or territory's two-letter code.
- Returns: The prefixes in ascending order, or an empty array for an unknown code.

```js
getZipPrefixesForState("RI")
// ["028","029"]
```

### hasValidAddressComponents

function

```ts
hasValidAddressComponents(address: string): boolean
```

Whether a string looks like an address at all: a number and a street, a PO box, a postal code or another recognised part.

- `address`: The text to look at.
- Returns: `true` when it holds something an address is made of.

```js
hasValidAddressComponents("123 Main St, Anytown, NY 12345")
// true
```

### INTERSECTION_PATTERNS

const

```ts
INTERSECTION_PATTERNS: { readonly BASIC_CITY: RegExp; readonly CITY_WITH_COMMA: RegExp; readonly STREET_WITH_TYPE: (directionalPattern: string, streetTypePattern: string) => RegExp; readonly STREET_SIMPLE: (directionalPattern: string) => RegExp; }
```

The regular expressions and pattern builders the intersection parser uses to find the city and each street with its type.

```js
INTERSECTION_PATTERNS.CITY_WITH_COMMA.exec("Pine St, Tacoma")?.[1]
// "Tacoma"
```

### ISLAND_TYPE_PATTERN

const

```ts
ISLAND_TYPE_PATTERN: RegExp
```

The words for an island, for addresses on one (`Island`, `Isle`, `Île`).

```js
ISLAND_TYPE_PATTERN.test("Island")
// true
```

### isSameAddress

function

```ts
isSameAddress(address1: ParsedAddress, address2: ParsedAddress, options?: AddressComparisonOptions): boolean
```

Whether two parsed addresses are the same place, by the same rules as `compareAddresses`.

- `address1`: The first address, as `parseLocation` returns it.
- `address2`: The second address.
- `options`: How to compare (see `AddressComparisonOptions`).
- Returns: `true` when they match, `false` otherwise.

```js
isSameAddress(parseLocation("東京都千代田区丸の内1丁目2番3号"), parseLocation("東京都千代田区丸の内１－２－３"))
// true
```

### isValidAddress

function

```ts
isValidAddress(addressString: string, options?: ValidationOptions): boolean
```

Whether an address passes `validateAddress`.

- `addressString`: The address as one string.
- `options`: What to require and how strict to be (see `ValidationOptions`).
- Returns: `true` when it has no errors, `false` otherwise. Warnings do not make it invalid unless `strictPostalValidation` turns them into errors.

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
  streetDirections?: string; // Kyoto's street directions before the town (通り名): 寺町通御池上る
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

The fields a Japanese address fills on top of the shared ones. Every value is normalised: full-width and kanji numerals become ASCII digits, and the block is split into chome, ban and go whichever way it was written.

```js
parseLocation("〒100-0005 東京都千代田区丸の内1丁目2番3号")?.municipalityCode
// "13101"
```

### JapaneseEnglishFormattingOptions

type

```ts
interface JapaneseEnglishFormattingOptions {
  includeCountry?: boolean; // ", Japan" at the end; default true
  includePostalCode?: boolean; // Default true
}
```

Options for `formatJapaneseEnglish`.

```js
formatJapaneseEnglish(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { includeCountry: false })
// "1-2-3 丸の内, Chiyoda-ku, Tokyo 100-0005"
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

Options for `formatJapanese`.

```js
formatJapanese(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { blockStyle: "markers", includePostalCode: false })
// "東京都千代田区丸の内1丁目2番3号"
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

A municipality (市区町村) in the tables: its JIS code, its prefecture's code, its official name with the district for a town or village in one, its reading and its romaji.

```js
findMunicipalityByCode("13101")
// {"code":"13101","prefecture":"13","name":"千代田区","kana":"チヨダク","romaji":"Chiyoda-ku"}
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

A prefecture (都道府県) in the tables: its JIS code, official name, katakana reading and romaji.

```js
findPrefecture("13")
// {"code":"13","name":"東京都","kana":"トウキョウト","romaji":"Tokyo-to"}
```

### JapaneseValidation

type

```ts
interface JapaneseValidation {
  errors: ValidationError[];
  warnings: ValidationError[];
}
```

What `validateJapaneseAddress` returns: the errors and the warnings found.

```js
validateJapaneseAddress(parseLocation("東京都大阪市北区梅田1-1")).warnings.map((one) => one.code)
// ["MUNICIPALITY_PREFECTURE_MISMATCH"]
```

### JP_DESIGNATED_CITIES

const

```ts
JP_DESIGNATED_CITIES: readonly JapaneseMunicipality[]
```

The twenty designated cities (政令指定都市) as municipalities of their own. Geolonia lists only their wards, but addresses often name the city alone (`大阪市`, `Sapporo`), and the city has a JIS code of its own: its wards' codes with the last digit 0 (札幌市 01100).

```js
JP_DESIGNATED_CITIES.length
// 20
```

### JP_MUNICIPALITIES

const

```ts
JP_MUNICIPALITIES: readonly JapaneseMunicipality[]
```

Every municipality (市区町村) by JIS X 0402 code, with its prefecture, official name, reading and romaji; a designated city's wards are listed, and the city itself is in `JP_DESIGNATED_CITIES`. Generated from Geolonia 住所データ (MIT).

```js
JP_MUNICIPALITIES.find((one) => one.code === "13101")?.name
// "千代田区"
```

### JP_POSTAL_EXCEPTIONS

const

```ts
JP_POSTAL_EXCEPTIONS: Readonly<Record<string, string>>
```

The postal codes that deliver to another prefecture than the rest of their three-digit prefix, each to that prefecture's JIS code. Generated from Japan Post's KEN_ALL.CSV through jp-postal (MIT).

```js
Object.keys(JP_POSTAL_EXCEPTIONS).length > 0
// true
```

### JP_POSTAL_PREFIXES

const

```ts
JP_POSTAL_PREFIXES: Readonly<Record<string, string>>
```

Each three-digit postal prefix, to the JIS code of the prefecture most of its codes deliver to. Generated from Japan Post's KEN_ALL.CSV through jp-postal (MIT).

```js
JP_POSTAL_PREFIXES["530"]
// "27"
```

### JP_PREFECTURES

const

```ts
JP_PREFECTURES: readonly JapanesePrefecture[]
```

The 47 prefectures in JIS X 0401 order, each with its code, official name, katakana reading and romaji. Generated from Geolonia 住所データ (MIT).

```js
JP_PREFECTURES.length
// 47
```

### kanjiNumeralsToDigits

function

```ts
kanjiNumeralsToDigits(text: string): string
```

Turns the kanji numerals that stand for block, floor or room numbers into digits: `一丁目二番三号` becomes `1丁目2番3号`. A numeral that is part of a name stays: `北一条西`, `三番町`, `麻布十番`, `二階堂`.

- `text`: Japanese text.
- Returns: The text with those numerals as digits.

```js
kanjiNumeralsToDigits("二丁目十五番")
// "2丁目15番"
```

### looksJapanese

function

```ts
looksJapanese(text: string): boolean
```

Whether a text is a Japanese address: in Japanese script, ending with Japan, or naming a prefecture beside a Japanese postal code, a romaji designator (`-ku`, `-shi`) or a municipality written with an English word (`Chiyoda City`). A US address that only mentions a Japanese name (`100 Tokyo Ave`) does not count.

- `text`: The text.
- Returns: `true` when the text should be read as Japanese.

```js
looksJapanese("1-2-3 Marunouchi, Chiyoda-ku, Tokyo")
// true
```

### municipalitiesOf

function

```ts
municipalitiesOf(prefectureCode: string): readonly JapaneseMunicipality[]
```

Every municipality of a prefecture, the designated cities included.

- `prefectureCode`: The prefecture's JIS code.
- Returns: The municipalities, an empty array for an unknown code.

```js
municipalitiesOf("47").length
// 41
```

### MUSIC_SQUARE_EAST_PATTERN

const

```ts
MUSIC_SQUARE_EAST_PATTERN: RegExp
```

Nashville's Music Square East, whose name ends in a directional word that is part of it.

```js
MUSIC_SQUARE_EAST_PATTERN.test("1 Music Square East")
// true
```

### normalizeJapaneseAddressText

function

```ts
normalizeJapaneseAddressText(text: string): string
```

Makes the text of a Japanese address uniform, as the parser reads it: widths folded, spaces tidied, numerals as digits, and `1の2の3`, `１－２－３` or any other dash written `1-2-3`. The postal mark 〒 is kept.

- `text`: Japanese text.
- Returns: The text made uniform.

```js
normalizeJapaneseAddressText("〒１００-０００５ 東京都千代田区丸の内一丁目二番三号")
// "〒100-0005 東京都千代田区丸の内1丁目2番3号"
```

### normalizeRegion

function

```ts
normalizeRegion(input: string): { abbr: string; country: "CA" | "US"; } | null
```

Finds the US state or Canadian province a name, code or misspelling means: `Calfornia`, `Que.`, `British Columbia`, `nfld`.

- `input`: A state or province name, code or abbreviation, in English or French.
- Returns: Its code and country, or `null` when nothing is close enough.

```js
normalizeRegion("Calfornia")
// {"abbr":"CA","country":"US"}
```

### normalizeStateProvinceName

function

```ts
normalizeStateProvinceName(stateName: string): string | undefined
```

The code of a US state or Canadian province written in full, in lower case.

- `stateName`: The name in full, in English or French, any letter case.
- Returns: The code in lower case, or `undefined` for a name that is not a state or province.

```js
normalizeStateProvinceName("Nova Scotia")
// "ns"
```

### normalizeText

function

```ts
normalizeText(text: string): string
```

Lower-cases a string, turns its periods, commas and semicolons into spaces, folds runs of spaces to one and trims it: the form the parsers compare words in.

- `text`: The text.
- Returns: The text in lower case, without that punctuation, with single spaces and none at either end.

```js
normalizeText("  123   Main  St  ")
// "123 main st"
```

### PARENTHETICAL_PATTERN

const

```ts
PARENTHETICAL_PATTERN: RegExp
```

Words in parentheses inside an address; group 1 is what is inside them.

```js
PARENTHETICAL_PATTERN.exec("123 Main St (Rear)")?.[1]
// "Rear"
```

### parseAddress

function

```ts
parseAddress(address: string, options?: ParseOptions): ParsedAddress | null
```

Parses a street address. The same as `parseLocation`, kept under the name parse-address's users know.

- `address`: The address as one string.
- `options`: How to parse (see `ParseOptions`).
- Returns: The parts found, or `null` when nothing can be read as an address.

```js
parseAddress("123 Main St Apt 4, Anytown, NY 12345")?.secUnitNum
// "4"
```

### parseAddresses

function

```ts
parseAddresses(addresses: string[], options?: ParseOptions): (ParsedAddress | null)[]
```

Parses many street addresses with `parseAddress`, in order.

- `addresses`: The addresses, one string each.
- `options`: How to parse every one of them (see `ParseOptions`).
- Returns: One result per address, in the same order, `null` where an address could not be read.

```js
parseAddresses(["10 Main St, Anytown, NY 12345", "PO Box 12, Springfield, IL 62701"]).map((one) => one?.city)
// ["Anytown","Springfield"]
```

### parseAddressesBatch

function

```ts
parseAddressesBatch(addresses: string[], options?: BatchParseOptions): BatchParseResult<ParsedAddress>
```

Parses many street addresses with `parseAddress`, and reports which failed and how long it took.

- `addresses`: The addresses, one string each.
- `options`: How to parse, plus the batch settings (see `BatchParseOptions`).
- Returns: The results in order (`null` for a failure), the errors, and the counts and timing.

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

What `parseLocation` returns: every part it found, each absent when the address has none. A Japanese address fills its own fields and the shared ones that stand for them: `state` the prefecture's JIS code, `city` the municipality, `street` the town, `number` the block, `zip` the postal code.

```js
parseLocation("123 Main St Apt 4, Anytown, NY 12345")
// {"number":"123","secUnitType":"Apartment","secUnitNum":"4","unit":"Apt 4","street":"Main","type":"St","city":"Anytown","state":"NY","zip":"12345","zipValid":true,"country":"US"}
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

What `parseIntersection` returns: two streets, each with its name, type and directionals, and the place.

```js
parseIntersection("Hollywood Blvd and Vine St, Los Angeles, CA")
// {"state":"CA","city":"Los Angeles","street1":"Hollywood","type1":"Blvd","street2":"Vine","type2":"St"}
```

### parseDirectional

function

```ts
parseDirectional(text: string): { direction: string | undefined; remaining: string; }
```

Takes a leading directional off a street (`NW Main St`), abbreviated.

- `text`: The street text.
- Returns: The directional (`undefined` when there is none) and the text that remains.

```js
parseDirectional("NW Main St")
// {"direction":"NW","remaining":"Main St"}
```

### parseFacility

function

```ts
parseFacility(text: string): { facility: string | undefined; remaining: string; }
```

Takes a facility's name (a building, a park, a hospital) off the start of an address.

- `text`: The address text.
- Returns: The facility (`undefined` when there is none) and the text that remains.

```js
parseFacility("Empire State Building, 350 5th Ave")
// {"facility":"Empire State Building","remaining":", 350 5th Ave"}
```

### parseInformalAddress

function

```ts
parseInformalAddress(address: string, options?: ParseOptions): ParsedAddress | null
```

Reads an address written loosely, as a fallback when `parseLocation` finds no street address: a description such as `Downtown near City Hall` is kept whole as the street, with any ZIP code after it.

- `address`: The address as one string.
- `options`: How to parse (see `ParseOptions`).
- Returns: The street and the ZIP code it could find, or `null` when the text is empty.

```js
parseInformalAddress("Downtown near City Hall, Springfield IL 62701")
// {"street":"Downtown near City Hall","zip":"62701","country":"US"}
```

### parseInformalAddresses

function

```ts
parseInformalAddresses(addresses: string[], options?: ParseOptions): (ParsedAddress | null)[]
```

Parses many loosely written addresses with `parseInformalAddress`, in order.

- `addresses`: The addresses, one string each.
- `options`: How to parse every one of them (see `ParseOptions`).
- Returns: One result per address, in the same order, `null` where nothing could be read.

```js
parseInformalAddresses(["Downtown near City Hall, Springfield IL 62701"]).map((one) => one?.zip)
// ["62701"]
```

### parseInformalAddressesBatch

function

```ts
parseInformalAddressesBatch(addresses: string[], options?: BatchParseOptions): BatchParseResult<ParsedAddress>
```

Parses many loosely written addresses with `parseInformalAddress`, and reports which failed and how long it took.

- `addresses`: The addresses, one string each.
- `options`: How to parse, plus the batch settings (see `BatchParseOptions`).
- Returns: The results in order (`null` for a failure), the errors, and the counts and timing.

```js
parseInformalAddressesBatch(["Main St, Anytown NY"]).stats.successful
// 1
```

### parseIntersection

function

```ts
parseIntersection(address: string, options?: ParseOptions): ParsedIntersection | null
```

Parses an intersection of two streets, joined by `&`, `and`, `at` or `@`, with the city, state and ZIP that may follow. With no comma before the city, the second street ends at its type, so the city may be any number of words.

- `address`: The intersection as one string, such as `Main St & Pine Ave, Tacoma, WA`.
- `options`: How to parse (see `ParseOptions`).
- Returns: Both streets with their types and directionals, and the place, or `null` when the text does not name two streets. A street with no type has `type1` or `type2` set to an empty string, as in parse-address.

```js
parseIntersection("Main St and Pine St Tacoma WA")
// {"state":"WA","city":"Tacoma","street1":"Main","type1":"St","street2":"Pine","type2":"St"}
```

### parseIntersections

function

```ts
parseIntersections(addresses: string[], options?: ParseOptions): (ParsedIntersection | null)[]
```

Parses many intersections with `parseIntersection`, in order.

- `addresses`: The intersections, one string each.
- `options`: How to parse every one of them (see `ParseOptions`).
- Returns: One result per intersection, in the same order, `null` where one could not be read.

```js
parseIntersections(["Yonge St and Bloor St, Toronto, ON"]).map((one) => one?.street2)
// ["Bloor"]
```

### parseIntersectionsBatch

function

```ts
parseIntersectionsBatch(addresses: string[], options?: BatchParseOptions): BatchParseResult<ParsedIntersection>
```

Parses many intersections with `parseIntersection`, and reports which failed and how long it took.

- `addresses`: The intersections, one string each.
- `options`: How to parse, plus the batch settings (see `BatchParseOptions`).
- Returns: The results in order (`null` for a failure), the errors, and the counts and timing.

```js
parseIntersectionsBatch(["Yonge St and Bloor St, Toronto, ON"]).stats.successful
// 1
```

### parseJapaneseAddress

function

```ts
parseJapaneseAddress(text: string, options?: ParseOptions): ParsedAddress | null
```

Parses a Japanese address, in Japanese script or in romaji, into the Japanese fields and the shared ones. `parseLocation` calls it for any address that looks Japanese; call it directly to skip the detection.

- `text`: The address as one string, in either script, with or without 〒 and the postal code.
- `options`: `useSnakeCase` gives snake_case keys; the other options are ignored.
- Returns: The parts found, or `null` when nothing in the text names a place in Japan (no prefecture, municipality or postal code).

```js
parseJapaneseAddress("〒100-0005 東京都千代田区丸の内1丁目2番3号 サンプルビル5階501号室")?.block
// "1-2-3"
```

### parseLocation

function

```ts
parseLocation(address: string, options?: ParseOptions): ParsedAddress | null
```

Parses a US, Canadian or Japanese address into its parts. The country is detected from the text (a state, a province, a postal code, Japanese script or romaji designators) unless `options.country` names it. A Japanese address fills its own fields (`prefecture`, `municipality`, `town`, `chome`, `ban`, `go`) and the shared ones that stand for them.

- `address`: The address as one string; commas, line breaks and full-width characters are all read.
- `options`: How to parse: the country, strict postal codes, snake_case keys and the rest (see `ParseOptions`).
- Returns: The parts found, or `null` when the text is empty or holds nothing that can be read as an address. A part that is not in the address is absent from the result, never an empty string.

```js
parseLocation("1600 Pennsylvania Ave NW, Washington, DC 20500")
// {"number":"1600","street":"Pennsylvania","type":"Ave","suffix":"NW","city":"Washington","state":"DC","zip":"20500","zipValid":true,"country":"US"}
```

### parseLocations

function

```ts
parseLocations(addresses: string[], options?: ParseOptions): (ParsedAddress | null)[]
```

Parses many addresses with `parseLocation`, in order.

- `addresses`: The addresses, one string each.
- `options`: How to parse every one of them (see `ParseOptions`).
- Returns: One result per address, in the same order: the parts, or `null` where an address could not be read.

```js
parseLocations(["100 Queen St W, Toronto, ON M5H 2N2", "大阪府大阪市北区梅田3-1-1"]).map((one) => one?.country)
// ["CA","JP"]
```

### parseLocationsBatch

function

```ts
parseLocationsBatch(addresses: string[], options?: BatchParseOptions): BatchParseResult<ParsedAddress>
```

Parses many addresses with `parseLocation`, and reports which failed and how long it took. A failure is recorded and the batch goes on, unless `options.stopOnError` is set.

- `addresses`: The addresses, one string each.
- `options`: How to parse, plus the batch settings (see `BatchParseOptions`).
- Returns: The results in order (`null` for a failure), the errors with their index and input, and the counts and timing.

```js
parseLocationsBatch(["100 Queen St W, Toronto, ON M5H 2N2", "", "大阪府大阪市北区梅田3-1-1"]).stats.successful
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

Options for every parser: the country, strict postal codes, snake_case keys and the rest. Every one is optional.

```js
parseLocation("東京都千代田区丸の内1-2-3", { country: "JP", useSnakeCase: true })?.prefecture_code
// "13"
```

### parseParenthetical

function

```ts
parseParenthetical(text: string): { secondary: string | undefined; remaining: string; }
```

Takes words in parentheses out of an address, such as `(Rear Entrance)`.

- `text`: The address text.
- Returns: The words in the parentheses (`undefined` when there are none) and the text without them.

```js
parseParenthetical("123 Main St (Rear Entrance)")
// {"secondary":"Rear Entrance","remaining":"123 Main St"}
```

### parsePostalCode

function

```ts
parsePostalCode(text: string): { zip: string | undefined; plus4: string | undefined; remaining: string; detectedCountry?: "US" | "CA"; detectedProvince?: string; }
```

Takes a ZIP code, ZIP+4 or Canadian postal code off the end of a text.

- `text`: The text, such as `Toronto ON M5H 2N2`.
- Returns: The code and its ZIP+4 (`undefined` when there is none), the text that remains, and the country and province the code points to.

```js
parsePostalCode("Toronto ON M5H 2N2")
// {"zip":"M5H 2N2","remaining":"Toronto ON","detectedCountry":"CA","detectedProvince":"ON"}
```

### parseSecondaryUnit

function

```ts
parseSecondaryUnit(text: string): { unit: string | undefined; secUnitType: string | undefined; secUnitNum: string | undefined; remaining: string; }
```

Takes a secondary unit (apartment, suite, floor and the rest) off a street line.

- `text`: The street line.
- Returns: The unit as written, its designator in full and its number (each `undefined` when there is none), and the text that remains.

```js
parseSecondaryUnit("123 Main St Apt 4")
// {"unit":"Apartment 4","secUnitType":"Apartment","secUnitNum":"4","remaining":"123 Main St"}
```

### parseStateProvince

function

```ts
parseStateProvince(text: string): { state: string | undefined; remaining: string; detectedCountry?: "US" | "CA"; }
```

Takes a US state or Canadian province off the end of a text, by code or by name.

- `text`: The text, such as `Anytown NY`.
- Returns: The two-letter code (`undefined` when there is none), the text that remains, and the country it points to.

```js
parseStateProvince("Anytown NY")
// {"state":"NY","remaining":"Anytown","detectedCountry":"US"}
```

### parseStreetNumber

function

```ts
parseStreetNumber(text: string): { number: string | undefined; remaining: string; }
```

Takes the house number off the start of a street line, with a fraction or a letter if it has one.

- `text`: The street line.
- Returns: The number (`undefined` when there is none) and the text that remains.

```js
parseStreetNumber("123 Main St")
// {"number":"123","remaining":"Main St"}
```

### parseStreetType

function

```ts
parseStreetType(text: string, country?: "US" | "CA"): { type: string | undefined; remaining: string; }
```

Takes the street type off the end of a street, abbreviated the USPS way.

- `text`: The street text.
- `country`: `US` or `CA`, for the types only one country uses.
- Returns: The type's USPS abbreviation in lower case (`undefined` when there is none) and the text that remains.

```js
parseStreetType("Main Street")
// {"type":"st","remaining":"Main"}
```

### PO_BOX_PATTERNS

const

```ts
PO_BOX_PATTERNS: { readonly US_PO_BOX: RegExp; readonly STATION_PATTERN: RegExp; readonly LEADING_BOX_NUMBER: RegExp; readonly TRAILING_COMMA: RegExp; }
```

The regular expressions the PO box parser uses: the box itself, a station after it, a box number first, and a trailing comma.

```js
PO_BOX_PATTERNS.US_PO_BOX.exec("PO Box 123, Springfield, IL 62701")?.slice(1)
// ["123","Springfield","IL","62701"]
```

### POSTAL_CODE_TO_PROVINCE

const

```ts
POSTAL_CODE_TO_PROVINCE: Record<string, string>
```

Each first letter of a Canadian postal code, to the province or territory it is assigned to. X is shared by the Northwest Territories and Nunavut and is resolved with `TERRITORY_POSTAL_RANGES`.

```js
POSTAL_CODE_TO_PROVINCE["V"]
// "BC"
```

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

What `validatePostalCode` returns: whether the code is well formed, its type, and the code written the standard way.

```js
validatePostalCode("98101")
// {"isValid":true,"type":"zip","formatted":"98101","message":"Valid US ZIP code format"}
```

### PROVINCE_EXPANSIONS

const

```ts
PROVINCE_EXPANSIONS: Record<string, string>
```

Each Canadian province's code in lower case, to its name in lower case: English by default, the French names under their own keys.

```js
PROVINCE_EXPANSIONS["on"]
// "ontario"
```

### PROVINCE_EXPANSIONS_EN

const

```ts
PROVINCE_EXPANSIONS_EN: Record<string, string>
```

Each Canadian province's code in lower case, to its English name in lower case.

```js
PROVINCE_EXPANSIONS_EN["qc"]
// "quebec"
```

### PROVINCE_EXPANSIONS_FR

const

```ts
PROVINCE_EXPANSIONS_FR: Record<string, string>
```

Each Canadian province's code in lower case, to its French name in lower case.

```js
PROVINCE_EXPANSIONS_FR["qc"]
// "québec"
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

A US state or Canadian province: its code, its country and its name, as `normalizeRegion` matches them.

```js
CA_REGIONS[0]
// {"abbr":"AB","country":"CA","name":"alberta"}
```

### SECONDARY_UNIT_PATTERN

const

```ts
SECONDARY_UNIT_PATTERN: RegExp
```

A unit at the end of a street line: group 1 is the street before it, group 2 the unit.

```js
SECONDARY_UNIT_PATTERN.exec("123 Main St Apt 4")?.[2]
// "Apt 4"
```

### SECONDARY_UNIT_TYPES

const

```ts
SECONDARY_UNIT_TYPES: Record<string, string>
```

Each secondary unit designator, abbreviated or in full, in lower case, to the word the parser reports in full: USPS Publication 28 Appendix C2, and Canada Post's French unit words, which stay French.

```js
SECONDARY_UNIT_TYPES["ste"]
// "Suite"
```

### setValidatedPostalCode

function

```ts
setValidatedPostalCode(result: ParsedAddress | ParsedIntersection, zipCode: string, options: ParseOptions): void
```

Sets a ZIP or postal code on a result, the way the parsers do: split into ZIP and ZIP+4, a Canadian code in capitals with one space, with `zipValid` set, and in strict mode only when the code is well formed. It changes the object it is given.

- `result`: The parsed address or intersection to set the code on.
- `zipCode`: The code as written.
- `options`: `strict` keeps a malformed code out (see `ParseOptions`).

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

A US state, DC or territory code that `getStateFromZip` can return.

```js
getStateFromZip("00901")
// "PR"
```

### STREET_NAME_ACRONYMS

const

```ts
STREET_NAME_ACRONYMS: Map<string, string>
```

Acronyms written in capitals inside a street name (`US`, `FBI`), from their lower-case form, for `capitalizeStreetName`.

```js
STREET_NAME_ACRONYMS.get("fbi")
// "FBI"
```

### STREET_TYPE_DETECTION_PATTERN

const

```ts
STREET_TYPE_DETECTION_PATTERN: RegExp
```

Whether a text has a common street type in it, used to judge that a parse found a street.

```js
STREET_TYPE_DETECTION_PATTERN.test("123 Main Street")
// true
```

### STREET_TYPE_EXPANSIONS

const

```ts
STREET_TYPE_EXPANSIONS: Record<string, string>
```

Each USPS street type abbreviation in lower case, to the word in full.

```js
STREET_TYPE_EXPANSIONS["blvd"]
// "Boulevard"
```

### STREET_TYPE_PROPER_CASE

const

```ts
STREET_TYPE_PROPER_CASE: Record<string, string>
```

Each street type abbreviation in lower case, to the way the parser reports it (`Ave`, `Xing`).

```js
STREET_TYPE_PROPER_CASE["xing"]
// "Xing"
```

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

An administrative part of a city (a borough, a parish, a ward, an arrondissement) that may be written where the city is expected.

```js
({ name: "brooklyn", parentCity: "new york", state: "NY", country: "US", type: "borough" }).type
// "borough"
```

### TERRITORY_POSTAL_PREFIXES

const

```ts
TERRITORY_POSTAL_PREFIXES: Record<string, string[]>
```

The first three characters of each territory's postal codes, since the territories share a first letter.

```js
TERRITORY_POSTAL_PREFIXES["NU"]
// ["X0A","X0B","X0C"]
```

### TERRITORY_POSTAL_RANGES

const

```ts
TERRITORY_POSTAL_RANGES: { pattern: RegExp; province: string; }[]
```

The patterns that tell the Northwest Territories' X codes from Nunavut's, by their first three characters.

```js
TERRITORY_POSTAL_RANGES.find((range) => range.pattern.test("X0A"))?.province
// "NU"
```

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

Any case in the package's JSON test files.

```js
({ input: "98101", expected: "WA" }).input
// "98101"
```

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

The fields every case in the package's JSON test files has: a name or description, the input, what is expected and the options. Exported for tools that read those files.

```js
({ name: "a ZIP code", input: "98101", expected: "WA" }).expected
// "WA"
```

### UNIT_TYPE_KEYWORDS

const

```ts
UNIT_TYPE_KEYWORDS: string
```

The secondary unit designators that take a value after them, as one alternation for a regular expression, longest first so that `apartment` is tried before `apt`: USPS Publication 28 Appendix C2, Canada Post's English and French unit words, and a few spellings people write.

```js
new RegExp("^(?:" + UNIT_TYPE_KEYWORDS + ")$", "i").test("suite")
// true
```

### UNIT_TYPE_NUMBER_PATTERN

const

```ts
UNIT_TYPE_NUMBER_PATTERN: RegExp
```

A unit's designator and value: groups 1 and 2 (`apt 123`, `Apt. #4B`), groups 3 and 4 for a lot run together (`lt42`), group 5 for the value after a bare `#`.

```js
UNIT_TYPE_NUMBER_PATTERN.exec("Apt. #4B")?.slice(1, 3)
// ["Apt","4B"]
```

### US_REGIONS

const

```ts
US_REGIONS: Region[]
```

Every name and other spelling of a US state, DC or territory as a `Region` object, for fuzzy matching by `normalizeRegion`.

```js
US_REGIONS.find((region) => region.abbr === "WA")?.name
// "washington"
```

### US_STATE_ALTERNATIVES

const

```ts
US_STATE_ALTERNATIVES: Record<string, string>
```

Other ways US states are written (shortened forms, old abbreviations, `D.C.`), in lower case, to their codes.

```js
US_STATE_ALTERNATIVES["calif"]
// "CA"
```

### US_STATE_EXPANSIONS

const

```ts
US_STATE_EXPANSIONS: Record<string, string>
```

Each US state's code in lower case, to its name in lower case: the reverse of `US_STATE_NAMES`.

```js
US_STATE_EXPANSIONS["wa"]
// "washington"
```

### US_STATE_NAMES

const

```ts
US_STATE_NAMES: Record<string, string>
```

Every US state, DC and territory by its name in lower case, to its two-letter code.

```js
US_STATE_NAMES["new york"]
// "NY"
```

### US_STATES

const

```ts
US_STATES: Record<string, string>
```

Every name and other spelling of a US state in lower case, to its code: `US_STATE_NAMES` and `US_STATE_ALTERNATIVES` together.

```js
US_STATES["mass"]
// "MA"
```

### US_STREET_TYPES

const

```ts
US_STREET_TYPES: Record<string, string>
```

Every street type USPS Publication 28 lists, and the common spellings of each, in lower case, to its USPS abbreviation in lower case.

```js
US_STREET_TYPES["boulevard"]
// "blvd"
```

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

Options for `formatUSPS`: which lines to include, and whether to set the letter case the USPS way.

```js
formatUSPS(parseLocation("123 Main St, Anytown, NY 12345"), { includeLastLine: false }).lines
// ["123 MAIN ST"]
```

### validateAddress

function

```ts
validateAddress(addressString: string, options?: ValidationOptions): AddressValidationResult
```

Checks an address: whether it has what an address needs, whether its ZIP or postal code is well formed and belongs to the state, province or prefecture named, and how sure the parser is.

- `addressString`: The address as one string.
- `options`: What to require and how strict to be (see `ValidationOptions`).
- Returns: Whether it is valid, the confidence and completeness from 0 to 1, every error and warning with its code, suggestions, and the parsed address (`null` when it could not be parsed).

```js
validateAddress("123 Main St, Seattle, NY 98101").warnings[0].code
// "POSTAL_REGION_MISMATCH"
```

### validateJapaneseAddress

function

```ts
validateJapaneseAddress(address: ParsedAddress, options?: ValidationOptions): JapaneseValidation
```

Checks a parsed Japanese address against the tables: the postal code's shape, whether any code begins with its first three digits, whether it delivers to the prefecture named, and whether the municipality is a real one in that prefecture.

- `address`: The address, as `parseLocation` returns it for a Japanese address.
- `options`: `strictPostalValidation` makes the postal findings errors rather than warnings; the municipality findings stay warnings.
- Returns: The errors and the warnings, each with its field, code and message.

```js
validateJapaneseAddress(parseLocation("〒530-0001 東京都千代田区丸の内1-2-3")).warnings.map((one) => one.code)
// ["POSTAL_REGION_MISMATCH"]
```

### validatePostalCode

function

```ts
validatePostalCode: (code: string) => PostalValidationResult
```

Checks the shape of a US ZIP code or a Canadian postal code.

- `code`: The code, with or without the space or the ZIP+4.
- Returns: Whether it is well formed, its type (`zip` or `postal`), and the code written the standard way.

```js
validatePostalCode("k1a0b1")
// {"isValid":true,"type":"postal","formatted":"K1A 0B1","message":"Valid Canadian postal code format"}
```

### VALIDATION_PATTERNS

const

```ts
VALIDATION_PATTERNS: { readonly HAS_LETTERS: RegExp; readonly ALPHANUMERIC: RegExp; readonly HAS_DIGITS: RegExp; readonly HOUSE_NUMBER_START: RegExp; readonly STARTS_WITH_NUMBER: RegExp; readonly WHITESPACE_SPLIT: RegExp; readonly TITLE_CASE: RegExp; readonly NUMERIC_ONLY: RegExp; readonly NON_WORD: RegExp; readonly REGEX_ESCAPE: RegExp; readonly NORMALIZE_SPACES: RegExp; readonly PO_BOX_NORMALIZE: RegExp; }
```

Small regular expressions the validators share: letters, digits, a house number at the start, and the like.

```js
VALIDATION_PATTERNS.STARTS_WITH_NUMBER.test("123 Main St")
// true
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

One finding of a validator: the field it is about, its code, a message, and how serious it is.

```js
validateAddress("123 Main St, Seattle, NY 98101").warnings[0]
// {"field":"zip","code":"POSTAL_REGION_MISMATCH","message":"ZIP code 98101 belongs to WA, not NY","severity":"warning"}
```

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

Options for the validators: which parts an address must have, which kinds are allowed, and whether a postal code that does not match its region is an error.

```js
validateAddress("123 Main St", { requirePostalCode: true }).errors.map((error) => error.code)
// ["MISSING_POSTAL_CODE"]
```

### WRITTEN_NUMBERS

const

```ts
WRITTEN_NUMBERS: string
```

House numbers written as words (`One`, `Twenty`), as one alternation for a regular expression, so `One Microsoft Way` is read as number 1.

```js
new RegExp("^(?:" + WRITTEN_NUMBERS + ")$", "i").test("one")
// true
```

### ZIP_CODE_PATTERN

const

```ts
ZIP_CODE_PATTERN: RegExp
```

A US ZIP code with an optional ZIP+4.

```js
ZIP_CODE_PATTERN.test("98101-1234")
// true
```

### ZIP_CODE_REGEX_PATTERN

const

```ts
ZIP_CODE_REGEX_PATTERN: string
```

The source of `ZIP_CODE_PATTERN`, for building larger patterns.

```js
ZIP_CODE_REGEX_PATTERN.length > 0
// true
```

### ZIP_VALIDATION_PATTERNS

const

```ts
ZIP_VALIDATION_PATTERNS: { readonly POTENTIAL_ZIP: RegExp; }
```

The shape of something that could be a ZIP code.

```js
ZIP_VALIDATION_PATTERNS.POTENTIAL_ZIP.test("98101")
// true
```


## @johnmorrisdotca/address-plus/jp

### findMunicipalitiesByName

function

```ts
findMunicipalitiesByName(name: string, prefectureCode?: string): JapaneseMunicipality[]
```

The municipalities a Japanese name could mean: several when the name is shared (`府中市` is in Tokyo and in Hiroshima). A town or village may be named without its district (`当別町`).

- `name`: The municipality's name in Japanese.
- `prefectureCode`: A prefecture's JIS code, to look in that prefecture only.
- Returns: Every match, an empty array when there is none.

```js
findMunicipalitiesByName("府中市").map((one) => one.code + " " + one.romaji)
// ["13206 Fuchu-shi","34208 Fuchu-shi"]
```

### findMunicipalitiesByRomaji

function

```ts
findMunicipalitiesByRomaji(text: string, prefectureCode?: string): JapaneseMunicipality[]
```

The municipalities a romaji name could mean, written with or without macrons and designators (`Chiyoda-ku`, `Chiyoda City`, `Sapporo-shi Chuo-ku`, `Chuo-ku, Sapporo`). A town written without its district, and then a ward written without its city, are looked up when the full name finds nothing.

- `text`: The name in romaji.
- `prefectureCode`: A prefecture's JIS code, to look in that prefecture only.
- Returns: Every match, an empty array when there is none.

```js
findMunicipalitiesByRomaji("Chuo-ku, Sapporo").map((one) => one.name)
// ["札幌市中央区"]
```

### findMunicipalityByCode

function

```ts
findMunicipalityByCode(code: string): JapaneseMunicipality | null
```

The municipality with a JIS X 0402 code, a designated city's own code included.

- `code`: The five-digit code.
- Returns: The municipality, or `null` for a code the tables do not have.

```js
findMunicipalityByCode("13101")?.name
// "千代田区"
```

### findPrefecture

function

```ts
findPrefecture(text: string): JapanesePrefecture | null
```

The prefecture a name, reading, romaji spelling or JIS code refers to: `東京都`, `東京`, `トウキョウト`, `Tokyo`, `Osaka Prefecture`, `13`.

- `text`: The name, reading or code; letter case and macrons do not matter.
- Returns: The prefecture, or `null` when the text names none.

```js
findPrefecture("Osaka Prefecture")?.name
// "大阪府"
```

### formatJapanese

function

```ts
formatJapanese(address: ParsedAddress, options?: JapaneseFormattingOptions): string
```

Writes a Japanese address in Japanese order, as an envelope is addressed: `〒100-0005`, then `東京都千代田区丸の内1-2-3`, then `サンプルビル5階501号室`. The prefecture and municipality are always in kanji, from the tables. A town or building parsed from romaji keeps its romaji, set off by spaces so the scripts do not run together. Kyoto's street directions are written before the town.

- `address`: The address, as `parseLocation` returns it for a Japanese address.
- `options`: The block's style (`1-2-3` or `1丁目2番3号`), the postal code, and lines or one line (see `JapaneseFormattingOptions`).
- Returns: The address as text, its lines joined with newlines unless `options.multiline` is `false`; an empty string when the address has none of the parts.

```js
formatJapanese(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { blockStyle: "markers", multiline: false })
// "〒100-0005 東京都千代田区丸の内1丁目2番3号"
```

### formatJapaneseEnglish

function

```ts
formatJapaneseEnglish(address: ParsedAddress, options?: JapaneseEnglishFormattingOptions): string
```

Writes a Japanese address in English order, as a form from abroad expects: building, room, block, town, municipality, prefecture, postal code, Japan. The prefecture and municipality are always romaji, from the tables; the town and building are written as they were parsed, since the tables hold no romaji for towns.

- `address`: The address, as `parseLocation` returns it for a Japanese address.
- `options`: Whether to end with the postal code and with Japan (see `JapaneseEnglishFormattingOptions`).
- Returns: The address as one line, its parts joined by commas.

```js
formatJapaneseEnglish(parseLocation("1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005"))
// "1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan"
```

### getPostalPrefixesForPrefecture

function

```ts
getPostalPrefixesForPrefecture(prefecture: string): string[]
```

The three-digit postal prefixes a prefecture's codes begin with, the reverse of `getPrefectureFromJapanesePostalCode`. A prefix on a border is listed under the prefecture most of its codes belong to.

- `prefecture`: The prefecture, by JIS code, name or romaji, as `findPrefecture` reads it.
- Returns: The prefixes in ascending order, an empty array for an unknown prefecture.

```js
getPostalPrefixesForPrefecture("沖縄県")
// ["900","901","902","903","904","905","906","907"]
```

### getPrefectureFromJapanesePostalCode

function

```ts
getPrefectureFromJapanesePostalCode(postalCode: string): string | null
```

The prefecture a Japanese postal code delivers to, from Japan Post's data: by its first three digits, and for the codes on the far side of a prefix that straddles a border, by the whole code.

- `postalCode`: The seven-digit code, with or without its hyphen, in either width.
- Returns: The prefecture's JIS code, or `null` for a malformed code or one no Japanese code begins like.

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
  streetDirections?: string; // Kyoto's street directions before the town (通り名): 寺町通御池上る
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

The fields a Japanese address fills on top of the shared ones. Every value is normalised: full-width and kanji numerals become ASCII digits, and the block is split into chome, ban and go whichever way it was written.

```js
parseLocation("〒100-0005 東京都千代田区丸の内1丁目2番3号")?.municipalityCode
// "13101"
```

### JapaneseEnglishFormattingOptions

type

```ts
interface JapaneseEnglishFormattingOptions {
  includeCountry?: boolean; // ", Japan" at the end; default true
  includePostalCode?: boolean; // Default true
}
```

Options for `formatJapaneseEnglish`.

```js
formatJapaneseEnglish(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { includeCountry: false })
// "1-2-3 丸の内, Chiyoda-ku, Tokyo 100-0005"
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

Options for `formatJapanese`.

```js
formatJapanese(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { blockStyle: "markers", includePostalCode: false })
// "東京都千代田区丸の内1丁目2番3号"
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

A municipality (市区町村) in the tables: its JIS code, its prefecture's code, its official name with the district for a town or village in one, its reading and its romaji.

```js
findMunicipalityByCode("13101")
// {"code":"13101","prefecture":"13","name":"千代田区","kana":"チヨダク","romaji":"Chiyoda-ku"}
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

A prefecture (都道府県) in the tables: its JIS code, official name, katakana reading and romaji.

```js
findPrefecture("13")
// {"code":"13","name":"東京都","kana":"トウキョウト","romaji":"Tokyo-to"}
```

### JapaneseValidation

type

```ts
interface JapaneseValidation {
  errors: ValidationError[];
  warnings: ValidationError[];
}
```

What `validateJapaneseAddress` returns: the errors and the warnings found.

```js
validateJapaneseAddress(parseLocation("東京都大阪市北区梅田1-1")).warnings.map((one) => one.code)
// ["MUNICIPALITY_PREFECTURE_MISMATCH"]
```

### JP_DESIGNATED_CITIES

const

```ts
JP_DESIGNATED_CITIES: readonly JapaneseMunicipality[]
```

The twenty designated cities (政令指定都市) as municipalities of their own. Geolonia lists only their wards, but addresses often name the city alone (`大阪市`, `Sapporo`), and the city has a JIS code of its own: its wards' codes with the last digit 0 (札幌市 01100).

```js
JP_DESIGNATED_CITIES.length
// 20
```

### JP_MUNICIPALITIES

const

```ts
JP_MUNICIPALITIES: readonly JapaneseMunicipality[]
```

Every municipality (市区町村) by JIS X 0402 code, with its prefecture, official name, reading and romaji; a designated city's wards are listed, and the city itself is in `JP_DESIGNATED_CITIES`. Generated from Geolonia 住所データ (MIT).

```js
JP_MUNICIPALITIES.find((one) => one.code === "13101")?.name
// "千代田区"
```

### JP_POSTAL_EXCEPTIONS

const

```ts
JP_POSTAL_EXCEPTIONS: Readonly<Record<string, string>>
```

The postal codes that deliver to another prefecture than the rest of their three-digit prefix, each to that prefecture's JIS code. Generated from Japan Post's KEN_ALL.CSV through jp-postal (MIT).

```js
Object.keys(JP_POSTAL_EXCEPTIONS).length > 0
// true
```

### JP_POSTAL_PREFIXES

const

```ts
JP_POSTAL_PREFIXES: Readonly<Record<string, string>>
```

Each three-digit postal prefix, to the JIS code of the prefecture most of its codes deliver to. Generated from Japan Post's KEN_ALL.CSV through jp-postal (MIT).

```js
JP_POSTAL_PREFIXES["530"]
// "27"
```

### JP_PREFECTURES

const

```ts
JP_PREFECTURES: readonly JapanesePrefecture[]
```

The 47 prefectures in JIS X 0401 order, each with its code, official name, katakana reading and romaji. Generated from Geolonia 住所データ (MIT).

```js
JP_PREFECTURES.length
// 47
```

### kanjiNumeralsToDigits

function

```ts
kanjiNumeralsToDigits(text: string): string
```

Turns the kanji numerals that stand for block, floor or room numbers into digits: `一丁目二番三号` becomes `1丁目2番3号`. A numeral that is part of a name stays: `北一条西`, `三番町`, `麻布十番`, `二階堂`.

- `text`: Japanese text.
- Returns: The text with those numerals as digits.

```js
kanjiNumeralsToDigits("二丁目十五番")
// "2丁目15番"
```

### looksJapanese

function

```ts
looksJapanese(text: string): boolean
```

Whether a text is a Japanese address: in Japanese script, ending with Japan, or naming a prefecture beside a Japanese postal code, a romaji designator (`-ku`, `-shi`) or a municipality written with an English word (`Chiyoda City`). A US address that only mentions a Japanese name (`100 Tokyo Ave`) does not count.

- `text`: The text.
- Returns: `true` when the text should be read as Japanese.

```js
looksJapanese("1-2-3 Marunouchi, Chiyoda-ku, Tokyo")
// true
```

### municipalitiesOf

function

```ts
municipalitiesOf(prefectureCode: string): readonly JapaneseMunicipality[]
```

Every municipality of a prefecture, the designated cities included.

- `prefectureCode`: The prefecture's JIS code.
- Returns: The municipalities, an empty array for an unknown code.

```js
municipalitiesOf("47").length
// 41
```

### normalizeJapaneseAddressText

function

```ts
normalizeJapaneseAddressText(text: string): string
```

Makes the text of a Japanese address uniform, as the parser reads it: widths folded, spaces tidied, numerals as digits, and `1の2の3`, `１－２－３` or any other dash written `1-2-3`. The postal mark 〒 is kept.

- `text`: Japanese text.
- Returns: The text made uniform.

```js
normalizeJapaneseAddressText("〒１００-０００５ 東京都千代田区丸の内一丁目二番三号")
// "〒100-0005 東京都千代田区丸の内1丁目2番3号"
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

What `parseLocation` returns: every part it found, each absent when the address has none. A Japanese address fills its own fields and the shared ones that stand for them: `state` the prefecture's JIS code, `city` the municipality, `street` the town, `number` the block, `zip` the postal code.

```js
parseLocation("123 Main St Apt 4, Anytown, NY 12345")
// {"number":"123","secUnitType":"Apartment","secUnitNum":"4","unit":"Apt 4","street":"Main","type":"St","city":"Anytown","state":"NY","zip":"12345","zipValid":true,"country":"US"}
```

### parseJapaneseAddress

function

```ts
parseJapaneseAddress(text: string, options?: ParseOptions): ParsedAddress | null
```

Parses a Japanese address, in Japanese script or in romaji, into the Japanese fields and the shared ones. `parseLocation` calls it for any address that looks Japanese; call it directly to skip the detection.

- `text`: The address as one string, in either script, with or without 〒 and the postal code.
- `options`: `useSnakeCase` gives snake_case keys; the other options are ignored.
- Returns: The parts found, or `null` when nothing in the text names a place in Japan (no prefecture, municipality or postal code).

```js
parseJapaneseAddress("〒100-0005 東京都千代田区丸の内1丁目2番3号 サンプルビル5階501号室")?.block
// "1-2-3"
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

Options for every parser: the country, strict postal codes, snake_case keys and the rest. Every one is optional.

```js
parseLocation("東京都千代田区丸の内1-2-3", { country: "JP", useSnakeCase: true })?.prefecture_code
// "13"
```

### validateJapaneseAddress

function

```ts
validateJapaneseAddress(address: ParsedAddress, options?: ValidationOptions): JapaneseValidation
```

Checks a parsed Japanese address against the tables: the postal code's shape, whether any code begins with its first three digits, whether it delivers to the prefecture named, and whether the municipality is a real one in that prefecture.

- `address`: The address, as `parseLocation` returns it for a Japanese address.
- `options`: `strictPostalValidation` makes the postal findings errors rather than warnings; the municipality findings stay warnings.
- Returns: The errors and the warnings, each with its field, code and message.

```js
validateJapaneseAddress(parseLocation("〒530-0001 東京都千代田区丸の内1-2-3")).warnings.map((one) => one.code)
// ["POSTAL_REGION_MISMATCH"]
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

One finding of a validator: the field it is about, its code, a message, and how serious it is.

```js
validateAddress("123 Main St, Seattle, NY 98101").warnings[0]
// {"field":"zip","code":"POSTAL_REGION_MISMATCH","message":"ZIP code 98101 belongs to WA, not NY","severity":"warning"}
```

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

Options for the validators: which parts an address must have, which kinds are allowed, and whether a postal code that does not match its region is an error.

```js
validateAddress("123 Main St", { requirePostalCode: true }).errors.map((error) => error.code)
// ["MISSING_POSTAL_CODE"]
```

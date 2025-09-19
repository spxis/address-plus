# address-plus

A modern, TypeScript‑first address parser and normalizer for US and Canada. Suppo// Typed intersection parsing
const intersection: ParsedIntersection | null = parseIntersection('5th St and Broadway');

// Batch processing with TypeScript
import { parseLocationsBatch, type BatchParseResult } from '@spxis/address-plus';

const addresses = ['123 Main St, NY 10001', '456 Oak Ave, CA 90210'];
const result: BatchParseResult<ParsedAddress> = parseLocationsBatch(addresses);

console.log(`Processed ${result.stats.successful}/${result.stats.total} addresses`);

````s USPS and Canada Post formats, bilingual abbreviations, ZIP and postal codes, facility name detection, and parenthetical parsing. Lightweight, regex‑driven, and API‑compatible with parse-address for seamless upgrades.

## Features

- 🇺🇸 **US Address Parsing**: Full USPS format support with street types, directionals, and secondary units
- 🇨🇦 **Canadian Address Parsing**: Canada Post bilingual support (English/French)
- 🏢 **Facility Detection**: Extracts business/landmark names with various separators
- 📍 **Intersection Parsing**: Handles street intersections with multiple formats
- 🔢 **Comprehensive Address Components**: Numbers, streets, units, cities, states, postal codes
- ⚡ **Batch Processing**: Efficiently process multiple addresses with performance statistics
- 📦 **Zero Dependencies**: Lightweight and fast
- 🔧 **TypeScript First**: Full type definitions included
- 🔄 **Drop-in Replacement**: API compatible with parse-address

## Installation

```bash
# npm
npm install @spxis/address-plus

# pnpm
pnpm add @spxis/address-plus

# yarn
yarn add @spxis/address-plus
````

## Usage

### JavaScript (ES6+)

```javascript
import { parseLocation, parseIntersection } from '@spxis/address-plus';

// Parse a standard address
const result = parseLocation('123 Main Street, Anytown, NY 12345');
console.log(result);
// {
//   number: '123',
//   street: 'Main',
//   type: 'St',
//   city: 'Anytown',
//   state: 'NY',
//   zip: '12345',
//   country: 'US'
// }

// Parse address with facility name
const facility = parseLocation('Empire State Building, 350 5th Avenue, New York NY 10118');
console.log(facility);
// {
//   place: 'Empire State Building',
//   number: '350',
//   street: '5th',
//   type: 'Ave',
//   city: 'New York',
//   state: 'NY',
//   zip: '10118',
//   country: 'US'
// }

// Parse intersection
const intersection = parseIntersection('Main St & Broadway, New York NY');
console.log(intersection);
// {
//   street1: 'Main',
//   type1: 'St',
//   street2: 'Broadway',
//   city: 'New York',
//   state: 'NY'
// }
```

### TypeScript

```typescript
import {
  parseLocation,
  parseIntersection,
  type ParsedAddress,
  type ParsedIntersection,
} from '@spxis/address-plus';

// Typed address parsing
const address: ParsedAddress | null = parseLocation(
  '1600 Pennsylvania Ave NW, Washington DC 20500'
);

if (address && 'street' in address) {
  // TypeScript knows this is a standard address, not an intersection
  console.log(`Number: ${address.number}`);
  console.log(`Street: ${address.street} ${address.type}`);
  console.log(`City: ${address.city}, ${address.state} ${address.zip}`);
}

// Typed intersection parsing
const intersection: ParsedIntersection | null = parseIntersection('5th St and Broadway');

if (intersection) {
  console.log(`Intersection: ${intersection.street1} & ${intersection.street2}`);
}

// Canadian address with types
const canadianAddress = parseLocation('123 Rue Saint-Jacques, Montréal QC H3C 1G1');
console.log(canadianAddress);
// {
//   number: '123',
//   street: 'Rue Saint-Jacques',
//   city: 'Montréal',
//   state: 'QC',
//   zip: 'H3C 1G1',
//   country: 'CA'
// }
```

### Node.js (CommonJS)

```javascript
const { parseLocation, parseIntersection } = require('@spxis/address-plus');

// Parse addresses in Node.js
const address = parseLocation('456 Oak Street, Suite 100, Boston MA 02101');
console.log(address);
// {
//   number: '456',
//   street: 'Oak',
//   type: 'St',
//   sec_unit_type: 'Suite',
//   sec_unit_num: '100',
//   city: 'Boston',
//   state: 'MA',
//   zip: '02101',
//   country: 'US'
// }

// Batch processing
const addresses = [
  '123 Main St, New York NY 10001',
  '456 Broadway Ave, Los Angeles CA 90210',
  '789 First Street, Chicago IL 60601',
];

const parsed = addresses.map(addr => parseLocation(addr));
console.log(parsed);
```

## Address Components

The parser returns structured objects with the following possible fields:

### Standard Address Fields

| Field           | Description                  | Example                                           |
| --------------- | ---------------------------- | ------------------------------------------------- |
| `number`        | House/building number        | `"123"`, `"123 1/2"`, `"N95W18855"`               |
| `prefix`        | Directional prefix           | `"N"`, `"SE"`, `"NW"`                             |
| `street`        | Street name                  | `"Main"`, `"Broadway"`, `"Martin Luther King Jr"` |
| `type`          | Street type (abbreviated)    | `"St"`, `"Ave"`, `"Blvd"`, `"Dr"`                 |
| `suffix`        | Directional suffix           | `"N"`, `"SW"`, `"E"`                              |
| `sec_unit_type` | Secondary unit type          | `"Apt"`, `"Suite"`, `"Unit"`, `"#"`               |
| `sec_unit_num`  | Secondary unit number        | `"4B"`, `"100"`, `"C-22"`                         |
| `city`          | City name                    | `"New York"`, `"Los Angeles"`                     |
| `state`         | State/province (abbreviated) | `"NY"`, `"CA"`, `"QC"`, `"ON"`                    |
| `zip`           | ZIP/postal code              | `"10001"`, `"90210"`, `"H3C 1G1"`                 |
| `plus4`         | ZIP+4 extension              | `"1234"`                                          |
| `country`       | Country code                 | `"US"`, `"CA"`                                    |
| `place`         | Facility/landmark name       | `"Empire State Building"`, `"Central Park"`       |

### Intersection Fields

| Field     | Description        | Example      |
| --------- | ------------------ | ------------ |
| `street1` | First street name  | `"Main"`     |
| `type1`   | First street type  | `"St"`       |
| `street2` | Second street name | `"Broadway"` |
| `type2`   | Second street type | `"Ave"`      |
| `city`    | City name          | `"New York"` |
| `state`   | State/province     | `"NY"`       |
| `zip`     | ZIP/postal code    | `"10001"`    |

## Examples

### US Addresses

```javascript
// Basic address
parseLocation('123 Main Street, Anytown, NY 12345');

// Address with directionals
parseLocation('456 N Broadway Ave, Los Angeles CA 90210');

// Address with secondary unit
parseLocation('789 Oak St, Apt 4B, Boston MA 02101');

// Fractional address numbers
parseLocation('123 1/2 Main Street, Los Angeles CA 90028');

// PO Box
parseLocation('PO Box 1234, Small Town, MT 59718');

// Business/facility with address
parseLocation('Starbucks, 1234 Coffee Lane, Seattle WA 98101');
```

### Canadian Addresses

```javascript
// English format
parseLocation('123 Main Street, Toronto ON M5V 1A1');

// French format
parseLocation('456 Rue Saint-Jacques, Montréal QC H3C 1G1');

// Bilingual
parseLocation('789 Avenue des Pins Ouest, Montréal QC H2W 1S6');
```

### Intersections

```javascript
// Various intersection formats
parseIntersection('Main St & Broadway');
parseIntersection('5th Street and Park Avenue');
parseIntersection('Highway 101 & Interstate 280');
```

## API Reference

### `parseLocation(address: string): ParsedAddress | null`

Parses a single address string into structured components.

**Parameters:**

- `address` (string): The address string to parse

**Returns:**

- `ParsedAddress | null`: Parsed address object or null if parsing fails

### `parseIntersection(intersection: string): ParsedIntersection | null`

Parses a street intersection string into structured components.

**Parameters:**

- `intersection` (string): The intersection string to parse

**Returns:**

- `ParsedIntersection | null`: Parsed intersection object or null if parsing fails

## ZIP Code & Postal Code Handling

The parser extracts ZIP/postal codes from addresses and provides validation information:

### US ZIP Codes

```javascript
// Standard 5-digit ZIP
parseLocation('123 Main St, New York NY 12345');
// { zip: '12345', zipValid: true, ... }

// ZIP+4 with hyphen (standard format)
parseLocation('123 Main St, New York NY 12345-6789');
// { zip: '12345', plus4: '6789', zipValid: true, ... }

// ZIP+4 without hyphen (extracted and normalized)
parseLocation('123 Main St, New York NY 123456789');
// { zip: '12345', plus4: '6789', zipValid: true, ... }

// Invalid ZIP length (still extracted but marked invalid)
parseLocation('123 Main St, New York NY 123');
// { zip: '123', zipValid: false, ... }

parseLocation('123 Main St, New York NY 1234567');
// { zip: '1234567', zipValid: false, ... }
```

### Canadian Postal Codes

```javascript
// Standard format with space (A1A 1A1)
parseLocation('123 Main St, Toronto ON M5V 1A1');
// { zip: 'M5V 1A1', zipValid: true, country: 'CA', ... }

// No spaces (extracted and normalized)
parseLocation('123 Main St, Toronto ON M5V1A1');
// { zip: 'M5V 1A1', zipValid: true, country: 'CA', ... }

// With hyphen (extracted but marked invalid format)
parseLocation('123 Main St, Toronto ON M5V-1A1');
// { zip: 'M5V-1A1', zipValid: false, country: 'CA', ... }

// Wrong pattern (extracted but marked invalid)
parseLocation('123 Main St, Toronto ON ABC123');
// { zip: 'ABC123', zipValid: false, country: 'CA', ... }
```

### Validation Fields

The parser provides these validation-related fields:

| Field      | Description                                | Example                         |
| ---------- | ------------------------------------------ | ------------------------------- |
| `zip`      | Extracted ZIP/postal code (any format)     | `"12345"`, `"M5V 1A1"`, `"123"` |
| `plus4`    | ZIP+4 extension (US only)                  | `"6789"`                        |
| `zipValid` | Whether ZIP/postal follows standard format | `true`, `false`                 |
| `country`  | Detected country based on format           | `"US"`, `"CA"`                  |

### Format Standards

**Valid US ZIP formats:**

- 5 digits: `12345`
- ZIP+4: `12345-6789` or `123456789`

**Valid Canadian postal formats:**

- Standard: `A1A 1A1` (letter-digit-letter space digit-letter-digit)
- No spaces: `A1A1A1` (automatically normalized to `A1A 1A1`)

**Invalid formats are still extracted** but `zipValid: false` to allow for:

- Data cleaning and validation workflows
- Parsing addresses with typos or non-standard formatting
- Flexible input handling while maintaining validation awareness

## Batch Processing

Process multiple addresses efficiently with built-in batch functions:

### Simple Batch Functions

```javascript
import { parseLocations, parseAddresses, parseIntersections } from '@spxis/address-plus';

// Process multiple addresses (returns array of results)
const addresses = [
  '123 Main St, New York, NY 10001',
  '456 Oak Ave, Los Angeles, CA 90210',
  '789 Pine Rd, Chicago, IL 60601',
];

const results = parseLocations(addresses);
// [
//   { number: '123', street: 'Main', city: 'New York', ... },
//   { number: '456', street: 'Oak', city: 'Los Angeles', ... },
//   { number: '789', street: 'Pine', city: 'Chicago', ... }
// ]

// Process intersections
const intersections = [
  'Main St & Broadway, New York, NY',
  '5th Street and Park Ave, San Francisco, CA',
];
const intersectionResults = parseIntersections(intersections);
```

### Advanced Batch Functions (with Statistics)

```javascript
import { parseLocationsBatch, parseAddressesBatch } from '@spxis/address-plus';

const addresses = [
  '123 Main St, New York, NY 10001',
  '', // Invalid address
  '456 Oak Ave, Los Angeles, CA 90210',
];

const result = parseLocationsBatch(addresses);

console.log(result.results);
// [
//   { number: '123', street: 'Main', ... },
//   null,  // Failed to parse
//   { number: '456', street: 'Oak', ... }
// ]

console.log(result.stats);
// {
//   total: 3,
//   successful: 2,
//   failed: 1,
//   duration: 15,           // milliseconds
//   averagePerAddress: 5,   // ms per address
//   addressesPerSecond: 200
// }

console.log(result.errors);
// [
//   {
//     index: 1,
//     error: 'Address parsing returned null - invalid or unparseable format',
//     input: ''
//   }
// ]
```

### Batch Options

```javascript
// Stop processing on first error
const result = parseLocationsBatch(addresses, {
  stopOnError: true,
});

// Pass parsing options to underlying parsers
const result = parseLocationsBatch(addresses, {
  strict: true, // Enable strict ZIP validation
  country: 'CA', // Force Canadian parsing
});
```

### Available Batch Functions

| Function                                           | Input Type | Output Type                            | Description              |
| -------------------------------------------------- | ---------- | -------------------------------------- | ------------------------ |
| `parseLocations(addresses)`                        | `string[]` | `ParsedAddress[]`                      | Simple array processing  |
| `parseAddresses(addresses)`                        | `string[]` | `ParsedAddress[]`                      | Alias for parseLocations |
| `parseInformalAddresses(addresses)`                | `string[]` | `ParsedAddress[]`                      | Process informal formats |
| `parseIntersections(addresses)`                    | `string[]` | `ParsedIntersection[]`                 | Process intersections    |
| `parseLocationsBatch(addresses, options?)`         | `string[]` | `BatchParseResult<ParsedAddress>`      | With statistics          |
| `parseAddressesBatch(addresses, options?)`         | `string[]` | `BatchParseResult<ParsedAddress>`      | With statistics          |
| `parseInformalAddressesBatch(addresses, options?)` | `string[]` | `BatchParseResult<ParsedAddress>`      | With statistics          |
| `parseIntersectionsBatch(addresses, options?)`     | `string[]` | `BatchParseResult<ParsedIntersection>` | With statistics          |

### BatchParseResult Type

```typescript
interface BatchParseResult<T> {
  results: (T | null)[]; // Array of parsed results (null for failures)
  errors: BatchParseError[]; // Array of error details
  stats: BatchParseStats; // Performance and count statistics
}

interface BatchParseError {
  index: number; // Index of failed address in input array
  error: string; // Error description
  input: string; // Original input that failed
}

interface BatchParseStats {
  total: number; // Total addresses processed
  successful: number; // Successfully parsed addresses
  failed: number; // Failed addresses
  duration: number; // Total processing time (ms)
  averagePerAddress: number; // Average time per address (ms)
  addressesPerSecond: number; // Processing rate
}
```

### Performance Benefits

Batch processing provides several advantages over individual parsing:

- **Reduced function call overhead**: Single function call for multiple addresses
- **Optimized pattern compilation**: Regex patterns compiled once
- **Better memory allocation**: Efficient array handling
- **Built-in error tracking**: Automatic error collection and reporting
- **Performance metrics**: Built-in timing and statistics

## Performance

- **Zero dependencies**: No external packages required
- **Lightweight**: < 50KB bundle size
- **Fast**: Regex-based parsing optimized for performance
- **Memory efficient**: Minimal object allocation

## Browser Support

- ✅ Chrome 61+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Node.js 14+

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## Related Projects

- [parse-address](https://github.com/scaleway/parse-address) - Original inspiration and API compatibility target

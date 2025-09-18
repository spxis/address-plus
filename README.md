# address-plus

A modern, TypeScript‑first address parser and normalizer for US and Canada. Supports USPS and Canada Post formats, bilingual abbreviations, ZIP and postal codes, facility name detection, and parenthetical parsing. Lightweight, regex‑driven, and API‑compatible with parse-address for seamless upgrades.

## Features

- 🇺🇸 **US Address Parsing**: Full USPS format support with street types, directionals, and secondary units
- 🇨🇦 **Canadian Address Parsing**: Canada Post bilingual support (English/French)
- 🏢 **Facility Detection**: Extracts business/landmark names with various separators
- 📍 **Intersection Parsing**: Handles street intersections with multiple formats
- 🔢 **Comprehensive Address Components**: Numbers, streets, units, cities, states, postal codes
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
```

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
import { parseLocation, parseIntersection, type ParsedAddress, type ParsedIntersection } from '@spxis/address-plus';

// Typed address parsing
const address: ParsedAddress | null = parseLocation('1600 Pennsylvania Ave NW, Washington DC 20500');

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
  '789 First Street, Chicago IL 60601'
];

const parsed = addresses.map(addr => parseLocation(addr));
console.log(parsed);
```

## Address Components

The parser returns structured objects with the following possible fields:

### Standard Address Fields

| Field | Description | Example |
|-------|-------------|---------|
| `number` | House/building number | `"123"`, `"123 1/2"`, `"N95W18855"` |
| `prefix` | Directional prefix | `"N"`, `"SE"`, `"NW"` |
| `street` | Street name | `"Main"`, `"Broadway"`, `"Martin Luther King Jr"` |
| `type` | Street type (abbreviated) | `"St"`, `"Ave"`, `"Blvd"`, `"Dr"` |
| `suffix` | Directional suffix | `"N"`, `"SW"`, `"E"` |
| `sec_unit_type` | Secondary unit type | `"Apt"`, `"Suite"`, `"Unit"`, `"#"` |
| `sec_unit_num` | Secondary unit number | `"4B"`, `"100"`, `"C-22"` |
| `city` | City name | `"New York"`, `"Los Angeles"` |
| `state` | State/province (abbreviated) | `"NY"`, `"CA"`, `"QC"`, `"ON"` |
| `zip` | ZIP/postal code | `"10001"`, `"90210"`, `"H3C 1G1"` |
| `plus4` | ZIP+4 extension | `"1234"` |
| `country` | Country code | `"US"`, `"CA"` |
| `place` | Facility/landmark name | `"Empire State Building"`, `"Central Park"` |

### Intersection Fields

| Field | Description | Example |
|-------|-------------|---------|
| `street1` | First street name | `"Main"` |
| `type1` | First street type | `"St"` |
| `street2` | Second street name | `"Broadway"` |
| `type2` | Second street type | `"Ave"` |
| `city` | City name | `"New York"` |
| `state` | State/province | `"NY"` |
| `zip` | ZIP/postal code | `"10001"` |

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

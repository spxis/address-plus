# Migrating from parse-address

address-plus was written to replace [parse-address](https://www.npmjs.com/package/parse-address): the same four
functions, under the same names, returning the same fields for the same addresses. This page shows the change to
make, how each call and field maps across, and every place where address-plus gives a different answer on purpose,
so nothing comes as a surprise.

How close the two are is measured, not claimed: `src/__tests__/corpus/parse-address-parity.test.ts` runs every one
of the 1,605 US and Canadian corpus addresses through both libraries. Of the 7,565 field values parse-address gets
right, address-plus also gets all 7,565 right, and the test fails if that ever drops. Where the two disagree,
address-plus is the one that matches the postal authority (see `docs/TEST_COVERAGE.md`).

## In one minute

```bash
pnpm remove parse-address
pnpm add @johnmorrisdotca/address-plus
```

```javascript
// Before
const parser = require("parse-address");
const parsed = parser.parseLocation("1005 N Gravenstein Hwy Suite 500 Sebastopol, CA 95472");
parsed.sec_unit_type; // 'Suite'

// After: the module has the same four functions (and its default export is the same object)
const parser = require("@johnmorrisdotca/address-plus");
const parsed = parser.parseLocation("1005 N Gravenstein Hwy Suite 500 Sebastopol, CA 95472", { useSnakeCase: true });
parsed.sec_unit_type; // 'Suite'
```

`{ useSnakeCase: true }` gives the field names parse-address uses (`sec_unit_type`, `sec_unit_num`). Without it the
names are camelCase (`secUnitType`, `secUnitNum`), which is what new code should use; every other field has the
same name either way. In an ES module or TypeScript:

```typescript
import parser from "@johnmorrisdotca/address-plus"; // the same shape as parse-address's module
import { parseLocation, type ParsedAddress } from "@johnmorrisdotca/address-plus"; // or name what you use
```

## Calls

| parse-address | address-plus | Notes |
| --- | --- | --- |
| `parseLocation(text)` | `parseLocation(text, options?)` | The function to call. Reads street addresses, PO boxes, intersections, rural routes, military addresses, Canada in English and French, and Japan. |
| `parseAddress(text)` | `parseAddress(text, options?)` | The same as `parseLocation` in address-plus. parse-address's version needs a house number and returns `null` without one; this one reads what it can (`Main St, Anytown NY` gives the street, city and state). |
| `parseIntersection(text)` | `parseIntersection(text, options?)` | The same fields: `street1`, `type1`, `prefix1`, `suffix1`, the same for 2, and the place. A street with no type has `type1` or `type2` set to `""`, as in parse-address. |
| `parseInformalAddress(text)` | `parseInformalAddress(text, options?)` | Different: see "Where parse-address reads more" below. Use `parseLocation`. |
| (none) | `parseLocations`, `parseAddresses`, `parseIntersections`, `parseInformalAddresses` | One call for many addresses, results in order. |
| (none) | `parseLocationsBatch` and the other `…Batch` functions | The same, with the failures and the timing reported. |
| (none) | `validateAddress`, `isValidAddress`, `getValidationErrors` | Whether an address is complete, and whether its ZIP or postal code belongs to its state, province or prefecture. |
| (none) | `formatUSPS`, `formatCanadaPost`, `formatAddress`, `formatJapanese`, `formatJapaneseEnglish` | Write a parsed address back out. |
| (none) | `compareAddresses`, `isSameAddress`, `getAddressSimilarity` | Whether two addresses are the same place. |
| (none) | `cleanAddress`, `cleanAddressDetailed` | Tidy an address typed in a hurry. |
| (none) | `getStateFromZip`, `getProvinceFromPostalCode`, `getPrefectureFromJapanesePostalCode` and the reverse lookups | Which region a postal code is in, and which codes a region uses. |

Every function has TSDoc with an example, so your editor shows what it does on hover; the full list is in the
[API reference](api.md).

## Fields

| parse-address | address-plus | With `useSnakeCase: true` |
| --- | --- | --- |
| `number` | `number` | `number` |
| `prefix` | `prefix` | `prefix` |
| `street` | `street` | `street` |
| `type` | `type` | `type` |
| `suffix` | `suffix` | `suffix` |
| `sec_unit_type` | `secUnitType` | `sec_unit_type` |
| `sec_unit_num` | `secUnitNum` | `sec_unit_num` |
| `city` | `city` | `city` |
| `state` | `state` | `state` |
| `zip` | `zip` | `zip` |
| `plus4` | `plus4` | `plus4` |
| `street1`, `type1`, `prefix1`, `suffix1`, and the same for 2 | the same | the same |

A field the address does not have is absent in both libraries, never an empty string (except an intersection's
`type1` and `type2`, above). Fields address-plus adds, which parse-address code can ignore:

| Field | What it holds |
| --- | --- |
| `country` | `US`, `CA` or `JP` |
| `zipValid` | Whether the ZIP or postal code is well formed (`zip_valid` in snake_case) |
| `unit` | The unit as written (`Apt 4`), beside `secUnitType` and `secUnitNum` |
| `place` | A landmark or building named before the address (`Empire State Building`) |
| `rr`, `ruralRoute`, `highwayContract`, `site`, `compartment`, `station`, `rpo`, `generalDelivery` | Rural routes, highway contract routes, Canadian site and compartment, stations, general delivery |
| `military` | A military delivery line (`PSC 802 Box 74`), with APO, FPO or DPO as the `city` and AA, AE or AP as the `state` |
| `locality` | A Puerto Rico urbanization |
| `prefecture`, `municipality`, `town`, `chome`, `ban`, `go`, `building`, `floor`, `room` and the rest | A Japanese address (see the README's "Japanese Addresses") |

## Answers that differ on purpose

Each row is real output from both libraries. In each, address-plus follows the postal authority or keeps what was
written, and parse-address does not. The corpus case that holds address-plus to its answer is named, so the reason is
on record.

| Input | parse-address | address-plus | Why |
| --- | --- | --- | --- |
| `123 Main St Apt 4, Anytown, NY 12345` | `sec_unit_type: "Apt"` | `secUnitType: "Apartment"`, `unit: "Apt 4"` | The designator is reported in full (USPS Publication 28 Appendix C2's word), so every spelling of it (`Apt`, `Apt.`, `APT`, `Apartment`) comes out the same; `unit` keeps what was written. A PO box is `PO Box` in both. |
| `5920 3/4 Orchard Road, Fresno, CA` | `number: "5920"` | `number: "5920 3/4"` | The fraction is part of the house number; dropping it gives another address (`parse-address-shapes.json`, shape 26). |
| `3307 Pinecrest Hwy, W Wenatchee WA` | `city: "West Wenatchee"` | `city: "W Wenatchee"` | A lone letter after the comma belongs to the city, and the city is kept as written rather than expanded (shapes 12 and 27). |
| `2207 State Highway 44 Gardner KS 66030` | `street: "State Highway 44"` | `street: "State Hwy 44"` | A numbered route keeps its number in the street, with the road word abbreviated the USPS way and no type (shape 18). The same for `County Road 12`, which is `County Rd 12` (shape 37). |
| `3456 COUNTY HWY 18E, Hartman, CO 81043` | `street: "COUNTY HWY 18"`, `suffix: "E"` | `street: "County Hwy 18E"` | `18E` is the route's number, not route 18 heading east (shape 38). |
| `4-123 Main St, Toronto ON M5H 2N2` | `number: "4-123"`, no city | `number: "123"`, `secUnitType: "Unit"`, `secUnitNum: "4"`, the city, province and postal code | Canada Post writes the unit first, joined by a hyphen. In a US address a hyphenated number such as Queens' `87-11` stays whole. |
| `100 Queen St W, Toronto, ON M5H 2N2` | no city, province or postal code | `city: "Toronto"`, `state: "ON"`, `zip: "M5H 2N2"` | parse-address reads no Canadian postal code. |
| `hello world` | `{ street: "hello" }` | `null` | Text that is not an address returns `null` rather than a guess. |
| `東京都千代田区丸の内1-2-3` | `{ street: "1" }` | the prefecture, municipality, town and block | Japanese addresses are read (see the README). |

## Where parse-address reads more

`parseInformalAddress` is not the same function in the two libraries. parse-address's reads a street, city and
state without a house number (`Main St, Anytown NY` gives the street `Main`, the type `St`, the city and the state).
address-plus's is a fallback for descriptions such as `Downtown near City Hall`: it keeps the whole text before the
place as the street, and the ZIP code. For parse-address's behaviour, call `parseLocation` (or `parseAddress`), which
reads that address in full:

```javascript
// parse-address
parser.parseInformalAddress("Main St, Anytown NY"); // { street: 'Main', type: 'St', city: 'Anytown', state: 'NY' }

// address-plus
parseLocation("Main St, Anytown NY"); // { street: 'Main', type: 'St', city: 'Anytown', state: 'NY', country: 'US' }
parseInformalAddress("Main St, Anytown NY"); // { street: 'Main St' }
```

The parity figures above cover `parseLocation` only, so this difference is not in them.

## Before and after

```javascript
// Before: parse-address
const parser = require("parse-address");

function shippingLabel(text) {
  const a = parser.parseLocation(text);
  if (!a) return null;
  const unit = a.sec_unit_type ? ` ${a.sec_unit_type} ${a.sec_unit_num}` : "";
  return `${a.number} ${a.street} ${a.type}${unit}\n${a.city} ${a.state} ${a.zip}`;
}

shippingLabel("1005 N Gravenstein Hwy Suite 500 Sebastopol, CA 95472");
// '1005 Gravenstein Hwy Suite 500\nSebastopol CA 95472'  (the N prefix was dropped by this code, not the parser)
```

```javascript
// After: address-plus, with the label written by the library
import { formatUSPS, parseLocation, validateAddress } from "@johnmorrisdotca/address-plus";

function shippingLabel(text) {
  const address = parseLocation(text);
  if (!address) return null;
  return formatUSPS(address).lines.join("\n");
}

shippingLabel("1005 N Gravenstein Hwy Suite 500 Sebastopol, CA 95472");
// '1005 N GRAVENSTEIN HWY STE 500\nSEBASTOPOL CA 95472'

validateAddress("123 Main St, Seattle, NY 98101").warnings[0].code;
// 'POSTAL_REGION_MISMATCH': 98101 is a Washington ZIP code, not New York's
```

If your code reads `sec_unit_type`, either pass `{ useSnakeCase: true }` everywhere you parse, or rename the field to
`secUnitType` once; and if it compares the unit's designator to `"Apt"`, compare it to `"Apartment"` (or read `unit`).

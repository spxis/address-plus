// Rural route, highway contract route and Canadian site and compartment addresses.
//
// USPS Publication 28 writes a rural route as "RR 2 BOX 152" and a highway contract route as "HC 68 BOX
// 23A"; older spellings are Rural Route, R.R., RFD, Highway Contract and Star Route. Canada Post writes
// "SITE 6 COMP 10 RR 8" on the line above the city. Each is the whole delivery line: there is no street.

import type { ParsedAddress, ParseOptions } from "../types";
import { detectCountry } from "../utils/parsing";

import { fillLastLine } from "./po-box-parser";

const RURAL_ROUTE = String.raw`(?:r\.?\s?r\.?|rural\s+route|rural\s+rte\.?|r\.?\s?f\.?\s?d\.?|rural\s+free\s+delivery)`;
const HIGHWAY_CONTRACT = String.raw`(?:h\.?\s?c\.?|highway\s+contract(?:\s+route)?|star\s+route)`;
const ROUTE_NUMBER = String.raw`\s*#?\s*(\d+)(?![\p{L}\p{N}])`;
const BOX = String.raw`(?:[,\s]+box\s*#?\s*([a-z0-9-]+))?`;

const RURAL_ROUTE_LINE = new RegExp(String.raw`^${RURAL_ROUTE}${ROUTE_NUMBER}${BOX}[,\s]*`, "iu");
const HIGHWAY_CONTRACT_LINE = new RegExp(String.raw`^${HIGHWAY_CONTRACT}${ROUTE_NUMBER}${BOX}[,\s]*`, "iu");
const SITE_LINE = new RegExp(
  String.raw`^site\s+([a-z0-9-]+)[,\s]+comp(?:artment)?\.?\s+([a-z0-9-]+)(?:[,\s]+${RURAL_ROUTE}${ROUTE_NUMBER})?${BOX}[,\s]*`,
  "iu",
);

// A rural route written after a street, at the end of the street line: "1234 River Rd RR 2".
const TRAILING_RURAL_ROUTE = new RegExp(String.raw`^(.*?)[,\s]+${RURAL_ROUTE}${ROUTE_NUMBER}\s*$`, "iu");
// A comma part that is only a rural route: "RR 2".
const RURAL_ROUTE_PART = new RegExp(String.raw`^${RURAL_ROUTE}${ROUTE_NUMBER}$`, "iu");

// Something must follow the route for it to be an address: a city, a state, a ZIP.
function finish(result: ParsedAddress, rest: string, options: ParseOptions): ParsedAddress | null {
  if (!rest.trim()) return null;
  fillLastLine(rest, result, options);
  result.country = detectCountry(result);
  return result;
}

function setBox(result: ParsedAddress, box: string | undefined): void {
  if (box) {
    result.secUnitType = "Box";
    result.secUnitNum = box.toUpperCase();
  }
}

// Parse an address whose delivery line is a rural route, a highway contract route or a site and
// compartment. Returns null for anything else.
function parseRuralRoute(address: string, options: ParseOptions = {}): ParsedAddress | null {
  const text = address.trim();

  const site = text.match(SITE_LINE);
  if (site) {
    const result: ParsedAddress = { compartment: site[2], site: site[1] };
    if (site[3]) {
      result.rr = site[3];
      result.ruralRoute = `RR ${site[3]}`;
    }
    setBox(result, site[4]);
    return finish(result, text.slice(site[0].length), options);
  }

  const rural = text.match(RURAL_ROUTE_LINE);
  if (rural) {
    const result: ParsedAddress = { rr: rural[1], ruralRoute: `RR ${rural[1]}` };
    setBox(result, rural[2]);
    return finish(result, text.slice(rural[0].length), options);
  }

  const contract = text.match(HIGHWAY_CONTRACT_LINE);
  if (contract) {
    const result: ParsedAddress = { highwayContract: contract[1], ruralRoute: `HC ${contract[1]}` };
    setBox(result, contract[2]);
    return finish(result, text.slice(contract[0].length), options);
  }

  return null;
}

export { parseRuralRoute, RURAL_ROUTE_PART, TRAILING_RURAL_ROUTE };

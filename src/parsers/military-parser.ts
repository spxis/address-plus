// Military addresses (USPS Publication 28, section 2.7).
//
// The delivery line names a unit, a postal service center or a ship ("UNIT 2050 BOX 4190", "PSC 802 BOX
// 74", "USS GEORGE WASHINGTON CVN 73"); the last line puts APO, FPO or DPO where a city goes and AA, AE or
// AP where a state goes, then the ZIP.

import type { ParsedAddress, ParseOptions } from "../types";

import { setZipAndPlus4 } from "./po-box-parser";

const MILITARY_LAST_LINE = /^(.*?)[,\s]+(apo|fpo|dpo)[,\s]+(aa|ae|ap)[,\s]+(\d{5}(?:[-\s]*\d{4})?)\s*$/i;

// Parse a military address. Returns null for anything else.
function parseMilitary(address: string, options: ParseOptions = {}): ParsedAddress | null {
  const match = address.trim().match(MILITARY_LAST_LINE);
  if (!match || !match[1].trim()) return null;

  const result: ParsedAddress = {
    city: match[2].toUpperCase(),
    military: match[1].trim().replace(/[,\s]+/g, " "),
    state: match[3].toUpperCase(),
  };
  setZipAndPlus4(result, match[4], options);
  result.country = "US";

  return result;
}

export { parseMilitary };

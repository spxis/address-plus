// Writing a parsed Japanese address back out: in Japanese order, as an envelope is addressed, or in
// English order for a form that expects the street first.

import type { ParsedAddress } from "../types/parsed-address";

interface JapaneseFormattingOptions {
  blockStyle?: "hyphen" | "markers"; // 1-2-3 (default) or 1丁目2番3号
  includePostalCode?: boolean; // 〒100-0005 on its own line; default true
  multiline?: boolean; // Lines joined with newlines (default) or one line with spaces
}

interface JapaneseEnglishFormattingOptions {
  includeCountry?: boolean; // ", Japan" at the end; default true
  includePostalCode?: boolean; // Default true
}

// The block in Japanese: 1丁目2番3号, 2番3号, or 123番地 for a lone number.
function blockWithMarkers(address: ParsedAddress): string {
  const { chome, ban, go } = address;
  if (!chome && !ban && !go) return address.block ?? "";
  let out = chome ? `${chome}丁目` : "";
  if (ban) out += go ? `${ban}番` : chome ? `${ban}番` : `${ban}番地`;
  if (go) out += `${go}号`;
  return out;
}

// 〒100-0005
// 東京都千代田区丸の内1-2-3
// 丸ビル5階501号室
function formatJapanese(address: ParsedAddress, options: JapaneseFormattingOptions = {}): string {
  const { blockStyle = "hyphen", includePostalCode = true, multiline = true } = options;
  const lines: string[] = [];
  if (includePostalCode && address.postalCode) lines.push(`〒${address.postalCode}`);

  const block = blockStyle === "markers" ? blockWithMarkers(address) : (address.block ?? "");
  const place = [address.prefecture, address.municipality, address.town, block].filter(Boolean).join("");
  if (place) lines.push(place);

  const building = [address.building, address.floor && `${address.floor}階`, address.room && `${address.room}号室`]
    .filter(Boolean)
    .join("");
  if (building) lines.push(building);

  return lines.join(multiline ? "\n" : " ");
}

// Marunouchi Bldg 5F, Room 501, 1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan
// The town is written as it was parsed: romaji when the address came in romaji, kanji otherwise.
function formatJapaneseEnglish(address: ParsedAddress, options: JapaneseEnglishFormattingOptions = {}): string {
  const { includeCountry = true, includePostalCode = true } = options;
  const parts: string[] = [];
  const building = [address.building, address.floor && `${address.floor}F`].filter(Boolean).join(" ");
  if (building) parts.push(building);
  if (address.room) parts.push(`Room ${address.room}`);
  const street = [address.block, address.town].filter(Boolean).join(" ");
  if (street) parts.push(street);
  if (address.municipalityRomaji ?? address.municipality) parts.push(address.municipalityRomaji ?? address.municipality!);
  const prefecture = address.prefectureRomaji ?? address.prefecture;
  const last = [prefecture, includePostalCode ? address.postalCode : undefined].filter(Boolean).join(" ");
  if (last) parts.push(last);
  if (includeCountry) parts.push("Japan");
  return parts.join(", ");
}

export { formatJapanese, formatJapaneseEnglish };
export type { JapaneseEnglishFormattingOptions, JapaneseFormattingOptions };

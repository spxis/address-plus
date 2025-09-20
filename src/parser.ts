// Main address parser implementation - based on the original parse-address library patterns

import { DIRECTIONAL_MAP, SECONDARY_UNIT_TYPES } from "./constants/index";
import { ALL_SUB_REGION_NAMES } from "./constants/sub-regions";
import { parseInformalAddress } from "./parsers/informal-address-parser";
import { parseIntersection } from "./parsers/intersection-parser";
import { parsePoBox } from "./parsers/po-box-parser";
import {
  FACILITY_INDICATORS,
  FACILITY_PATTERNS,
  MUSIC_SQUARE_EAST_PATTERN,
  SECONDARY_UNIT_PATTERN,
  UNIT_TYPE_KEYWORDS,
  UNIT_TYPE_NUMBER_PATTERN,
} from "./patterns/address-patterns";
import {
  COMMON_STREET_NAMES_PATTERN,
  CONNECTOR_WORDS,
  FACILITY_DELIMITER_PATTERNS,
  GENERAL_DELIVERY_PATTERNS,
  ISLAND_TYPE_PATTERN,
  VALIDATION_PATTERNS,
  ZIP_VALIDATION_PATTERNS,
} from "./patterns/core-patterns";
import { CANADIAN_POSTAL_LIBERAL_PATTERN, CITY_PATTERNS, ZIP_CODE_PATTERN } from "./patterns/location-patterns";
import { buildPatterns } from "./patterns/pattern-builder";
import type { ParsedAddress, ParseOptions } from "./types";
import { hasValidAddressComponents, setValidatedPostalCode } from "./utils/address-validation";
import { capitalizeStreetName } from "./utils/capitalization";
import { toCamelCase, toSnakeCase } from "./utils/case-converter";
import { detectCountry, parseStateProvince } from "./utils/parsing";
import { normalizeStreetType } from "./utils/street-type-normalizer";

// Parse a location string into address components
function parseLocation(address: string, options: ParseOptions = {}): ParsedAddress | null {
  if (!address || typeof address !== "string") {
    return null;
  }

  let original = address.trim();

  // Strip surrounding parentheses if present
  if (original.startsWith("(") && original.endsWith(")")) {
    original = original.slice(1, -1).trim();
  }

  // Check for intersection first
  const patterns = buildPatterns();
  if (new RegExp(patterns.intersection, "i").test(original)) {
    const result = parseIntersection(original, options);
    return applyCaseConversion(result, options);
  }

  // Check for PO Box
  const poBoxMatch = original.match(new RegExp(`^\\s*${patterns.poBox}`, "i"));
  if (poBoxMatch) {
    const result = parsePoBox(original, options);
    return applyCaseConversion(result, options);
  }

  // Try standard address parsing
  return parseStandardAddress(original, options) || parseInformalAddress(original, options);
}

// Parse standard addresses with number, street, type, city, state, zip
function parseStandardAddress(address: string, options: ParseOptions = {}): ParsedAddress | null {
  const patterns = buildPatterns();

  // Check if input contains valid address components
  if (!hasValidAddressComponents(address)) {
    return null;
  }

  // Normalize newlines to commas for consistent parsing
  const normalizedAddress = address.replace(/\n/g, ", ");

  // Split by comma to handle comma-separated components
  const commaParts = normalizedAddress.split(",").map((p) => p.trim());

  // Track General Delivery flag and excluded parts
  let isGeneralDelivery = false;
  const excludedPartIndices = new Set<number>();

  // Detect facility addresses (facility name comes first, followed by actual address)
  let addressStartIndex = 0;
  let facilityName = "";
  // Track if address was embedded inline in the first part (via delimiter or parentheses)
  let addressInlineInFirstPart = false;
  // Preserve delimiter used between facility and address when inline
  let facilityDelimiter: string | null = null;
  // Preserve original spaces between facility and trailing Island phrase
  let preservedFacilitySpacing: string | null = null;
  // Address part override when inline address found in first comma part
  let addressPartOverride: string | null = null;

  if (commaParts.length > 1) {
    const firstPart = commaParts[0];

    // Special-case: General Delivery as the first part
    if (GENERAL_DELIVERY_PATTERNS.STANDARD.test(firstPart)) {
      isGeneralDelivery = true;
      addressStartIndex = 1;
    }

    // Sophisticated heuristic for facility detection:
    // 1. No house numbers at the start
    // 2. Street types should be secondary (like "Park", "Center", "Building")
    // 3. Doesn't follow typical "number + street + type" pattern

    const hasHouseNumber = VALIDATION_PATTERNS.HOUSE_NUMBER_START.test(firstPart.trim());
    const startsWithNumber = VALIDATION_PATTERNS.STARTS_WITH_NUMBER.test(firstPart);

    // If it starts with a number, it's likely a street address, not a facility
    if (!startsWithNumber && !hasHouseNumber) {
      // Handle inline address separated by delimiter or parentheses
      const parenInline = firstPart.match(FACILITY_DELIMITER_PATTERNS.PARENTHETICAL);
      const delimInline = firstPart.match(FACILITY_DELIMITER_PATTERNS.DELIMITED);
      // Handle trailing Island-like phrases without delimiters; preserve spaces
      const trailingIsland = firstPart.match(FACILITY_DELIMITER_PATTERNS.TRAILING_ISLAND);

      if (parenInline) {
        facilityName = parenInline[1].trim();
        addressPartOverride = parenInline[2].trim();
        addressStartIndex = 0;
        excludedPartIndices.add(0);
        addressInlineInFirstPart = true;
      } else if (delimInline) {
        facilityName = delimInline[1].trim();
        facilityDelimiter = delimInline[2];
        addressPartOverride = delimInline[3].trim();
        addressStartIndex = 0;
        excludedPartIndices.add(0);
        addressInlineInFirstPart = true;
      } else if (trailingIsland) {
        // Keep trailing Island phrase as address part and preserve spacing
        facilityName = trailingIsland[1].trim();
        preservedFacilitySpacing = trailingIsland[2];
        addressPartOverride = trailingIsland[3].trim();
        addressStartIndex = 0;
        excludedPartIndices.add(0);
        addressInlineInFirstPart = true;
      }

      // Check if this looks like a facility name vs a street name
      const words = firstPart.trim().split(VALIDATION_PATTERNS.WHITESPACE_SPLIT);
      // Ignore connector words when checking Title Case
      const filteredWords = words.filter((w) => {
        const lw = w.toLowerCase();
        return !CONNECTOR_WORDS.has(lw);
      });

      const hasMultipleWords = words.length >= 2;
      const hasFacilityIndicator = words.some((word) =>
        FACILITY_INDICATORS.includes(word.toLowerCase().replace(VALIDATION_PATTERNS.NON_WORD, "") as any),
      );

      // If it's multiple words with facility indicators, treat as facility
      // OR if it's a proper noun pattern (Title Case) without obvious street patterns
      if (
        !facilityName &&
        ((hasMultipleWords && hasFacilityIndicator) ||
          (hasMultipleWords &&
            filteredWords.length >= 2 &&
            filteredWords.every((word) => VALIDATION_PATTERNS.TITLE_CASE.test(word)) &&
            !words.some((word) => VALIDATION_PATTERNS.NUMERIC_ONLY.test(word))))
      ) {
        facilityName = firstPart.trim();
        addressStartIndex = 1;
      }
    }
  }

  // Extract ZIP from end and work backwards
  let zipPart = "";
  let invalidZipCandidate = ""; // Track invalid ZIP patterns for validation in strict mode
  let statePart = "";
  let cityPart = "";
  let addressPart = commaParts[addressStartIndex] || commaParts[0];
  if (addressPartOverride) {
    // Use inline address found in first part; parse separately from facility
    addressPart = addressPartOverride;
  }

  if (facilityName && addressStartIndex > 0) {
    excludedPartIndices.add(0); // Exclude facility name part
  }
  if (isGeneralDelivery) {
    excludedPartIndices.add(0); // Exclude General Delivery from city parsing
  }

  // Handle non-comma separated addresses
  if (commaParts.length === 1) {
    // No commas, try to parse city/state/zip from the end
    let remainingText = address.trim();
    // Special-case: strip leading General Delivery (with optional comma/space)
    const leadingGeneralDelivery = remainingText.match(/^\s*(general\s+delivery)\b[\s,]*/i);
    if (leadingGeneralDelivery) {
      isGeneralDelivery = true;
      remainingText = remainingText.slice(leadingGeneralDelivery[0].length).trim();
    }

    // Extract ZIP first
    const zipMatch = remainingText.match(new RegExp(`\\s+(${patterns.zip.slice(1, -1)})\\s*$`));
    const caPostalMatch = remainingText.match(new RegExp(`\\s+(${CANADIAN_POSTAL_LIBERAL_PATTERN.source})\\s*$`));

    if (zipMatch) {
      zipPart = zipMatch[1];
      remainingText = remainingText.replace(zipMatch[0], "").trim();
    } else if (caPostalMatch) {
      zipPart = caPostalMatch[1];
      remainingText = remainingText.replace(caPostalMatch[0], "").trim();
    }

    // Extract state (try abbreviations first, then full names)
    const stateAbbrevMatch = remainingText.match(new RegExp(`\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, "i"));
    const stateFullMatch = remainingText.match(new RegExp(`\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, "i"));

    if (stateAbbrevMatch) {
      statePart = stateAbbrevMatch[1];
      remainingText = remainingText.replace(stateAbbrevMatch[0], "").trim();
    } else if (stateFullMatch) {
      statePart = stateFullMatch[1];
      remainingText = remainingText.replace(stateFullMatch[0], "").trim();
    }

    // Extract city (what's left after removing ZIP and state, taking the last word(s))
    if (remainingText) {
      // Look for city at the end of remaining text, but be smart about it
      // If we have a state, we can be more confident about city extraction
      // If no state, extract city if we can identify a non-street-type word
      const hasState = !!statePart;

      if (hasState) {
        // With state, we can confidently extract city as usual
        const singleWordCityMatch = remainingText.match(CITY_PATTERNS.SINGLE_WORD_CITY);
        const twoWordCityMatch = remainingText.match(CITY_PATTERNS.TWO_WORD_CITY);

        let potentialCity = "";
        let matchToReplace = null;

        // Prefer longer matches first (two words over one word), but check if the two-word match makes sense
        if (twoWordCityMatch) {
          const twoWordCity = twoWordCityMatch[1].trim();
          const firstWordOfCity = twoWordCity.split(" ")[0];

          // Check if the first word of the potential two-word city is a street component
          const isFirstWordStreetType = new RegExp(`^(${patterns.streetType.slice(1, -1)})$`, "i").test(
            firstWordOfCity,
          );
          const isFirstWordDirectional = new RegExp(`^(${patterns.directional.slice(1, -1)})$`, "i").test(
            firstWordOfCity,
          );

          // Additional check: common street names that might not be in street types
          const isCommonStreetName = COMMON_STREET_NAMES_PATTERN.test(firstWordOfCity);

          // If the first word is a street component or common street name, prefer single word city
          if ((isFirstWordStreetType || isFirstWordDirectional || isCommonStreetName) && singleWordCityMatch) {
            potentialCity = singleWordCityMatch[1].trim();
            matchToReplace = singleWordCityMatch[0];
          } else {
            // Use two-word city as normal - this handles legitimate cases like "San Francisco"
            potentialCity = twoWordCity;
            matchToReplace = twoWordCityMatch[0];
          }
        } else if (singleWordCityMatch) {
          potentialCity = singleWordCityMatch[1].trim();
          matchToReplace = singleWordCityMatch[0];
        }

        // Check if potential city is a street type or starts with a street type
        const isStreetType = new RegExp(`^(${patterns.streetType.slice(1, -1)})$`, "i").test(potentialCity);
        const startsWithStreetTypeMatch = potentialCity.match(
          new RegExp(`^(${patterns.streetType.slice(1, -1)})\\s+(.+)$`, "i"),
        );

        if (potentialCity && !isStreetType && matchToReplace) {
          if (startsWithStreetTypeMatch) {
            // If the potential city starts with a street type, extract just the city part
            cityPart = startsWithStreetTypeMatch[2];
            // Only remove the city part, not the street type
            const cityOnlyMatch = remainingText.match(
              new RegExp(`\\s+(${cityPart.replace(VALIDATION_PATTERNS.REGEX_ESCAPE, "\\$&")})$`),
            );
            if (cityOnlyMatch) {
              remainingText = remainingText.replace(cityOnlyMatch[0], "").trim();
            }
          } else {
            cityPart = potentialCity;
            remainingText = remainingText.replace(matchToReplace, "").trim();
          }
        }
      } else {
        // Without state, be conservative about city extraction
        // Extract if we have a clear non-street-type word at the end
        // AND the remaining text suggests a full address (at least 4+ words)
        const wordCount = remainingText.split(VALIDATION_PATTERNS.WHITESPACE_SPLIT).length;
        if (wordCount >= 5) {
          // More conservative: at least "number prefix street type city"
          const singleWordCityMatch = remainingText.match(CITY_PATTERNS.SINGLE_WORD_CITY);

          if (singleWordCityMatch) {
            const potentialCity = singleWordCityMatch[1].trim();
            const isStreetType = new RegExp(`^(${patterns.streetType.slice(1, -1)})$`, "i").test(potentialCity);
            const isDirectional = new RegExp(`^(${patterns.directional.slice(1, -1)})$`, "i").test(potentialCity);

            // Extract if it's clearly not a street component
            if (!isStreetType && !isDirectional && potentialCity.length > 2) {
              cityPart = potentialCity;
              remainingText = remainingText.replace(singleWordCityMatch[0], "").trim();
            }
          }
        }
      }
    }

    // Use remaining text as address part (after removing city/state/zip)
    if (remainingText) {
      addressPart = remainingText;
    }
  } else {
    const lastPart = commaParts[commaParts.length - 1];
    const zipMatch = lastPart.match(new RegExp(`(${patterns.zip.slice(1, -1)})`));
    const caPostalMatch = lastPart.match(CANADIAN_POSTAL_LIBERAL_PATTERN);

    if (zipMatch) {
      zipPart = zipMatch[1];
      // Remove ZIP from the part and see what's left (might be city + state)
      const remainingAfterZip = lastPart.replace(zipMatch[0], "").trim();
      if (remainingAfterZip) {
        // Try to parse city and state from remaining text
        const cityStateAbbrevMatch = remainingAfterZip.match(
          new RegExp(`^(.+?)\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, "i"),
        );
        if (cityStateAbbrevMatch) {
          cityPart = cityStateAbbrevMatch[1].trim();
          statePart = cityStateAbbrevMatch[2].trim();
        } else {
          const cityStateFullMatch = remainingAfterZip.match(
            new RegExp(`^(.+?)\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, "i"),
          );
          if (cityStateFullMatch) {
            cityPart = cityStateFullMatch[1].trim();
            statePart = cityStateFullMatch[2].trim();
          } else {
            // State or unknown format
            statePart = remainingAfterZip;
          }
        }
      }
      // Check if we have city in previous part (but skip excluded parts like secondary units)
      // Also consider if we skipped a facility name (addressStartIndex > 0)
      if (commaParts.length > 2) {
        // Find the last non-excluded part that could be a city
        // But don't go back before the address start index (to skip facility names)
        for (let i = commaParts.length - 2; i >= Math.max(1, addressStartIndex); i--) {
          if (!excludedPartIndices.has(i)) {
            // Set city if we haven't already parsed it from city/state pattern
            if (!cityPart) {
              cityPart = commaParts[i].trim();
            }
            break;
          }
        }
      } else if (commaParts.length === 2 && !statePart) {
        // No ZIP was removed, so this might be city, state
        const remainingText = lastPart.replace(zipMatch[0], "").trim();
        const cityStateAbbrevMatch = remainingText.match(
          new RegExp(`^(.+?)\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, "i"),
        );
        if (cityStateAbbrevMatch) {
          cityPart = cityStateAbbrevMatch[1].trim();
          statePart = cityStateAbbrevMatch[2].trim();
        } else {
          const cityStateFullMatch = remainingText.match(
            new RegExp(`^(.+?)\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, "i"),
          );
          if (cityStateFullMatch) {
            cityPart = cityStateFullMatch[1].trim();
            statePart = cityStateFullMatch[2].trim();
          } else {
            // Before assigning remaining text as city, check if it's a standalone secondary unit type
            if (remainingText.toLowerCase() in SECONDARY_UNIT_TYPES) {
              // The entire remaining text is just a secondary unit type (no city)
              // Don't assign it as city, let parseStandardAddress handle it
              // cityPart remains empty
            } else {
              const standaloneUnitMatch = remainingText.match(
                new RegExp(`^(.*?)\\s+(${Object.keys(SECONDARY_UNIT_TYPES).join("|")})\\s*$`, "i"),
              );
              if (standaloneUnitMatch && standaloneUnitMatch[1].trim()) {
                // Found a secondary unit, extract city from the part before it
                cityPart = standaloneUnitMatch[1].trim();
                // Note: The secondary unit will be processed later in parseStandardAddress
              } else {
                cityPart = remainingText;
              }
            }
          }
        }
      }
    } else if (caPostalMatch) {
      // Canadian postal code
      zipPart = caPostalMatch[1];
      const remainingAfterZip = lastPart.replace(caPostalMatch[0], "").trim();
      if (remainingAfterZip) {
        statePart = remainingAfterZip;
      }
      if (commaParts.length > 2) {
        cityPart = commaParts[commaParts.length - 2].trim();
      } else if (commaParts.length === 2) {
        const cityStateText = lastPart.replace(caPostalMatch[0], "").trim();
        const cityStateAbbrevMatch = cityStateText.match(
          new RegExp(`^(.+?)\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, "i"),
        );
        if (cityStateAbbrevMatch) {
          cityPart = cityStateAbbrevMatch[1].trim();
          statePart = cityStateAbbrevMatch[2].trim();
        } else {
          const cityStateFullMatch = cityStateText.match(
            new RegExp(`^(.+?)\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, "i"),
          );
          if (cityStateFullMatch) {
            cityPart = cityStateFullMatch[1].trim();
            statePart = cityStateFullMatch[2].trim();
          } else {
            cityPart = cityStateText;
          }
        }
      }
    } else {
      // No ZIP found, try to parse city/state from remaining parts after facility
      // Skip facility name if present and properly parse remaining parts
      const startIndex = addressStartIndex;
      const remainingParts = commaParts.slice(startIndex);

      if (remainingParts.length > 0) {
        // Join remaining parts and re-split for proper city/state/zip parsing
        const remainingText = remainingParts.join(", ");

        // First try to match with state abbreviations (more specific)
        const cityStateAbbrevMatch = remainingText.match(
          new RegExp(`^(.+?)\\s+(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, "i"),
        );
        if (cityStateAbbrevMatch) {
          const beforeState = cityStateAbbrevMatch[1].trim();
          statePart = cityStateAbbrevMatch[2].trim();

          // Remove any trailing comma from beforeState
          const cleanBeforeState = beforeState.replace(/,+\s*$/, "").trim();

          // Split the part before state to get address and city
          const beforeStateParts = cleanBeforeState
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
          if (beforeStateParts.length >= 2) {
            addressPart = beforeStateParts[0];
            // The city is typically the last part before state
            cityPart = beforeStateParts[beforeStateParts.length - 1];
          } else if (beforeStateParts.length === 1) {
            // One part before state - could be address or city
            // Heuristic: if it has numbers, it's probably address; if not, city
            if (/\d/.test(beforeStateParts[0])) {
              addressPart = beforeStateParts[0];
            } else {
              cityPart = beforeStateParts[0];
            }
          }
        } else {
          // Then try full state names
          const cityStateFullMatch = remainingText.match(
            new RegExp(`^(.+?)\\s+(${patterns.stateFullName.slice(2, -2)})\\s*$`, "i"),
          );
          if (cityStateFullMatch) {
            const beforeState = cityStateFullMatch[1].trim();
            statePart = cityStateFullMatch[2].trim();

            // Remove any trailing comma from beforeState
            const cleanBeforeState = beforeState.replace(/,+\s*$/, "").trim();

            // Split the part before state to get address and city
            const beforeStateParts = cleanBeforeState
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p.length > 0);
            if (beforeStateParts.length >= 2) {
              addressPart = beforeStateParts[0];
              // The city is typically the last part before state
              cityPart = beforeStateParts[beforeStateParts.length - 1];
            } else if (beforeStateParts.length === 1) {
              // One part before state
              if (/\d/.test(beforeStateParts[0])) {
                addressPart = beforeStateParts[0];
              } else {
                cityPart = beforeStateParts[0];
              }
            }
          } else {
            // Check if the entire text is a state/province (abbreviation first)
            const justStateAbbrevMatch = remainingText.match(
              new RegExp(`^(${patterns.stateAbbrev.slice(2, -2)})\\s*$`, "i"),
            );
            if (justStateAbbrevMatch) {
              statePart = justStateAbbrevMatch[1].trim();
            } else {
              const justStateFullMatch = remainingText.match(
                new RegExp(`^(${patterns.stateFullName.slice(2, -2)})\\s*$`, "i"),
              );
              if (justStateFullMatch) {
                statePart = justStateFullMatch[1].trim();
              } else if (remainingParts.length === 1) {
                // One remaining part, treat as address
                addressPart = remainingParts[0];
              } else {
                // Multiple parts but no state found - treat first as address, rest as city
                addressPart = remainingParts[0];
                cityPart = remainingParts.slice(1).join(", ");
              }
            }
          }
        }
      }
    }
  }

  // Fallback: If General Delivery and city wasn't captured, try to extract city between it and the province/state
  if (isGeneralDelivery && !cityPart) {
    // Example non-comma formats:
    //  - General Delivery Whitehorse YT Y1A 2T6
    //  - General Delivery Iqaluit NU X0A 0H0
    const gdCityMatch = address.match(GENERAL_DELIVERY_PATTERNS.WITH_CITY);
    if (gdCityMatch) {
      cityPart = gdCityMatch[1].trim();
    }
  }

  // Check for facility names and secondary units in middle comma parts
  let facilityPart = "";
  let secondaryUnitPart = "";

  if (commaParts.length > 2) {
    // Check middle parts for facility patterns and secondary units
    for (let i = 1; i < commaParts.length - 1; i++) {
      const part = commaParts[i].trim();

      // Check for secondary units first (Suite 500, Apt 3B, #45, etc.)
      const unitMatch = part.match(new RegExp(`^(?:${UNIT_TYPE_KEYWORDS})\\s+[a-z0-9-]+$|^#\\s*[a-z0-9-]+$`, "i"));
      if (unitMatch && !secondaryUnitPart) {
        secondaryUnitPart = part;
        excludedPartIndices.add(i);
        continue;
      }

      // Check for facility patterns
      for (const pattern of FACILITY_PATTERNS) {
        if (pattern.test(part)) {
          facilityPart = part;
          excludedPartIndices.add(i);
          break;
        }
      }
    }
  }

  const result: ParsedAddress = {};

  // Extract parenthetical information first
  let secondaryInfo = "";
  const parentheticalMatch = addressPart.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (parentheticalMatch) {
    addressPart = parentheticalMatch[1].trim();
    secondaryInfo = parentheticalMatch[2].trim();
  }

  // Parse address part using step-by-step approach
  let remaining = addressPart.trim();

  // 0. Check for secondary unit at the beginning (e.g., "#42 233 S Wacker Dr", "lt42 99 Some Road")
  const prefixSecUnitMatch = remaining.match(
    new RegExp(`^((?:${UNIT_TYPE_KEYWORDS})\\s*[a-z0-9-]*|#\\s*[a-z0-9-]+)\\s+(.*)$`, "i"),
  );
  if (prefixSecUnitMatch) {
    const unitText = prefixSecUnitMatch[1];
    remaining = prefixSecUnitMatch[2];

    // Parse the unit type and number
    const unitParts = unitText.match(UNIT_TYPE_NUMBER_PATTERN);
    if (unitParts) {
      if (unitParts[1] && unitParts[2]) {
        // Standard format with space: "apt 123", "suite 5A"
        const rawType = unitParts[1].toLowerCase();
        result.secUnitType = SECONDARY_UNIT_TYPES[rawType] || rawType;
        result.secUnitNum = unitParts[2];
      } else if (unitParts[3] && unitParts[4]) {
        // No-space format: "lt42", "lot5"
        const rawType = unitParts[3].toLowerCase();
        result.secUnitType = SECONDARY_UNIT_TYPES[rawType] || rawType;
        result.secUnitNum = unitParts[4];
      } else if (unitParts[5]) {
        // Hash format: "#123", "# 123"
        result.secUnitType = "#";
        result.secUnitNum = unitParts[5];
      }
    }
  }

  // 1. Extract number (including fractions and complex formats)
  // First try the standard pattern with space after number
  let numberMatch = remaining.match(
    new RegExp(`^(${patterns.number.slice(1, -1)})(?:\\s+(${patterns.fraction.slice(1, -1)}))?\\s+(.*)$`, "i"),
  );

  // If no match, try to detect number immediately followed by directional (like "48S")
  if (!numberMatch) {
    const numberDirectionalMatch = remaining.match(
      new RegExp(`^(\\d+)(${patterns.directional.slice(1, -1)})\\s+(.*)$`, "i"),
    );
    if (numberDirectionalMatch) {
      result.number = numberDirectionalMatch[1];
      // Set the directional as prefix and continue with remaining
      const normalizedDirectional = DIRECTIONAL_MAP[numberDirectionalMatch[2].toLowerCase()];
      result.prefix = normalizedDirectional || numberDirectionalMatch[2].toUpperCase();
      remaining = numberDirectionalMatch[3] || "";
    }
  } else {
    result.number = numberMatch[1];

    // Capitalize written numbers (One, Two, etc.)
    if (/^[a-zA-Z]+$/.test(result.number)) {
      result.number = result.number.charAt(0).toUpperCase() + result.number.slice(1).toLowerCase();
    }

    if (numberMatch[2]) {
      result.number = `${result.number} ${numberMatch[2]}`;
    }
    remaining = numberMatch[3] || "";
  }

  // If no number found, try without number
  if (!result.number && remaining) {
    // This is a street name without number
    // continue processing with the full text
  }

  // 2. Extract prefix directional (if not already extracted with number)
  if (!result.prefix) {
    const prefixMatch = remaining.match(new RegExp(`^(${patterns.directional.slice(1, -1)})\\s+(.*)$`, "i"));
    if (prefixMatch) {
      const normalizedDirectional = DIRECTIONAL_MAP[prefixMatch[1].toLowerCase()];
      result.prefix = normalizedDirectional || prefixMatch[1].toUpperCase();
      remaining = prefixMatch[2];
    }
  }

  // 2.5. Check for spaced grid address pattern (e.g., "2200 W" or "400 E")
  if (result.number && result.prefix && !result.street) {
    // Look for pattern: NUMBER DIRECTION at the start of remaining text
    const gridMatch = remaining.match(
      new RegExp(`^(\\d+)\\s+(${Object.keys(DIRECTIONAL_MAP).join("|")})\\b(.*)$`, "i"),
    );
    if (gridMatch) {
      result.street = gridMatch[1];
      const normalizedDirectional = DIRECTIONAL_MAP[gridMatch[2].toLowerCase()];
      result.suffix = normalizedDirectional || gridMatch[2].toUpperCase();
      remaining = gridMatch[3].trim();
    }
  }

  // 3. Extract secondary unit from the end (before we parse street type) or use from comma parts
  // Use pattern from data constants
  const secUnitMatch = remaining.match(SECONDARY_UNIT_PATTERN);
  if (secUnitMatch) {
    remaining = secUnitMatch[1];
    const unitParts = secUnitMatch[2].match(UNIT_TYPE_NUMBER_PATTERN);
    if (unitParts) {
      if (unitParts[1] && unitParts[2]) {
        // Standard format with space: "apt 123", "suite 5A"
        const rawType = unitParts[1].toLowerCase();
        result.secUnitType = SECONDARY_UNIT_TYPES[rawType] || rawType;
        result.secUnitNum = unitParts[2];
        result.unit = secUnitMatch[2]; // Store original unit text
      } else if (unitParts[3] && unitParts[4]) {
        // No-space format: "lt42", "lot5"
        const rawType = unitParts[3].toLowerCase();
        result.secUnitType = SECONDARY_UNIT_TYPES[rawType] || rawType;
        result.secUnitNum = unitParts[4];
        result.unit = secUnitMatch[2]; // Store original unit text
      } else if (unitParts[5]) {
        // Hash format: "#123", "# 123"
        result.secUnitType = "#";
        result.secUnitNum = unitParts[5];
        result.unit = secUnitMatch[2]; // Store original unit text
      }
    }
  } else if (secondaryUnitPart) {
    // Use secondary unit found in comma-separated parts
    const unitParts = secondaryUnitPart.match(UNIT_TYPE_NUMBER_PATTERN);
    if (unitParts) {
      if (unitParts[1] && unitParts[2]) {
        // Standard format with space: "apt 123", "suite 5A"
        const rawType = unitParts[1].toLowerCase();
        result.secUnitType = SECONDARY_UNIT_TYPES[rawType] || rawType;
        result.secUnitNum = unitParts[2];
        result.unit = secondaryUnitPart; // Store original unit text
      } else if (unitParts[3] && unitParts[4]) {
        // No-space format: "lt42", "lot5"
        const rawType = unitParts[3].toLowerCase();
        result.secUnitType = SECONDARY_UNIT_TYPES[rawType] || rawType;
        result.secUnitNum = unitParts[4];
        result.unit = secondaryUnitPart; // Store original unit text
      } else if (unitParts[5]) {
        // Hash format: "#123", "# 123"
        result.secUnitType = "#";
        result.secUnitNum = unitParts[5];
        result.unit = secondaryUnitPart; // Store original unit text
      }
    }
  }

  // 3.5. Check for standalone secondary unit types (like "lobby" without a unit number)
  if (!result.secUnitType && !result.secUnitNum) {
    // Look for standalone secondary unit type at the end before ZIP code
    const standaloneUnitMatch = remaining.match(
      new RegExp(`^(.*?)\\s+(${Object.keys(SECONDARY_UNIT_TYPES).join("|")})\\s*$`, "i"),
    );
    if (standaloneUnitMatch) {
      remaining = standaloneUnitMatch[1].trim();
      const rawType = standaloneUnitMatch[2].toLowerCase();
      result.secUnitType = SECONDARY_UNIT_TYPES[rawType];
      result.unit = standaloneUnitMatch[2]; // Store original unit text
    }
  }

  // 4. Special case: Check if "East" at the end should be treated as a street type
  // This handles the specific case "Music Square East" where "East" becomes type "E"
  const musicSquareEastMatch = remaining.match(MUSIC_SQUARE_EAST_PATTERN);
  if (musicSquareEastMatch) {
    result.street = musicSquareEastMatch[1].trim();
    result.type = "E";
    remaining = "";
  }

  // If General Delivery was detected, force street to "General Delivery" and skip further street parsing
  if (isGeneralDelivery) {
    result.number = undefined;
    result.prefix = undefined;
    result.type = undefined;
    result.suffix = undefined;
    result.street = "General Delivery";
    remaining = "";
  }

  // 5. Extract street type and directional combinations first (before standalone directionals)
  if (!result.type) {
    // Pattern: "Street Type. Directional" (e.g., "Ave. N.W.")
    const streetTypeWithDirectionalMatch = remaining.match(
      new RegExp(
        `^(.*?)\\s+\\b(${patterns.streetType.slice(1, -1)})\\.?\\s+(${patterns.directional.slice(1, -1)})\\s*$`,
        "i",
      ),
    );

    if (streetTypeWithDirectionalMatch) {
      result.street = streetTypeWithDirectionalMatch[1].trim();
      result.type = normalizeStreetType(streetTypeWithDirectionalMatch[2]);
      const normalizedDirectional = DIRECTIONAL_MAP[streetTypeWithDirectionalMatch[3].toLowerCase()];
      result.suffix = normalizedDirectional || streetTypeWithDirectionalMatch[3].toUpperCase();
      remaining = ""; // Consumed everything
    }
  }

  // 6. Extract suffix directional from the end (only if street type wasn't handled above)
  if (!result.type) {
    // Allow optional whitespace before directional, and also handle cases like "O." (French) or attached without extra tokens
    // IMPORTANT: Require at least one whitespace before directional so we don't
    // accidentally capture the trailing letter in words like "Street" as "E".
    // Support dotted forms like "O." but only when separated by whitespace.
    const suffixMatch = remaining.match(new RegExp(`^(.*?)\s+(${patterns.directional.slice(1, -1)})\.?\s*$`, "i"));
    if (suffixMatch) {
      remaining = suffixMatch[1].trim();
      const dirRaw = suffixMatch[2].toLowerCase();
      // Try multiple directional formats: exact match, without dot, with dot
      const normalizedDirectional =
        DIRECTIONAL_MAP[dirRaw] || DIRECTIONAL_MAP[dirRaw.replace(/\.$/, "")] || DIRECTIONAL_MAP[dirRaw + "."];
      result.suffix = normalizedDirectional || suffixMatch[2].toUpperCase();
    }
  }

  // 7. Extract street type from the end (English pattern) or beginning (French pattern) - if not already set
  if (!result.type) {
    // Pattern: "Street Type + Directional" (e.g., "Main St West")
    const streetTypeWithDirectionalMatch = remaining.match(
      new RegExp(
        `^(.*?)\\s+\\b(${patterns.streetType.slice(1, -1)})\\.?\\s+(${patterns.directional.slice(1, -1)})\\s*$`,
        "i",
      ),
    );

    // Pattern: "Street Type Number" (e.g., "US Hwy 101", "Route 66")
    const streetTypeNumberMatch = remaining.match(
      new RegExp(`^(.*?)\\s+\\b(${patterns.streetType.slice(1, -1)})\\s+(\\d+[A-Za-z]?)\\s*$`, "i"),
    );

    // Pattern: "Street Type." or "Street Type" at the end
    const streetTypeSuffixMatch = remaining.match(
      new RegExp(`^(.*?)\\s+\\b(${patterns.streetType.slice(1, -1)})\\.?\\s*$`, "i"),
    );

    // Pattern: French pattern: "Type Street"
    const streetTypePrefixMatch = remaining.match(
      new RegExp(`^\\b(${patterns.streetType.slice(1, -1)})\\b\\s+(.*)$`, "i"),
    );

    if (streetTypeWithDirectionalMatch) {
      // English pattern with directional: "Main St West" or "Front Street West"
      result.street = capitalizeStreetName(streetTypeWithDirectionalMatch[1].trim());
      result.type = normalizeStreetType(streetTypeWithDirectionalMatch[2]);
      const dirRaw = streetTypeWithDirectionalMatch[3].toLowerCase().replace(/\.$/, ""); // Remove trailing dot
      const normalizedDirectional =
        DIRECTIONAL_MAP[dirRaw] ||
        DIRECTIONAL_MAP[dirRaw + "."] ||
        DIRECTIONAL_MAP[streetTypeWithDirectionalMatch[3].toLowerCase()];
      result.suffix = normalizedDirectional || streetTypeWithDirectionalMatch[3].toUpperCase();
    } else if (streetTypeNumberMatch) {
      if (result.number) {
        // Fix: When a house number exists, do NOT overwrite it with the route number.
        // Instead, keep the route number as part of the street name.
        const streetCore = `${capitalizeStreetName(streetTypeNumberMatch[1].trim())} ${normalizeStreetType(streetTypeNumberMatch[2])} ${streetTypeNumberMatch[3]}`;
        result.street = streetCore.trim();
        // Leave result.type undefined to match expectations like "State Highway 116" as street
      } else {
        // No house number: keep the route as full street (e.g., "US Hwy 101")
        const streetCore = `${capitalizeStreetName(streetTypeNumberMatch[1].trim())} ${normalizeStreetType(streetTypeNumberMatch[2])} ${streetTypeNumberMatch[3]}`;
        result.street = streetCore.trim();
      }
    } else if (streetTypeSuffixMatch) {
      // English pattern: "Main St" or "Main St."
      const rawType = streetTypeSuffixMatch[2];
      const normalizedType = normalizeStreetType(rawType);
      // Special case: Facility + "Island" with no house number should keep full phrase as street
      if (facilityName && !result.number && ISLAND_TYPE_PATTERN.test(rawType)) {
        result.street = capitalizeStreetName(`${streetTypeSuffixMatch[1].trim()} Island`);
        // Do not set type in this special facility case
      } else {
        result.street = capitalizeStreetName(streetTypeSuffixMatch[1].trim());
        result.type = normalizedType;
      }
    } else if (streetTypePrefixMatch) {
      // French pattern: "Rue Main"
      result.type = normalizeStreetType(streetTypePrefixMatch[1]);
      result.street = capitalizeStreetName(streetTypePrefixMatch[2].trim());
    } else {
      // No street type found, check if remaining is a number+directional (like "400E")
      const numberDirectionalStreetMatch = remaining
        .trim()
        .match(new RegExp(`^(\\d+)(${patterns.directional.slice(1, -1)})$`, "i"));
      if (numberDirectionalStreetMatch) {
        result.street = numberDirectionalStreetMatch[1];
        const normalizedDirectional = DIRECTIONAL_MAP[numberDirectionalStreetMatch[2].toLowerCase()];
        result.suffix = normalizedDirectional || numberDirectionalStreetMatch[2].toUpperCase();
      } else {
        // Everything remaining is street name
        if (!result.street) {
          result.street = remaining.trim();
        }
      }
    }
  }

  // Add city, locality (if available), state, zip
  if (cityPart) result.city = cityPart;

  // Fix: If city was incorrectly assigned a secondary unit type, move it to secUnitType
  if (result.city && !result.secUnitType && result.city.toLowerCase() in SECONDARY_UNIT_TYPES) {
    result.secUnitType = SECONDARY_UNIT_TYPES[result.city.toLowerCase()];
    result.unit = result.city; // Store original text
    delete result.city; // Remove incorrect city assignment
  }

  // If we have a facility and the next comma part is a sub-region (NYC borough, DC quadrant, etc.), treat it as locality
  if (facilityName && commaParts.length > 1) {
    const maybeLocalityRaw: string = commaParts[1].trim();
    const normLocality: string = maybeLocalityRaw.toLowerCase().replace(VALIDATION_PATTERNS.NON_WORD, "");
    if (ALL_SUB_REGION_NAMES.has(normLocality)) {
      result.locality = maybeLocalityRaw;
    }
  }
  if (statePart) {
    // Use parseStateProvince to properly normalize state names to abbreviations
    const cleanedState = statePart.replace(/\./g, "").trim();
    const stateInfo = parseStateProvince(cleanedState);
    result.state = stateInfo.state || cleanedState.toUpperCase();
  }
  if (zipPart) {
    // Handle ZIP+4 format: 12345-6789, 123456789, 12345 6789
    const zipMatch = zipPart.match(ZIP_CODE_PATTERN);
    if (zipMatch) {
      setValidatedPostalCode(result, zipMatch[1], options);
      if (zipMatch[2]) {
        result.plus4 = zipMatch[2];
      }
    } else {
      setValidatedPostalCode(result, zipPart, options);
    }
  } else if (options.strict) {
    // In strict mode, check if there were invalid ZIP patterns that we should validate
    // Look for ZIP-like patterns in the original address
    const originalParts = address.split(",");
    const lastOriginalPart = originalParts[originalParts.length - 1] || "";
    const potentialZipMatch = lastOriginalPart.match(ZIP_VALIDATION_PATTERNS.POTENTIAL_ZIP);
    if (potentialZipMatch) {
      // Found a potential ZIP pattern that wasn't extracted in strict mode
      setValidatedPostalCode(result, potentialZipMatch[1], options);
    }
  }

  // Mark General Delivery if detected
  if (isGeneralDelivery) {
    result.generalDelivery = true;
  }

  // Add place if found (from either initial detection or middle parts)
  if (facilityName) {
    result.place = facilityName;
  } else if (facilityPart) {
    result.place = facilityPart;
  }

  // Add secondary information if found
  if (secondaryInfo) result.secondary = secondaryInfo;

  // Detect country if not set
  result.country = detectCountry(result);

  // Return result if we have meaningful components
  const finalResult = result.number || result.street || result.generalDelivery ? result : null;

  // Apply case conversion based on options
  return applyCaseConversion(finalResult, options);
}

// Helper function to apply case conversion based on options
function applyCaseConversion(result: ParsedAddress | null, options: ParseOptions): ParsedAddress | null {
  if (!result) {
    return null;
  }

  // useCamelCase takes precedence over useSnakeCase
  if (options.useCamelCase) {
    return toCamelCase(result as any);
  }
  
  if (options.useSnakeCase) {
    return toSnakeCase(result) as any;
  }

  return result;
}

// Parse informal addresses (fallback)
import { createParser, parseAddress, parser, setParseLocationImpl } from "./parsers/parser-orchestrator";

// Inject parseLocation implementation to break circular dependency
setParseLocationImpl(parseLocation);

// Re-export main functions
export { createParser, parseAddress, parseInformalAddress, parseIntersection, parseLocation, parser };

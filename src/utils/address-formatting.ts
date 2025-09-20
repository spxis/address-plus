// Address formatting utilities for standardized output formats

import { CA_PROVINCE_NAMES, DIRECTIONAL_MAP, US_STATE_NAMES, US_STREET_TYPES } from "../constants";
import type {
  AddressAbbreviations,
  AddressFormattingOptions,
  CanadaPostFormattingOptions,
  FormattedAddress,
  ParsedAddress,
  USPSFormattingOptions,
} from "../types";
import { capitalize } from "../utils/capitalization";

// Simple unit type abbreviations for formatting
const UNIT_ABBREVIATIONS: Record<string, string> = {
  apartment: "Apt",
  suite: "Ste",
  unit: "Unit",
  building: "Bldg",
  floor: "Fl",
  room: "Rm",
};

// Format address using standard conventions
function formatAddress(address: ParsedAddress, options: AddressFormattingOptions = {}): FormattedAddress {
  const {
    includeCountry = false,
    includeSecondaryUnit = true,
    upperCase = false,
    separator = " ",
    abbreviateStreetTypes = false,
    abbreviateDirections = false,
    abbreviateStates = false,
  } = options;

  const lines: string[] = [];

  // Build delivery line (street address)
  const deliveryLine = buildDeliveryLine(address, {
    includeSecondaryUnit,
    abbreviateStreetTypes,
    abbreviateDirections,
    separator,
  });

  if (deliveryLine) {
    lines.push(deliveryLine);
  }

  // Build last line (city, state, postal)
  const lastLine = buildLastLine(address, {
    abbreviateStates,
    separator,
  });

  if (lastLine) {
    lines.push(lastLine);
  }

  // Add country if requested and not US/Canada
  if (includeCountry && address.country && !["US", "CA"].includes(address.country)) {
    lines.push(address.country);
  }

  // Apply case transformation
  const formattedLines = lines.map((line) => (upperCase ? line.toUpperCase() : line));

  return {
    lines: formattedLines,
    singleLine: formattedLines.join(", "),
    deliveryLine,
    lastLine,
    country: address.country,
    format: "standard",
  };
}

// Format address using USPS standards
function formatUSPS(address: ParsedAddress, options: USPSFormattingOptions = {}): FormattedAddress {
  const { includeDeliveryLine = true, includeLastLine = true, standardizeCase = true } = options;

  const lines: string[] = [];

  // USPS specific delivery line with unit after street
  const deliveryLine = buildDeliveryLine(address, {
    includeSecondaryUnit: true,
    abbreviateStreetTypes: true,
    abbreviateDirections: true,
    separator: " ",
    uspsOrder: true, // Units come after street address for USPS
  });

  if (includeDeliveryLine && deliveryLine) {
    lines.push(deliveryLine);
  }

  // Build last line (city, state, postal)
  const lastLine = buildLastLine(address, {
    abbreviateStates: true,
    separator: " ",
  });

  if (includeLastLine && lastLine) {
    lines.push(lastLine);
  }

  return {
    lines: standardizeCase ? lines.map((line) => line.toUpperCase()) : lines,
    singleLine: lines.join(", "),
    deliveryLine,
    lastLine,
    country: address.country,
    format: "usps",
  };
}

// Format address using Canada Post standards
function formatCanadaPost(address: ParsedAddress, options: CanadaPostFormattingOptions = {}): FormattedAddress {
  const { includeDeliveryLine = true, includeLastLine = true, standardizeCase = true } = options;

  const lines: string[] = [];

  // Canada Post specific formatting
  const deliveryLine = buildDeliveryLine(address, {
    includeSecondaryUnit: true,
    abbreviateStreetTypes: true,
    abbreviateDirections: true,
    separator: " ",
  });

  if (includeDeliveryLine && deliveryLine) {
    lines.push(deliveryLine);
  }

  // Canada Post last line format: CITY PROVINCE POSTAL_CODE
  let lastLine = "";
  if (address.city && address.state && address.zip) {
    const province = abbreviateProvince(address.state);
    lastLine = `${address.city} ${province}  ${address.zip}`;
  } else if (address.city && address.state) {
    const province = abbreviateProvince(address.state);
    lastLine = `${address.city} ${province}`;
  }

  if (includeLastLine && lastLine) {
    lines.push(lastLine);
  }

  return {
    lines: standardizeCase ? lines.map((line) => line.toUpperCase()) : lines,
    singleLine: lines.join(", "),
    deliveryLine,
    lastLine,
    country: address.country || "CA",
    format: "canada-post",
  };
}

// Get all available abbreviations for address formatting
function getAddressAbbreviations(): AddressAbbreviations {
  // Create properly capitalized versions of the mappings
  const streetTypes: Record<string, string> = {};
  for (const [key, value] of Object.entries(US_STREET_TYPES)) {
    streetTypes[key] = capitalize(value);
  }

  return {
    streetTypes,
    directions: { ...DIRECTIONAL_MAP },
    states: { ...US_STATE_NAMES },
    provinces: { ...CA_PROVINCE_NAMES },
    unitTypes: { ...UNIT_ABBREVIATIONS },
  };
}

// Helper functions

function buildDeliveryLine(
  address: ParsedAddress,
  options: {
    includeSecondaryUnit: boolean;
    abbreviateStreetTypes: boolean;
    abbreviateDirections: boolean;
    separator: string;
    uspsOrder?: boolean; // New option for USPS unit ordering
  },
): string {
  const parts: string[] = [];

  // Add unit prefix if it exists (unless USPS order)
  if (options.includeSecondaryUnit && address.secUnitType && address.secUnitNum && !options.uspsOrder) {
    const unitType = options.abbreviateStreetTypes ? abbreviateUnitType(address.secUnitType) : address.secUnitType;
    parts.push(unitType);
    parts.push(address.secUnitNum);
  }

  // Add street number
  if (address.number) {
    parts.push(address.number);
  }

  // Add directional prefix
  if (address.prefix) {
    const prefix = options.abbreviateDirections ? abbreviateDirection(address.prefix) : address.prefix;
    parts.push(prefix);
  }

  // Add street name
  if (address.street) {
    parts.push(address.street);
  }

  // Add street type
  if (address.type) {
    const streetType = options.abbreviateStreetTypes ? abbreviateStreetType(address.type) : address.type;
    parts.push(streetType);
  }

  // Add directional suffix
  if (address.suffix) {
    const suffix = options.abbreviateDirections ? abbreviateDirection(address.suffix) : address.suffix;
    parts.push(suffix);
  }

  // Add unit suffix for USPS order (after street address)
  if (options.includeSecondaryUnit && address.secUnitType && address.secUnitNum && options.uspsOrder) {
    const unitType = options.abbreviateStreetTypes ? abbreviateUnitType(address.secUnitType) : address.secUnitType;
    parts.push(unitType);
    parts.push(address.secUnitNum);
  }

  // Add unit suffix if it exists and not already added as prefix
  if (options.includeSecondaryUnit && address.unit && !address.secUnitType) {
    parts.push(address.unit);
  }

  return parts.join(options.separator);
}

function buildLastLine(
  address: ParsedAddress,
  options: {
    abbreviateStates: boolean;
    separator: string;
  },
): string {
  const parts: string[] = [];

  if (address.city) {
    parts.push(address.city);
  }

  if (address.state) {
    const state = options.abbreviateStates ? abbreviateState(address.state) : address.state;
    parts.push(state);
  }

  if (address.zip) {
    let postal = address.zip;
    if (address.plus4) {
      postal += `-${address.plus4}`;
    }
    parts.push(postal);
  }

  return parts.join(options.separator);
}

function abbreviateStreetType(streetType: string): string {
  const normalized = streetType.toLowerCase();
  const abbrev = US_STREET_TYPES[normalized];
  return abbrev ? capitalize(abbrev) : streetType;
}

function abbreviateDirection(direction: string): string {
  const normalized = direction.toLowerCase();
  return DIRECTIONAL_MAP[normalized] || direction;
}

function abbreviateState(state: string): string {
  const normalized = state.toLowerCase();
  return US_STATE_NAMES[normalized] || state;
}

function abbreviateProvince(province: string): string {
  const normalized = province.toLowerCase();
  return CA_PROVINCE_NAMES[normalized] || province;
}

function abbreviateUnitType(unitType: string): string {
  const normalized = unitType.replace(/[^a-zA-Z]/g, "").toLowerCase();
  return UNIT_ABBREVIATIONS[normalized] || unitType;
}

export { formatAddress, formatCanadaPost, formatUSPS, getAddressAbbreviations };

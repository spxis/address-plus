// Case conversion utilities for backward compatibility

import type { ParsedAddress } from "../types";

// Mapping of camelCase field names to snake_case equivalents
const FIELD_NAME_MAPPING: Record<string, string> = {
  secUnitType: "sec_unit_type",
  secUnitNum: "sec_unit_num",
  ruralRoute: "rural_route",
  generalDelivery: "general_delivery",
  postalValid: "postal_valid",
  postalType: "postal_type",
  zipValid: "zip_valid",
};

// Convert a camelCase ParsedAddress to snake_case for backward compatibility
function toSnakeCase(address: ParsedAddress): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(address)) {
    if (value !== undefined) {
      const snakeKey = FIELD_NAME_MAPPING[key] || key;
      result[snakeKey] = value;
    }
  }

  return result;
}

// Convert a snake_case object to camelCase ParsedAddress
function toCamelCase(address: Record<string, any>): ParsedAddress {
  const result: ParsedAddress = {};
  const reverseMapping = Object.fromEntries(Object.entries(FIELD_NAME_MAPPING).map(([camel, snake]) => [snake, camel]));

  for (const [key, value] of Object.entries(address)) {
    if (value !== undefined) {
      const camelKey = reverseMapping[key] || key;
      (result as any)[camelKey] = value;
    }
  }

  return result;
}

// Exports at end of file as per AGENTS.md guidelines
export { FIELD_NAME_MAPPING, toCamelCase, toSnakeCase };

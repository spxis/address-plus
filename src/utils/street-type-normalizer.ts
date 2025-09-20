import { US_STREET_TYPES, CA_STREET_TYPES, STREET_TYPE_PROPER_CASE } from "../constants";

// Normalize street type to standard format
function normalizeStreetType(type: string): string {
  const normalized = type.toLowerCase().replace(/\./g, '');
  const mappedType = US_STREET_TYPES[normalized] || CA_STREET_TYPES[normalized];
  
  if (mappedType) {
    // Use proper case mapping from data
    return STREET_TYPE_PROPER_CASE[mappedType] || mappedType.charAt(0).toUpperCase() + mappedType.slice(1).toLowerCase();
  }
  
  // Return original with proper case if no mapping found
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export { normalizeStreetType };
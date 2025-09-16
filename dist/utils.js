"use strict";
/**
 * Core parsing utilities and regex patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeText = normalizeText;
exports.buildRegexFromDict = buildRegexFromDict;
exports.parseDirectional = parseDirectional;
exports.parseStreetType = parseStreetType;
exports.parseStateProvince = parseStateProvince;
exports.parsePostalCode = parsePostalCode;
exports.parseSecondaryUnit = parseSecondaryUnit;
exports.parseFacility = parseFacility;
exports.parseParenthetical = parseParenthetical;
exports.parseStreetNumber = parseStreetNumber;
exports.detectCountry = detectCountry;
const data_1 = require("./data");
/**
 * Normalize text for consistent parsing
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,;]/g, ' ')
        .trim();
}
/**
 * Build regex patterns from dictionary
 */
function buildRegexFromDict(dict, capture = true) {
    const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
    const pattern = keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return new RegExp(capture ? `\\b(${pattern})\\b` : `\\b(?:${pattern})\\b`, 'i');
}
/**
 * Extract and normalize directional
 */
function parseDirectional(text) {
    const dirPattern = buildRegexFromDict(data_1.DIRECTIONAL_MAP);
    const match = text.match(dirPattern);
    if (match) {
        const direction = data_1.DIRECTIONAL_MAP[match[1].toLowerCase()];
        const remaining = text.replace(dirPattern, ' ').replace(/\s+/g, ' ').trim();
        return { direction, remaining };
    }
    return { direction: undefined, remaining: text };
}
/**
 * Extract and normalize street type
 */
function parseStreetType(text, country = 'US') {
    const typeMap = country === 'CA' ? { ...data_1.US_STREET_TYPES, ...data_1.CA_STREET_TYPES } : data_1.US_STREET_TYPES;
    const typePattern = buildRegexFromDict(typeMap);
    const match = text.match(typePattern);
    if (match) {
        const type = typeMap[match[1].toLowerCase()];
        const remaining = text.replace(typePattern, ' ').replace(/\s+/g, ' ').trim();
        return { type, remaining };
    }
    return { type: undefined, remaining: text };
}
/**
 * Extract state or province
 */
function parseStateProvince(text, country) {
    // Try US states first - look for full names
    const usPattern = buildRegexFromDict(data_1.US_STATES);
    let match = text.match(usPattern);
    if (match) {
        const state = data_1.US_STATES[match[1].toLowerCase()];
        const remaining = text.replace(match[0], ' ').replace(/\s+/g, ' ').trim();
        return { state, remaining, detectedCountry: 'US' };
    }
    // Try US state abbreviations
    const usAbbrevPattern = new RegExp(`\\b(${Object.values(data_1.US_STATES).join('|')})\\b`, 'i');
    match = text.match(usAbbrevPattern);
    if (match) {
        const state = match[1].toUpperCase();
        const remaining = text.replace(match[0], ' ').replace(/\s+/g, ' ').trim();
        return { state, remaining, detectedCountry: 'US' };
    }
    // Try Canadian provinces - look for full names
    const caPattern = buildRegexFromDict(data_1.CA_PROVINCES);
    match = text.match(caPattern);
    if (match) {
        const state = data_1.CA_PROVINCES[match[1].toLowerCase()];
        const remaining = text.replace(match[0], ' ').replace(/\s+/g, ' ').trim();
        return { state, remaining, detectedCountry: 'CA' };
    }
    // Try Canadian province abbreviations
    const caAbbrevPattern = new RegExp(`\\b(${Object.values(data_1.CA_PROVINCES).join('|')})\\b`, 'i');
    match = text.match(caAbbrevPattern);
    if (match) {
        const state = match[1].toUpperCase();
        const remaining = text.replace(match[0], ' ').replace(/\s+/g, ' ').trim();
        return { state, remaining, detectedCountry: 'CA' };
    }
    return { state: undefined, remaining: text };
}
/**
 * Extract ZIP or postal code
 */
function parsePostalCode(text) {
    // Try US ZIP code - look for it anywhere in the text
    const zipMatch = text.match(/\b(\d{5})(?:[-\s]?(\d{4}))?\b/);
    if (zipMatch) {
        const zip = zipMatch[1];
        const zipext = zipMatch[2];
        const remaining = text.replace(zipMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { zip, zipext, remaining, detectedCountry: 'US' };
    }
    // Try Canadian postal code - look for it anywhere in the text
    const postalMatch = text.match(/\b([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)\b/);
    if (postalMatch) {
        const zip = `${postalMatch[1]} ${postalMatch[2]}`.toUpperCase();
        const remaining = text.replace(postalMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { zip, zipext: undefined, remaining, detectedCountry: 'CA' };
    }
    return { zip: undefined, zipext: undefined, remaining: text };
}
/**
 * Extract secondary unit information
 */
function parseSecondaryUnit(text) {
    const unitPattern = buildRegexFromDict(data_1.SECONDARY_UNIT_TYPES);
    // Look for unit type followed by number
    const unitMatch = text.match(new RegExp(`${unitPattern.source}\\s*(\\d+\\w*|[a-zA-Z]+\\d*)`));
    if (unitMatch) {
        const sec_unit_type = data_1.SECONDARY_UNIT_TYPES[unitMatch[1].toLowerCase()];
        const sec_unit_num = unitMatch[2];
        const unit = `${sec_unit_type} ${sec_unit_num}`;
        const remaining = text.replace(unitMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { unit, sec_unit_type, sec_unit_num, remaining };
    }
    // Look for just numbers that might be unit numbers
    const numberMatch = text.match(/\b(apt|apartment|unit|ste|suite|#)\s*(\d+\w*)\b/i);
    if (numberMatch) {
        const sec_unit_type = data_1.SECONDARY_UNIT_TYPES[numberMatch[1].toLowerCase()] || numberMatch[1].toLowerCase();
        const sec_unit_num = numberMatch[2];
        const unit = `${sec_unit_type} ${sec_unit_num}`;
        const remaining = text.replace(numberMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { unit, sec_unit_type, sec_unit_num, remaining };
    }
    return { unit: undefined, sec_unit_type: undefined, sec_unit_num: undefined, remaining: text };
}
/**
 * Extract facility names
 */
function parseFacility(text) {
    for (const pattern of data_1.FACILITY_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            // Try to extract the full facility name (word before + match + word after if relevant)
            const fullMatch = text.match(new RegExp(`\\b[\\w\\s]*${match[0]}[\\w\\s]*\\b`, 'i'));
            if (fullMatch) {
                const facility = fullMatch[0].trim();
                const remaining = text.replace(fullMatch[0], ' ').replace(/\s+/g, ' ').trim();
                return { facility, remaining };
            }
        }
    }
    return { facility: undefined, remaining: text };
}
/**
 * Parse parenthetical information
 */
function parseParenthetical(text) {
    const parenMatch = text.match(/\(([^)]+)\)/);
    if (parenMatch) {
        const secondary = parenMatch[1].trim();
        const remaining = text.replace(parenMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { secondary, remaining };
    }
    return { secondary: undefined, remaining: text };
}
/**
 * Extract street number (including fractional)
 */
function parseStreetNumber(text) {
    // Handle fractional numbers like "123 1/2" or "123-1/2"
    const fracMatch = text.match(/^\s*(\d+(?:\s*[-\/]\s*\d+\/\d+|\s+\d+\/\d+)?)\b/);
    if (fracMatch) {
        const number = fracMatch[1].replace(/\s+/g, ' ').trim();
        const remaining = text.replace(fracMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { number, remaining };
    }
    // Handle simple numbers
    const numMatch = text.match(/^\s*(\d+)\b/);
    if (numMatch) {
        const number = numMatch[1];
        const remaining = text.replace(numMatch[0], ' ').replace(/\s+/g, ' ').trim();
        return { number, remaining };
    }
    return { number: undefined, remaining: text };
}
/**
 * Detect country from address components
 */
function detectCountry(address) {
    if (address.state) {
        if (Object.values(data_1.US_STATES).includes(address.state) || Object.keys(data_1.US_STATES).includes(address.state.toLowerCase())) {
            return 'US';
        }
        if (Object.values(data_1.CA_PROVINCES).includes(address.state) || Object.keys(data_1.CA_PROVINCES).includes(address.state.toLowerCase())) {
            return 'CA';
        }
    }
    if (address.zip) {
        if (data_1.ZIP_CODE_PATTERN.test(address.zip)) {
            return 'US';
        }
        if (data_1.CANADIAN_POSTAL_CODE_PATTERN.test(address.zip)) {
            return 'CA';
        }
    }
    return undefined;
}

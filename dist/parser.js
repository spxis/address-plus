"use strict";
/**
 * Main address parser implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressParser = void 0;
exports.parseLocation = parseLocation;
exports.parseIntersection = parseIntersection;
exports.parseInformalAddress = parseInformalAddress;
exports.parseAddress = parseAddress;
const utils_1 = require("./utils");
const data_1 = require("./data");
/**
 * Parse a location string into address components
 */
function parseLocation(address, options = {}) {
    if (!address || typeof address !== 'string') {
        return null;
    }
    const { country = 'auto', normalize = true, validatePostalCode = true, language = 'auto', extractFacilities = true, parseParenthetical: enableParenthetical = true, } = options;
    const original = address.trim();
    const result = {};
    // Split by comma FIRST before any normalization that removes commas
    const parts = original.split(',').map(p => p.trim()).filter(Boolean);
    let streetPart = '';
    let cityPart = '';
    let stateZipPart = '';
    if (parts.length >= 3) {
        // Format: "street, city, state zip"
        streetPart = parts[0];
        cityPart = parts[1];
        stateZipPart = parts.slice(2).join(' ');
    }
    else if (parts.length >= 2) {
        streetPart = parts[0];
        stateZipPart = parts[1]; // Could be "city state zip" or just "state zip"
    }
    else if (parts.length === 1) {
        streetPart = parts[0]; // Parse everything from one part
    }
    // Now normalize the working text (this will be used for facilities, parenthetical, etc.)
    let workingText = original.toLowerCase().replace(/[.,;]/g, ' ').replace(/\s+/g, ' ').trim();
    // Parse parenthetical information first if enabled
    if (enableParenthetical) {
        const parenMatch = workingText.match(/\(([^)]+)\)/);
        if (parenMatch) {
            result.secondary = parenMatch[1].trim();
            workingText = workingText.replace(parenMatch[0], ' ').replace(/\s+/g, ' ').trim();
        }
    }
    // Extract facility names if enabled
    if (extractFacilities) {
        const facilityPatterns = [
            /\b(hospital|medical center|clinic|mall|shopping center|plaza|tower|building|center|centre)\b/i,
            /\b(school|university|college|library|church|temple|mosque|synagogue)\b/i,
        ];
        for (const pattern of facilityPatterns) {
            const match = workingText.match(pattern);
            if (match) {
                const fullMatch = workingText.match(new RegExp(`\\b[\\w\\s]*${match[0]}[\\w\\s]*\\b`, 'i'));
                if (fullMatch) {
                    result.facility = fullMatch[0].trim();
                    workingText = workingText.replace(fullMatch[0], ' ').replace(/\s+/g, ' ').trim();
                    break;
                }
            }
        }
    }
    // Extract ZIP/Postal code from stateZipPart or original
    let sourceForZip = stateZipPart || original;
    const zipMatch = sourceForZip.match(/\b(\d{5})(?:[-\s]?(\d{4}))?\b/);
    const postalMatch = sourceForZip.match(/\b([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)\b/);
    if (zipMatch) {
        result.zip = zipMatch[1];
        if (zipMatch[2])
            result.zipext = zipMatch[2];
        result.country = 'US';
        if (stateZipPart) {
            stateZipPart = stateZipPart.replace(new RegExp(zipMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ').replace(/\s+/g, ' ').trim();
        }
        else {
            // Remove from streetPart if no separate stateZipPart
            streetPart = streetPart.replace(new RegExp(zipMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ').replace(/\s+/g, ' ').trim();
        }
    }
    else if (postalMatch) {
        result.zip = `${postalMatch[1]} ${postalMatch[2]}`.toUpperCase();
        result.country = 'CA';
        if (stateZipPart) {
            stateZipPart = stateZipPart.replace(new RegExp(postalMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ').replace(/\s+/g, ' ').trim();
        }
        else {
            streetPart = streetPart.replace(new RegExp(postalMatch[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ').replace(/\s+/g, ' ').trim();
        }
    }
    // Extract state/province from stateZipPart or original
    const usStates = Object.values(data_1.US_STATES).join('|');
    const caProvinces = Object.values(data_1.CA_PROVINCES).join('|');
    let sourceForState = stateZipPart || streetPart;
    const stateMatch = sourceForState.match(new RegExp(`\\b(${usStates}|${caProvinces})\\b`, 'i'));
    if (stateMatch) {
        result.state = stateMatch[1].toUpperCase();
        if (!result.country) {
            result.country = Object.values(data_1.US_STATES).includes(result.state) ? 'US' : 'CA';
        }
        if (stateZipPart) {
            stateZipPart = stateZipPart.replace(new RegExp(`\\b${stateMatch[1]}\\b`, 'i'), ' ').replace(/\s+/g, ' ').trim();
        }
        else {
            streetPart = streetPart.replace(new RegExp(`\\b${stateMatch[1]}\\b`, 'i'), ' ').replace(/\s+/g, ' ').trim();
        }
    }
    // If we had a 2-part split and stateZipPart has remaining text after removing state/zip, that's the city
    if (parts.length === 2 && stateZipPart && stateZipPart.trim()) {
        cityPart = stateZipPart.trim();
    }
    // Parse street components
    if (streetPart) {
        // Extract street number
        const numMatch = streetPart.match(/^(\d+(?:\s*[-\/]\s*\d+\/\d+|\s+\d+\/\d+)?)/);
        if (numMatch) {
            result.number = numMatch[1].trim();
            streetPart = streetPart.replace(numMatch[0], ' ').trim();
        }
        // Extract secondary unit
        const unitMatch = streetPart.match(/\b(apt|apartment|unit|ste|suite|#)\s*(\d+\w*)/i);
        if (unitMatch) {
            const unitType = data_1.SECONDARY_UNIT_TYPES[unitMatch[1].toLowerCase()] || unitMatch[1].toLowerCase();
            result.sec_unit_type = unitType;
            result.sec_unit_num = unitMatch[2];
            result.unit = `${unitType} ${unitMatch[2]}`;
            streetPart = streetPart.replace(unitMatch[0], ' ').trim();
        }
        // Extract directional prefix
        const dirWords = Object.keys(data_1.DIRECTIONAL_MAP).join('|');
        const prefixMatch = streetPart.match(new RegExp(`^(${dirWords})\\s+`, 'i'));
        if (prefixMatch) {
            result.prefix = data_1.DIRECTIONAL_MAP[prefixMatch[1].toLowerCase()];
            streetPart = streetPart.replace(prefixMatch[0], ' ').trim();
        }
        // Extract street type and suffix
        const streetTypes = result.country === 'CA' ? { ...data_1.US_STREET_TYPES, ...data_1.CA_STREET_TYPES } : data_1.US_STREET_TYPES;
        const streetWords = streetPart.split(/\s+/);
        let typeIndex = -1;
        // Find street type - prioritize later positions and common abbreviations
        for (let i = streetWords.length - 1; i >= 0; i--) {
            const word = streetWords[i].toLowerCase();
            if (streetTypes[word]) {
                // Additional check: if this is a common street name that's also a type, skip it unless it's in a typical type position
                if (word === 'pine' || word === 'oak' || word === 'maple' || word === 'cedar') {
                    // These are common street names, only treat as type if they're at the end or followed by directional
                    if (i === streetWords.length - 1 ||
                        (i === streetWords.length - 2 && data_1.DIRECTIONAL_MAP[streetWords[i + 1].toLowerCase()])) {
                        result.type = streetTypes[word];
                        typeIndex = i;
                        break;
                    }
                }
                else {
                    result.type = streetTypes[word];
                    typeIndex = i;
                    break;
                }
            }
        }
        if (typeIndex >= 0) {
            // Check for suffix directional after street type
            let suffixIndex = -1;
            if (typeIndex + 1 < streetWords.length) {
                const suffixCandidate = streetWords[typeIndex + 1].toLowerCase();
                if (data_1.DIRECTIONAL_MAP[suffixCandidate]) {
                    result.suffix = data_1.DIRECTIONAL_MAP[suffixCandidate];
                    suffixIndex = typeIndex + 1;
                }
            }
            // Street name is everything before the type
            if (typeIndex > 0) {
                result.street = streetWords.slice(0, typeIndex).join(' ');
            }
            // If there's text after the type (and suffix), it might be city
            const remainingStart = suffixIndex >= 0 ? suffixIndex + 1 : typeIndex + 1;
            if (remainingStart < streetWords.length && !cityPart) {
                cityPart = streetWords.slice(remainingStart).join(' ');
            }
        }
        else {
            // No street type found, assume it's all street name
            result.street = streetPart;
        }
    }
    // Set city  
    if (cityPart) {
        result.city = cityPart;
    }
    // Auto-detect country if not set
    if (!result.country && result.state) {
        result.country = Object.values(data_1.US_STATES).includes(result.state) ? 'US' : 'CA';
    }
    // Validate postal code if requested
    if (validatePostalCode && result.zip && result.country) {
        const isValid = result.country === 'US'
            ? /^\d{5}(?:-\d{4})?$/.test(result.zip)
            : /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(result.zip);
        if (!isValid) {
            delete result.zip;
            delete result.zipext;
        }
    }
    // Capitalize names appropriately
    if (result.street) {
        result.street = result.street.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    if (result.city) {
        result.city = result.city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    // Return only if we have meaningful components
    const hasComponents = result.number || result.street || result.city || result.state || result.zip;
    return hasComponents ? result : null;
}
/**
 * Parse an intersection string
 */
function parseIntersection(address, options = {}) {
    if (!address || typeof address !== 'string') {
        return null;
    }
    const text = (0, utils_1.normalizeText)(address);
    const result = {};
    // Look for intersection indicators
    const intersectionMarkers = /\b(?:and|&|at|@|\/|\\|intersection of|corner of)\b/i;
    const match = text.match(intersectionMarkers);
    if (!match) {
        return null; // No intersection indicator found
    }
    const parts = text.split(intersectionMarkers);
    if (parts.length !== 2) {
        return null;
    }
    const street1Text = parts[0].trim();
    const street2Text = parts[1].trim();
    // Parse each street
    const parseCountry = options.country !== 'auto' ? options.country : 'US';
    // Parse first street
    let s1Text = street1Text;
    const s1PrefixResult = (0, utils_1.parseDirectional)(s1Text);
    if (s1PrefixResult.direction) {
        result.prefix1 = s1PrefixResult.direction;
        s1Text = s1PrefixResult.remaining;
    }
    const s1TypeResult = (0, utils_1.parseStreetType)(s1Text, parseCountry);
    if (s1TypeResult.type) {
        result.type1 = s1TypeResult.type;
        s1Text = s1TypeResult.remaining;
    }
    const s1SuffixResult = (0, utils_1.parseDirectional)(s1Text);
    if (s1SuffixResult.direction) {
        result.suffix1 = s1SuffixResult.direction;
        s1Text = s1SuffixResult.remaining;
    }
    if (s1Text.trim()) {
        result.street1 = s1Text.trim();
    }
    // Parse second street (may include city, state, zip)
    let s2Text = street2Text;
    // Extract postal code from second street
    const postalResult = (0, utils_1.parsePostalCode)(s2Text);
    if (postalResult.zip) {
        result.zip = postalResult.zip;
        s2Text = postalResult.remaining;
    }
    // Extract state from second street
    const stateResult = (0, utils_1.parseStateProvince)(s2Text);
    if (stateResult.state) {
        result.state = stateResult.state;
        s2Text = stateResult.remaining;
        if (stateResult.detectedCountry) {
            result.country = stateResult.detectedCountry;
        }
    }
    const s2PrefixResult = (0, utils_1.parseDirectional)(s2Text);
    if (s2PrefixResult.direction) {
        result.prefix2 = s2PrefixResult.direction;
        s2Text = s2PrefixResult.remaining;
    }
    const s2TypeResult = (0, utils_1.parseStreetType)(s2Text, parseCountry);
    if (s2TypeResult.type) {
        result.type2 = s2TypeResult.type;
        s2Text = s2TypeResult.remaining;
    }
    const s2SuffixResult = (0, utils_1.parseDirectional)(s2Text);
    if (s2SuffixResult.direction) {
        result.suffix2 = s2SuffixResult.direction;
        s2Text = s2SuffixResult.remaining;
    }
    // Remaining text could be street name and/or city
    const s2Parts = s2Text.split(/\s+/).filter(Boolean);
    if (s2Parts.length > 0) {
        if (s2Parts.length === 1) {
            result.street2 = s2Parts[0];
        }
        else {
            // Assume last word is city if we don't have state/zip to help determine
            if (!result.state && !result.zip) {
                result.street2 = s2Parts.slice(0, -1).join(' ');
                result.city = s2Parts.slice(-1)[0];
            }
            else {
                result.street2 = s2Parts.join(' ');
            }
        }
    }
    // Return result if we have at least two streets
    return (result.street1 && result.street2) ? result : null;
}
/**
 * Parse an informal address (more lenient parsing)
 */
function parseInformalAddress(address, options = {}) {
    // For informal addresses, be more lenient with parsing
    const informalOptions = {
        ...options,
        validatePostalCode: false, // Don't validate postal codes strictly
        parseParenthetical: true, // Always parse parenthetical info
        extractFacilities: true, // Always extract facilities
    };
    return parseLocation(address, informalOptions);
}
/**
 * Main parse function (alias for parseLocation for API compatibility)
 */
function parseAddress(address, options = {}) {
    return parseLocation(address, options);
}
/**
 * Create the parser object with all methods
 */
exports.addressParser = {
    parseLocation,
    parseIntersection,
    parseInformalAddress,
    parseAddress,
};

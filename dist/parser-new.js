"use strict";
/**
 * Improved address parser implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLocationNew = parseLocationNew;
const utils_1 = require("./utils");
/**
 * Parse a location string into address components
 */
function parseLocationNew(address, options = {}) {
    if (!address || typeof address !== 'string') {
        return null;
    }
    const { country = 'auto', normalize = true, validatePostalCode = true, language = 'auto', extractFacilities = true, parseParenthetical: enableParenthetical = true, } = options;
    let text = (0, utils_1.normalizeText)(address);
    const result = {};
    // Parse parenthetical information first if enabled
    if (enableParenthetical) {
        const { secondary, remaining } = (0, utils_1.parseParenthetical)(text);
        if (secondary) {
            result.secondary = secondary;
            text = remaining;
        }
    }
    // Extract facility names if enabled
    if (extractFacilities) {
        const { facility, remaining } = (0, utils_1.parseFacility)(text);
        if (facility) {
            result.facility = facility;
            text = remaining;
        }
    }
    // Parse from RIGHT TO LEFT (end of address first)
    // Split by commas first to help structure the parsing
    const commaParts = text.split(',').map(s => s.trim()).filter(Boolean);
    let streetAndNumber = '';
    let cityPart = '';
    let stateZipPart = '';
    if (commaParts.length === 1) {
        // No commas - might be "123 Main St New York NY 10001" format
        streetAndNumber = commaParts[0];
    }
    else if (commaParts.length === 2) {
        // "123 Main St, New York NY 10001" format
        streetAndNumber = commaParts[0];
        stateZipPart = commaParts[1];
    }
    else if (commaParts.length >= 3) {
        // "123 Main St, New York, NY 10001" format
        streetAndNumber = commaParts[0];
        cityPart = commaParts[1];
        stateZipPart = commaParts.slice(2).join(' ');
    }
    // Parse state and ZIP from the rightmost part
    let workingText = stateZipPart || streetAndNumber;
    // Extract postal/ZIP code
    const postalResult = (0, utils_1.parsePostalCode)(workingText);
    if (postalResult.zip) {
        result.zip = postalResult.zip;
        result.zipext = postalResult.zipext;
        workingText = postalResult.remaining;
        if (country === 'auto' && postalResult.detectedCountry) {
            result.country = postalResult.detectedCountry;
        }
    }
    // Extract state/province 
    const stateResult = (0, utils_1.parseStateProvince)(workingText, country === 'auto' ? undefined : country);
    if (stateResult.state) {
        result.state = stateResult.state;
        workingText = stateResult.remaining;
        if (country === 'auto' && stateResult.detectedCountry && !result.country) {
            result.country = stateResult.detectedCountry;
        }
    }
    // If we have remaining text in stateZipPart after removing state/zip, it might be city
    if (stateZipPart && workingText.trim() && !cityPart) {
        cityPart = workingText.trim();
    }
    // Now parse the street and number part
    workingText = streetAndNumber;
    // If we still need to extract city and don't have it yet
    if (!cityPart && !result.state && !result.zip) {
        // Try to split off city from the end
        const words = workingText.split(/\s+/).filter(Boolean);
        if (words.length > 3) {
            // Assume last 1-2 words might be city
            cityPart = words.slice(-2).join(' ');
            workingText = words.slice(0, -2).join(' ');
        }
    }
    // Extract secondary unit information
    const unitResult = (0, utils_1.parseSecondaryUnit)(workingText);
    if (unitResult.unit) {
        result.unit = unitResult.unit;
        result.sec_unit_type = unitResult.sec_unit_type;
        result.sec_unit_num = unitResult.sec_unit_num;
        workingText = unitResult.remaining;
    }
    // Extract street number from the beginning
    const numberResult = (0, utils_1.parseStreetNumber)(workingText);
    if (numberResult.number) {
        result.number = numberResult.number;
        workingText = numberResult.remaining;
    }
    // Extract prefix directional
    const prefixResult = (0, utils_1.parseDirectional)(workingText);
    if (prefixResult.direction) {
        result.prefix = prefixResult.direction;
        workingText = prefixResult.remaining;
    }
    // Determine country for street type parsing
    const parseCountry = result.country || (country !== 'auto' ? country : 'US');
    // Extract street type and suffix directional from what remains
    const typeResult = (0, utils_1.parseStreetType)(workingText, parseCountry);
    if (typeResult.type) {
        result.type = typeResult.type;
        workingText = typeResult.remaining;
    }
    // Extract suffix directional
    const suffixResult = (0, utils_1.parseDirectional)(workingText);
    if (suffixResult.direction) {
        result.suffix = suffixResult.direction;
        workingText = suffixResult.remaining;
    }
    // Remaining text should be the street name
    if (workingText.trim()) {
        result.street = workingText.trim();
    }
    // Set city if we found one
    if (cityPart) {
        result.city = cityPart;
    }
    // Auto-detect country if not already determined
    if (!result.country) {
        result.country = (0, utils_1.detectCountry)(result);
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
    // Return null if we couldn't parse any meaningful components
    const hasComponents = result.number || result.street || result.city || result.state || result.zip;
    return hasComponents ? result : null;
}

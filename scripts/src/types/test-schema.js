/**
 * Schema definitions for JSON test case files
 * Provides type safety and consistency for all test data structures
 */
// Type guard functions to check test case types
export function isAddressParsingTestCase(testCase) {
    return typeof testCase.expected === 'object' &&
        testCase.expected !== null &&
        ('number' in testCase.expected || 'street' in testCase.expected || 'city' in testCase.expected);
}
export function isAddressFormattingTestCase(testCase) {
    return typeof testCase.expected === 'string' &&
        testCase.options !== undefined &&
        (testCase.options && ('format' in testCase.options || 'case' in testCase.options || 'abbreviate' in testCase.options));
}
export function isAddressValidationTestCase(testCase) {
    return typeof testCase.expected === 'object' &&
        testCase.expected !== null &&
        ('isValid' in testCase.expected || 'confidence' in testCase.expected || 'errors' in testCase.expected);
}
export function isCleanAddressTestCase(testCase) {
    return typeof testCase.expected === 'string' &&
        testCase.options !== undefined &&
        (testCase.options && ('removeExtraSpaces' in testCase.options || 'standardizeCase' in testCase.options));
}
// Validation function for test file schema
export function validateTestFile(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    // Check that all non-description properties are arrays of test cases
    for (const [key, value] of Object.entries(data)) {
        if (key === 'description') {
            if (typeof value !== 'string') {
                return false;
            }
            continue;
        }
        if (!Array.isArray(value)) {
            return false;
        }
        // Validate each test case in the array
        for (const testCase of value) {
            if (!validateTestCase(testCase)) {
                return false;
            }
        }
    }
    return true;
}
// Validation function for individual test cases
export function validateTestCase(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    // Must have either name or description
    if (!('name' in data) && !('description' in data)) {
        return false;
    }
    // Must have input and expected
    if (!('input' in data) || !('expected' in data)) {
        return false;
    }
    // name/description must be string if present
    if ('name' in data && typeof data.name !== 'string') {
        return false;
    }
    if ('description' in data && typeof data.description !== 'string') {
        return false;
    }
    // input must be string or array
    if (typeof data.input !== 'string' && !Array.isArray(data.input) && typeof data.input !== 'object') {
        return false;
    }
    // options must be object if present
    if ('options' in data && (typeof data.options !== 'object' || data.options === null)) {
        return false;
    }
    return true;
}

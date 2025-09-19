import { parseLocation } from './dist/index.js';

// Test the problematic address step by step
console.log('=== PARSING BREAKDOWN ===');

const fullAddress = '1234 West Broadway Vancouver BC V6H 1G5';
console.log('Full address:', fullAddress);

// Simulate the parsing steps
const afterZipExtraction = '1234 West Broadway Vancouver BC';
console.log('After ZIP extraction:', afterZipExtraction);

const afterStateExtraction = '1234 West Broadway Vancouver';
console.log('After state extraction:', afterStateExtraction);

// This should be where city extraction happens
console.log('\n=== TESTING CITY EXTRACTION ===');
const result1 = parseLocation(afterStateExtraction);
console.log('Result for "' + afterStateExtraction + '":', JSON.stringify(result1, null, 2));

// Test just the address components
console.log('\n=== TESTING ADDRESS ONLY ===');
const addressOnly = '1234 West Broadway';
const result2 = parseLocation(addressOnly);
console.log('Result for "' + addressOnly + '":', JSON.stringify(result2, null, 2));

// Test JUST city extraction pattern
console.log('\n=== TESTING PATTERN MATCHING ===');
const testText = '1234 West Broadway Vancouver';
const singleWordPattern = /\s+([A-Za-z]+)$/;
const twoWordPattern = /\s+([A-Za-z]+\s+[A-Za-z]+)$/;

const singleMatch = testText.match(singleWordPattern);
const twoMatch = testText.match(twoWordPattern);

console.log('Single word match:', singleMatch ? singleMatch[1] : 'none');
console.log('Two word match:', twoMatch ? twoMatch[1] : 'none');

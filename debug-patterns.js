import { parseLocation } from './dist/index.js';

console.log('=== STEP BY STEP SIMULATION ===');

// Simulate the exact steps that should happen:
console.log('1. Original:', '1234 West Broadway Vancouver BC V6H 1G5');

// After ZIP extraction
const afterZip = '1234 West Broadway Vancouver BC';
console.log('2. After ZIP:', afterZip);
const zipResult = parseLocation(afterZip);
console.log('   Parse result:', JSON.stringify(zipResult, null, 2));

// After state extraction
const afterState = '1234 West Broadway Vancouver';
console.log('3. After state:', afterState);
const stateResult = parseLocation(afterState);
console.log('   Parse result:', JSON.stringify(stateResult, null, 2));

// This should be when city extraction happens and leaves us with address part
const addressPart = '1234 West Broadway'; // This is what should be left
console.log('4. Address part:', addressPart);
const addressResult = parseLocation(addressPart);
console.log('   Parse result:', JSON.stringify(addressResult, null, 2));

console.log('\n=== THE PROBLEM ===');
console.log('Expected after city extraction: "1234 West Broadway"');
console.log('Expected result: number: "1234", prefix: "W", street: "Broadway"');
console.log('Actual when full parsing: street: "West", city: "Broadway Vancouver"');

console.log('\n=== TESTING MANUAL CITY PATTERNS ===');
const input = '1234 West Broadway Vancouver';
const singleWordPattern = /\s+([A-Za-z]+)$/;
const twoWordPattern = /\s+([A-Za-z]+\s+[A-Za-z]+)$/;

const singleMatch = input.match(singleWordPattern);
const twoMatch = input.match(twoWordPattern);

console.log('Input:', input);
console.log('Single word city pattern match:', singleMatch ? singleMatch[1] : 'none');
console.log('Two word city pattern match:', twoMatch ? twoMatch[1] : 'none');
console.log('Should prefer single word (Vancouver) over two word (Broadway Vancouver)');

// Now test what happens if we manually extract Vancouver
const afterCityExtraction = '1234 West Broadway';
console.log('\nAfter manual Vancouver extraction:', afterCityExtraction);
const manualResult = parseLocation(afterCityExtraction);
console.log('Result:', JSON.stringify(manualResult, null, 2));

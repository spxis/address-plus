import { parseLocation } from './dist/index.js';

// Add debugging to trace the exact parsing flow
const originalParseLocation = parseLocation;

function debugParseLocation(address) {
  console.log('\n=== DEBUGGING PARSE:', address, '===');

  const result = originalParseLocation(address);
  console.log('Final result:', JSON.stringify(result, null, 2));

  return result;
}

// Test the failing case
debugParseLocation('1005 Gravenstein Hwy 95472');

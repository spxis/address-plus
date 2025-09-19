#!/usr/bin/env node

/**
 * Test script to verify our DRY pattern constants work correctly
 */

import { parseAddress } from './dist/index.js';

console.log('🔍 Testing DRY pattern constants...\n');

// Test directional parsing with common street names
const testCases = [
  "1234 West Broadway Vancouver BC",
  "115 Broadway San Francisco CA",
  "456 Main Street Seattle WA",
  "789 First Avenue New York NY"
];

testCases.forEach(address => {
  console.log(`Input: "${address}"`);
  const result = parseAddress(address);
  console.log(`Result:`);
  console.log(`  - Number: ${result?.number || 'N/A'}`);
  console.log(`  - Prefix: ${result?.prefix || 'N/A'}`);
  console.log(`  - Street: ${result?.street || 'N/A'}`);
  console.log(`  - City: ${result?.city || 'N/A'}`);
  console.log(`  - State: ${result?.state || 'N/A'}`);
  console.log('');
});

console.log('✅ DRY pattern constants test complete!');
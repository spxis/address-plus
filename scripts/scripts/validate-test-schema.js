#!/usr/bin/env node
/**
 * JSON Test Schema Validation Script
 *
 * This script validates all JSON test files against our formal schema definitions
 * to ensure consistency and type safety across the test suite.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { validateTestCase } from '../src/types/test-schema.js';
function getAllJsonFiles(dir) {
    const files = [];
    const items = readdirSync(dir);
    for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            files.push(...getAllJsonFiles(fullPath));
        }
        else if (extname(item) === '.json' && !item.startsWith('.')) {
            files.push(fullPath);
        }
    }
    return files;
}
function detectTestCaseType(data) {
    // Check if it's an array vs object structure
    if (Array.isArray(data)) {
        // Check first element to determine type
        const firstItem = data[0];
        if (!firstItem)
            return 'empty-array';
        if (firstItem.input && firstItem.expected) {
            return 'parsing-array';
        }
        if (firstItem.input && firstItem.functions) {
            return 'multi-function-array';
        }
        return 'unknown-array';
    }
    // Object structure - check properties
    if (data.testCases) {
        return 'comparison-object';
    }
    if (data.validateAddress) {
        return 'validation-object';
    }
    if (data.batchTests) {
        return 'batch-object';
    }
    if (data.basic_addresses || data.edge_cases || data.famous_addresses) {
        return 'parsing-object';
    }
    if (data.description && Array.isArray(data.basic_addresses)) {
        return 'parsing-object-with-description';
    }
    return 'unknown-object';
}
function validateJsonFile(filePath) {
    const result = {
        file: filePath,
        isValid: false,
        errors: []
    };
    try {
        const content = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        result.detectedType = detectTestCaseType(data);
        // For now, we'll validate basic JSON structure
        // More specific validation can be added as we refine the schema
        if (Array.isArray(data)) {
            // Validate array elements
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (!validateTestCase(item)) {
                    result.errors.push(`Item ${i} does not match any test case schema`);
                }
            }
        }
        else if (typeof data === 'object' && data !== null) {
            // Validate object structure
            if (!data.description && !data.testCases && !data.validateAddress && !data.batchTests) {
                result.errors.push('Object missing expected top-level properties (description, testCases, validateAddress, or batchTests)');
            }
        }
        else {
            result.errors.push('Root level must be an object or array');
        }
        result.isValid = result.errors.length === 0;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push(`JSON parsing error: ${errorMessage}`);
    }
    return result;
}
function main() {
    const testDataDir = join(process.cwd(), 'test-data');
    console.log('🔍 Scanning for JSON test files...\n');
    const jsonFiles = getAllJsonFiles(testDataDir);
    console.log(`Found ${jsonFiles.length} JSON files to validate\n`);
    const results = [];
    for (const file of jsonFiles) {
        const relativePath = file.replace(process.cwd() + '/', '');
        console.log(`Validating: ${relativePath}`);
        const result = validateJsonFile(file);
        results.push(result);
        if (result.isValid) {
            console.log(`  ✅ Valid (${result.detectedType})`);
        }
        else {
            console.log(`  ❌ Invalid (${result.detectedType})`);
            result.errors.forEach(error => {
                console.log(`     - ${error}`);
            });
        }
        console.log();
    }
    // Summary
    const validFiles = results.filter(r => r.isValid).length;
    const invalidFiles = results.length - validFiles;
    console.log('📊 VALIDATION SUMMARY');
    console.log('=====================================');
    console.log(`Total files: ${results.length}`);
    console.log(`Valid: ${validFiles}`);
    console.log(`Invalid: ${invalidFiles}`);
    if (invalidFiles > 0) {
        console.log('\n❌ Schema validation failed for some files');
        process.exit(1);
    }
    else {
        console.log('\n✅ All JSON test files pass schema validation');
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

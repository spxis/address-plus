# Test Schema Validation

This document describes the formal schema validation system for JSON test files in this project.

## Overview

We use JSON Schema for validating test data files. This provides industry-standard validation, IDE support, and automatic error detection for malformed JSON files.

## Schema Files

### Core Schema Files

- **`schemas/test-case.json`** - Schema for individual test cases
- **`schemas/test-file.json`** - Schema for complete test files containing arrays of test cases

## Using JSON Schema

### Adding Schema to JSON Files

All JSON test files should include the `$schema` property to enable automatic validation:

```json
{
  "$schema": "../../schemas/test-file.json",
  "description": "Test file description",
  "testCases": [
    {
      "name": "Test case name",
      "input": "input data", 
      "expected": "expected result"
    }
  ]
}
```

### Test Case Structure

Individual test cases must follow this structure:

```json
{
  "name": "Human-readable test name",
  "description": "Alternative to name field",
  "input": "string|array|object - the input data",
  "expected": "any - the expected output",
  "options": {
    "optional": "configuration object"
  }
}
```

### File Structure Options

Test files can be structured as:

1. **Array of test cases** (simple format):
```json
{
  "$schema": "../../schemas/test-file.json",
  "testCases": [
    { "name": "test1", "input": "data", "expected": "result" }
  ]
}
```

2. **Categorized test cases** (organized format):
```json
{
  "$schema": "../../schemas/test-file.json",
  "description": "File description",
  "basicTests": [
    { "name": "test1", "input": "data", "expected": "result" }
  ],
  "edgeCases": [
    { "name": "test2", "input": "edge", "expected": "result" }
  ]
}
```

## TypeScript Integration

The project includes TypeScript interfaces that mirror the JSON Schema:

- `TestCaseBase` - Base interface for all test cases
- `AddressParsingTestCase` - Address parsing tests
- `AddressFormattingTestCase` - Address formatting tests
- `AddressValidationTestCase` - Address validation tests
- `AddressComparisonTestCase` - Address comparison tests
- `CleanAddressTestCase` - Address cleaning tests
- `BatchProcessingTestCase` - Batch processing tests

Import these types for TypeScript support:

```typescript
import type { TestCase, AddressParsingTestCase } from "./types";
```

## Benefits

1. **Automatic Validation** - IDEs and tools automatically validate JSON against schema
2. **IntelliSense Support** - Auto-completion and error detection in editors
3. **Industry Standard** - Uses JSON Schema specification
4. **Tool Integration** - Works with validation tools and CI/CD pipelines
5. **Documentation** - Schema serves as living documentation

## Validation Tools

### VS Code
- Install "JSON Schema Validator" extension for automatic validation
- Schema errors appear as red underlines in JSON files

### Command Line
```bash
# Install a JSON Schema validator
npm install -g ajv-cli

# Validate a file
ajv validate -s schemas/test-file.json -d test-data/examples/schema-example.json
```

### CI/CD Integration
```yaml
# Example GitHub Action step
- name: Validate JSON Schema
  run: |
    npm install -g ajv-cli
    find test-data -name "*.json" -exec ajv validate -s schemas/test-file.json -d {} \;
```

## Migration Guide

To add schema validation to existing JSON test files:

1. Add `$schema` property pointing to `../../schemas/test-file.json`
2. Ensure test cases have required `input` and `expected` fields
3. Add `name` or `description` field to each test case
4. Verify structure matches one of the supported formats

## Example

See `test-data/examples/schema-example.json` for a complete example of a properly structured test file with JSON Schema validation.
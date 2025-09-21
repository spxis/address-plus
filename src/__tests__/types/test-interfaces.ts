// Test Interfaces for Address Plus Test Suite
// This file consolidates all test case interfaces used across the test files

import type { BatchParseOptions, CleanAddressOptions, ParsedAddress, ParsedIntersection, ValidationOptions } from "../../types";

// ============================================================================
// Common Test Types
// ============================================================================

// Basic test case structure used across multiple test files
interface BaseTestCase {
  description: string;
  input: string;
}

// Test case with expected result
interface TestCaseWithExpected<T = unknown> extends BaseTestCase {
  expected: T;
}

// Test case with optional name
interface NamedTestCase extends BaseTestCase {
  name?: string;
}

// ============================================================================
// Region Normalization Test Interfaces
// ============================================================================

interface RegionTestCase {
  input: string;
  expected: { abbr: string; country: "CA" | "US" } | null;
  description: string;
}

interface FuzzyMatchTestCase {
  input: string;
  expected: { abbr: string; country: "CA" | "US" };
  description: string;
}

interface NullTestCase {
  input: string;
  description: string;
}

// ============================================================================
// Postal Mappings Test Interfaces
// ============================================================================

interface PostalMappingTestCase {
  name: string;
  description?: string;
  input: string;
  expected: string | null;
}

// ============================================================================
// Address Cleaning Test Interfaces
// ============================================================================

interface CleanAddressTestCase {
  name: string;
  input: string;
  expected: string;
  options?: Record<string, any>;
}

interface CleanAddressDetailedTestCase {
  name: string;
  input: string;
  expected: {
    cleanedAddress?: string;
    cleaned?: string;
    wasModified: boolean;
    changes: string[];
  };
  options?: Record<string, any>;
}

interface FormatSpecificTestCase {
  name: string;
  input: string;
  expected: string;
  expectContains: string[];
  options?: Record<string, any>;
}

interface EdgeCaseTestCase {
  name: string;
  input: string;
  expected: string;
  options?: Record<string, any>;
}

interface AdditionalTestCase {
  name: string;
  description: string;
  input: string;
  expected: string;
}

// ============================================================================
// Address Comparison Test Interfaces
// ============================================================================

interface ComparisonTestCase {
  description: string;
  input: {
    address1: Record<string, any>;
    address2: Record<string, any>;
    options?: Record<string, any>;
  };
  expected: {
    isSame: boolean;
    similarity: number;
    score?: number;
  };
}

interface SimilarityTestCase {
  description: string;
  input: {
    address1: Record<string, any>;
    address2: Record<string, any>;
  };
  expected: {
    similarity: number;
  };
}

interface ComparisonEdgeCaseTestCase {
  description: string;
  input: {
    address1: Record<string, any> | null;
    address2: Record<string, any> | null;
    options?: Record<string, any>;
  };
  expected: {
    isSame: boolean;
    similarity?: number;
    similarityLessThan?: number;
    comparison?: {
      score?: number;
    };
  };
}

// ============================================================================
// Address Formatting Test Interfaces
// ============================================================================

interface FormattingTestCase {
  description: string;
  input: Record<string, any>;
  expected: {
    lines?: string[];
    singleLine?: string;
    format?: string;
    shouldNotContain?: string;
    shouldContain?: string;
    regex?: string;
    country?: string;
    hasProperties?: string[];
    streetTypes?: Record<string, any>;
    directions?: Record<string, any>;
    states?: Record<string, any>;
    provinces?: Record<string, any>;
    unitTypes?: Record<string, any>;
    usps?: string;
    canadaPost?: string;
    informal?: string;
    formal?: string;
    directionals?: Record<string, string>;
    abbreviations?: Record<string, string>;
  };
  options?: Record<string, any>;
}

// ============================================================================
// Validation Test Interfaces
// ============================================================================

interface ValidationTestCase {
  name: string;
  description?: string;
  input: string;
  expected: {
    isValid?: boolean;
    confidence?: number;
    confidenceGreaterThan?: number;
    completeness?: number;
    completenessGreaterThan?: number;
    completenessLessThan?: number;
    errorCodes?: string[];
    errorsLength?: number;
    errorsLengthGreaterThan?: number;
    warningsLengthGreaterThan?: number;
    parsedAddress?: Record<string, any>;
    parsedAddressNull?: boolean;
    firstErrorCode?: string;
    suggestionsLengthGreaterThan?: number;
    suggestionContains?: string;
  };
  options?: ValidationOptions;
}

interface IsValidTestCase {
  name: string;
  description?: string;
  input?: string | string[];
  expected?: boolean | boolean[];
  tests?: Array<{
    input: string;
    expected: boolean;
    options?: ValidationOptions;
  }>;
}

interface GetValidationErrorsTestCase {
  name: string;
  description?: string;
  input: string;
  expected: {
    errorsLengthGreaterThan?: number;
    allSeverityTypes?: string[];
    errorSeverityCount?: number;
    warningSeverityCount?: number;
    length?: number;
    errorCodes?: string[];
    errorsLength?: number;
    firstErrorCode?: string;
    errorMessages?: string[];
    hasErrors?: boolean;
    hasWarnings?: boolean;
    warningsLengthGreaterThan?: number;
    suggestionsLengthGreaterThan?: number;
    suggestionContains?: string;
  };
  options?: ValidationOptions;
}

interface ConfidenceScoringTestCase {
  name: string;
  description?: string;
  inputs?: {
    complete?: string;
    incomplete?: string;
    identical?: string[];
    different?: string[];
  };
  input?: string;
  expected: {
    confidenceComparison?: string;
    confidencesEqual?: boolean;
    confidencesDifferent?: boolean;
    confidence?: number | { min: number; max: number };
    confidenceGreaterThan?: number;
    completeness?: number | { min: number; max: number };
    completenessGreaterThan?: number;
    completenessLessThan?: number;
    isValid?: boolean;
    firstErrorCode?: string;
  };
  options?: ValidationOptions;
}

// ============================================================================
// Batch Parser Test Interfaces
// ============================================================================

interface BatchTestCase {
  id: number;
  name: string;
  description: string;
  addresses: string[];
  expectedSuccessCount: number;
  expectedFailureCount: number;
  testFunction: string;
  expectStats?: boolean;
}

interface BatchTestData {
  batchTests: BatchTestCase[];
}

interface BatchParseFunctionTestData {
  parseLocations: Array<{
    description: string;
    addresses: string[];
    expectedResults?: (ParsedAddress | null)[];
    expectedSuccessCount?: number;
    expectedFailureCount?: number;
  }>;
  parseAddresses: Array<{
    description: string;
    addresses: string[];
    expectedResults?: (ParsedAddress | null)[];
    expectedSuccessCount?: number;
    expectedFailureCount?: number;
  }>;
  parseInformalAddresses: Array<{
    description: string;
    addresses: string[];
    expectedResults?: (ParsedAddress | null)[];
    expectedSuccessCount?: number;
    expectedFailureCount?: number;
  }>;
  parseIntersections: Array<{
    description: string;
    addresses: string[];
    expectedResults?: (ParsedIntersection | null)[];
    expectedSuccessCount?: number;
    expectedFailureCount?: number;
  }>;
  options: Array<{
    description: string;
    addresses: string[];
    options?: BatchParseOptions;
    expectedResults?: (ParsedAddress | null)[];
    expectedSuccessCount?: number;
    expectedFailureCount?: number;
  }>;
}

interface AdvancedFunctionTestData {
  withStatistics: Array<{
    description: string;
    addresses: string[];
    options?: BatchParseOptions;
    expectedStats?: {
      total: number;
      successful: number;
      failed: number;
    };
    expectedErrors?: Array<{
      index: number;
      errorContains: string;
    }>;
    expectedResultsLength?: number;
  }>;
  performance: Array<{
    description: string;
    addresses?: string[];
    generateAddresses?: {
      count: number;
      template: string;
      startNumber: number;
    };
    expectedStats?: {
      total: number;
      successful: number;
      failed: number;
    };
    performanceExpectations?: {
      maxDurationMs: number;
      minAddressesPerSecond: number;
    };
  }>;
  edgeCases: Array<{
    description: string;
    addresses: (string | null)[];
    expectedStats?: {
      total: number;
      successful: number;
      failed: number;
    };
  }>;
  options: Array<{
    description: string;
    addresses: string[];
    options?: BatchParseOptions;
    expectedStats?: {
      total: number;
      successful: number;
      failed: number;
    };
    expectedErrors?: Array<{
      index: number;
      errorContains: string;
    }>;
    expectedResultsLength?: number;
    performanceExpectations?: {
      maxDurationMs: number;
      minAddressesPerSecond: number;
    };
  }>;
}

// ============================================================================
// Strict Mode Test Interfaces
// ============================================================================

interface PostalExpectedResult {
  zip: string | null;
  zipValid: boolean;
  plus4?: string;
}

interface StrictModeTestCase {
  description: string;
  input: string;
  expected: {
    strict?: PostalExpectedResult;
    permissive?: PostalExpectedResult;
    zip?: string;
    zipValid?: boolean;
    plus4?: string;
  };
}

interface StrictModeTestData {
  tests: StrictModeTestCase[] | { [key: string]: StrictModeTestCase[] | StrictModeTestCase };
}

// ============================================================================
// Compatibility Test Interfaces
// ============================================================================

interface CompatibilityComparisonTestCase {
  id: number;
  description: string;
  input: string;
  category: string;
}

interface SnakeCaseTestCase {
  description: string;
  input: string;
  options?: { useSnakeCase?: boolean };
  expected: Record<string, unknown> | null;
  notExpected?: string[];
}

interface AddressTestCase {
  description: string;
  input: string;
  expected: Record<string, unknown> | null;
}

interface MultipleParserTestCase {
  description: string;
  input: string;
  functions: string[];
  expectedResult: string;
}

interface KeyTestCase {
  description: string;
  input: string;
  purpose: string;
}

interface CompatibilityTestData {
  tests: {
    parseAddressComparison?: CompatibilityComparisonTestCase[];
    snakeCaseCompatibility?: SnakeCaseTestCase[];
    multipleParserFunctions?: MultipleParserTestCase[];
    usBasicAddresses?: AddressTestCase[];
    canadaBasicAddresses?: AddressTestCase[];
    intersections?: AddressTestCase[];
    usSpecialFormats?: AddressTestCase[];
  };
}

interface LegacyTestData {
  description: string;
  testCases: CompatibilityComparisonTestCase[];
  keyTestCase: KeyTestCase;
}

// ============================================================================
// Export all interfaces
// ============================================================================

export type {
  // Common
  BaseTestCase,
  TestCaseWithExpected,
  NamedTestCase,
  
  // Region Normalization
  RegionTestCase,
  FuzzyMatchTestCase,
  NullTestCase,
  
  // Postal Mappings
  PostalMappingTestCase,
  
  // Address Cleaning
  CleanAddressTestCase,
  CleanAddressDetailedTestCase,
  FormatSpecificTestCase,
  EdgeCaseTestCase,
  AdditionalTestCase,
  
  // Address Comparison
  ComparisonTestCase,
  SimilarityTestCase,
  ComparisonEdgeCaseTestCase,
  
  // Address Formatting
  FormattingTestCase,
  
  // Validation
  ValidationTestCase,
  IsValidTestCase,
  GetValidationErrorsTestCase,
  ConfidenceScoringTestCase,
  
  // Batch Parser
  BatchTestCase,
  BatchTestData,
  BatchParseFunctionTestData,
  AdvancedFunctionTestData,
  
  // Strict Mode
  PostalExpectedResult,
  StrictModeTestCase,
  StrictModeTestData,
  
  // Compatibility
  CompatibilityComparisonTestCase,
  SnakeCaseTestCase,
  AddressTestCase,
  MultipleParserTestCase,
  KeyTestCase,
  CompatibilityTestData,
  LegacyTestData,
};
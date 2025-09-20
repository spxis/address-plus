// Comprehensive type definitions for all test data structures
// This file provides strongly typed interfaces for test cases to replace any types

// Common interfaces for test case structures

// Region normalization interfaces
interface RegionResult {
  abbr: string;
  country: "CA" | "US";
}

interface RegionTestCase {
  input: string;
  expected: RegionResult;
  description: string;
}

interface RegionNullTestCase {
  input: string;
  description: string;
}

interface RegionTestData {
  abbreviationTests?: {
    cases: RegionTestCase[];
  };
  nameTests?: {
    cases: RegionTestCase[];
  };
  caseInsensitiveTests?: {
    cases: RegionTestCase[];
  };
  periodsTests?: {
    cases: RegionTestCase[];
  };
  fuzzyMatching?: RegionTestCase[];
  cases?: Array<RegionTestCase | RegionNullTestCase>;
}

// Postal mapping interfaces
interface PostalMappingTestCase {
  name: string;
  description: string;
  input: string;
  expected: string;
}

interface PostalMappingTestData {
  tests: {
    provinceMapping?: PostalMappingTestCase[];
    formatVariations?: PostalMappingTestCase[];
    invalidCases?: PostalMappingTestCase[];
  };
}

// Clean address interfaces
interface CleanAddressChange {
  type: string;
  from?: string;
  to?: string;
}

interface CleanAddressExpected {
  cleaned?: string;
  changes?: CleanAddressChange[];
}

interface CleanAddressTestCase {
  name: string;
  input: string;
  expected: string | CleanAddressExpected;
  expectContains?: string[];
  options?: Record<string, unknown>;
  description?: string;
}

interface CleanAddressTestData {
  tests: {
    cleanAddress?: CleanAddressTestCase[];
    cleanAddressDetailed?: CleanAddressTestCase[];
    formatSpecific?: CleanAddressTestCase[];
    edgeCases?: CleanAddressTestCase[];
    additionalTests?: CleanAddressTestCase[];
  };
}

// Address comparison interfaces
interface ComparisonExpected {
  similarity?: number;
  similarityLessThan?: number;
  isSame?: boolean;
  differences?: string[];
  comparison?: {
    score?: number;
  };
}

interface ComparisonInput {
  address1: string;
  address2: string;
  options?: Record<string, unknown>;
}

interface ComparisonTestCase {
  id?: string | number;
  name?: string;
  description: string;
  input: ComparisonInput;
  expected: ComparisonExpected;
  category?: string;
}

interface ComparisonTestData {
  tests: {
    compareAddresses?: ComparisonTestCase[];
    edgeCases?: ComparisonTestCase[];
  };
}

// Address formatting interfaces
interface FormattingExpected {
  lines?: string[];
  singleLine?: string;
  format?: string;
  country?: string;
  shouldContain?: string;
  shouldNotContain?: string;
  regex?: string;
  hasProperties?: string[];
  includesKey?: string;
  excludesKey?: string;
  streetTypes?: Record<string, unknown>;
  directions?: Record<string, unknown>;
  states?: Record<string, unknown>;
  provinces?: Record<string, unknown>;
  unitTypes?: Record<string, unknown>;
}

interface FormattingTestCase {
  id?: string | number;
  name?: string;
  description: string;
  input: string;
  expected: FormattingExpected;
  options?: Record<string, unknown>;
}

interface FormattingTestData {
  tests: {
    formatAddress?: FormattingTestCase[];
    formatUSPS?: FormattingTestCase[];
    formatCanadaPost?: FormattingTestCase[];
    getAddressAbbreviations?: FormattingTestCase[];
  };
}

// Validation interfaces
interface ValidationExpected {
  isValid?: boolean;
  confidence?: number;
  completeness?: number;
  parsedAddress?: Record<string, unknown>;
  errorCodes?: string[];
  suggestionContains?: string;
  allSeverityTypes?: string[];
  errorSeverityCount?: number;
}

interface ValidationInput {
  address?: string;
  addresses?: string[];
}

interface ValidationTest {
  input: string;
  options?: Record<string, unknown>;
  expected: boolean;
}

interface ValidationTestCase {
  name: string;
  description: string;
  input: ValidationInput | string;
  expected: ValidationExpected | boolean;
  options?: Record<string, unknown>;
  tests?: ValidationTest[];
}

interface ValidationTestData {
  tests: {
    validateAddress?: ValidationTestCase[];
    isValidAddress?: ValidationTestCase[];
    getValidationErrors?: ValidationTestCase[];
    confidenceScoring?: Array<{
      name: string;
      description: string;
      inputs: string[];
      expected: number[];
    }>;
  };
}

// Batch parser interfaces
interface BatchExpectedStats {
  total: number;
  successful: number;
  failed: number;
}

interface BatchExpectedError {
  index: number;
  errorContains: string;
}

interface BatchExpectedResult {
  number?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  [key: string]: unknown;
}

interface BatchPerformanceExpectations {
  maxDurationMs: number;
  minAddressesPerSecond: number;
}

interface BatchGenerateAddresses {
  count: number;
  template: string;
  startNumber: number;
}

interface SimpleFunctionTestCase {
  description: string;
  addresses: string[];
  expectedResults?: BatchExpectedResult[];
  options?: Record<string, unknown>;
}

interface AdvancedFunctionTestCase {
  description: string;
  addresses?: string[];
  generateAddresses?: BatchGenerateAddresses;
  options?: Record<string, unknown>;
  expectedStats?: BatchExpectedStats;
  expectedErrors?: BatchExpectedError[];
  expectedResultsLength?: number;
  performanceExpectations?: BatchPerformanceExpectations;
}

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

interface SimpleFunctionTestData {
  parseLocations?: SimpleFunctionTestCase[];
  parseAddresses?: SimpleFunctionTestCase[];
  parseInformalAddresses?: SimpleFunctionTestCase[];
  parseIntersections?: SimpleFunctionTestCase[];
}

interface AdvancedFunctionTestData {
  withStatistics: AdvancedFunctionTestCase[];
  performance: AdvancedFunctionTestCase[];
  edgeCases: Array<{
    description: string;
    addresses: (string | null)[];
    expectedStats?: BatchExpectedStats;
  }>;
  options: AdvancedFunctionTestCase[];
}

interface BatchTestData {
  description: string;
  batchTests: BatchTestCase[];
}

// Strict mode interfaces
interface PostalExpectedResult {
  zip: string | null;
  zipValid: boolean;
  plus4?: string;
}

interface StrictModeExpected {
  strict?: PostalExpectedResult;
  permissive?: PostalExpectedResult;
  zip?: string;
  zipValid?: boolean;
  plus4?: string;
}

interface StrictModeTestCase {
  description: string;
  address: string;
  expected: StrictModeExpected;
}

// Compatibility interfaces
interface ComparisonCompatibilityTestCase {
  id: number | string;
  description: string;
  input: string;
  category: string;
  purpose?: string;
}

interface SnakeCaseTestCase {
  description: string;
  input: string;
  expected: Record<string, unknown> | null;
  options?: Record<string, unknown>;
}

interface CompatibilityTestData {
  tests: {
    parseAddressComparison?: ComparisonCompatibilityTestCase[];
    snakeCaseCompatibility?: SnakeCaseTestCase[];
    multipleParserFunctions?: Array<{
      description: string;
      input: string;
      expected: Record<string, unknown>;
    }>;
    usBasicAddresses?: Array<{
      description: string;
      input: string;
      expected: Record<string, unknown>;
    }>;
    canadaBasicAddresses?: Array<{
      description: string;
      input: string;
      expected: Record<string, unknown>;
    }>;
    intersections?: Array<{
      description: string;
      input: string;
      expected: Record<string, unknown>;
    }>;
    usSpecialFormats?: Array<{
      description: string;
      input: string;
      expected: Record<string, unknown>;
    }>;
  };
}

// Parser test interfaces
interface ParserTestCase {
  description: string;
  input: string;
  expected: Record<string, unknown> | null;
  options?: Record<string, unknown>;
}

// Generic test data loader types
interface TestDataWithSchema<T = unknown> {
  $schema?: string;
  tests?: T;
  description?: string;
  name?: string;
}

// Export all types
export type {
  AdvancedFunctionTestCase,
  AdvancedFunctionTestData,
  BatchExpectedError,
  BatchExpectedResult,
  BatchExpectedStats,
  BatchGenerateAddresses,
  BatchPerformanceExpectations,
  BatchTestCase,
  BatchTestData,
  CleanAddressChange,
  CleanAddressExpected,
  CleanAddressTestCase,
  CleanAddressTestData,
  ComparisonCompatibilityTestCase,
  ComparisonExpected,
  ComparisonInput,
  ComparisonTestCase,
  ComparisonTestData,
  CompatibilityTestData,
  FormattingExpected,
  FormattingTestCase,
  FormattingTestData,
  ParserTestCase,
  PostalExpectedResult,
  PostalMappingTestCase,
  PostalMappingTestData,
  RegionNullTestCase,
  RegionResult,
  RegionTestCase,
  RegionTestData,
  SimpleFunctionTestCase,
  SimpleFunctionTestData,
  SnakeCaseTestCase,
  StrictModeExpected,
  StrictModeTestCase,
  TestDataWithSchema,
  ValidationExpected,
  ValidationInput,
  ValidationTest,
  ValidationTestCase,
  ValidationTestData,
};
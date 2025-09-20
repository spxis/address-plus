// Schema definitions for JSON test case files
// Provides type safety and consistency for all test data structures

// Base schema for individual test cases
interface TestCaseBase {
  name?: string; // Human-readable name or description of what this test case validates
  description?: string; // Human-readable description of what this test case validates (alternative to name)
  input: any; // The input data for the test
  expected: any; // The expected output/result of the test
  options?: Record<string, any>; // Optional configuration or parsing options for the test
}

// Schema for test case files with grouped test categories
interface TestFileSchema {
  description?: string; // Optional description of the entire test file's purpose
  [categoryName: string]: TestCaseBase[] | string | undefined; // Test cases organized by category/group name
}

// Address parsing test cases
interface AddressParsingTestCase extends TestCaseBase {
  input: string; // Input address string to parse
  expected: {
    number?: string;
    prefix?: string;
    street?: string;
    type?: string;
    suffix?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    [key: string]: any;
  }; // Expected parsed address components
  options?: {
    strict?: boolean;
    country?: string;
    [key: string]: any;
  }; // Optional parsing configuration
}

// Address formatting test cases
interface AddressFormattingTestCase extends TestCaseBase {
  input: string; // Input address to format
  expected: string; // Expected formatted address string
  options?: {
    format?: string;
    abbreviate?: boolean;
    [key: string]: any;
  }; // Optional formatting configuration
}

// Address validation test cases
interface AddressValidationTestCase extends TestCaseBase {
  input: string; // Input address string to validate
  expected: {
    isValid: boolean;
    confidence?: number;
    completeness?: number;
    errors?: string[];
    warnings?: string[];
    [key: string]: any;
  }; // Expected validation results
}

// Address comparison test cases
interface AddressComparisonTestCase extends TestCaseBase {
  input: {
    address1: string;
    address2: string;
  }; // Two addresses to compare
  expected: {
    isSame?: boolean;
    similarity?: number;
    differences?: string[];
    [key: string]: any;
  }; // Expected comparison results
}

// Clean address test cases
interface CleanAddressTestCase extends TestCaseBase {
  input: string; // Input address string to clean
  expected: {
    cleaned: string;
    changes?: string[];
    [key: string]: any;
  }; // Expected cleaned address and changes
  options?: {
    format?: string;
    abbreviate?: boolean;
    [key: string]: any;
  }; // Optional cleaning configuration
}

// Batch processing test cases
interface BatchProcessingTestCase extends TestCaseBase {
  input: string[]; // Array of input addresses
  expected: {
    results?: any[];
    statistics?: {
      total: number;
      successful: number;
      failed: number;
    };
    errors?: Array<{
      index: number;
      error: string;
    }>;
    [key: string]: any;
  }; // Expected batch processing results
}

// Union type for all test cases
type TestCase =
  | AddressParsingTestCase
  | AddressFormattingTestCase
  | AddressValidationTestCase
  | AddressComparisonTestCase
  | CleanAddressTestCase
  | BatchProcessingTestCase;

// Helper type for extracting test categories from file schema
type TestCategory<T extends TestFileSchema> = {
  [K in keyof T]: T[K] extends TestCase[] ? K : never;
}[keyof T];

// Validation function for test file schema
function validateTestFile(data: any): data is TestFileSchema {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  // Handle array format (direct array of test cases)
  if (Array.isArray(data)) {
    return data.every((item: any) => validateTestCase(item));
  }

  // Handle object format - recursively check for test case arrays
  function hasValidTestCases(obj: any, depth: number = 0): boolean {
    if (typeof obj !== "object" || obj === null || depth > 5) {
      return false;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (key === "description" || key === "name") {
        continue; // Skip metadata fields
      }

      if (Array.isArray(value)) {
        // Check if this array contains valid test cases
        if (value.length > 0) {
          // Allow arrays that are mostly test cases (80% threshold)
          const validTestCases = value.filter((item: any) => validateTestCase(item));

          if (validTestCases.length >= Math.max(1, value.length * 0.8)) {
            return true;
          }
        }
      } else if (typeof value === "object" && value !== null) {
        // Recursively check nested objects
        if (hasValidTestCases(value, depth + 1)) {
          return true;
        }
      }
    }

    return false;
  }

  return hasValidTestCases(data);
}

// Validation function for individual test cases
function validateTestCase(data: any): data is TestCase {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  // Must have either name or description (but allow for very simple cases)
  if (
    !("name" in data) &&
    !("description" in data) &&
    !("input" in data) &&
    !("address" in data) &&
    !("addresses" in data)
  ) {
    return false;
  }

  // Must have some form of input or be a metadata container
  const hasInput = "input" in data || "address" in data || "addresses" in data;

  // Allow metadata objects that don't have input but have description/name
  const isMetadata = ("description" in data || "name" in data) && !hasInput;

  if (!hasInput && !isMetadata) {
    return false;
  }

  // If it has input, it should have some form of expected output
  if (hasInput) {
    const hasExpected =
      "expected" in data ||
      "expectedResult" in data ||
      "expectedResults" in data ||
      "expectedSuccessCount" in data ||
      "expectedFailureCount" in data ||
      "category" in data ||
      "id" in data;

    if (!hasExpected) {
      return false;
    }
  }

  // name/description must be string if present
  if ("name" in data && typeof data.name !== "string") {
    return false;
  }

  if ("description" in data && typeof data.description !== "string") {
    return false;
  }

  // options must be object if present
  if ("options" in data && (typeof data.options !== "object" || data.options === null)) {
    return false;
  }

  return true;
}

export type {
  AddressComparisonTestCase,
  AddressFormattingTestCase,
  AddressParsingTestCase,
  AddressValidationTestCase,
  BatchProcessingTestCase,
  CleanAddressTestCase,
  TestCase,
  TestCaseBase,
  TestCategory,
  TestFileSchema,
};

export { validateTestCase, validateTestFile };

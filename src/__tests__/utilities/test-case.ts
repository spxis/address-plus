// Types for test case data structures
// Provides interfaces for region normalization testing
// Covers both successful normalization and edge cases that should return null

// Expected result for region normalization
interface ExpectedResult {
  abbr: string; // Region abbreviation (e.g., "CA", "NY")
  country: "CA" | "US"; // Country code
}

// A single test case for region normalization
interface RegionTestCase {
  input: string; // Input string to test
  expected: ExpectedResult; // Expected normalized result
  description?: string; // Optional description of what this test case covers
}

// Collection of test cases organized by category
interface RegionTestSuite {
  name: string; // Test suite name
  description: string; // Description of what this test suite covers
  cases: RegionTestCase[]; // Array of test cases
}

// Edge case test where we expect null result
interface EdgeTestCase {
  input: string; // Input string to test
  description: string; // Description of why this should return null
}

// Collection of edge case tests
interface EdgeTestSuite {
  name: string; // Test suite name
  description: string; // Description of what this test suite covers
  cases: EdgeTestCase[]; // Array of edge test cases (all expect null)
}

export type { EdgeTestCase, EdgeTestSuite, ExpectedResult, RegionTestCase, RegionTestSuite };

/**
 * Types for test case data structures
 */

/**
 * Expected result for region normalization
 */
export interface ExpectedResult {
  abbr: string;
  country: "CA" | "US";
}

/**
 * A single test case for region normalization
 */
export interface RegionTestCase {
  /** Input string to test */
  input: string;
  /** Expected normalized result */
  expected: ExpectedResult;
  /** Optional description of what this test case covers */
  description?: string;
}

/**
 * Collection of test cases organized by category
 */
export interface RegionTestSuite {
  /** Test suite name */
  name: string;
  /** Description of what this test suite covers */
  description: string;
  /** Array of test cases */
  cases: RegionTestCase[];
}

/**
 * Edge case test where we expect null result
 */
export interface EdgeTestCase {
  /** Input string to test */
  input: string;
  /** Description of why this should return null */
  description: string;
}

/**
 * Collection of edge case tests
 */
export interface EdgeTestSuite {
  /** Test suite name */
  name: string;
  /** Description of what this test suite covers */
  description: string;
  /** Array of edge test cases (all expect null) */
  cases: EdgeTestCase[];
}
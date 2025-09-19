/**
 * Test data loader utilities
 */

import fs from "fs";
import path from "path";

import type { 
  EdgeTestSuite, 
  RegionTestCase,
  RegionTestSuite,
} from "./test-case.js";

// Constants for test data paths
const TEST_DATA_ROOT_PATH = "test-data";
const REGIONS_PATH = "regions";
const CANADA_PATH = "canada";

/**
 * Structure for exact match test data
 */
interface ExactMatchData {
  name: string;
  description: string;
  abbreviationTests: {
    name: string;
    description: string;
    cases: RegionTestCase[];
  };
  nameTests: {
    name: string;
    description: string;
    cases: RegionTestCase[];
  };
  caseInsensitiveTests: {
    name: string;
    description: string;
    cases: RegionTestCase[];
  };
  periodsTests: {
    name: string;
    description: string;
    cases: RegionTestCase[];
  };
}

/**
 * Structure for edge case test data
 */
interface EdgeCaseData {
  name: string;
  description: string;
  nullCases: Array<{
    input: string;
    description: string;
  }>;
  whitespaceTests: RegionTestCase[];
  priorityTests: RegionTestCase[];
}

/**
 * Structure for postal code province mapping test data
 */
interface PostalCodeProvinceTestData {
  name: string;
  description: string;
  provinceMapping: Array<{
    input: string;
    expected: string;
    description: string;
  }>;
  formatVariations: Array<{
    input: string;
    expected: string;
    description: string;
  }>;
  invalidCases: Array<{
    input: string;
    expected: null;
    description: string;
  }>;
}

/**
 * Load JSON test data from file
 */
function loadTestData<T>(filePath: string): T {
  const fullPath = path.join(process.cwd(), filePath);
  const rawData = fs.readFileSync(fullPath, "utf-8");

  return JSON.parse(rawData) as T;
}

/**
 * Load US states fuzzy matching test cases
 */
function loadUSStatesFuzzyTests(): RegionTestSuite {
  const filePath = path.join(TEST_DATA_ROOT_PATH, REGIONS_PATH, "us-states-fuzzy.json");

  return loadTestData<RegionTestSuite>(filePath);
}

/**
 * Load Canadian provinces fuzzy matching test cases
 */
function loadCanadianProvincesFuzzyTests(): RegionTestSuite {
  const filePath = path.join(TEST_DATA_ROOT_PATH, REGIONS_PATH, "ca-provinces-fuzzy.json");

  return loadTestData<RegionTestSuite>(filePath);
}

/**
 * Load exact match test cases
 */
function loadExactMatchTests(): ExactMatchData {
  const filePath = path.join(TEST_DATA_ROOT_PATH, REGIONS_PATH, "exact-match-cases.json");

  return loadTestData<ExactMatchData>(filePath);
}

/**
 * Load edge case test data
 */
function loadEdgeCases(): EdgeCaseData {
  const filePath = path.join(TEST_DATA_ROOT_PATH, REGIONS_PATH, "edge-cases.json");

  return loadTestData<EdgeCaseData>(filePath);
}

/**
 * Load postal code province mapping test data
 */
function loadPostalCodeProvinceTests(): PostalCodeProvinceTestData {
  const filePath = path.join(TEST_DATA_ROOT_PATH, CANADA_PATH, "postal-code-provinces.json");

  return loadTestData<PostalCodeProvinceTestData>(filePath);
}

export { 
  loadCanadianProvincesFuzzyTests, 
  loadEdgeCases, 
  loadExactMatchTests, 
  loadPostalCodeProvinceTests, 
  loadUSStatesFuzzyTests 
};
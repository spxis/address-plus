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
 * Load JSON test data from file
 */
function loadTestData<T>(filename: string): T {
  const testDataPath = path.join(process.cwd(), "test-data", "regions", filename);
  const rawData = fs.readFileSync(testDataPath, "utf-8");
  
  return JSON.parse(rawData) as T;
}

/**
 * Load US states fuzzy matching test cases
 */
export function loadUSStatesFuzzyTests(): RegionTestSuite {
  return loadTestData<RegionTestSuite>("us-states-fuzzy.json");
}

/**
 * Load Canadian provinces fuzzy matching test cases
 */
export function loadCanadianProvincesFuzzyTests(): RegionTestSuite {
  return loadTestData<RegionTestSuite>("ca-provinces-fuzzy.json");
}

/**
 * Load exact match test cases
 */
export function loadExactMatchTests(): ExactMatchData {
  return loadTestData<ExactMatchData>("exact-match-cases.json");
}

/**
 * Load edge case test data
 */
export function loadEdgeCases(): EdgeCaseData {
  return loadTestData<EdgeCaseData>("edge-cases.json");
}
import { readFileSync } from "fs";
import { join } from "path";
import { parseIntersection, parseLocation } from "./dist/index.js";

function loadTestData(country, filename) {
  const filePath = join("./test-data", country, filename);
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  if (Array.isArray(data)) return data;
  const firstKey = Object.keys(data).find((key) => key !== "description");
  return firstKey ? data[firstKey] || [] : [];
}

function testJsonFile(country, filename, useIntersection = false) {
  try {
    const tests = loadTestData(country, filename);
    let failed = 0;
    let passed = 0;

    tests.forEach((testCase) => {
      try {
        const result = useIntersection ? parseIntersection(testCase.input) : parseLocation(testCase.input);
        if (!result) {
          failed++;
          return;
        }

        if (testCase.expected) {
          let hasFailure = false;
          Object.keys(testCase.expected).forEach((key) => {
            if (result[key] !== testCase.expected[key]) {
              hasFailure = true;
            }
          });
          if (hasFailure) failed++;
          else passed++;
        } else {
          passed++;
        }
      } catch (e) {
        failed++;
      }
    });

    return {
      filename,
      failed,
      passed,
      total: tests.length,
      failureRate: tests.length > 0 ? ((failed / tests.length) * 100).toFixed(1) : 0,
    };
  } catch (e) {
    return { filename, failed: 0, passed: 0, total: 0, failureRate: 0, error: e.message };
  }
}

// Test all files
const usFiles = [
  "basic.json",
  "compatibility.json",
  "edge-cases.json",
  "facilities.json",
  "famous-edge.json",
  "famous.json",
  "intersections.json",
  "special.json",
  "units-and-boxes.json",
  "unusual-types.json",
];
const canadaFiles = [
  "basic.json",
  "edge-cases.json",
  "facilities.json",
  "famous-edge.json",
  "famous.json",
  "special-postal.json",
  "special.json",
];

console.log("=== US JSON Files (ordered by failure count) ===");
const usResults = usFiles.map((file) => {
  const useIntersection = file === "intersections.json";
  return testJsonFile("us", file, useIntersection);
});

usResults.sort((a, b) => b.failed - a.failed);
usResults.forEach((result) => {
  if (result.error) {
    console.log(`${result.filename}: Error - ${result.error}`);
  } else {
    console.log(
      `${result.filename}: ${result.failed} failed, ${result.passed} passed (${result.total} total, ${result.failureRate}% failure rate)`,
    );
  }
});

console.log("\n=== Canada JSON Files (ordered by failure count) ===");
const canadaResults = canadaFiles.map((file) => testJsonFile("canada", file));

canadaResults.sort((a, b) => b.failed - a.failed);
canadaResults.forEach((result) => {
  if (result.error) {
    console.log(`${result.filename}: Error - ${result.error}`);
  } else {
    console.log(
      `${result.filename}: ${result.failed} failed, ${result.passed} passed (${result.total} total, ${result.failureRate}% failure rate)`,
    );
  }
});

#!/usr/bin/env node

// Test tracking script for monitoring test counts and regressions
// Programmatically extracts test results from Vitest JSON output

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_FILE = join(__dirname, "test-results.json");

function runTests() {
  try {
    console.log("Running tests and extracting results programmatically...");
    const jsonOutput = execSync("pnpm test:run --reporter=json", {
      encoding: "utf8",
      stdio: "pipe",
    });

    try {
      console.log("Parsing JSON output...");

      // Extract JSON from pnpm output - look for the line that starts with {
      const lines = jsonOutput.split("\n");
      const jsonLine = lines.find((line) => line.trim().startsWith("{"));

      if (!jsonLine) {
        throw new Error("No JSON line found in output");
      }

      const testResults = JSON.parse(jsonLine);

      if (testResults && typeof testResults.numTotalTests === "number") {
        const totalTests = testResults.numTotalTests;
        const passedTests = testResults.numPassedTests || 0;
        const failedTests = testResults.numFailedTests || 0;

        console.log(
          `Total Tests: ${totalTests}, Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%), Failed: ${failedTests}`,
        );

        return {
          total: totalTests,
          passed: passedTests,
          failed: failedTests,
          percentage: ((passedTests / totalTests) * 100).toFixed(1),
        };
      } else {
        console.log("Invalid JSON structure, missing numTotalTests");
        console.log("JSON keys:", Object.keys(testResults));
        throw new Error("Invalid JSON structure");
      }
    } catch (jsonError) {
      console.log("JSON parsing failed:", jsonError.message);
      console.log("Output preview:", jsonOutput.substring(0, 200) + "...");
      return parseTextOutput(jsonOutput);
    }
  } catch (error) {
    console.error("Error running tests:", error.message);
    return null;
  }
}

function parseTextOutput(output) {
  // Fallback text parsing method - scan for Vitest summary patterns
  const lines = output.split("\n");

  // Look for various Vitest output patterns
  for (const line of lines) {
    // Pattern: "Tests  928 passed (928)"
    let match = line.match(/Tests\s+(\d+)\s+passed\s*\((\d+)\)/);
    if (match) {
      const total = parseInt(match[1]);
      const passed = parseInt(match[2]);
      const failed = total - passed;

      console.log(
        `Total Tests: ${total}, Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%), Failed: ${failed}`,
      );
      return {
        total: total,
        passed: passed,
        failed: failed,
        percentage: ((passed / total) * 100).toFixed(1),
      };
    }

    // Pattern: " ✓ 928 tests passed"
    match = line.match(/✓\s+(\d+)\s+tests?\s+passed/);
    if (match) {
      const passed = parseInt(match[1]);
      console.log(`Total Tests: ${passed}, Passed: ${passed} (100.0%), Failed: 0`);
      return {
        total: passed,
        passed: passed,
        failed: 0,
        percentage: "100.0",
      };
    }
  }

  console.log("Could not parse test results from output");
  return {
    total: 0,
    passed: 0,
    failed: 0,
    percentage: "0.0",
  };
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getBaselineFailures() {
  if (existsSync(RESULTS_FILE)) {
    try {
      const data = JSON.parse(readFileSync(RESULTS_FILE, "utf8"));
      return data.regressionAnalysis?.baseline || 0;
    } catch (error) {
      console.warn("Could not read baseline from test results, using default");
      return 0;
    }
  }
  return 0;
}

function analyzeRegression(currentFailures, previousFailures) {
  const regressionCount = currentFailures - previousFailures;

  if (regressionCount > 0) {
    return {
      status: "REGRESSION",
      count: regressionCount,
      message: `REGRESSION DETECTED: ${regressionCount} additional test failures!`,
    };
  } else if (regressionCount < 0) {
    return {
      status: "IMPROVEMENT",
      count: Math.abs(regressionCount),
      message: `IMPROVEMENT: ${Math.abs(regressionCount)} fewer test failures!`,
    };
  } else {
    // No change - different messages based on current state
    if (currentFailures === 0) {
      return {
        status: "STABLE",
        count: 0,
        message: "All tests passing - maintaining 100% success rate",
      };
    } else {
      return {
        status: "STABLE",
        count: 0,
        message: "No regression detected - test results stable",
      };
    }
  }
}

function updateTestResults(testData) {
  if (!testData) {
    console.error("No test data to update");
    return;
  }

  const { failed, passed, total, percentage } = testData;

  // Read previous results if they exist
  let previousFailures = 0;
  let isFirstRun = true;

  if (existsSync(RESULTS_FILE)) {
    try {
      const prevData = JSON.parse(readFileSync(RESULTS_FILE, "utf8"));
      previousFailures = prevData.testSummary.failed || 0;
      isFirstRun = false;
    } catch (error) {
      console.warn("Could not read previous test results, treating as first run");
    }
  }

  // For first run, use old baseline if it exists, otherwise compare to 0
  const comparisonBase = isFirstRun ? getBaselineFailures() : previousFailures;
  const regression = analyzeRegression(failed, comparisonBase);

  const results = {
    testSummary: {
      timestamp: getCurrentTimestamp(),
      totalTests: total,
      passed: passed,
      failed: failed,
      passRate: `${percentage}%`,
      regressionStatus: regression.status,
      previousBest: Math.min(failed, comparisonBase),
      regressionCount: regression.count,
    },
    regressionAnalysis: {
      baseline: comparisonBase,
      current: failed,
      change: failed - comparisonBase,
      message: regression.message,
    },
    lastUpdated: getCurrentTimestamp(),
    gitCommit: getGitCommit(),
  };

  // Write results to file
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  // Output results
  console.log("\n" + "=".repeat(60));
  console.log("TEST RESULTS SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} (${percentage}%)`);
  console.log(`Failed: ${failed}`);
  console.log(`Baseline: ${comparisonBase} failures`);
  console.log(regression.message);
  console.log("=".repeat(60));

  // Exit with error code if regression detected
  if (regression.status === "REGRESSION") {
    console.error("\nCOMMIT BLOCKED: Regression detected!");
    console.error(`You must fix the ${regression.count} additional failing tests before committing.`);
    process.exit(1);
  }

  console.log("\nTest tracking updated successfully");
  return results;
}

function getGitCommit() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

// Main execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const testData = runTests();
  updateTestResults(testData);
}

export { analyzeRegression, runTests, updateTestResults };

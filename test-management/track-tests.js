#!/usr/bin/env node

/**
 * Test tracking script to monitor regressions
 * Automatically updates test-results.json with latest test results
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_RESULTS_FILE = join(__dirname, 'test-results.json');

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getBaselineFailures() {
  const DEFAULT_BASELINE = 54; // Fallback if no previous results exist
  
  if (existsSync(TEST_RESULTS_FILE)) {
    try {
      const data = JSON.parse(readFileSync(TEST_RESULTS_FILE, 'utf8'));
      return data.regressionAnalysis?.baseline || DEFAULT_BASELINE;
    } catch (error) {
      console.warn('Could not read baseline from test results, using default');
      return DEFAULT_BASELINE;
    }
  }
  
  return DEFAULT_BASELINE;
}

function runTests() {
  try {
    console.log('Running tests to check for regressions...');
    const output = execSync('pnpm test:run', { encoding: 'utf8', stdio: 'pipe' });

    // Parse test output to extract numbers - look for the "Tests" line specifically (not "Test Files")
    const testResultMatch = output.match(
      /Tests\s+(\d+)\s+failed\s*\|\s*(\d+)\s+passed\s*\((\d+)\)/
    );

    if (testResultMatch) {
      const failed = parseInt(testResultMatch[1]);
      const passed = parseInt(testResultMatch[2]);
      const total = parseInt(testResultMatch[3]);
      return { failed, passed, total, output };
    }

    // Fallback to original parsing if new format not found
    const failedMatch = output.match(/(\d+)\s+failed/);
    const passedMatch = output.match(/(\d+)\s+passed/);

    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const total = failed + passed;

    return { failed, passed, total, output };
  } catch (error) {
    // Tests failed - extract numbers from error output
    const output = error.stdout || error.message;

    // Look for the "Tests" line specifically (not "Test Files")
    const testResultMatch = output.match(
      /Tests\s+(\d+)\s+failed\s*\|\s*(\d+)\s+passed\s*\((\d+)\)/
    );

    if (testResultMatch) {
      const failed = parseInt(testResultMatch[1]);
      const passed = parseInt(testResultMatch[2]);
      const total = parseInt(testResultMatch[3]);
      return { failed, passed, total, output };
    }

    // Fallback parsing
    const failedMatch = output.match(/(\d+)\s+failed/);
    const passedMatch = output.match(/(\d+)\s+passed/);

    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const total = failed + passed;

    return { failed, passed, total, output };
  }
}
function analyzeRegression(currentFailures, previousFailures) {
  const regressionCount = currentFailures - previousFailures;

  if (regressionCount > 0) {
    return {
      status: 'REGRESSION',
      count: regressionCount,
      message: `⚠️  REGRESSION DETECTED: ${regressionCount} additional test failures!`,
    };
  } else if (regressionCount < 0) {
    return {
      status: 'IMPROVEMENT',
      count: Math.abs(regressionCount),
      message: `✅ IMPROVEMENT: ${Math.abs(regressionCount)} fewer test failures!`,
    };
  } else {
    return {
      status: 'STABLE',
      count: 0,
      message: '✅ No regression detected - test results stable',
    };
  }
}

function updateTestResults(testData) {
  const { failed, passed, total } = testData;
  const passRate = ((passed / total) * 100).toFixed(2);
  const baselineFailures = getBaselineFailures();

  // Read previous results if they exist
  let previousBest = baselineFailures;
  if (existsSync(TEST_RESULTS_FILE)) {
    try {
      const prevData = JSON.parse(readFileSync(TEST_RESULTS_FILE, 'utf8'));
      previousBest = prevData.testSummary.previousBest || baselineFailures;

      // Update previousBest if we've improved
      if (failed < previousBest) {
        previousBest = failed;
      }
    } catch (error) {
      console.warn('Could not read previous test results, using baseline');
    }
  }
  const regression = analyzeRegression(failed, baselineFailures);

  const results = {
    testSummary: {
      timestamp: getCurrentTimestamp(),
      totalTests: total,
      passed: passed,
      failed: failed,
      passRate: `${passRate}%`,
      regressionStatus: regression.status,
      previousBest: previousBest,
      regressionCount: regression.count,
    },
    regressionAnalysis: {
      baseline: baselineFailures,
      current: failed,
      change: failed - baselineFailures,
      message: regression.message,
    },
    lastUpdated: getCurrentTimestamp(),
    gitCommit: getGitCommit(),
  };

  // Write results to file
  writeFileSync(TEST_RESULTS_FILE, JSON.stringify(results, null, 2));

  // Output results
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} (${passRate}%)`);
  console.log(`Failed: ${failed}`);
  console.log(`Baseline: ${baselineFailures} failures`);
  console.log(regression.message);
  console.log('='.repeat(60));

  // Exit with error code if regression detected
  if (regression.status === 'REGRESSION') {
    console.error('\n❌ COMMIT BLOCKED: Regression detected!');
    console.error(
      `You must fix the ${regression.count} additional failing tests before committing.`
    );
    process.exit(1);
  }

  console.log('\n✅ Test tracking updated successfully');
  return results;
}

function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

// Main execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const testData = runTests();
  updateTestResults(testData);
}

export { runTests, updateTestResults, analyzeRegression };

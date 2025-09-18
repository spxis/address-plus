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
const BASELINE_FAILURES = 160;

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function runTests() {
  try {
    console.log('Running tests to check for regressions...');
    const output = execSync('pnpm test:run', { encoding: 'utf8', stdio: 'pipe' });

    // Parse test output to extract numbers
    const failedMatch = output.match(/(\d+)\s+failed/);
    const passedMatch = output.match(/(\d+)\s+passed/);

    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const total = failed + passed;

    return { failed, passed, total, output };
  } catch (error) {
    // Tests failed - extract numbers from error output
    const output = error.stdout || error.message;
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

  // Read previous results if they exist
  let previousBest = BASELINE_FAILURES;
  if (existsSync(TEST_RESULTS_FILE)) {
    try {
      const prevData = JSON.parse(readFileSync(TEST_RESULTS_FILE, 'utf8'));
      previousBest = prevData.testSummary.previousBest || BASELINE_FAILURES;

      // Update previousBest if we've improved
      if (failed < previousBest) {
        previousBest = failed;
      }
    } catch (error) {
      console.warn('Could not read previous test results, using baseline');
    }
  }
  const regression = analyzeRegression(failed, BASELINE_FAILURES);

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
      baseline: BASELINE_FAILURES,
      current: failed,
      change: failed - BASELINE_FAILURES,
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
  console.log(`Baseline: ${BASELINE_FAILURES} failures`);
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

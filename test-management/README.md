# Test Management

This directory contains files related to test tracking and analysis.

## Files

- **track-tests.js** - Main test tracking script that monitors test regressions and updates baseline
- **test-results.json** - Current test results and regression analysis data  
- **test-output.json** - Detailed test output from latest run

## Usage

The track-tests.js script is automatically run by the git pre-commit hook to prevent regressions.

You can also run it manually:
```bash
node test-management/track-tests.js
```

Or using the package.json scripts:
```bash
pnpm test:track
pnpm test:regression
```

## How it Works

1. Runs the full test suite via `pnpm test:run`
2. Parses test output to extract pass/fail counts
3. Reads baseline from `test-results.json`
4. Compares current results against baseline
5. Updates `test-results.json` with latest results
6. Blocks commits if regressions are detected
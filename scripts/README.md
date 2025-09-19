# Development Scripts

This directory contains utility scripts for development, debugging, and maintenance.

## Files

- **analyze-json-failures.js** - Analyzes test failures in JSON test data files
- **debug-directional.js** - Debug script for directional address parsing issues
- **debug-patterns.js** - Debug script for address pattern parsing
- **update-test-expectations.cjs** - Updates test expectations based on actual parser output

## Usage

Most scripts can be run directly with Node.js:

```bash
# Analyze test failures
node scripts/analyze-json-failures.js

# Debug directional patterns
node scripts/debug-directional.js

# Debug general patterns  
node scripts/debug-patterns.js

# Update test expectations
node scripts/update-test-expectations.cjs
```

Note: Some scripts may require the project to be built first (`pnpm build`).
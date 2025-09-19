# Development Scripts

This directory contains utility scripts for development, debugging, and maintenance.

## Sub-regions Data Pipeline

The `sub-regions/` directory contains a modular TypeScript pipeline for automatically fetching, normalizing, and merging authoritative sub-region data for both the United States and Canada.

### Overview

The pipeline consists of three main scripts:

1. **`fetch-us-sub-regions.ts`** - Queries the US Census Bureau's TIGER/Line Places API
2. **`fetch-ca-sub-regions.ts`** - Pulls from Statistics Canada's Standard Geographical Classification dataset
3. **`update-sub-regions.ts`** - Orchestrates both fetchers, normalizes, deduplicates, and generates output

### Usage

```bash
# Run the complete pipeline (recommended)
pnpm run update:sub-regions

# Or run directly with tsx
npx tsx scripts/sub-regions/update-sub-regions.ts
```

### What it does

- **Fetches comprehensive data**: Collects boroughs, parishes, districts, quadrants, and other administrative subdivisions
- **Handles bilingual names**: Processes both English and French names for Canadian sub-regions
- **Validates and deduplicates**: Ensures data quality and removes duplicates with intelligent priority rules
- **Generates optimized output**: Creates TypeScript files with lookup maps and filtered collections for performance
- **Provides statistics**: Reports on data coverage and type distribution

### Output

The pipeline generates `src/data/sub-regions.ts` containing:

- `ALL_SUB_REGIONS` - Complete array of all sub-regions
- `SUB_REGION_NAMES` - Set for fast lookup
- `SUB_REGION_MAP` - Map for detailed lookup
- Country-specific collections (`US_SUB_REGIONS`, `CA_SUB_REGIONS`)
- Type-specific collections (`BOROUGHS`, `PARISHES`, `DISTRICTS`, etc.)

### Data Sources

**US Data:**

- US Census Bureau TIGER/Line Places API
- Covers all 50 states plus DC and territories
- Includes incorporated places and census designated places
- Rate-limited to be respectful to the API

**Canadian Data:**

- Statistics Canada Standard Geographical Classification (primary)
- Hardcoded fallback for major metropolitan areas
- Handles bilingual names and special cases like Montreal arrondissements

### Features

- **Error handling**: Graceful fallbacks and detailed logging
- **Rate limiting**: Respectful API usage with configurable delays
- **Type detection**: Smart pattern matching for administrative types
- **Parent city mapping**: Links sub-regions to major metropolitan areas
- **Validation**: Comprehensive data quality checks
- **ES module compatible**: Uses modern JavaScript standards

### Maintenance

The pipeline should be run periodically to keep sub-region data current:

- **Monthly**: For active development
- **Quarterly**: For stable releases
- **After major census updates**: When new official data is released

### Dependencies

- `node-fetch` - For HTTP requests to data APIs
- `csv-parse` - For parsing CSV data from Statistics Canada
- `@types/node-fetch` - TypeScript types for node-fetch

## Other Development Scripts

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

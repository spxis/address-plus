#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

function getAllJsonFiles(dir) {
  const files = [];
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllJsonFiles(fullPath));
    } else if (item.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

function convertArrayToObjectStructure(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    // Skip if already has correct structure or missing tests
    if (!data.tests || (typeof data.tests === "object" && !Array.isArray(data.tests))) {
      return false;
    }

    // Skip if tests is not an array
    if (!Array.isArray(data.tests)) {
      return false;
    }

    // Convert tests array to object with appropriate category name
    const categoryName = getCategoryName(filePath);
    data.tests = {
      [categoryName]: data.tests,
    };

    // Write back to file
    writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`✅ Converted ${filePath} to use '${categoryName}' category`);
    return true;
  } catch (error) {
    console.error(`❌ Error converting ${filePath}:`, error.message);
    return false;
  }
}

function getCategoryName(filePath) {
  const filename = filePath.split("/").pop().replace(".json", "");

  // Map common patterns to meaningful category names
  const categoryMap = {
    basic: "basic",
    "edge-cases": "edgeCases",
    facilities: "facilities",
    famous: "famous",
    "famous-edge": "famousEdge",
    "null-cases": "nullCases",
    "postal-code-provinces": "postalCodeMapping",
    "special-postal": "specialPostal",
    special: "special",
    "strict-mode": "strictMode",
    compatibility: "compatibility",
    intersections: "intersections",
    "units-and-boxes": "unitsAndBoxes",
    "unusual-types": "unusualTypes",
    "us-states-fuzzy": "fuzzyMatching",
    "ca-provinces-fuzzy": "fuzzyMatching",
    "exact-match-cases": "exactMatches",
    "schema-example": "examples",
  };

  return categoryMap[filename] || "cases";
}

// Main execution
const testDataDir = "test-data";
const jsonFiles = getAllJsonFiles(testDataDir);

console.log(`🔍 Found ${jsonFiles.length} JSON files to check for conversion\n`);

let converted = 0;
for (const file of jsonFiles) {
  if (convertArrayToObjectStructure(file)) {
    converted++;
  }
}

console.log(`\n✨ Converted ${converted} files to object-of-arrays structure`);

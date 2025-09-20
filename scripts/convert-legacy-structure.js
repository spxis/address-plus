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

function convertLegacyStructure(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    // Skip if already has tests property
    if (data.tests) {
      return false;
    }

    // Skip if only has name, description, $schema
    const keys = Object.keys(data).filter((key) => !["$schema", "name", "description"].includes(key));
    if (keys.length === 0) {
      return false;
    }

    // Wrap all non-metadata properties in a tests object
    const tests = {};
    for (const key of keys) {
      tests[key] = data[key];
      delete data[key];
    }

    data.tests = tests;

    // Write back to file
    writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
    console.log(`Converted ${filePath} - wrapped properties: ${Object.keys(tests).join(", ")}`);
    return true;
  } catch (error) {
    console.error(`Error converting ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const testDataDir = "test-data";
const jsonFiles = getAllJsonFiles(testDataDir);

console.log(`Found ${jsonFiles.length} JSON files to check for legacy structure conversion\n`);

let converted = 0;
for (const file of jsonFiles) {
  if (convertLegacyStructure(file)) {
    converted++;
  }
}

console.log(`\n✨ Converted ${converted} files from legacy structure to tests wrapper`);

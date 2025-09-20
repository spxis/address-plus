#!/usr/bin/env node

// JSON Schema validation script for test files
// Uses proper pnpm dependencies as specified in AGENTS.md

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync, statSync } from "fs";
import { extname, join, relative } from "path";

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  loadSchema: false, // Don't try to load remote schemas
  strict: false, // Be more lenient with schema validation
});
addFormats(ajv);

// Load our unified schema
const testFileSchema = JSON.parse(readFileSync("schemas/test-file.json", "utf-8"));

// Remove $schema property that causes issues
delete testFileSchema.$schema;

// Add schema to ajv
ajv.addSchema(testFileSchema, "test-file.json");

function getAllJsonFiles(dir) {
  const files = [];

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllJsonFiles(fullPath));
    } else if (extname(item) === ".json" && !item.startsWith(".")) {
      files.push(fullPath);
    }
  }

  return files;
}

function validateJsonFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    // All files must have explicit $schema property
    if (data.$schema) {
      // All files should reference test-file.json now
      const validate = ajv.getSchema("test-file.json");

      if (validate) {
        const valid = validate(data);
        return {
          valid,
          errors: validate.errors || [],
          schema: "test-file.json",
        };
      }
    }

    // No $schema property found
    return {
      valid: false,
      errors: [
        {
          message: "No $schema property found. All test files must have explicit $schema property.",
        },
      ],
      schema: "missing",
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{ message: `JSON parsing error: ${error.message}` }],
      schema: "parse-error",
    };
  }
}

function main() {
  console.log("Validating JSON test files with schema...\n");

  const testDataDir = "test-data";
  const jsonFiles = getAllJsonFiles(testDataDir);

  console.log(`Found ${jsonFiles.length} JSON files to validate\n`);

  const results = [];

  for (const file of jsonFiles) {
    const relativePath = relative(process.cwd(), file);
    const result = validateJsonFile(file);

    results.push({ file: relativePath, ...result });

    if (result.valid) {
      console.log(`Valid: ${relativePath} (${result.schema})`);
    } else {
      console.log(`Invalid: ${relativePath} (${result.schema})`);
      if (result.errors.length > 0) {
        result.errors.slice(0, 3).forEach((error) => {
          console.log(`   • ${error.instancePath || "root"}: ${error.message}`);
        });
        if (result.errors.length > 3) {
          console.log(`   • ... and ${result.errors.length - 3} more errors`);
        }
      }
    }
  }

  console.log("\nVALIDATION SUMMARY");
  console.log("=====================================");

  const validFiles = results.filter((r) => r.valid).length;
  const invalidFiles = results.length - validFiles;
  const withSchema = results.filter((r) => r.schema.includes("$schema") || r.schema.includes("auto-detected")).length;
  const withoutSchema = results.filter((r) => r.schema === "unknown").length;

  console.log(`Total files: ${results.length}`);
  console.log(`Valid: ${validFiles}`);
  console.log(`Invalid: ${invalidFiles}`);
  console.log(`With $schema: ${withSchema}`);
  console.log(`Without $schema: ${withoutSchema}`);

  if (invalidFiles > 0) {
    console.log("\nSome files failed schema validation");
    process.exit(1);
  } else {
    console.log("\nAll JSON test files pass schema validation");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/",
      "node_modules/",
      "coverage/",
      "test-management/",
      "scripts/*.js",
      "site/",
      "test-results/",
      "playwright-report/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
    },
  },
  { files: ["scripts/validate-schemas.js", "scripts/**/*.ts"], languageOptions: { globals: { console: "readonly", process: "readonly", fetch: "readonly", Buffer: "readonly" } } },
  // The demo page runs in a browser, its build scripts and browser tests in Node with code that runs in the page.
  {
    files: ["demo/**/*.js", "e2e/**/*.mjs", "scripts/*.mjs", "playwright.config.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        document: "readonly",
        familyLanguage: "readonly",
        getComputedStyle: "readonly",
        Node: "readonly",
        URL: "readonly",
        window: "readonly",
      },
    },
  },
);

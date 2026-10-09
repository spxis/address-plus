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
      "scripts/scripts/",
      "scripts/src/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Japanese text is full of the ideographic space (U+3000), in regular expressions and in examples, on purpose.
    files: ["src/jp/**/*.ts", "src/constants/jp/**/*.ts", "src/__tests__/japan/**/*.ts", "scripts/jp/**/*.ts"],
    rules: {
      "no-irregular-whitespace": [
        "error",
        { skipComments: true, skipRegExps: true, skipStrings: true, skipTemplates: true },
      ],
    },
  },
  {
    files: ["scripts/validate-schemas.js", "scripts/**/*.ts"],
    languageOptions: { globals: { console: "readonly", process: "readonly", fetch: "readonly", Buffer: "readonly" } },
  },
);

---
applyTo: "**/*.{ts,tsx,js,jsx}"
---

# Coding Conventions for Copilot Agent

## Module Structure

- **Use ES Modules exclusively** - no CommonJS (`require`/`module.exports`).
- All files must use `import` and `export` statements.
- Imports must appear at the top of the file.
  - Group external packages first, then internal modules.
  - Use `import/order` with `newlines-between: always` and alphabetize imports.
- Exports must be placed at the end of the file.
  - Enforce `exports/eof` rule when active.
- Avoid parent-relative imports (`../..`) — use `@` alias instead.

## Sorting & Organization

- Use `eslint-plugin-perfectionist` to sort:
  - Imports, exports, named imports
  - Variable declarations, object keys/types
  - JSX props, enums, interfaces, classes
- Use `prettier-plugin-organize-imports` to auto-format import blocks.

## Formatting Rules

- Indentation: 2 spaces, no tabs.
- Quotes: Use double quotes (`"`) for strings and props.
- Trailing commas: Required in multiline structures.
- Arrow functions: Always include parentheses.
- Brackets: Use spacing inside object literals.
- Line padding:
  - Add blank lines before `return` statements.
  - Add blank lines after variable declarations.
- Max line length: 120 characters.
- No multiple empty lines: Max 1, none at BOF/EOF.

## Comment Style & Documentation

- **Use concise `//` single-line comments** instead of JSDoc blocks (`/** */`) for brevity.
- **Never use emoji, icons, or symbols** in comments, documentation, or any text output.
- Place comments above the code they describe, not inline unless necessary.
- For interfaces and types, use inline comments after properties: `property: string; // Description`
- For multi-line explanations, use multiple single-line comments:
  ```typescript
  // This function handles complex address parsing logic
  // It normalizes input and extracts components systematically
  // Returns null if the input cannot be parsed
  function parseAddress(input: string): ParsedAddress | null;
  ```
- Avoid redundant comments that simply restate the code.
- Focus on explaining **why** something is done, not **what** is being done.

## TypeScript Rules

- Use `@typescript-eslint` parser and plugin.
- Avoid `any` unless explicitly allowed.
- Use consistent type imports.
- **All props, state, and function signatures must be explicitly typed.**
- **Add explicit types for variables when type inference is not clear.**
- **Function parameters and return types must be explicitly declared.**
- Use PascalCase, camelCase, or UPPER_CASE for variables.
- Prefix unused parameters with `_` to satisfy lint rules.
- Prefer async/await over `.then()` chains.
- Use type annotations for better code clarity: `const result: ParsedAddress = parseLocation(input);`

## Naming & Readability

- Do not use short or cryptic variable names like `x`, `y`, `tmp`, or `val`.
- All constants and variables must be descriptive and reflect their purpose.
- Use meaningful names for functions, parameters, and return values.

## UI Text & Accessibility

- **Never use emoji, icons, or visual symbols** in any user-facing text, console output, or documentation.
- Centralize all user-facing strings (e.g., labels, titles, ARIA attributes) at the top of the file.
- Do not inline text in JSX or props.
- Use semantic HTML and ARIA roles/labels where appropriate.
- Ensure keyboard accessibility and screen-reader compatibility.

## Constants & Configuration

- Declare static arrays (e.g., dropdown options, filters) at the top of the file.
- Declare all URLs (API endpoints, external links) as constants at the top.
- Reference constants throughout the component to ensure DRY code.
- **Use descriptive constant names and group related constants together.**
- **Export constants from dedicated files in `src/data/` for reusability.**

## Data Architecture

- **Use scalable data structures** for geographic and regional data.
- **Create comprehensive lookup sets and maps** for fast searching (e.g., `SUB_REGION_NAMES`, `SUB_REGION_MAP`).
- **Maintain backward compatibility** when updating data structures.
- **Group related data types** in structured interfaces with proper typing.
- **Use enum-like patterns** for standardized values (countries, regions, etc.).

## JSX Style

- Prefer one-liner JSX when elements fit within 132 characters.
- Break into multiple lines only when readability improves.

## Testing

- Cover all branches and error cases.
- Use mocks for dependencies and mock before importing the module under test.
- **ALL test data MUST be stored in JSON files in the `/test-data/` folder - NO hardcoded test data inline in test files.**
- **Import JSON test data constants at the top of test files, immediately after other imports.**
- **Organize test data JSON files in appropriate subfolders within `/test-data/` (e.g., `/test-data/formatting/`, `/test-data/parsing/`).**
- **Use descriptive names for JSON test data files without redundant suffixes (e.g., `address-formatting.json`, not `address-formatting-test-data.json`).**

## Package Management

- **Always use `pnpm`** instead of `npm` or `yarn` for this project.
- Run tests with: `pnpm test` or `pnpm run test:run`
- Build with: `pnpm build`
- Install dependencies with: `pnpm install`
- The project is configured for pnpm (see `package.json` prepublishOnly script)

## Prompting Behavior

- If a preference is not listed here, ask for clarification before generating code.
- **When refactoring existing code, maintain backward compatibility unless explicitly asked to break it.**
- **Always verify changes don't break existing functionality by running tests.**
- **Use systematic approach when updating multiple files** - work through them methodically.
- **Prioritize code clarity and maintainability** over brevity when they conflict.

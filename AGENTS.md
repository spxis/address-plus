---
applyTo: '**/*.{ts,tsx,js,jsx}'
---

# Coding Conventions for Copilot Agent

## Module Structure

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

## TypeScript Rules

- Use `@typescript-eslint` parser and plugin.
- Avoid `any` unless explicitly allowed.
- Use consistent type imports.
- All props, state, and function signatures must be explicitly typed.
- Use PascalCase, camelCase, or UPPER_CASE for variables.
- Prefix unused parameters with `_` to satisfy lint rules.
- Prefer async/await over `.then()` chains.

## Naming & Readability

- Do not use short or cryptic variable names like `x`, `y`, `tmp`, or `val`.
- All constants and variables must be descriptive and reflect their purpose.
- Use meaningful names for functions, parameters, and return values.

## UI Text & Accessibility

- Centralize all user-facing strings (e.g., labels, titles, ARIA attributes) at the top of the file.
- Do not inline text in JSX or props.
- Use semantic HTML and ARIA roles/labels where appropriate.
- Ensure keyboard accessibility and screen-reader compatibility.

## Constants & Configuration

- Declare static arrays (e.g., dropdown options, filters) at the top of the file.
- Declare all URLs (API endpoints, external links) as constants at the top.
- Reference constants throughout the component to ensure DRY code.

## JSX Style

- Prefer one-liner JSX when elements fit within 132 characters.
- Break into multiple lines only when readability improves.

## Testing

- Cover all branches and error cases.
- Use mocks for dependencies and mock before importing the module under test.

## Package Management

- **Always use `pnpm`** instead of `npm` or `yarn` for this project.
- Run tests with: `pnpm test` or `pnpm run test:run`
- Build with: `pnpm build`
- Install dependencies with: `pnpm install`
- The project is configured for pnpm (see `package.json` prepublishOnly script)

## Prompting Behavior

- If a preference is not listed here, ask for clarification before generating code.

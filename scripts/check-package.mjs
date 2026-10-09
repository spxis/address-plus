/**
 * Proves the built package works the way a user gets it: `pnpm test:package` (after `pnpm build`).
 *
 * It packs the package, installs the tarball into a temporary project, and checks that
 *   - require() and import of the main entry both work and expose parseLocation;
 *   - the ./jp entry works from both and exposes parseJapaneseAddress;
 *   - the types of both entries resolve under the Node16 and bundler module resolutions;
 *   - the ./jp bundle, and every chunk it loads, carries none of the US street-type tables, so a Japan-only user does
 *     not ship them.
 *
 * It prints what it proved and exits non-zero on the first failure.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const PACKAGE_NAME = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).name;
// A word only the US street-type tables carry; the Japan entry has no use for it.
const US_ONLY_WORD = "boulevard";

const proved = [];

function fail(message) {
  console.error(`test:package FAILED: ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

function run(command, args, cwd) {
  try {
    return execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ?? ""}`.trim();
    return fail(`${command} ${args.join(" ")}\n${output}`);
  }
}

function prove(claim) {
  proved.push(claim);
  console.log(`  ok  ${claim}`);
}

// The relative files a built module loads: static imports, re-exports and require() calls.
function localImports(source) {
  const found = new Set();
  const pattern = /(?:from\s*|import\s*|require\()\s*["'](\.{1,2}\/[^"']+)["']/g;
  for (const match of source.matchAll(pattern)) found.add(match[1]);
  return [...found];
}

// Every file reachable from an entry through relative imports.
function reachableFiles(entry) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const target of localImports(readFileSync(file, "utf8"))) queue.push(resolve(dirname(file), target));
  }
  return [...seen];
}

function checkEntry(project, entry, exportName) {
  const specifier = entry === "." ? PACKAGE_NAME : `${PACKAGE_NAME}/${entry.slice(2)}`;
  const esm = run(
    "node",
    [
      "--input-type=module",
      "-e",
      `const m = await import(${JSON.stringify(specifier)}); console.log(typeof m.${exportName});`,
    ],
    project,
  );
  if (esm !== "function") fail(`import("${specifier}") does not expose ${exportName} (got ${esm})`);
  prove(`import("${specifier}") exposes ${exportName}`);

  const cjs = run("node", ["-e", `console.log(typeof require(${JSON.stringify(specifier)}).${exportName});`], project);
  if (cjs !== "function") fail(`require("${specifier}") does not expose ${exportName} (got ${cjs})`);
  prove(`require("${specifier}") exposes ${exportName}`);
}

function checkTypes(project) {
  writeFileSync(
    join(project, "types.ts"),
    [
      `import { parseLocation, type ParsedAddress } from "${PACKAGE_NAME}";`,
      `import { parseJapaneseAddress } from "${PACKAGE_NAME}/jp";`,
      "",
      "const us: ParsedAddress | null = parseLocation('1600 Pennsylvania Avenue NW, Washington, DC 20500');",
      "const jp = parseJapaneseAddress('東京都千代田区千代田1-1');",
      "console.log(us, jp);",
      "",
    ].join("\n"),
  );
  const tsc = join(root, "node_modules", "typescript", "bin", "tsc");
  for (const resolution of ["node16", "bundler"]) {
    const options = resolution === "node16" ? ["--module", "node16"] : ["--module", "esnext"];
    run(
      "node",
      [
        tsc,
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "--target",
        "es2022",
        ...options,
        "--moduleResolution",
        resolution,
        "types.ts",
      ],
      project,
    );
    prove(`types of both entry points resolve with moduleResolution ${resolution}`);
  }
}

function checkJpBundle(installed) {
  for (const file of ["dist/jp/index.js", "dist/jp/index.cjs"]) {
    const entry = join(installed, file);
    if (!existsSync(entry)) fail(`${file} is missing from the packed package`);
    const files = reachableFiles(entry);
    for (const reached of files) {
      if (readFileSync(reached, "utf8").toLowerCase().includes(US_ONLY_WORD)) {
        fail(
          `${file} carries the US street-type tables: "${US_ONLY_WORD}" appears in ${reached.slice(installed.length + 1)}`,
        );
      }
    }
    prove(`${file} and the ${files.length - 1} file(s) it loads carry no US street-type tables`);
  }
}

function main() {
  for (const file of [
    "dist/index.js",
    "dist/index.cjs",
    "dist/index.d.ts",
    "dist/jp/index.js",
    "dist/jp/index.cjs",
    "dist/jp/index.d.ts",
  ]) {
    if (!existsSync(join(root, file))) fail(`${file} does not exist; run pnpm build first`);
  }

  const scratch = mkdtempSync(join(tmpdir(), "address-plus-package-"));
  try {
    const packs = join(scratch, "packs");
    const project = join(scratch, "project");
    mkdirSync(packs);
    mkdirSync(project);

    console.log("Packing and installing the package in a temporary project");
    run("pnpm", ["pack", "--pack-destination", packs], root);
    const tarball = readdirSync(packs).find((name) => name.endsWith(".tgz"));
    if (!tarball) return fail("pnpm pack produced no tarball");
    writeFileSync(
      join(project, "package.json"),
      JSON.stringify({ name: "check-package", private: true, type: "module" }),
    );
    run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", join(packs, tarball)], project);
    prove(`the packed ${tarball} installs`);

    checkEntry(project, ".", "parseLocation");
    checkEntry(project, "./jp", "parseJapaneseAddress");
    checkTypes(project);
    checkJpBundle(join(project, "node_modules", ...PACKAGE_NAME.split("/")));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }

  console.log(`\ntest:package passed: ${proved.length} things proved about the packed package.`);
}

try {
  main();
} catch {
  // fail() has already printed the reason and set the exit code.
}

// Writes docs/api.md, the API reference as Markdown: the same reference the demo site serves as api.html, made from
// the source, with every function's example run against the built package. `pnpm docs:make` builds the package first
// if it has not been built.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import process from "node:process";

import { apiMarkdown, apiOf, runExamples } from "./api.mjs";

if (!existsSync("dist/index.js")) {
  const built = spawnSync("pnpm", ["build"], { stdio: "inherit", shell: process.platform === "win32" });
  if (built.status !== 0) process.exit(built.status ?? 1);
}
const api = apiOf();
const examples = await runExamples(api);
mkdirSync("docs", { recursive: true });
writeFileSync("docs/api.md", apiMarkdown(api, examples));
console.log("docs/api.md is written.");

/**
 * Cuts a release: `pnpm release <version>`.
 *
 * Sets the version in package.json, moves the changelog's `## Unreleased` section under `## <version> - <date>`,
 * commits as `chore(release): <version>` and creates the annotated tag `v<version>`. It pushes nothing; pushing the tag
 * starts `.github/workflows/release.yml`.
 *
 * It refuses a dirty tree, a branch other than main, an empty Unreleased section, and a version that is not greater
 * than the current one.
 *
 * `node scripts/release.mjs --notes <version>` prints that version's changelog section, which the workflow uses as the
 * GitHub release notes.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_FILE = "package.json";
const CHANGELOG_FILE = "CHANGELOG.md";
const UNRELEASED = "Unreleased";

// The pattern from semver.org, without build metadata, which a published version should not carry.
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?$/;

function isSemver(version) {
  return SEMVER.test(version);
}

// Orders two versions by semver precedence: negative when a comes first, positive when b does.
function compareSemver(a, b) {
  const [, ...pa] = SEMVER.exec(a) ?? [];
  const [, ...pb] = SEMVER.exec(b) ?? [];
  if (pa.length === 0 || pb.length === 0) throw new Error(`Not a semver version: ${pa.length ? b : a}`);
  for (let i = 0; i < 3; i++) {
    const diff = Number(pa[i]) - Number(pb[i]);
    if (diff !== 0) return diff;
  }
  const preA = pa[3];
  const preB = pb[3];
  // A version without a prerelease part is greater than the same version with one.
  if (preA === undefined || preB === undefined) return (preA === undefined ? 1 : 0) - (preB === undefined ? 1 : 0);
  const idsA = preA.split(".");
  const idsB = preB.split(".");
  for (let i = 0; i < Math.max(idsA.length, idsB.length); i++) {
    const x = idsA[i];
    const y = idsB[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (x === y) continue;
    const numX = /^\d+$/.test(x);
    const numY = /^\d+$/.test(y);
    if (numX && numY) return Number(x) - Number(y);
    if (numX !== numY) return numX ? -1 : 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

// Replaces the top-level "version" of a package.json, keeping the rest of the file exactly as it was.
function setPackageVersion(text, version) {
  const pattern = /^( {2}"version":\s*")[^"]*(")/m;
  if (!pattern.test(text)) throw new Error('No top-level "version" field found');
  const next = text.replace(pattern, `$1${version}$2`);
  if (JSON.parse(next).version !== version) throw new Error("Could not set the version");
  return next;
}

// Finds a `## <title>` heading and the extent of its section, up to the next `## ` heading.
function findSection(lines, title) {
  const start = lines.findIndex((line) => line === `## ${title}` || line.startsWith(`## ${title} `));
  if (start === -1) return undefined;
  const next = lines.findIndex((line, i) => i > start && line.startsWith("## "));
  return { start, bodyStart: start + 1, end: next === -1 ? lines.length : next };
}

function trimBlankLines(lines) {
  let first = 0;
  let last = lines.length;
  while (first < last && lines[first].trim() === "") first++;
  while (last > first && lines[last - 1].trim() === "") last--;
  return lines.slice(first, last);
}

// The body of a version's changelog section, without its heading; throws when the section is missing or empty.
function changelogSection(text, version) {
  const lines = text.split("\n");
  const section = findSection(lines, version);
  if (!section) throw new Error(`CHANGELOG.md has no "## ${version}" section`);
  const body = trimBlankLines(lines.slice(section.bodyStart, section.end));
  if (body.length === 0) throw new Error(`The "## ${version}" section of CHANGELOG.md is empty`);
  return `${body.join("\n")}\n`;
}

// Moves the Unreleased entries under `## <version> - <date>` and leaves an empty Unreleased section above them.
function releaseChangelog(text, version, date) {
  const lines = text.split("\n");
  if (findSection(lines, version)) throw new Error(`CHANGELOG.md already has a "## ${version}" section`);
  const section = findSection(lines, UNRELEASED);
  if (!section) throw new Error(`CHANGELOG.md has no "## ${UNRELEASED}" section`);
  const body = trimBlankLines(lines.slice(section.bodyStart, section.end));
  if (body.length === 0) throw new Error(`The "## ${UNRELEASED}" section of CHANGELOG.md is empty; nothing to release`);
  const released = [`## ${UNRELEASED}`, "", `## ${version} - ${date}`, "", ...body];
  const rest = lines.slice(section.end);
  return [...lines.slice(0, section.start), ...released, ...(rest.length ? ["", ...rest] : [""])].join("\n");
}

// Today's date in the releaser's time zone, as YYYY-MM-DD.
function today(now = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function currentVersion(root) {
  return JSON.parse(readFileSync(join(root, PACKAGE_FILE), "utf8")).version;
}

// Writes the new version into package.json and the changelog under root; returns the files it changed.
function applyRelease(root, version, date) {
  const current = currentVersion(root);
  if (!isSemver(version)) throw new Error(`"${version}" is not a valid semver version, such as 1.2.0`);
  if (compareSemver(version, current) <= 0) throw new Error(`${version} is not greater than the current ${current}`);
  const edits = new Map([
    [PACKAGE_FILE, setPackageVersion(readFileSync(join(root, PACKAGE_FILE), "utf8"), version)],
    [CHANGELOG_FILE, releaseChangelog(readFileSync(join(root, CHANGELOG_FILE), "utf8"), version, date)],
  ]);
  // Every edit is prepared before any is written, so a refusal leaves the tree untouched.
  for (const [file, text] of edits) writeFileSync(join(root, file), text);
  return [...edits.keys()];
}

function git(root, ...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function release(root, version) {
  if (git(root, "status", "--porcelain") !== "") throw new Error("The working tree has changes; commit them first");
  const branch = git(root, "rev-parse", "--abbrev-ref", "HEAD");
  if (branch !== "main") throw new Error(`Releases are cut from main, not ${branch}`);
  const tag = `v${version}`;
  if (git(root, "tag", "--list", tag) !== "") throw new Error(`The tag ${tag} already exists`);

  const files = applyRelease(root, version, today());
  git(root, "add", ...files);
  git(root, "commit", "--quiet", "-m", `chore(release): ${version}`);
  git(root, "tag", "--annotate", tag, "-m", version);

  console.log(`Committed chore(release): ${version} and tagged ${tag}. Push both to publish:\n`);
  console.log("  git push origin main");
  console.log(`  git push origin ${tag}`);
}

function main(args) {
  const root = fileURLToPath(new URL("..", import.meta.url));
  if (args[0] === "--notes" && args[1]) {
    process.stdout.write(changelogSection(readFileSync(join(root, CHANGELOG_FILE), "utf8"), args[1]));
    return;
  }
  const version = args[0]?.replace(/^v/, "");
  if (!version || args.length !== 1) {
    console.error("Usage: pnpm release <version>   (for example pnpm release 1.2.0)");
    process.exit(2);
  }
  release(root, version);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`release: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

export {
  applyRelease,
  changelogSection,
  compareSemver,
  currentVersion,
  isSemver,
  release,
  releaseChangelog,
  setPackageVersion,
  today,
};

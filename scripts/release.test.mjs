// Tests for scripts/release.mjs. They work on temporary files and never read the real CHANGELOG.md.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyRelease,
  changelogSection,
  compareSemver,
  isSemver,
  release,
  releaseChangelog,
  setPackageVersion,
  today,
} from "./release.mjs";

const CHANGELOG = `# Changelog

All notable changes are listed here.

## Unreleased

### Added

- Japanese addresses.

### Fixed

- A thing.

## 1.1.0 - 2026-10-09

### Added

- Postal codes know their region.

## 1.0.0 - 2026-09-01

- First release.
`;

const PACKAGE = `{
  "name": "example",
  "version": "1.1.0",
  "scripts": {}
}
`;

describe("semver", () => {
  it("accepts plain and prerelease versions and rejects the rest", () => {
    expect(isSemver("1.2.3")).toBe(true);
    expect(isSemver("1.2.3-beta.1")).toBe(true);
    expect(isSemver("1.2")).toBe(false);
    expect(isSemver("01.2.3")).toBe(false);
    expect(isSemver("v1.2.3")).toBe(false);
  });

  it("orders versions by precedence", () => {
    expect(compareSemver("1.2.0", "1.1.9")).toBeGreaterThan(0);
    expect(compareSemver("1.10.0", "1.9.0")).toBeGreaterThan(0);
    expect(compareSemver("1.0.0", "1.0.0")).toBe(0);
    expect(compareSemver("1.0.0-rc.1", "1.0.0")).toBeLessThan(0);
    expect(compareSemver("1.0.0-alpha.2", "1.0.0-alpha.10")).toBeLessThan(0);
  });
});

describe("setPackageVersion", () => {
  it("changes only the version", () => {
    expect(setPackageVersion(PACKAGE, "1.2.0")).toBe(PACKAGE.replace("1.1.0", "1.2.0"));
  });
});

describe("changelogSection", () => {
  it("returns the body of a version, without its heading", () => {
    expect(changelogSection(CHANGELOG, "1.1.0")).toBe("### Added\n\n- Postal codes know their region.\n");
  });

  it("returns the last section too", () => {
    expect(changelogSection(CHANGELOG, "1.0.0")).toBe("- First release.\n");
  });

  it("refuses a missing or empty section", () => {
    expect(() => changelogSection(CHANGELOG, "9.9.9")).toThrow('no "## 9.9.9" section');
    expect(() => changelogSection("## 2.0.0 - 2026-01-01\n\n## 1.0.0 - 2025-01-01\n- x\n", "2.0.0")).toThrow("empty");
  });
});

describe("releaseChangelog", () => {
  it("moves the Unreleased entries under the new version and leaves Unreleased empty", () => {
    const next = releaseChangelog(CHANGELOG, "1.2.0", "2026-10-10");
    expect(next).toContain("## Unreleased\n\n## 1.2.0 - 2026-10-10\n\n### Added\n\n- Japanese addresses.");
    expect(next).toContain("- A thing.\n\n## 1.1.0 - 2026-10-09");
    expect(changelogSection(next, "1.2.0")).toBe("### Added\n\n- Japanese addresses.\n\n### Fixed\n\n- A thing.\n");
    expect(next.startsWith("# Changelog\n\nAll notable changes are listed here.\n\n## Unreleased")).toBe(true);
  });

  it("refuses an empty Unreleased section", () => {
    const empty = CHANGELOG.replace(/## Unreleased[\s\S]*?(?=## 1\.1\.0)/, "## Unreleased\n\n");
    expect(() => releaseChangelog(empty, "1.2.0", "2026-10-10")).toThrow("nothing to release");
  });

  it("refuses a version that already has a section", () => {
    expect(() => releaseChangelog(CHANGELOG, "1.1.0", "2026-10-10")).toThrow("already has");
  });

  it("works when Unreleased is the last section", () => {
    const next = releaseChangelog("# Changelog\n\n## Unreleased\n\n- x\n", "1.0.0", "2026-10-10");
    expect(next).toBe("# Changelog\n\n## Unreleased\n\n## 1.0.0 - 2026-10-10\n\n- x\n");
  });
});

describe("applyRelease", () => {
  let root;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "address-plus-release-"));
    writeFileSync(join(root, "package.json"), PACKAGE);
    writeFileSync(join(root, "CHANGELOG.md"), CHANGELOG);
  });

  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("writes the version and the changelog", () => {
    expect(applyRelease(root, "1.2.0", "2026-10-10")).toEqual(["package.json", "CHANGELOG.md"]);
    expect(JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version).toBe("1.2.0");
    expect(readFileSync(join(root, "CHANGELOG.md"), "utf8")).toContain("## 1.2.0 - 2026-10-10");
  });

  it("refuses a version that is not greater, and writes nothing", () => {
    expect(() => applyRelease(root, "1.1.0", "2026-10-10")).toThrow("not greater");
    expect(() => applyRelease(root, "1.0.5", "2026-10-10")).toThrow("not greater");
    expect(() => applyRelease(root, "not-a-version", "2026-10-10")).toThrow("not a valid semver");
    expect(readFileSync(join(root, "package.json"), "utf8")).toBe(PACKAGE);
    expect(readFileSync(join(root, "CHANGELOG.md"), "utf8")).toBe(CHANGELOG);
  });

  it("leaves package.json alone when the changelog refuses", () => {
    writeFileSync(join(root, "CHANGELOG.md"), "# Changelog\n\n## Unreleased\n\n");
    expect(() => applyRelease(root, "1.2.0", "2026-10-10")).toThrow("nothing to release");
    expect(readFileSync(join(root, "package.json"), "utf8")).toBe(PACKAGE);
  });
});

describe("release", () => {
  let root;
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "address-plus-release-git-"));
    git("init", "--quiet", "--initial-branch=main");
    git("config", "user.name", "Test");
    git("config", "user.email", "test@example.test");
    git("config", "commit.gpgsign", "false");
    git("config", "tag.gpgsign", "false");
    writeFileSync(join(root, "package.json"), PACKAGE);
    writeFileSync(join(root, "CHANGELOG.md"), CHANGELOG);
    git("add", ".");
    git("commit", "--quiet", "-m", "start");
  });

  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("commits chore(release) and tags the version", () => {
    release(root, "1.2.0");
    expect(git("log", "-1", "--format=%s")).toBe("chore(release): 1.2.0");
    expect(git("tag", "--list")).toBe("v1.2.0");
    expect(git("status", "--porcelain")).toBe("");
  });

  it("refuses a dirty tree", () => {
    writeFileSync(join(root, "stray.txt"), "x");
    expect(() => release(root, "1.2.0")).toThrow("working tree has changes");
  });

  it("refuses a branch other than main", () => {
    git("switch", "--quiet", "-c", "feature");
    expect(() => release(root, "1.2.0")).toThrow("not feature");
  });

  it("refuses a version that is not greater and tags nothing", () => {
    expect(() => release(root, "1.1.0")).toThrow("not greater");
    expect(git("tag", "--list")).toBe("");
  });
});

describe("today", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(today(new Date(2026, 9, 9))).toBe("2026-10-09");
  });
});

// The API reference, made from the source: every export of every entry point in package.json, with its
// signature and its comment, read with the TypeScript compiler the package is built with, and for every
// function one example, run against the built package so the answer printed beside it is the real one.
// `apiOf()` is the data; `apiPage()` is the page the demo site serves as api.html; `apiMarkdown()` is the
// same reference as docs/api.md. A dev-only tool: the package itself does not depend on it.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

import { FAMILY, FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

// The family template is shared byte for byte and lists its members; address-plus is not on that list yet,
// so it is added here, for this build only, rather than by editing the shared file.
export const MEMBER = { id: "address-plus", name: "Address Plus", kana: "アドレスプラス" };
if (!FAMILY.some((one) => one.id === MEMBER.id)) FAMILY.push(MEMBER);

/** The data: URI of the page's icon: an envelope on the family's green. */
export const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Crect x='20' y='28' width='60' height='44' rx='5' fill='none' stroke='%23f3efe4' stroke-width='5'/%3E%3Cpath d='M22 31 50 54 78 31' fill='none' stroke='%23f3efe4' stroke-width='5' stroke-linejoin='round'/%3E%3C/svg%3E";

// One example for every function, as code a reader could paste. The last line is the expression whose value is
// shown; any lines before it set things up. Each is run against dist/index.js when the site is built.
export const EXAMPLES = {
  default: `parser.parseLocation("123 Main St, New York, NY 10001").zip`,
  buildRegexFromDict: `buildRegexFromDict({ street: "St", avenue: "Ave" }).test("avenue")`,
  capitalizeStreetName: `capitalizeStreetName("o'brien")`,
  capitalizeWords: `capitalizeWords("new york city")`,
  cleanAddress: `cleanAddress("350 FIFTH AVENUE, NEW YORK, NY 10118")`,
  cleanAddressDetailed: `cleanAddressDetailed("742 evergreen terrace,springfield ,  il 62704")`,
  compareAddresses: `compareAddresses(parseLocation("123 Main Street, Anytown, NY 12345"), parseLocation("123 Main St, Anytown, New York 12345")).matchType`,
  detectCountry: `detectCountry({ zip: "M5H 2N2" })`,
  findMunicipalitiesByRomaji: `findMunicipalitiesByRomaji("Chiyoda", "13").map((one) => one.name)`,
  findMunicipalityByCode: `findMunicipalityByCode("13101")`,
  findPrefecture: `findPrefecture("Osaka")`,
  formatAddress: `formatAddress(parseLocation("123 Main Street, Anytown, NY 12345")).singleLine`,
  formatCanadaPost: `formatCanadaPost(parseLocation("100 Queen Street West, Toronto, Ontario M5H 2N2")).lines`,
  formatJapanese: `formatJapanese(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { blockStyle: "markers" })`,
  formatJapaneseEnglish: `formatJapaneseEnglish(parseLocation("1-2-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005"))`,
  formatUSPS: `formatUSPS(parseLocation("123 Main Street Apt 4, Anytown, NY 12345")).lines`,
  getAddressAbbreviations: `getAddressAbbreviations().streetTypes.avenue`,
  getAddressSimilarity: `getAddressSimilarity(parseLocation("123 Main Street, Anytown, NY 12345"), parseLocation("125 Main Street, Anytown, NY 12345")).differences`,
  getPostalPrefixesForPrefecture: `getPostalPrefixesForPrefecture("47")`,
  getPostalPrefixesForProvince: `getPostalPrefixesForProvince("ON")`,
  getPrefectureFromJapanesePostalCode: `getPrefectureFromJapanesePostalCode("530-0001")`,
  getProvinceFromPostalCode: `getProvinceFromPostalCode("H3G 1P1")`,
  getStateFromZip: `getStateFromZip("98101")`,
  getValidationErrors: `getValidationErrors("123 Main St", { requirePostalCode: true })`,
  getZipPrefixesForState: `getZipPrefixesForState("WA")`,
  hasValidAddressComponents: `hasValidAddressComponents("123 Main St, Anytown, NY 12345")`,
  isSameAddress: `isSameAddress(parseLocation("東京都千代田区丸の内1丁目2番3号"), parseLocation("東京都千代田区丸の内１－２－３"))`,
  isValidAddress: `isValidAddress("123 Main St, Seattle, NY 98101", { strictPostalValidation: true })`,
  kanjiNumeralsToDigits: `kanjiNumeralsToDigits("二丁目十五番")`,
  looksJapanese: `looksJapanese("1-2-3 Marunouchi, Chiyoda-ku, Tokyo")`,
  municipalitiesOf: `municipalitiesOf("47").length`,
  normalizeJapaneseAddressText: `normalizeJapaneseAddressText("東京都千代田区丸の内１－２－３")`,
  normalizeRegion: `normalizeRegion("British Columbia")`,
  normalizeStateProvinceName: `normalizeStateProvinceName("Nova Scotia")`,
  normalizeText: `normalizeText("  123   Main  St  ")`,
  parseAddress: `parseAddress("1600 Pennsylvania Ave NW, Washington, DC 20500")`,
  parseAddresses: `parseAddresses(["10 Main St, Anytown, NY 12345", "PO Box 12, Springfield, IL 62701"]).map((one) => one?.city)`,
  parseAddressesBatch: `parseAddressesBatch(["10 Main St, Anytown, NY 12345", "PO Box 12, Springfield, IL 62701"]).stats.successful`,
  parseDirectional: `parseDirectional("NW Main St")`,
  parseFacility: `parseFacility("Empire State Building, 350 5th Ave")`,
  parseInformalAddress: `parseInformalAddress("Main St near the post office, Anytown NY")`,
  parseInformalAddresses: `parseInformalAddresses(["Main St, Anytown NY"]).length`,
  parseInformalAddressesBatch: `parseInformalAddressesBatch(["Main St, Anytown NY"]).stats.successful`,
  parseIntersection: `parseIntersection("Hollywood Blvd and Vine St, Los Angeles, CA")`,
  parseIntersections: `parseIntersections(["Yonge St and Bloor St, Toronto, ON"])`,
  parseIntersectionsBatch: `parseIntersectionsBatch(["Yonge St and Bloor St, Toronto, ON"]).stats.successful`,
  parseJapaneseAddress: `parseJapaneseAddress("〒100-0005 東京都千代田区丸の内1丁目2番3号 丸ビル5階501号室")`,
  parseLocation: `parseLocation("1234 rue Sainte-Catherine O, Montréal, QC H3G 1P1")`,
  parseLocations: `parseLocations(["100 Queen St W, Toronto, ON M5H 2N2", "大阪府大阪市北区梅田3-1-1"]).map((one) => one?.country)`,
  parseLocationsBatch: `parseLocationsBatch(["100 Queen St W, Toronto, ON M5H 2N2", "大阪府大阪市北区梅田3-1-1"]).stats.successful`,
  parseParenthetical: `parseParenthetical("123 Main St (Rear Entrance)")`,
  parsePostalCode: `parsePostalCode("Toronto ON M5H 2N2")`,
  parseSecondaryUnit: `parseSecondaryUnit("123 Main St Apt 4")`,
  parseStateProvince: `parseStateProvince("Anytown NY")`,
  parseStreetNumber: `parseStreetNumber("123 Main St")`,
  parseStreetType: `parseStreetType("Main Street")`,
  setValidatedPostalCode: `const parsed = { city: "Toronto", state: "ON" };
setValidatedPostalCode(parsed, "m5h2n2", {});
parsed`,
  validateAddress: `validateAddress("〒530-0001 東京都千代田区丸の内1-2-3").warnings`,
  validateJapaneseAddress: `validateJapaneseAddress(parseLocation("〒530-0001 東京都千代田区丸の内1-2-3"), { strictPostalValidation: true })`,
  validatePostalCode: `validatePostalCode("K1A 0B1")`,
};

/** The source file an entry in `exports` is built from: ./dist/jp/index.js is src/jp/index.ts. */
const sourceOf = (entry) =>
  resolve(root, (entry.import ?? entry.default).replace("./dist/", "src/").replace(/\.js$/, ".ts"));

const clip = (text, most = 420) => {
  const one = text.replace(/\s+/g, " ").trim();
  return one.length > most ? `${one.slice(0, most - 1)}…` : one;
};

// The package writes its comments with //, not /** */, so a declaration with no doc comment is described by the
// // lines straight above it (or above the statement that holds it).
function leadingComment(declaration) {
  if (declaration === undefined) return "";
  const holder = ts.isVariableDeclaration(declaration) ? declaration.parent.parent : declaration;
  const source = holder.getSourceFile().getFullText();
  const ranges = ts.getLeadingCommentRanges(source, holder.getFullStart()) ?? [];
  return ranges
    .filter((range) => range.kind === ts.SyntaxKind.SingleLineCommentTrivia)
    .map((range) => source.slice(range.pos + 2, range.end).trim())
    .join(" ")
    .trim();
}

/** Every entry point with its exports: [{ entry, name, exports: [{ name, kind, signature, doc }] }]. */
export function apiOf() {
  const entries = Object.entries(pkg.exports)
    .filter(([key, entry]) => !key.includes("*") && typeof entry === "object")
    .map(([key, entry]) => ({
      key,
      name: key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`,
      file: sourceOf(entry),
    }));
  const config = ts.getParsedCommandLineOfConfigFile(
    join(root, "tsconfig.json"),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  );
  const program = ts.createProgram(
    entries.map((entry) => entry.file),
    { ...config.options, noEmit: true },
  );
  const checker = program.getTypeChecker();
  return entries.map(({ key, name, file }) => {
    const module = checker.getSymbolAtLocation(program.getSourceFile(file));
    const exports = checker.getExportsOfModule(module).map((symbol) => {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      const declaration = target.declarations?.[0];
      const doc =
        ts.displayPartsToString(target.getDocumentationComment(checker)).trim() || leadingComment(declaration);
      let kind = "const";
      let signature = "";
      if (target.flags & ts.SymbolFlags.Function) {
        kind = "function";
        const type = checker.getTypeOfSymbolAtLocation(target, declaration);
        signature = type
          .getCallSignatures()
          .map(
            (call) =>
              `${symbol.name}${checker.signatureToString(call, declaration, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature).replace(/ => /, ": ")}`,
          )
          .join("\n");
      } else if (target.flags & (ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Interface)) {
        kind = "type";
        // Kept as written, line by line: the package's types carry // comments, which one line would swallow.
        const written = declaration
          .getText()
          .replace(/^export /, "")
          .split("\n");
        signature = written.length > 40 ? [...written.slice(0, 39), "  …"].join("\n") : written.join("\n");
      } else {
        const type = checker.getTypeOfSymbolAtLocation(target, declaration);
        if (type.getCallSignatures().length > 0) kind = "function";
        signature = clip(`${symbol.name}: ${checker.typeToString(type, declaration, ts.TypeFormatFlags.NoTruncation)}`);
      }
      return { name: symbol.name, kind, signature: kind === "function" ? clip(signature, 600) : signature, doc };
    });
    exports.sort((a, b) => a.name.localeCompare(b.name, "en"));
    return { entry: key, name, exports };
  });
}

/** Show a value the way a reader would write it: JSON, with a regular expression or undefined spelled out. */
export function shown(value) {
  if (value === undefined) return "undefined";
  if (value instanceof RegExp) return String(value);
  return clip(JSON.stringify(value), 360);
}

/**
 * Run each example against the built package, and every line of `extra` too: { [name]: { code, result } }.
 * A function with no example stops the build, so that a new export cannot reach the page without one.
 */
export async function runExamples(api, extra = {}) {
  const library = await import(pathToFileURL(join(root, "dist", "index.js")).href);
  const { default: parser, ...named } = library;
  const scope = { ...named, parser };
  const names = Object.keys(scope).filter((key) => /^[A-Za-z_$][\w$]*$/.test(key));
  const run = (code) => {
    const lines = code.trim().split("\n");
    const body = `${lines.slice(0, -1).join("\n")}\nreturn (${lines.at(-1)});`;
    return new Function(...names, body)(...names.map((key) => scope[key]));
  };
  const missing = api.flatMap((entry) =>
    entry.exports.filter((one) => one.kind === "function" && !(one.name in EXAMPLES)).map((one) => one.name),
  );
  if (missing.length > 0)
    throw new Error(`No example for ${[...new Set(missing)].join(", ")}: add one to EXAMPLES in scripts/api.mjs`);
  const out = {};
  for (const [name, code] of Object.entries({ ...EXAMPLES, ...extra })) out[name] = { code, result: shown(run(code)) };
  return out;
}

const escape = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** A comment as HTML: one paragraph, with `code` in backticks. Nothing else is read as markup. */
const prose = (doc) => `<p>${escape(doc.replace(/\n/g, " ")).replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`;
const anchor = (entry, name) => `${entry === "." ? "main" : entry.slice(2)}-${name}`;
const exampleHtml = (example) =>
  example === undefined
    ? ""
    : `<pre class="api-example"><code>${escape(example.code)}\n// ${escape(example.result)}</code></pre>`;

/** The reference as one page's body, between the family's header and footer. */
export function apiBody(api, examples) {
  const total = api.reduce((sum, entry) => sum + entry.exports.length, 0);
  const contents = api
    .map(
      (entry) =>
        `<li><a href="#${anchor(entry.entry, "")}"><code>${escape(entry.name)}</code></a> <span class="fam-muted">${entry.exports.length}</span></li>`,
    )
    .join("\n");
  const sections = api
    .map(
      (entry) => `<section class="api-entry" id="${anchor(entry.entry, "")}">
        <h2><code>${escape(entry.name)}</code></h2>
        <p class="api-names">${entry.exports.map((one) => `<a href="#${anchor(entry.entry, one.name)}">${escape(one.name)}</a>`).join(" ")}</p>
        ${entry.exports
          .map(
            (one) => `<article id="${anchor(entry.entry, one.name)}" data-kind="${one.kind}">
          <h3><span class="fam-badge">${one.kind}</span> ${escape(one.name)}</h3>
          <pre>${escape(one.signature)}</pre>
          ${one.doc === "" ? "" : prose(one.doc)}
          ${exampleHtml(examples[one.name])}
        </article>`,
          )
          .join("\n")}
      </section>`,
    )
    .join("\n");
  return {
    total,
    html: `<section class="api-contents"><p class="fam-fine">${pkg.name} ${pkg.version} · ${api.length} entry points · ${total} exports</p><ul>${contents}</ul></section>\n${sections}`,
  };
}

/** The same reference as Markdown, for docs/api.md: every entry point, every export, and each function's example. */
export function apiMarkdown(api, examples) {
  const fence = "```";
  const parts = [
    "# API reference",
    "",
    `Every export of every entry point of ${pkg.name} ${pkg.version}, with its signature, its comment and, for each function, one example with the answer it gives. Made from the source by \`pnpm docs:make\`; the same reference is on the demo site at https://johnmorrisdotca.github.io/address-plus/api.html.`,
  ];
  for (const entry of api) {
    parts.push("", `## ${entry.name}`, "");
    for (const one of entry.exports) {
      parts.push(`### ${one.name}`, "", `${one.kind}`, "", `${fence}ts`, one.signature, fence, "");
      if (one.doc !== "") parts.push(one.doc, "");
      const example = examples[one.name];
      if (example !== undefined) parts.push(`${fence}js`, example.code, `// ${example.result}`, fence, "");
    }
  }
  return `${parts.join("\n").trimEnd()}\n`;
}

/** The reference page's own words, in both languages, under the names the family's header and footer ask for. */
export const API_WORDS = {
  en: {
    pitch:
      "Every export of every entry point, with its signature and its comment, and one example for each function with the answer it gives. Made from the source when the site is built, so it cannot fall behind the code.",
    name: "",
    nameLink: "README",
    foot: "Made from the package's own source; every example was run against the built package.",
    pageBack: "Demo",
  },
  ja: {
    pitch:
      "すべてのエントリーポイントのすべてのエクスポートを、シグネチャとコメント付きで一覧にしています。関数にはそれぞれ例を一つ付け、その結果も載せています。サイトをビルドするときにソースから作るので、コードとずれることはありません。",
    name: "",
    nameLink: "README（英語）",
    foot: "パッケージ自身のソースから作っています。例はすべて、ビルドしたパッケージで実際に実行した結果です。",
    pageBack: "デモ",
  },
};

/** The stylesheet of the reference, written beside the family's own as api.css. It uses the family's variables. */
export const API_CSS = `/* The API reference page: made by scripts/api.mjs. */
.api-contents ul { list-style: none; margin: 8px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr)); gap: 0 12px; font-size: .9rem; }
.api-contents li a { display: inline-flex; align-items: center; min-height: 44px; overflow-wrap: anywhere; }
.api-contents p { margin: 0 0 4px; }
.api-entry { margin-top: 28px; min-width: 0; }
.api-entry h2 { font-size: 1.15rem; margin: 0 0 6px; overflow-wrap: anywhere; }
.api-names { display: flex; flex-wrap: wrap; gap: 2px 12px; margin: 0 0 12px; font-size: .85rem; }
.api-names a { font-family: var(--mono); display: inline-flex; align-items: center; min-height: 32px; }
.api-entry article { border-top: 1px solid var(--rule); padding: 12px 0; display: grid; gap: 8px; min-width: 0; }
.api-entry article > * { min-width: 0; max-width: 100%; }
.api-entry h3 { margin: 0; font-size: 1rem; font-family: var(--mono); overflow-wrap: anywhere; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.api-entry h3 .fam-badge { font-family: var(--font); font-weight: 600; }
.api-entry p { margin: 0; line-height: 1.5; max-width: 72ch; overflow-wrap: anywhere; }
.api-entry p.api-names { max-width: none; }
.api-entry pre { white-space: pre-wrap; overflow-wrap: anywhere; }
.api-entry pre.api-example { background: color-mix(in srgb, var(--surface) 60%, var(--page)); }
`;

/** The header's line on the name links to the README's "The name"; address-plus has none, so it links to the README. */
export const header = (options) => familyHeader(options).replace("#the-name", "#readme");

/** The whole page, api.html: the family's header and footer around the reference. */
export function apiPage({ api, examples }) {
  const { id, name } = MEMBER;
  const body = apiBody(api, examples);
  return `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({ id, title: `${name} API reference: every export, with its signature and an example`, description: `The API reference of ${pkg.name}, the US, Canadian and Japanese address parser: every export of every entry point, with its signature, its comment and a worked example, made from the source.` })}
    <link rel="icon" href="${ICON}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="api.css" />
  </head>
  <body>
    <main>
      ${header({ id, links: [{ href: "./", say: "pageBack" }] })}
      ${body.html}
      ${familyUnreviewed({ id })}
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    <script>familyLanguage({ id: ${JSON.stringify(id)}, words: ${JSON.stringify(API_WORDS)} });</script>
  </body>
</html>
`;
}

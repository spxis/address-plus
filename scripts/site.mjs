// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's shared header and
// footer, with the family's stylesheet, the page's own, its script and words, the library bundled for the browser,
// and the API reference made from the source.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

import { build } from "tsup";

import { API_CSS, apiOf, apiPage, header, ICON, MEMBER, runExamples } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyUnreviewed } from "./family-template.mjs";

const { id } = MEMBER;

// The lines of "Using it": each is run against the built package, and the answer it gives is written after it.
const USES = {
  useImport: `import { parseLocation, validateAddress, formatJapanese } from "@johnmorrisdotca/address-plus";`,
  useParse: `parseLocation("1600 Pennsylvania Ave NW, Washington, DC 20500")?.state`,
  useJapan: `parseLocation("東京都千代田区丸の内１－２－３")?.block`,
  useValidate: `validateAddress("123 Main St, Seattle, NY 98101").warnings[0].code`,
  useFormat: `formatJapanese(parseLocation("〒100-0005 東京都千代田区丸の内1-2-3"), { blockStyle: "markers", multiline: false })`,
  useSame: `isSameAddress(parseLocation("123 Main Street, Anytown, NY 12345"), parseLocation("123 Main St, Anytown, New York 12345"))`,
  usePostal: `getPrefectureFromJapanesePostalCode("530-0001")`,
  useJp: `import { parseJapaneseAddress } from "@johnmorrisdotca/address-plus/jp";`,
};

const escape = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** An option row: a label and the fields, with the help line the Help switch shows in either language. */
const row = (help, content) =>
  `<div class="fam-row" data-help-en="${escape(help[0])}" data-help-ja="${escape(help[1])}">${content}</div>`;
const field = (name, key, value, { pair = false } = {}) =>
  `${pair ? `<span class="pair">` : ""}<label class="fam-label" for="${name}" data-say="${key}"></label><input id="${name}" class="fam-field" data-testid="${name}" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" value="${escape(value)}" />${pair ? "</span>" : ""}`;
const exampleRow = (name, help) =>
  `<div class="fam-seg" role="group" data-say-label="examples" id="${name}-examples" data-testid="${name}-examples" data-help-en="${escape(help[0])}" data-help-ja="${escape(help[1])}"></div>`;
/** A row of choices, exactly one pressed: [{ say, data, value, pressed }]. */
const choices = (name, label, attribute, options) =>
  `<span class="fam-label" data-say="${label}"></span><div class="fam-seg" role="group" data-say-label="${label}" id="${name}" data-testid="${name}">${options
    .map(
      (option) =>
        `<button type="button" data-${attribute}="${option.value}" aria-pressed="${option.pressed === true}" data-say="${option.say}"></button>`,
    )
    .join("")}</div>`;

/** A panel: its title and the function it shows, what it does, what to type, the examples, the answer, the call and the JSON. */
const panel = ({
  name,
  code,
  fields,
  help,
  options = "",
  exampleHelp,
}) => `<section class="fam-panels job" id="${name}" aria-labelledby="${name}-title" data-testid="${name}-panel">
        <div class="fam-panel">
          <h2 id="${name}-title"><span data-say="${name}_title"></span> <code>${code}</code></h2>
          <p class="blurb" data-say="${name}_blurb"></p>
          ${row(help, fields)}${options}
          ${exampleRow(name, exampleHelp)}
          <div class="answer" id="${name}-answer" data-testid="${name}-answer" aria-live="polite"></div>
          <pre class="call" id="${name}-call" data-testid="${name}-call" aria-label="the call"></pre>
          <details class="fam-fold" data-testid="${name}-fold">
            <summary data-say="json"></summary>
            <pre class="json" id="${name}-json" data-testid="${name}-json"></pre>
          </details>
        </div>
      </section>`;

const panels = [
  panel({
    name: "parse",
    code: "parseLocation",
    fields: field("parse-input", "input", "1600 Pennsylvania Ave NW, Washington, DC 20500"),
    help: [
      "Type an address from the US, Canada or Japan. Each part of it is shown in its own field.",
      "米国、カナダ、日本の住所を入力します。住所の各部分が、それぞれの項目に分かれて表示されます。",
    ],
    exampleHelp: [
      "Fill the box with an example: a street address, a landmark, a PO box, an intersection, Canada in English and French, Japan in Japanese script, in romaji and in full-width digits.",
      "例を入力欄に入れます：番地のある住所、建物名つき、私書箱、交差点、英語とフランス語のカナダの住所、日本語・ローマ字・全角数字の日本の住所。",
    ],
  }),
  panel({
    name: "validate",
    code: "validateAddress",
    fields: field("validate-input", "input", "123 Main St, Seattle, NY 98101"),
    help: [
      "Type an address. Whether it is valid, how sure the parser is, and every error and warning are listed.",
      "住所を入力します。有効かどうか、解析の信頼度、エラーと警告をすべて示します。",
    ],
    options: `
          ${row(
            [
              "Strict postal codes: a postal code that belongs to another region, or is in the wrong shape, makes the address invalid instead of raising a warning.",
              "郵便番号の厳密な検査：別の地域の郵便番号や形式の正しくない郵便番号があると、警告にとどまらず、住所が無効と判定されます。",
            ],
            `<span class="fam-label" data-say="options"></span><button type="button" class="fam-button" id="validate-strict" data-testid="validate-strict" aria-pressed="false" data-say="validate_strict"></button>`,
          )}`,
    exampleHelp: [
      "Fill the box with an example: a ZIP code from another state, a Canadian postal code from another province, a Japanese postal code from another prefecture, two complete addresses and one that is not.",
      "例を入れます：別の州の ZIP コード、別の州のカナダの郵便番号、別の都道府県の日本の郵便番号、完全な住所が二つ、不完全な住所が一つ。",
    ],
  }),
  panel({
    name: "format",
    code: "formatUSPS · formatCanadaPost · formatJapanese",
    fields: field("format-input", "input", "〒100-0005 東京都千代田区丸の内1丁目2番3号 サンプルビル5階501号室"),
    help: [
      "Type an address. It is written out in its country's postal format.",
      "住所を入力します。その国の郵便の書式で書き直します。",
    ],
    options: `
          ${row(
            [
              "How a Japanese block number is written: 1-2-3, or with its markers, 1丁目2番3号.",
              "日本の番地の書き方：1-2-3 とするか、1丁目2番3号 のように書くかを選びます。",
            ],
            choices("format-style", "format_block", "style", [
              { say: "format_hyphen", value: "hyphen", pressed: false },
              { say: "format_markers", value: "markers", pressed: true },
            ]),
          )}`,
    exampleHelp: [
      "Fill the box with an example: Japan in Japanese script and in romaji, a US address with a unit, a Canadian one, a PO box.",
      "例を入れます：日本語とローマ字の日本の住所、部屋番号つきの米国の住所、カナダの住所、私書箱。",
    ],
  }),
  panel({
    name: "compare",
    code: "compareAddresses · isSameAddress",
    fields: `${field("compare-first", "compare_first", "123 Main Street, Anytown, NY 12345", { pair: true })}${field("compare-second", "compare_second", "123 Main St, Anytown, New York 12345", { pair: true })}`,
    help: [
      "Type two addresses. They are parsed and compared field by field.",
      "住所を二つ入力します。それぞれ読み取ってから、項目ごとに比べます。",
    ],
    exampleHelp: [
      "Fill both boxes with an example: abbreviations against full names, a typo, Canada, kanji against full-width digits, two different places.",
      "二つの欄に例を入れます：略語と正式名、打ち間違い、カナダの住所、漢字と全角数字、まったく別の場所。",
    ],
  }),
  panel({
    name: "postal",
    code: "getStateFromZip · getPrefectureFromJapanesePostalCode",
    fields: field("postal-input", "input", "98101"),
    help: [
      "Type a ZIP or postal code to find its region, or a region's code or name to list its codes.",
      "郵便番号を入力すると地域が、地域のコードか名前を入力するとそこで使われる番号がわかります。",
    ],
    exampleHelp: [
      "Fill the box with an example: US ZIP codes, Canadian postal codes, Japanese postal codes in half-width and full-width digits, then a state, a province and two prefectures.",
      "例を入れます：米国の ZIP コード、カナダの郵便番号、半角と全角の日本の郵便番号、そして米国の州、カナダの州、都道府県が二つ。",
    ],
  }),
  panel({
    name: "clean",
    code: "cleanAddressDetailed",
    fields: field("clean-input", "input", "350 FIFTH AVENUE, NEW YORK, NY 10118"),
    help: [
      "Paste an address typed in a hurry. It comes back tidied, with what was changed.",
      "急いで入力したような住所を貼り付けます。整えた住所と、変更点を返します。",
    ],
    options: `
          ${row(
            [
              "How capitals are set in the cleaned address: capital first letters, all capitals, or as typed.",
              "整えた住所の大文字と小文字：語頭だけ大文字、すべて大文字、入力のままから選びます。",
            ],
            choices("clean-case", "clean_case", "case", [
              { say: "clean_title_case", value: "title", pressed: true },
              { say: "clean_upper", value: "upper", pressed: false },
              { say: "clean_asis", value: "none", pressed: false },
            ]),
          )}`,
    exampleHelp: [
      "Fill the box with an example: all capitals, stray spaces in lower case, a Canadian address, a Japanese one in full-width digits.",
      "例を入れます：すべて大文字、小文字で空白の乱れた住所、カナダの住所、全角数字の日本の住所。",
    ],
  }),
];

/** The page, from the panels and the lines of "Using it" with their answers. */
function page(uses) {
  return `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({
      id,
      title: "Address Plus · parse, validate and format US, Canadian and Japanese addresses",
      description:
        "Try address-plus in your browser: a TypeScript address parser for the US, Canada and Japan. Parse an address into its fields, validate it (a ZIP or postal code from another state, province or prefecture is caught), write it out the USPS, Canada Post or Japanese way, compare two addresses, find the region of a postal code, and clean up a messy one. Free and open source, in English and Japanese.",
      ogTitle: "Address Plus: US, Canadian and Japanese addresses, parsed and checked",
      ogDescription:
        "Parse, validate, format and compare addresses from the US, Canada and Japan, including Japanese script, romaji and full-width digits. One small dependency.",
    })}
    <link rel="icon" href="${ICON}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="address-plus.css" />
  </head>
  <body>
    <main>
      ${header({ id, links: [{ href: "api.html", say: "pageApi" }] })}
      <div class="jobs">
      ${panels.join("\n      ")}
      </div>
      ${familyUnreviewed({ id })}
      <section class="more" aria-labelledby="more-title">
        <h2 id="more-title" data-say="moreTitle"></h2>
        <p data-say="moreText"></p>
        <ul class="uses">
          ${uses.map((line) => `<li><code>${escape(line)}</code></li>`).join("\n          ")}
        </ul>
      </section>
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    <script type="module" src="demo.js"></script>
  </body>
</html>
`;
}

const api = apiOf();
const runnable = Object.fromEntries(Object.entries(USES).filter(([, code]) => !code.startsWith("import ")));
const examples = await runExamples(api, runnable);
const uses = Object.entries(USES).map(([key, code]) =>
  code.startsWith("import ") ? code : `${code}  // ${examples[key].result}`,
);

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
// The browser gets the whole library as one ES module: fast-levenshtein (CommonJS) and hikidashi bundled in.
await build({
  config: false,
  entry: { index: "src/index.ts" },
  format: ["esm"],
  platform: "browser",
  target: "es2022",
  splitting: false,
  noExternal: [/.*/],
  outDir: "site/lib",
  dts: false,
  sourcemap: false,
  minify: true,
  clean: true,
  silent: true,
});
writeFileSync("site/index.html", page(uses));
// The API reference, made from the source: every export of every entry point, each function with an example.
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", apiPage({ api, examples }));
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");

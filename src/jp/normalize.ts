// Normalising the text of a Japanese address before it is parsed: one width of digit, one kind of
// dash, one kind of space, and the block numbers as digits whichever way they were written.

import { parseJapaneseNumber } from "@johnmorrisdotca/hikidashi/numerals";

// Kanji numerals, read only when they stand before a block, floor or separator so a town such as
// 北一条西 or 三軒茶屋 keeps its name.
const KANJI_NUMERAL = /([〇零一二三四五六七八九十百千]+)(?=丁目|番地|番|号|階|の|ノ|-)/g;

// Dashes of every width and the katakana long-vowel mark, between two digits only, since ー is a
// letter in a name such as ハーバー.
const DASH_BETWEEN_DIGITS = /(?<=\d)[-−－‐‑‒–—―ー](?=\d)/g;

// Full-width space and other Unicode spaces to one ASCII space.
const SPACES = /[\s　]+/g;

// Looks Japanese: kanji, kana or the postal mark.
const JAPANESE_SCRIPT = /[぀-ヿ㐀-䶿一-鿿豈-﫿〒]/;

// The text with full-width digits, letters and punctuation folded to ASCII and half-width katakana to
// full-width. NFKC does both.
function foldWidth(text: string): string {
  return text.normalize("NFKC");
}

// Kanji numerals before a block or floor marker become digits: 一丁目二番三号 → 1丁目2番3号.
function kanjiNumeralsToDigits(text: string): string {
  return text.replace(KANJI_NUMERAL, (numeral) => {
    const value = parseJapaneseNumber(numeral);
    return value === null ? numeral : String(value);
  });
}

// The whole text made uniform: widths folded, the postal mark and spaces tidied, numerals as digits,
// and 1の2の3 or １－２－３ written 1-2-3.
// @example normalizeJapaneseAddressText('〒１００-０００５　東京都千代田区丸の内一丁目二番三号') → '100-0005 東京都千代田区丸の内1丁目2番3号'
function normalizeJapaneseAddressText(text: string): string {
  let out = foldWidth(text)
    .replace(/〒|郵便番号/g, " ")
    .replace(SPACES, " ")
    .trim();
  out = kanjiNumeralsToDigits(out);
  out = out.replace(/(?<=\d)[のノ](?=\d)/g, "-").replace(DASH_BETWEEN_DIGITS, "-");
  return out;
}

// Whether the text is in Japanese script at all.
function hasJapaneseScript(text: string): boolean {
  return JAPANESE_SCRIPT.test(text);
}

export { foldWidth, hasJapaneseScript, kanjiNumeralsToDigits, normalizeJapaneseAddressText };

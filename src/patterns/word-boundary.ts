// Word edges that know every alphabet.
//
// `\b` counts only ASCII letters and digits as word characters, so an accented letter reads as a break:
// the "al" closing "Montréal" is a whole word to `\b` (and so Alabama), and "allée" never ends where a
// space follows it. These lookarounds say "no letter or digit of any script on this side" instead. A
// pattern that uses them must carry the `u` flag, without which `\p{...}` is not understood.

const WORD_START = String.raw`(?<![\p{L}\p{N}])`;
const WORD_END = String.raw`(?![\p{L}\p{N}])`;

// Wrap an alternation so it matches only as a whole word: wholeWord("al|ak") never matches inside "Montréal".
function wholeWord(alternation: string): string {
  return `${WORD_START}(?:${alternation})${WORD_END}`;
}

export { WORD_END, WORD_START, wholeWord };

// The regular expressions the Japanese parser, normaliser and formatter share, kept in one place.

// Kanji numerals: the ten digits, 〇 and the magnitudes an address number can reach.
const KANJI_NUMERAL_CLASS = "〇零一二三四五六七八九十百千";

// Every dash that may stand between two numbers of a block: the hyphens and dashes of U+2010 to U+2015, the
// minus signs, the katakana long-vowel mark in both widths, the box-drawing lines ─ and ━, the hyphen bullet and
// the modifier minus. ー is a letter in a name such as ハーバー or センター, so a dash is only read between numbers.
const DASH_CLASS = "\\-\\u02d7\\u2010-\\u2015\\u2043\\u2212\\u2500\\u2501\\u30fc\\uff0d\\uff70";

// A letter that may lead the number after a dash, as in 14-イ22 or 14-A22: a Latin letter or katakana.
const NUMBER_LETTER_CLASS = "A-Za-z\\u30a1-\\u30f6";

// A run of kanji numerals that stands for a block, floor or room number. Only a numeral in front of a
// marker is read, so that a town such as 北一条西, 三軒茶屋, 一ノ瀬 or 麻布十番 keeps its name:
//   一丁目, 二丁 followed by a number (Sakai's 3丁), 二番地, 三階 (but not 二階堂), 一〇一号室
//   二番三号, 二番三 at the end, and 二番 at the end after a 丁目 (三番町 and 麻布十番 are towns)
//   三号 after 番, 番地 or a dash, once the number before it is a digit
//   一の二, the の reading as a dash between two numbers, and 四-2-27 or 一-二-三, a dash after it
const KANJI_BLOCK_NUMERAL = new RegExp(
  `(?<![${KANJI_NUMERAL_CLASS}])[${KANJI_NUMERAL_CLASS}]+` +
    `(?=丁目|丁\\s*[\\d${KANJI_NUMERAL_CLASS}]|番地|階(?![\\u3400-\\u9fff])|号室|番[${KANJI_NUMERAL_CLASS}]+(?:号|$|\\s)|` +
    `[のノ][${KANJI_NUMERAL_CLASS}\\d]|\\s*[${DASH_CLASS}]\\s*[${NUMBER_LETTER_CLASS}]?[\\d${KANJI_NUMERAL_CLASS}])`,
  "g",
);
const KANJI_NUMERAL_AFTER_CHOME = new RegExp(`(?<=\\d丁目?)[${KANJI_NUMERAL_CLASS}]+(?=番|$|\\s)`, "g");
const KANJI_NUMERAL_GO = new RegExp(
  `(?<=\\d(?:番地?|[${DASH_CLASS}のノ])[${NUMBER_LETTER_CLASS}]?)[${KANJI_NUMERAL_CLASS}]+(?=号|$|\\s)`,
  "g",
);
const KANJI_POSITIONAL_DIGITS = /^[〇一二三四五六七八九]{2,}$/;
const KANJI_DIGITS = "〇一二三四五六七八九";

// A dash between two digits, or between a digit and a lettered number (14ーイ22).
const DASH_BETWEEN_DIGITS = new RegExp(`(?<=\\d)\\s*[${DASH_CLASS}]\\s*(?=[${NUMBER_LETTER_CLASS}]?\\d)`, "g");
// の or ノ between two digits is a dash: 1の2の3.
const NO_BETWEEN_DIGITS = /(?<=\d)[のノ](?=\d)/g;

// 巿 (U+5DFF), a different character that looks like 市 and is typed for it.
const LOOKALIKE_CITY = /\u5dff/g;

// Full-width space and other Unicode spaces to one ASCII space; \s covers U+3000, the ideographic space.
const SPACES = /\s+/g;

// Looks Japanese: hiragana, katakana, kanji or the postal mark.
const JAPANESE_SCRIPT = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3012]/;

// The postal mark and the words for a postal code.
const POSTAL_MARK = /〒|郵便番号[:：]?/g;

// A postal code after 〒: 〒100-0005, 〒1000005, 〒 100-0005.
const MARKED_POSTAL_CODE = /〒\s*(\d{3})\s*-?\s*(\d{4})(?!\d)/;
// A postal code at the start or end of the text, with or without its hyphen.
const LEADING_POSTAL_CODE = /^(\d{3})-?(\d{4})(?=[\s,、]|$)/;
const TRAILING_POSTAL_CODE = /[\s,、](\d{3})-?(\d{4})$/;
// A hyphenated postal code anywhere: 東京都 100-0005 千代田区.
const HYPHENATED_POSTAL_CODE = /(?<![\d-])(\d{3})-(\d{4})(?![\d-])/;
const POSTAL_CODE_SHAPE = /^\d{3}-\d{4}$/;

// Japan, at either end of the text. 日本 at the start must be followed by a space or comma, or it may
// be the start of a name such as 日本橋.
const LEADING_COUNTRY = /^(?:日本国|日本|japan)(?:[\s,、]+|$)/i;
const TRAILING_COUNTRY = /[\s,、]+(?:日本国|日本|japan|jp)\.?$/i;

// Punctuation and spaces between parts.
const SEPARATORS_AT_START = /^[\s,、]+/;
// What may sit between the block and a building: a space, a comma or a stray dash (1-4-1-レジデンス).
const BUILDING_LEAD = /^[\s,、-]+/;
const SEPARATORS_AT_END = /[\s,、]+$/;

// A municipality not in the table but written as one: the shortest run ending in 市, 区, 町 or 村.
const WRITTEN_MUNICIPALITY = /^([^\d\s,、]{1,10}?[市区町村])/;

// Words in a key written camelCase, for the snake_case result: postalCode → postal_code.
const CAMEL_CASE_CAPITAL = /[A-Z]/g;

// The block, read at a digit. In order of preference:
//   1丁目2番3号, 1丁目2番地3, 1丁目2-3, 1丁目2, 1丁目
//   2番3号, 2番地3, 2番地の3, 2番, 488番地
//   1-2-3, 1-2, 1-2-3-405 (the fourth number is a room)
//   488 alone, at the end or before a space
//   2番23-2 and 1番2-403号, where the number after a further dash is a room
// Sakai writes 丁 for 丁目 (3丁1番9号), so 丁 followed by a number, a dash or the end is a chome too. A go may
// lead with a letter: 14-イ22, 14-A22.
const BLOCK_CHOME = /^(\d+)丁(?:目|(?=\s*[\d-]|$))\s*-?\s*/;
const BLOCK_BAN_GO =
  /^(\d+)(?:番地?)(?:\s*[-の]?\s*([A-Za-z\u30a1-\u30f6]?\d+)(?:号(?!室))?)?(?:\s*-\s*(\d+)(?:号(?!室))?)?/;
const BLOCK_HYPHENATED = /^(\d+)-([A-Za-z\u30a1-\u30f6]?\d+)(?:-(\d+))?(?:-(\d+))?(?:号(?!室))?/;
const BLOCK_BARE_NUMBER = /^(\d+)(?=$|[\s,、])/;
// What may follow a digit for it to start a block: a marker, a dash, or the end of the address part. A 番
// followed by 町 or 丁 is part of a town's name (和歌山市7番町, 新潟市学校町通1番町), as is a 丁 followed by a
// name rather than a number.
const BLOCK_START = /^\d+(?:丁目|丁(?=\s*[\d-]|$)|番(?![町丁])|号(?!室)|-[A-Za-z\u30a1-\u30f6]?\d|$|[\s,、])/;
const DIGIT = /\d/;
// A rural town named with 大字 or 字, which has no chome: its pair of numbers is ban and go.
const RURAL_TOWN = /(?:^|大)字/;

// Kyoto's street directions (通り名): the street, the cross street and which way from the corner, 上ル or 上る
// (north), 下ル or 下る (south), 東入 (east) and 西入 (west), with or without ル or る, and 上がる and 下がる.
// The last direction ends the locator; the town follows it (寺町通御池上る上本能寺前町) or, less often, comes first
// (高辻堀川町西堀川通高辻下る), and then it is the run before the first street, which ends in 町.
const KYOTO_DIRECTION = /(?:上|下)(?:が|ガ)?(?:る|ル)|(?:東|西)入(?:る|ル)?/g;
const KYOTO_TOWN_FIRST = /^(.+?町)(?=[^町]+通)/;

// Spaces between two letters of Japanese script inside a town: 藤橋町 亥 is the town 藤橋町亥.
const SPACE_INSIDE_JAPANESE = /(?<=[\u3040-\u30ff\u3400-\u9fff々])\s+(?=[\u3040-\u30ff\u3400-\u9fff々])/g;

// What follows the block: a building, its floor and its room.
const FLOOR = /(?:(地下)\s*(\d+)\s*階|[bB](\d+)[fF]\b|(\d+)\s*(?:階(?![\u3400-\u9fff])|[fF](?![a-zA-Z])))/;
const ROOM = /(\d+)\s*号室|(\d+)\s*号$|(?:^|\s)#?(\d+)$/;

// Romaji: the block written 1-2-3 or 1-chome, a floor, a room and the words that make a part a building.
const ROMAJI_BLOCK = /\b(\d+)-(\d+)(?:-(\d+))?\b(?!-?(?:jo|chome)\b)/i;
const ROMAJI_CHOME = /\b(\d+)[- ]?chome\b/i;
const ROMAJI_FLOOR = /\b(\d+)(?:F|f|st floor|nd floor|rd floor|th floor)\b|\bfloor\s*(\d+)\b/i;
const ROMAJI_ROOM = /\b(?:room|rm\.?|suite|ste\.?|apt\.?|#)\s*(\d+)\b|#(\d+)/i;
const ROMAJI_BUILDING_WORD = /\b(?:bldg\.?|building|tower|mansion|heights|court|house|plaza|center|centre|hills)\b/i;
const ROMAJI_MUNICIPALITY_DESIGNATOR = /-(?:ku|shi|cho|machi|mura|son)\b|\b(?:city|ward|town|village)\b/i;
const ENGLISH_MUNICIPALITY_WORD = /\b(?:city|ward|town|village)\b/i;
const DIGITS_ONLY = /^\d+$/;
const ROMAJI_DESIGNATOR_WORD = /-(?:ku|shi|cho|machi|mura|son|gun|to|do|fu|ken)\b/i;
const COMMA_SPLIT = /\s*,\s*/;
const LATIN_LETTER = /[A-Za-z]/;
const WORD_SPLIT = /[,\s]+/;
const PART_TRIM = /^[\s〒]+|[\s.]+$/g;
// Lines of a romaji address are parts, as commas are.
const LINE_BREAK = /\s*[\r\n]+\s*/g;
// A prefecture, district, city or ward designator followed by a space starts a new part: Tokyo-to Chiyoda-ku
// Marunouchi 1-2-3 is three parts. -cho and -machi are left alone, since a town's own name often ends in them.
const ROMAJI_PART_END = /(-(?:to|do|fu|ken|gun|shi|ku))\s+(?=\S)/gi;
const COMBINING_MARKS = /[\u0300-\u036f]/g;
const WHITESPACE_RUN = /\s+/g;

export {
  BLOCK_BAN_GO,
  BLOCK_BARE_NUMBER,
  BLOCK_CHOME,
  BLOCK_HYPHENATED,
  BLOCK_START,
  BUILDING_LEAD,
  CAMEL_CASE_CAPITAL,
  COMBINING_MARKS,
  COMMA_SPLIT,
  DASH_BETWEEN_DIGITS,
  DIGIT,
  DIGITS_ONLY,
  ENGLISH_MUNICIPALITY_WORD,
  FLOOR,
  HYPHENATED_POSTAL_CODE,
  JAPANESE_SCRIPT,
  KANJI_BLOCK_NUMERAL,
  KANJI_DIGITS,
  KANJI_NUMERAL_AFTER_CHOME,
  KANJI_NUMERAL_GO,
  KANJI_POSITIONAL_DIGITS,
  KYOTO_DIRECTION,
  KYOTO_TOWN_FIRST,
  LATIN_LETTER,
  LEADING_COUNTRY,
  LEADING_POSTAL_CODE,
  LINE_BREAK,
  LOOKALIKE_CITY,
  MARKED_POSTAL_CODE,
  NO_BETWEEN_DIGITS,
  PART_TRIM,
  POSTAL_CODE_SHAPE,
  POSTAL_MARK,
  ROMAJI_BLOCK,
  ROMAJI_BUILDING_WORD,
  ROMAJI_CHOME,
  ROMAJI_DESIGNATOR_WORD,
  ROMAJI_FLOOR,
  ROMAJI_MUNICIPALITY_DESIGNATOR,
  ROMAJI_PART_END,
  ROMAJI_ROOM,
  ROOM,
  RURAL_TOWN,
  SEPARATORS_AT_END,
  SEPARATORS_AT_START,
  SPACES,
  SPACE_INSIDE_JAPANESE,
  TRAILING_COUNTRY,
  TRAILING_POSTAL_CODE,
  WHITESPACE_RUN,
  WORD_SPLIT,
  WRITTEN_MUNICIPALITY,
};

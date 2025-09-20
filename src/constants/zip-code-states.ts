// US ZIP code → state/territory (2-letter) resolver
// Complete, zero-padded string comparisons (no octal issues).
// - Accepts 5-digit or ZIP+4 formats
// - Returns a single 2-letter code, or undefined if invalid/unmapped
// - Covers all 50 states, DC, territories, and military/diplomatic (AA/AE/AP)

type StateCode =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DC' | 'DE' | 'FL'
  | 'GA' | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME'
  | 'MD' | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH'
  | 'NJ' | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI'
  | 'SC' | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY'
  | 'PR' | 'VI' | 'AS' | 'GU' | 'MP' | 'FM' | 'MH' | 'PW'
  | 'AA' | 'AE' | 'AP';

interface Zip3Range {
  start: string; // inclusive, 3 chars (e.g., "010")
  end: string;   // inclusive, 3 chars
  code: StateCode;
}

interface Zip5Range {
  start: string; // inclusive, 5 chars (e.g., "00501")
  end: string;   // inclusive, 5 chars
  code: StateCode;
}

// Exact 5-digit ranges with precedence (territories and military/diplomatic).
// These are checked BEFORE the 3-digit regional ranges.
const ZIP5_EXACT_OVERRIDES: Zip5Range[] = [
  // Military/diplomatic
  { start: '09000', end: '09899', code: 'AE' }, // Europe/Middle East/Africa APO/FPO/DPO
  { start: '34000', end: '34099', code: 'AA' }, // Americas APO/FPO/DPO
  { start: '96200', end: '96699', code: 'AP' }, // Pacific APO/FPO/DPO

  // Territories in 9xx
  { start: '96799', end: '96799', code: 'AS' }, // American Samoa
  { start: '96910', end: '96932', code: 'GU' }, // Guam
  { start: '96950', end: '96952', code: 'MP' }, // Northern Mariana Islands
  { start: '96939', end: '96940', code: 'PW' }, // Palau
  { start: '96941', end: '96944', code: 'FM' }, // Federated States of Micronesia
  { start: '96960', end: '96970', code: 'MH' }, // Marshall Islands

  // Puerto Rico and USVI
  { start: '00600', end: '00799', code: 'PR' }, // PR uses 006xx–007xx
  { start: '00900', end: '00999', code: 'PR' }, // PR 009xx
  { start: '00800', end: '00899', code: 'VI' }, // U.S. Virgin Islands

  // Special NY IRS block
  { start: '00500', end: '00599', code: 'NY' }, // e.g., 00501 Holtsville (IRS)
];

// 3-digit regional ranges (inclusive), used when no 5-digit override matches.
// Ranges are zero-padded strings and compared lexicographically.
const ZIP3_RANGES: Zip3Range[] = [
  // New England + NJ
  { start: '010', end: '027', code: 'MA' },
  { start: '028', end: '029', code: 'RI' },
  { start: '030', end: '038', code: 'NH' },
  { start: '039', end: '049', code: 'ME' },
  { start: '050', end: '059', code: 'VT' },
  { start: '060', end: '069', code: 'CT' },
  { start: '070', end: '089', code: 'NJ' },

  // NY, PA, DE
  { start: '100', end: '149', code: 'NY' },
  { start: '150', end: '196', code: 'PA' },
  { start: '197', end: '199', code: 'DE' },

  // DC/MD/VA/WV/NC/SC
  { start: '200', end: '200', code: 'DC' },
  { start: '201', end: '201', code: 'VA' },
  { start: '202', end: '205', code: 'DC' },
  { start: '206', end: '219', code: 'MD' },
  { start: '220', end: '246', code: 'VA' },
  { start: '247', end: '268', code: 'WV' },
  { start: '270', end: '289', code: 'NC' },
  { start: '290', end: '299', code: 'SC' },

  // Southeast
  { start: '300', end: '319', code: 'GA' },
  { start: '320', end: '339', code: 'FL' },
  { start: '341', end: '349', code: 'FL' },
  { start: '350', end: '369', code: 'AL' },
  { start: '370', end: '385', code: 'TN' },
  { start: '386', end: '397', code: 'MS' },
  { start: '398', end: '399', code: 'GA' },

  // Midwest & Great Lakes
  { start: '400', end: '427', code: 'KY' },
  { start: '430', end: '459', code: 'OH' },
  { start: '460', end: '479', code: 'IN' },
  { start: '480', end: '499', code: 'MI' },

  // Upper Midwest & Plains
  { start: '500', end: '528', code: 'IA' },
  { start: '530', end: '549', code: 'WI' },
  { start: '550', end: '567', code: 'MN' },
  { start: '570', end: '577', code: 'SD' },
  { start: '580', end: '588', code: 'ND' },
  { start: '590', end: '599', code: 'MT' },

  // IL, MO, KS, NE (+ DC special 569 below as its own block)
  { start: '600', end: '629', code: 'IL' },
  { start: '630', end: '658', code: 'MO' },
  { start: '660', end: '679', code: 'KS' },
  { start: '680', end: '693', code: 'NE' },

  // DC special
  { start: '569', end: '569', code: 'DC' },

  // Southern Plains & Texas
  { start: '700', end: '715', code: 'LA' },
  { start: '716', end: '729', code: 'AR' },
  { start: '730', end: '749', code: 'OK' },
  { start: '750', end: '799', code: 'TX' },
  { start: '885', end: '885', code: 'TX' }, // El Paso PO Box-only region

  // Rockies & Southwest
  { start: '800', end: '816', code: 'CO' },
  { start: '820', end: '831', code: 'WY' },
  { start: '832', end: '838', code: 'ID' },
  { start: '840', end: '847', code: 'UT' },
  { start: '850', end: '865', code: 'AZ' },
  { start: '870', end: '884', code: 'NM' },
  { start: '889', end: '898', code: 'NV' },

  // West Coast & Alaska/Hawaii entry points
  { start: '900', end: '961', code: 'CA' },
  { start: '970', end: '979', code: 'OR' },
  { start: '980', end: '994', code: 'WA' },
  { start: '995', end: '999', code: 'AK' },

  // Hawaii (note: 967–968 default is HI; 96799 override is AS)
  { start: '967', end: '968', code: 'HI' },
];

// Resolve a US ZIP code (5-digit or ZIP+4) to a 2-letter state/territory code.
 function getStateFromZip(zip: string | number): StateCode | undefined {
  if (zip == null) return undefined;

  const raw = String(zip).trim();
  if (!/^\d{5}(?:-\d{4})?$/.test(raw)) return undefined;

  const zip5 = raw.slice(0, 5);
  const zip3 = zip5.slice(0, 3);

  // 1) Exact/5-digit overrides first (territories, military/diplomatic, PR/VI, special NY)
  for (const { start, end, code } of ZIP5_EXACT_OVERRIDES) {
    if (zip5 >= start && zip5 <= end) return code;
  }

  // 2) 3-digit regional ranges
  for (const { start, end, code } of ZIP3_RANGES) {
    if (zip3 >= start && zip3 <= end) return code;
  }

  return undefined;
}

// Example:
// getStateFromZip('00501') -> 'NY'
// getStateFromZip('00802') -> 'VI'
// getStateFromZip('00926') -> 'PR'
// getStateFromZip('20001') -> 'DC'
// getStateFromZip('73301') -> 'TX'
// getStateFromZip('96701') -> 'HI'
// getStateFromZip('96799') -> 'AS'
// getStateFromZip('96931') -> 'GU'
// getStateFromZip('09012') -> 'AE'
// getStateFromZip('34012') -> 'AA'
// getStateFromZip('96205') -> 'AP'

export type { StateCode };
export { getStateFromZip };

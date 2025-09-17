// src/data/ca-provinces.ts
var CA_PROVINCE_NAMES_EN = {
  alberta: "AB",
  "british columbia": "BC",
  manitoba: "MB",
  "new brunswick": "NB",
  "newfoundland and labrador": "NL",
  "northwest territories": "NT",
  "nova scotia": "NS",
  nunavut: "NU",
  ontario: "ON",
  "prince edward island": "PE",
  quebec: "QC",
  saskatchewan: "SK",
  yukon: "YT"
};
var CA_PROVINCE_NAMES_FR = {
  alberta: "AB",
  // Same in French
  "colombie-britannique": "BC",
  manitoba: "MB",
  // Same in French
  "nouveau-brunswick": "NB",
  "terre-neuve-et-labrador": "NL",
  "territoires du nord-ouest": "NT",
  "nouvelle-\xE9cosse": "NS",
  nunavut: "NU",
  // Same in French (Inuktitut origin)
  ontario: "ON",
  // Same in French
  "\xEEle-du-prince-\xE9douard": "PE",
  qu\u00E9bec: "QC",
  saskatchewan: "SK",
  // Same in French (Cree origin)
  yukon: "YT"
  // Same in French
};
var CA_PROVINCE_NAMES = {
  ...CA_PROVINCE_NAMES_EN,
  ...CA_PROVINCE_NAMES_FR
};
var CA_PROVINCE_ALTERNATIVES = {
  // Alberta
  alb: "AB",
  alta: "AB",
  // Manitoba  
  man: "MB",
  // Newfoundland and Labrador
  newfoundland: "NL",
  labrador: "NL",
  "terre-neuve": "NL",
  "terre neuve": "NL",
  "terre neuve et labrador": "NL",
  tnl: "NL",
  // Northwest Territories
  northwest: "NT",
  territories: "NT",
  territoires: "NT",
  nwt: "NT",
  "tn-o": "NT",
  // Nunavut
  nvt: "NU",
  // Ontario
  ont: "ON",
  // Prince Edward Island
  pei: "PE",
  "prince edward": "PE",
  "ile-du-prince-\xE9douard": "PE",
  // without circumflex
  "\xEEle du prince \xE9douard": "PE",
  // without hyphens
  "ile du prince \xE9douard": "PE",
  // without circumflex or hyphens
  "\xEEp\xE9": "PE",
  // Saskatchewan
  sask: "SK"
};
var CA_PROVINCES = {
  ...CA_PROVINCE_NAMES,
  ...CA_PROVINCE_ALTERNATIVES
};
var CA_REGIONS = Object.entries(CA_PROVINCES).map(([name, abbr]) => ({
  abbr,
  country: "CA",
  name
}));

// src/data/ca-street-types.ts
var CA_STREET_TYPES = {
  // English
  autoroute: "aut",
  av: "ave",
  avenue: "ave",
  blvd: "blvd",
  boul: "blvd",
  boulevard: "blvd",
  carref: "carref",
  carrefour: "carref",
  cercle: "cir",
  ch: "ch",
  chemin: "ch",
  cir: "cir",
  circ: "cir",
  circle: "cir",
  cour: "cour",
  court: "crt",
  c\u00F4te: "c\xF4te",
  cres: "cres",
  crescent: "cres",
  crois: "crois",
  croissant: "crois",
  crt: "crt",
  ct: "crt",
  dr: "dr",
  drive: "dr",
  expy: "expy",
  expressway: "expy",
  freeway: "fwy",
  fwy: "fwy",
  gardens: "gdns",
  gate: "gate",
  gdns: "gdns",
  grove: "grove",
  heights: "hts",
  hill: "hill",
  highway: "hwy",
  hts: "hts",
  hwy: "hwy",
  imp: "imp",
  impasse: "imp",
  lane: "lane",
  mt\u00E9e: "mt\xE9e",
  mont\u00E9e: "mt\xE9e",
  park: "pk",
  parkway: "pky",
  pass: "pass",
  passage: "pass",
  pk: "pk",
  pky: "pky",
  pl: "pl",
  place: "pl",
  plaza: "plaza",
  point: "pt",
  prom: "prom",
  promenade: "prom",
  pt: "pt",
  rang: "rang",
  rd: "rd",
  rle: "rle",
  road: "rd",
  route: "rte",
  rte: "rte",
  rue: "rue",
  ruelle: "rle",
  sent: "sent",
  sentier: "sent",
  sq: "sq",
  square: "sq",
  st: "st",
  street: "st",
  terr: "terr",
  terrace: "terr",
  terrasse: "terr",
  trail: "trail",
  voie: "voie",
  way: "way"
};

// src/data/directionals.ts
var DIRECTIONAL_MAP = {
  // English
  east: "E",
  north: "N",
  northeast: "NE",
  northwest: "NW",
  south: "S",
  southeast: "SE",
  southwest: "SW",
  west: "W",
  // Short forms
  e: "E",
  n: "N",
  ne: "NE",
  nw: "NW",
  s: "S",
  se: "SE",
  sw: "SW",
  w: "W",
  // French (for Canada)
  est: "E",
  nord: "N",
  "nord-est": "NE",
  "nord-ouest": "NW",
  ouest: "W",
  sud: "S",
  "sud-est": "SE",
  "sud-ouest": "SW"
};

// src/data/facility-patterns.ts
var FACILITY_PATTERNS = [
  /\b(hospital|medical center|clinic|mall|shopping center|plaza|tower|building|center|centre)\b/i,
  /\b(school|university|college|library|church|temple|mosque|synagogue)\b/i,
  /\b(airport|station|terminal|depot|port|harbor|harbour)\b/i,
  /\b(park|recreation|rec center|community center|civic center)\b/i
];

// src/data/postal-patterns.ts
var ZIP_CODE_PATTERN = /^(\d{5})(?:[-\s]?(\d{4}))?$/;
var CANADIAN_POSTAL_CODE_PATTERN = /^([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)$/;

// src/data/secondary-unit-types.ts
var SECONDARY_UNIT_TYPES = {
  apartment: "apt",
  apartme: "apt",
  apt: "apt",
  basement: "bsmt",
  bld: "bldg",
  bldg: "bldg",
  bsmt: "bsmt",
  building: "bldg",
  department: "dept",
  dept: "dept",
  fl: "fl",
  floor: "fl",
  flr: "fl",
  front: "frnt",
  frnt: "frnt",
  hanger: "hngr",
  hngr: "hngr",
  key: "key",
  lbby: "lbby",
  lobby: "lbby",
  lot: "lot",
  lower: "lowr",
  lowr: "lowr",
  ofc: "ofc",
  office: "ofc",
  penthouse: "ph",
  ph: "ph",
  pier: "pier",
  rear: "rear",
  rm: "rm",
  room: "rm",
  side: "side",
  slip: "slip",
  space: "spc",
  spc: "spc",
  ste: "ste",
  stop: "stop",
  su: "ste",
  suite: "ste",
  trailer: "trlr",
  trlr: "trlr",
  unit: "unit",
  upper: "uppr",
  uppr: "uppr"
};

// src/data/us-states.ts
var US_STATE_NAMES = {
  alabama: "AL",
  alaska: "AK",
  "american samoa": "AS",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  "district of columbia": "DC",
  florida: "FL",
  georgia: "GA",
  guam: "GU",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  "northern mariana islands": "MP",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "puerto rico": "PR",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  "virgin islands": "VI",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY"
};
var US_STATE_ALTERNATIVES = {
  // Alabama
  ala: "AL",
  bama: "AL",
  // Arizona
  ariz: "AZ",
  // Arkansas
  ark: "AR",
  // California
  cal: "CA",
  cali: "CA",
  calif: "CA",
  // Colorado
  colo: "CO",
  // Connecticut
  conn: "CT",
  // Delaware
  del: "DE",
  // District of Columbia
  dc: "DC",
  // Florida
  fla: "FL",
  // Illinois
  ill: "IL",
  // Indiana
  ind: "IN",
  // Kansas
  kan: "KS",
  kans: "KS",
  // Kentucky
  ky: "KY",
  kent: "KY",
  // Louisiana
  la: "LA",
  lou: "LA",
  // Massachusetts
  mass: "MA",
  // Michigan
  mich: "MI",
  // Minnesota
  minn: "MN",
  // Mississippi
  miss: "MS",
  // Missouri
  mo: "MO",
  // Montana
  mont: "MT",
  // Nebraska
  neb: "NE",
  nebr: "NE",
  // Nevada
  nev: "NV",
  // New Hampshire
  "new hamp": "NH",
  "new hampsh": "NH",
  // New Jersey
  "new jers": "NJ",
  // New Mexico
  "new mex": "NM",
  "new mexic": "NM",
  // North Carolina
  "n carolina": "NC",
  "north car": "NC",
  // North Dakota
  "n dakota": "ND",
  "north dak": "ND",
  // Oklahoma
  okla: "OK",
  // Oregon
  ore: "OR",
  oreg: "OR",
  // Pennsylvania
  penn: "PA",
  pa: "PA",
  penna: "PA",
  pennsyl: "PA",
  // Rhode Island
  "rhode isl": "RI",
  // South Carolina
  "s carolina": "SC",
  "south car": "SC",
  // South Dakota
  "s dakota": "SD",
  "south dak": "SD",
  // Tennessee
  tenn: "TN",
  // Texas
  tex: "TX",
  // Vermont
  vt: "VT",
  // Virginia
  va: "VA",
  virg: "VA",
  // Washington
  wash: "WA",
  // West Virginia
  "west va": "WV",
  "west virg": "WV",
  // Wisconsin
  wis: "WI",
  wisc: "WI",
  // Wyoming
  wyo: "WY"
};
var US_STATES = {
  ...US_STATE_NAMES,
  ...US_STATE_ALTERNATIVES
};
var US_REGIONS = Object.entries(US_STATES).map(([name, abbr]) => ({
  abbr,
  country: "US",
  name
}));

// src/data/us-street-types.ts
var US_STREET_TYPES = {
  allee: "aly",
  alley: "aly",
  ally: "aly",
  anex: "anx",
  annex: "anx",
  annx: "anx",
  arcade: "arc",
  av: "ave",
  ave: "ave",
  aven: "ave",
  avenu: "ave",
  avenue: "ave",
  avn: "ave",
  avnue: "ave",
  bayoo: "byu",
  bayou: "byu",
  beach: "bch",
  bend: "bnd",
  blf: "blf",
  bluf: "blf",
  bluff: "blf",
  bluffs: "blfs",
  bot: "btm",
  bottom: "btm",
  bottm: "btm",
  boul: "blvd",
  boulevard: "blvd",
  boulv: "blvd",
  branch: "br",
  brdge: "brg",
  bridge: "brg",
  brnch: "br",
  brook: "brk",
  brooks: "brks",
  burg: "bg",
  burgs: "bgs",
  byp: "byp",
  bypa: "byp",
  bypas: "byp",
  bypass: "byp",
  byps: "byp",
  camp: "cp",
  canyn: "cyn",
  canyon: "cyn",
  cape: "cpe",
  causeway: "cswy",
  causwa: "cswy",
  cent: "ctr",
  center: "ctr",
  centr: "ctr",
  centre: "ctr",
  centers: "ctrs",
  cir: "cir",
  circ: "cir",
  circl: "cir",
  circle: "cir",
  circles: "cirs",
  cliff: "clf",
  cliffs: "clfs",
  club: "clb",
  cmp: "cp",
  cnter: "ctr",
  cntr: "ctr",
  cnyn: "cyn",
  cmn: "cmn",
  cmns: "cmns",
  common: "cmn",
  commons: "cmns",
  cor: "cor",
  corner: "cor",
  corners: "cors",
  cors: "cors",
  course: "crse",
  court: "ct",
  courts: "cts",
  cove: "cv",
  coves: "cvs",
  crcl: "cir",
  crcle: "cir",
  creek: "crk",
  cres: "cres",
  crescent: "cres",
  crest: "crst",
  crossing: "xing",
  crossroad: "xrd",
  crossroads: "xrds",
  crsent: "cres",
  crsnt: "cres",
  crssing: "xing",
  crssng: "xing",
  crt: "ct",
  curve: "curv",
  dale: "dl",
  dam: "dm",
  div: "dv",
  divide: "dv",
  dr: "dr",
  driv: "dr",
  drive: "dr",
  drives: "drs",
  drv: "dr",
  dvd: "dv",
  est: "est",
  estate: "est",
  estates: "ests",
  exp: "expy",
  expr: "expy",
  express: "expy",
  expressway: "expy",
  expw: "expy",
  expy: "expy",
  ext: "ext",
  extension: "ext",
  extensions: "exts",
  extn: "ext",
  extnsn: "ext",
  fall: "fall",
  falls: "fls",
  ferry: "fry",
  field: "fld",
  fields: "flds",
  flat: "flt",
  flats: "flts",
  fls: "fls",
  ford: "frd",
  fords: "frds",
  forg: "frg",
  forge: "frg",
  forges: "frgs",
  fork: "frk",
  forks: "frks",
  forest: "frst",
  forests: "frst",
  fort: "ft",
  frd: "frd",
  frds: "frds",
  freewy: "fwy",
  freeway: "fwy",
  frg: "frg",
  frgs: "frgs",
  frk: "frk",
  frks: "frks",
  frry: "fry",
  frst: "frst",
  frt: "ft",
  frway: "fwy",
  frwy: "fwy",
  fry: "fry",
  ft: "ft",
  fwy: "fwy",
  garden: "gdn",
  gardens: "gdns",
  gardn: "gdn",
  gatewy: "gtwy",
  gateway: "gtwy",
  gatway: "gtwy",
  gdn: "gdn",
  gdns: "gdns",
  glen: "gln",
  glens: "glns",
  grden: "gdn",
  grdn: "gdn",
  grdns: "gdns",
  green: "grn",
  greens: "grns",
  grov: "grv",
  grove: "grv",
  groves: "grvs",
  gtway: "gtwy",
  gtwy: "gtwy",
  harb: "hbr",
  harbor: "hbr",
  harbors: "hbrs",
  harbr: "hbr",
  haven: "hvn",
  hbr: "hbr",
  hbrs: "hbrs",
  height: "hts",
  heights: "hts",
  hgts: "hts",
  highway: "hwy",
  highwy: "hwy",
  hill: "hl",
  hills: "hls",
  hiway: "hwy",
  hiwy: "hwy",
  hl: "hl",
  hllw: "holw",
  hls: "hls",
  hollow: "holw",
  hollows: "holw",
  holw: "holw",
  holws: "holw",
  hrbor: "hbr",
  ht: "hts",
  hts: "hts",
  hvn: "hvn",
  hway: "hwy",
  hwy: "hwy",
  inlet: "inlt",
  inlt: "inlt",
  is: "is",
  island: "is",
  islands: "iss",
  isle: "isle",
  isles: "isle",
  islnd: "is",
  islnds: "iss",
  iss: "iss",
  jct: "jct",
  jction: "jct",
  jctn: "jct",
  jctns: "jcts",
  jcts: "jcts",
  junctn: "jct",
  junction: "jct",
  junctions: "jcts",
  juncton: "jct",
  key: "ky",
  keys: "kys",
  knl: "knl",
  knol: "knl",
  knoll: "knl",
  knolls: "knls",
  knols: "knls",
  ky: "ky",
  kys: "kys",
  lake: "lk",
  lakes: "lks",
  land: "land",
  landing: "lndg",
  lane: "ln",
  lanes: "ln",
  ldg: "ldg",
  ldge: "ldg",
  lf: "lf",
  lgt: "lgt",
  lgts: "lgts",
  light: "lgt",
  lights: "lgts",
  lk: "lk",
  lks: "lks",
  ln: "ln",
  lndg: "lndg",
  lndng: "lndg",
  loaf: "lf",
  lck: "lck",
  lcks: "lcks",
  lock: "lck",
  locks: "lcks",
  lodg: "ldg",
  lodge: "ldg",
  loop: "loop",
  loops: "loop",
  mall: "mall",
  manr: "mnr",
  manor: "mnr",
  manors: "mnrs",
  manrs: "mnrs",
  mdw: "mdw",
  mdws: "mdws",
  meadow: "mdw",
  meadows: "mdws",
  medows: "mdws",
  mews: "mews",
  mill: "ml",
  mills: "mls",
  mission: "msn",
  missn: "msn",
  ml: "ml",
  mls: "mls",
  mnt: "mt",
  mntain: "mtn",
  mntn: "mtn",
  mntns: "mtns",
  mnr: "mnr",
  mnrs: "mnrs",
  motorway: "mtwy",
  mount: "mt",
  mountain: "mtn",
  mountains: "mtns",
  mountin: "mtn",
  msn: "msn",
  mssn: "msn",
  mt: "mt",
  mtin: "mtn",
  mtn: "mtn",
  mtns: "mtns",
  mtwy: "mtwy",
  nck: "nck",
  neck: "nck",
  opas: "opas",
  orch: "orch",
  orchard: "orch",
  orchrd: "orch",
  oval: "oval",
  overpass: "opas",
  park: "park",
  parks: "park",
  parkway: "pkwy",
  parkways: "pkwy",
  parkwy: "pkwy",
  pass: "pass",
  passage: "psge",
  path: "path",
  paths: "path",
  pike: "pike",
  pikes: "pike",
  pine: "pne",
  pines: "pnes",
  pky: "pkwy",
  pkway: "pkwy",
  pkwy: "pkwy",
  pkwys: "pkwy",
  pl: "pl",
  place: "pl",
  plain: "pln",
  plains: "plns",
  plaza: "plz",
  plc: "pl",
  pln: "pln",
  plns: "plns",
  plz: "plz",
  plza: "plz",
  pne: "pne",
  pnes: "pnes",
  point: "pt",
  points: "pts",
  port: "prt",
  ports: "prts",
  pr: "pr",
  prairie: "pr",
  prarie: "pr",
  prk: "park",
  prr: "pr",
  prt: "prt",
  prts: "prts",
  psge: "psge",
  pt: "pt",
  pts: "pts",
  rad: "radl",
  radial: "radl",
  radl: "radl",
  ramp: "ramp",
  ranch: "rnch",
  ranches: "rnch",
  rapid: "rpd",
  rapids: "rpds",
  rd: "rd",
  rdg: "rdg",
  rdge: "rdg",
  rdgs: "rdgs",
  rds: "rds",
  rest: "rst",
  ridge: "rdg",
  ridges: "rdgs",
  riv: "riv",
  river: "riv",
  rivr: "riv",
  rnch: "rnch",
  rnchs: "rnch",
  road: "rd",
  roads: "rds",
  route: "rte",
  row: "row",
  rpd: "rpd",
  rpds: "rpds",
  rst: "rst",
  rte: "rte",
  rue: "rue",
  run: "run",
  rvr: "riv",
  shl: "shl",
  shls: "shls",
  shoal: "shl",
  shoals: "shls",
  shoar: "shr",
  shoars: "shrs",
  shore: "shr",
  shores: "shrs",
  shr: "shr",
  shrs: "shrs",
  skyway: "skwy",
  skwy: "skwy",
  spg: "spg",
  spgs: "spgs",
  spng: "spg",
  spngs: "spgs",
  spring: "spg",
  springs: "spgs",
  sprng: "spg",
  sprngs: "spgs",
  spur: "spur",
  spurs: "spur",
  sq: "sq",
  sqr: "sq",
  sqre: "sq",
  sqrs: "sqs",
  sqs: "sqs",
  squ: "sq",
  square: "sq",
  squares: "sqs",
  st: "st",
  sta: "sta",
  station: "sta",
  statn: "sta",
  stn: "sta",
  str: "st",
  stra: "stra",
  strav: "stra",
  straven: "stra",
  stravenue: "stra",
  stream: "strm",
  streme: "strm",
  street: "st",
  streets: "sts",
  strm: "strm",
  strt: "st",
  strvn: "stra",
  strvnue: "stra",
  sts: "sts",
  sumit: "smt",
  sumitt: "smt",
  summit: "smt",
  smt: "smt",
  ter: "ter",
  terr: "ter",
  terrace: "ter",
  throughway: "trwy",
  tpke: "tpke",
  trace: "trce",
  traces: "trce",
  track: "trak",
  tracks: "trak",
  trafficway: "trfy",
  trail: "trl",
  trailer: "trlr",
  trails: "trl",
  trak: "trak",
  trce: "trce",
  trfy: "trfy",
  trk: "trak",
  trks: "trak",
  trl: "trl",
  trlr: "trlr",
  trlrs: "trlr",
  trls: "trl",
  trnpk: "tpke",
  trwy: "trwy",
  tunel: "tunl",
  tunl: "tunl",
  tunls: "tunl",
  tunnel: "tunl",
  tunnels: "tunl",
  tunnl: "tunl",
  turnpike: "tpke",
  turnpk: "tpke",
  un: "un",
  underpass: "upas",
  union: "un",
  unions: "uns",
  uns: "uns",
  upas: "upas",
  valley: "vly",
  valleys: "vlys",
  vally: "vly",
  vdct: "via",
  via: "via",
  viadct: "via",
  viaduct: "via",
  view: "vw",
  views: "vws",
  vill: "vlg",
  villag: "vlg",
  village: "vlg",
  villages: "vlgs",
  villg: "vlg",
  villiage: "vlg",
  ville: "vl",
  vis: "vis",
  vist: "vis",
  vista: "vis",
  vl: "vl",
  vlg: "vlg",
  vlgs: "vlgs",
  vlly: "vly",
  vly: "vly",
  vlys: "vlys",
  vst: "vis",
  vsta: "vis",
  vw: "vw",
  vws: "vws",
  walk: "walk",
  walks: "walk",
  wall: "wall",
  way: "way",
  ways: "ways",
  well: "wl",
  wells: "wls",
  wl: "wl",
  wls: "wls",
  wy: "way",
  xing: "xing",
  xrd: "xrd",
  xrds: "xrds"
};

// src/utils.ts
function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, " ").replace(/[.,;]/g, " ").trim();
}
function buildRegexFromDict(dict, capture = true) {
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  const pattern = keys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(capture ? `\\b(${pattern})\\b` : `\\b(?:${pattern})\\b`, "i");
}
function parseDirectional(text) {
  const dirPattern = buildRegexFromDict(DIRECTIONAL_MAP);
  const match = text.match(dirPattern);
  if (match) {
    const direction = DIRECTIONAL_MAP[match[1].toLowerCase()];
    const remaining = text.replace(dirPattern, " ").replace(/\s+/g, " ").trim();
    return { direction, remaining };
  }
  return { direction: void 0, remaining: text };
}
function parseStreetType(text, country = "US") {
  const typeMap = country === "CA" ? { ...US_STREET_TYPES, ...CA_STREET_TYPES } : US_STREET_TYPES;
  const typePattern = buildRegexFromDict(typeMap);
  const match = text.match(typePattern);
  if (match) {
    const type = typeMap[match[1].toLowerCase()];
    const remaining = text.replace(typePattern, " ").replace(/\s+/g, " ").trim();
    return { type, remaining };
  }
  return { type: void 0, remaining: text };
}
function parseStateProvince(text, country) {
  const usAbbrevPattern = new RegExp(`\\b(${Object.values(US_STATES).join("|")})\\b`, "i");
  let match = text.match(usAbbrevPattern);
  if (match) {
    const state = match[1].toUpperCase();
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), " ").replace(/\s+/g, " ").trim();
    return { state, remaining, detectedCountry: "US" };
  }
  const caAbbrevPattern = new RegExp(`\\b(${Object.values(CA_PROVINCES).join("|")})\\b`, "i");
  match = text.match(caAbbrevPattern);
  if (match) {
    const state = match[1].toUpperCase();
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), " ").replace(/\s+/g, " ").trim();
    return { state, remaining, detectedCountry: "CA" };
  }
  const usPattern = buildRegexFromDict(US_STATES);
  match = text.match(usPattern);
  if (match) {
    const state = US_STATES[match[1].toLowerCase()];
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), " ").replace(/\s+/g, " ").trim();
    return { state, remaining, detectedCountry: "US" };
  }
  const caPattern = buildRegexFromDict(CA_PROVINCES);
  match = text.match(caPattern);
  if (match) {
    const state = CA_PROVINCES[match[1].toLowerCase()];
    const remaining = text.replace(new RegExp(`\\b${match[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), " ").replace(/\s+/g, " ").trim();
    return { state, remaining, detectedCountry: "CA" };
  }
  return { state: void 0, remaining: text };
}
function parsePostalCode(text) {
  const zipMatch = text.match(/\b(\d{5})(?:[-\s]?(\d{4}))?\b/);
  if (zipMatch) {
    const zip = zipMatch[1];
    const zipext = zipMatch[2];
    const remaining = text.replace(zipMatch[0], " ").replace(/\s+/g, " ").trim();
    return { zip, zipext, remaining, detectedCountry: "US" };
  }
  const postalMatch = text.match(/\b([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)\b/);
  if (postalMatch) {
    const zip = `${postalMatch[1]} ${postalMatch[2]}`.toUpperCase();
    const remaining = text.replace(postalMatch[0], " ").replace(/\s+/g, " ").trim();
    return { zip, zipext: void 0, remaining, detectedCountry: "CA" };
  }
  return { zip: void 0, zipext: void 0, remaining: text };
}
function parseSecondaryUnit(text) {
  const unitPattern = buildRegexFromDict(SECONDARY_UNIT_TYPES);
  const unitMatch = text.match(new RegExp(`${unitPattern.source}\\s*(\\d+\\w*|[a-zA-Z]+\\d*)`));
  if (unitMatch) {
    const sec_unit_type = SECONDARY_UNIT_TYPES[unitMatch[1].toLowerCase()];
    const sec_unit_num = unitMatch[2];
    const unit = `${sec_unit_type} ${sec_unit_num}`;
    const remaining = text.replace(unitMatch[0], " ").replace(/\s+/g, " ").trim();
    return { unit, sec_unit_type, sec_unit_num, remaining };
  }
  const numberMatch = text.match(/\b(apt|apartment|unit|ste|suite|#)\s*(\d+\w*)\b/i);
  if (numberMatch) {
    const sec_unit_type = SECONDARY_UNIT_TYPES[numberMatch[1].toLowerCase()] || numberMatch[1].toLowerCase();
    const sec_unit_num = numberMatch[2];
    const unit = `${sec_unit_type} ${sec_unit_num}`;
    const remaining = text.replace(numberMatch[0], " ").replace(/\s+/g, " ").trim();
    return { unit, sec_unit_type, sec_unit_num, remaining };
  }
  return { unit: void 0, sec_unit_type: void 0, sec_unit_num: void 0, remaining: text };
}
function parseFacility(text) {
  for (const pattern of FACILITY_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const fullMatch = text.match(new RegExp(`\\b[\\w\\s]*${match[0]}[\\w\\s]*\\b`, "i"));
      if (fullMatch) {
        const facility = fullMatch[0].trim();
        const remaining = text.replace(fullMatch[0], " ").replace(/\s+/g, " ").trim();
        return { facility, remaining };
      }
    }
  }
  return { facility: void 0, remaining: text };
}
function parseParenthetical(text) {
  const parenMatch = text.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const secondary = parenMatch[1].trim();
    const remaining = text.replace(parenMatch[0], " ").replace(/\s+/g, " ").trim();
    return { secondary, remaining };
  }
  return { secondary: void 0, remaining: text };
}
function parseStreetNumber(text) {
  const fracMatch = text.match(/^\s*(\d+(?:\s*[-\/]\s*\d+\/\d+|\s+\d+\/\d+)?)\b/);
  if (fracMatch) {
    const number = fracMatch[1].replace(/\s+/g, " ").trim();
    const remaining = text.replace(fracMatch[0], " ").replace(/\s+/g, " ").trim();
    return { number, remaining };
  }
  const numMatch = text.match(/^\s*(\d+)\b/);
  if (numMatch) {
    const number = numMatch[1];
    const remaining = text.replace(numMatch[0], " ").replace(/\s+/g, " ").trim();
    return { number, remaining };
  }
  return { number: void 0, remaining: text };
}
function detectCountry(address) {
  if (address.state) {
    if (Object.values(US_STATES).includes(address.state) || Object.keys(US_STATES).includes(address.state.toLowerCase())) {
      return "US";
    }
    if (Object.values(CA_PROVINCES).includes(address.state) || Object.keys(CA_PROVINCES).includes(address.state.toLowerCase())) {
      return "CA";
    }
  }
  if (address.zip) {
    if (ZIP_CODE_PATTERN.test(address.zip)) {
      return "US";
    }
    if (CANADIAN_POSTAL_CODE_PATTERN.test(address.zip)) {
      return "CA";
    }
  }
  return void 0;
}

// src/parser.ts
var buildPatterns = () => {
  const streetTypes = Object.keys(US_STREET_TYPES).concat(Object.values(US_STREET_TYPES)).filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => b.length - a.length).join("|");
  const directionals = Object.keys(DIRECTIONAL_MAP).concat(Object.values(DIRECTIONAL_MAP)).filter((v, i, arr) => arr.indexOf(v) === i).sort((a, b) => b.length - a.length).join("|");
  const states = Object.keys(US_STATES).concat(Object.values(US_STATES)).concat(Object.keys(CA_PROVINCES)).concat(Object.values(CA_PROVINCES)).filter((v, i, arr) => arr.indexOf(v) === i).join("|");
  return {
    number: String.raw`(\d+[-\w]*|\w\d+\w\d+)`,
    fraction: String.raw`(\d+\/\d+)`,
    directional: `(${directionals})`,
    streetType: `(${streetTypes})`,
    state: `\\b(${states})\\b`,
    zip: String.raw`(\d{5}(?:[-\s]\d{4})?)`,
    poBox: String.raw`(?:p\.?o\.?\s*box|post\s*office\s*box|pobox)\s*(\d+)`,
    intersection: String.raw`\s+(?:and|&|at|\@)\s+`,
    secUnit: String.raw`(?:(suite?|ste?|apt|apartment|unit|#)\s*([a-z0-9-]+))`
  };
};
function parseLocation(address, options = {}) {
  if (!address || typeof address !== "string") {
    return null;
  }
  const original = address.trim();
  const patterns = buildPatterns();
  if (new RegExp(patterns.intersection, "i").test(original)) {
    return parseIntersection(original, options);
  }
  const poBoxMatch = original.match(new RegExp(`^\\s*${patterns.poBox}`, "i"));
  if (poBoxMatch) {
    return parsePoBox(original, options);
  }
  return parseStandardAddress(original, options) || parseInformalAddress(original, options);
}
function parsePoBox(address, options = {}) {
  const patterns = buildPatterns();
  const match = address.match(new RegExp(
    `^\\s*${patterns.poBox}\\s*,?\\s*(?:([^\\d,]+?)\\s*,?\\s*)?(?:${patterns.state}\\s*)?(?:${patterns.zip})?\\s*$`,
    "i"
  ));
  if (!match) return null;
  const result = {
    sec_unit_type: match[0].replace(/\s*\d+.*$/, "").trim(),
    sec_unit_num: match[1]
  };
  if (match[2]) result.city = match[2].trim();
  if (match[3]) result.state = match[3].toUpperCase();
  if (match[4]) result.zip = match[4];
  result.country = detectCountry(result);
  return result;
}
function parseStandardAddress(address, options = {}) {
  const patterns = buildPatterns();
  const commaParts = address.split(",").map((p) => p.trim());
  let zipPart = "";
  let cityStatePart = "";
  let addressPart = commaParts[0];
  if (commaParts.length > 1) {
    const lastPart = commaParts[commaParts.length - 1];
    const zipMatch = lastPart.match(new RegExp(patterns.zip));
    if (zipMatch) {
      zipPart = zipMatch[1];
      cityStatePart = lastPart.replace(zipMatch[0], "").trim();
      if (commaParts.length > 2) {
        cityStatePart = commaParts[commaParts.length - 2] + " " + cityStatePart;
      }
    } else {
      cityStatePart = commaParts.slice(1).join(" ");
    }
  }
  const result = {};
  const addressMatch = addressPart.match(new RegExp(
    `^\\s*(?:${patterns.number}\\s+)?(?:${patterns.fraction}\\s+)?(?:${patterns.directional}\\s+)?([^\\s]+(?:\\s+[^\\s]+)*)\\s*(?:${patterns.streetType}\\b\\s*)?(?:${patterns.directional}\\s*)?(?:${patterns.secUnit}\\s*)?$`,
    "i"
  ));
  if (addressMatch) {
    let i = 1;
    if (addressMatch[i]) result.number = addressMatch[i++];
    if (addressMatch[i]) result.fraction = addressMatch[i++];
    if (addressMatch[i]) result.prefix = addressMatch[i++].toUpperCase();
    let streetText = addressMatch[i++];
    if (streetText) {
      const streetTypeMatch = streetText.match(new RegExp(`\\b(${patterns.streetType.slice(1, -1)})\\b\\s*$`, "i"));
      if (streetTypeMatch) {
        result.type = normalizeStreetType(streetTypeMatch[1]);
        result.street = streetText.replace(streetTypeMatch[0], "").trim();
      } else {
        result.street = streetText.trim();
      }
    }
    if (addressMatch[i]) result.suffix = addressMatch[i++].toUpperCase();
    if (addressMatch[i] && addressMatch[i + 1]) {
      result.sec_unit_type = addressMatch[i++].toLowerCase();
      result.sec_unit_num = addressMatch[i++];
      result.unit = `${result.sec_unit_type} ${result.sec_unit_num}`;
    }
  }
  if (cityStatePart) {
    const cityStateMatch = cityStatePart.match(new RegExp(`^(.+?)\\s+${patterns.state}\\s*$`, "i"));
    if (cityStateMatch) {
      result.city = cityStateMatch[1].trim();
      result.state = cityStateMatch[2].toUpperCase();
    } else {
      const stateMatch = cityStatePart.match(new RegExp(`^${patterns.state}\\s*$`, "i"));
      if (stateMatch) {
        result.state = stateMatch[1].toUpperCase();
      } else {
        result.city = cityStatePart;
      }
    }
  }
  if (zipPart) {
    result.zip = zipPart;
  }
  result.country = detectCountry(result);
  return result.number || result.street ? result : null;
}
function parseInformalAddress(address, options = {}) {
  const patterns = buildPatterns();
  const parts = address.split(/\s*,\s*/);
  if (parts.length === 0) return null;
  const result = {};
  const firstPart = parts[0];
  const numberMatch = firstPart.match(new RegExp(`^\\s*${patterns.number}\\s+(.+)$`));
  if (numberMatch) {
    result.number = numberMatch[1];
    result.street = numberMatch[2];
  } else {
    result.street = firstPart;
  }
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const zipMatch = lastPart.match(new RegExp(patterns.zip));
    if (zipMatch) {
      result.zip = zipMatch[1];
      result.country = "US";
    }
  }
  return result;
}
function normalizeStreetType(type) {
  const normalized = type.toLowerCase().replace(/\./g, "");
  return US_STREET_TYPES[normalized] || type.toLowerCase();
}
function parseIntersection(address, options = {}) {
  const patterns = buildPatterns();
  const intersectionPattern = new RegExp(patterns.intersection, "i");
  const parts = address.split(intersectionPattern);
  if (parts.length !== 2) return null;
  const result = {};
  let locationText = parts[1].trim();
  const locationMatch = locationText.match(new RegExp(
    `(.+?)\\s*,?\\s*([^,]+?)\\s*,?\\s*${patterns.state}\\s*(?:${patterns.zip})?\\s*$`,
    "i"
  ));
  if (locationMatch) {
    result.city = locationMatch[2].trim();
    result.state = locationMatch[3].toUpperCase();
    if (locationMatch[4]) result.zip = locationMatch[4];
    locationText = locationMatch[1].trim();
  } else {
    const simpleLocationMatch = locationText.match(new RegExp(
      `(.+?)\\s+${patterns.state}\\s*$`,
      "i"
    ));
    if (simpleLocationMatch) {
      result.city = simpleLocationMatch[1].trim();
      result.state = simpleLocationMatch[2].toUpperCase();
      locationText = "";
    }
  }
  const street1Text = parts[0].trim();
  const street1Match = street1Text.match(new RegExp(
    `^([^\\s]+(?:\\s+[^\\s]+)*)\\s*(?:(${patterns.streetType.slice(1, -1)})\\b)?\\s*$`,
    "i"
  ));
  if (street1Match) {
    result.street1 = street1Match[1].trim();
    result.type1 = street1Match[2] ? normalizeStreetType(street1Match[2]) : "";
  }
  const street2Text = locationText || parts[1].trim();
  const street2Match = street2Text.match(new RegExp(
    `^([^\\s]+(?:\\s+[^\\s]+)*)\\s*(?:(${patterns.streetType.slice(1, -1)})\\b)?`,
    "i"
  ));
  if (street2Match) {
    result.street2 = street2Match[1].trim();
    result.type2 = street2Match[2] ? normalizeStreetType(street2Match[2]) : "";
  }
  if (!result.street1 || !result.street2) return null;
  if (!result.type1) result.type1 = "";
  if (!result.type2) result.type2 = "";
  return result;
}
function parseAddress(address, options = {}) {
  return parseLocation(address, options);
}
function createParser(defaultOptions = {}) {
  return {
    parseAddress: (address, options) => parseAddress(address, { ...defaultOptions, ...options }),
    parseInformalAddress: (address, options) => parseInformalAddress(address, { ...defaultOptions, ...options }),
    parseIntersection: (address, options) => parseIntersection(address, { ...defaultOptions, ...options }),
    parseLocation: (address, options) => parseLocation(address, { ...defaultOptions, ...options })
  };
}
var parser = createParser();

// src/index.ts
var parser2 = {
  parseLocation,
  parseIntersection,
  parseInformalAddress,
  parseAddress
};
var index_default = parser2;
export {
  CANADIAN_POSTAL_CODE_PATTERN,
  CA_PROVINCES,
  CA_PROVINCE_ALTERNATIVES,
  CA_PROVINCE_NAMES,
  CA_PROVINCE_NAMES_EN,
  CA_PROVINCE_NAMES_FR,
  CA_REGIONS,
  CA_STREET_TYPES,
  DIRECTIONAL_MAP,
  FACILITY_PATTERNS,
  SECONDARY_UNIT_TYPES,
  US_REGIONS,
  US_STATES,
  US_STATE_ALTERNATIVES,
  US_STATE_NAMES,
  US_STREET_TYPES,
  ZIP_CODE_PATTERN,
  buildRegexFromDict,
  index_default as default,
  detectCountry,
  normalizeText,
  parseAddress,
  parseDirectional,
  parseFacility,
  parseInformalAddress,
  parseIntersection,
  parseLocation,
  parseParenthetical,
  parsePostalCode,
  parseSecondaryUnit,
  parseStateProvince,
  parseStreetNumber,
  parseStreetType
};
//# sourceMappingURL=index.js.map
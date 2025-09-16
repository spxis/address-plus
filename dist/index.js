// src/data.ts
var DIRECTIONAL_MAP = {
  // English
  "north": "N",
  "northeast": "NE",
  "east": "E",
  "southeast": "SE",
  "south": "S",
  "southwest": "SW",
  "west": "W",
  "northwest": "NW",
  // Short forms
  "n": "N",
  "ne": "NE",
  "e": "E",
  "se": "SE",
  "s": "S",
  "sw": "SW",
  "w": "W",
  "nw": "NW",
  // French (for Canada)
  "nord": "N",
  "nord-est": "NE",
  "est": "E",
  "sud-est": "SE",
  "sud": "S",
  "sud-ouest": "SW",
  "ouest": "W",
  "nord-ouest": "NW"
};
var US_STREET_TYPES = {
  "alley": "aly",
  "allee": "aly",
  "ally": "aly",
  "anex": "anx",
  "annex": "anx",
  "annx": "anx",
  "arcade": "arc",
  "avenue": "ave",
  "av": "ave",
  "aven": "ave",
  "avenu": "ave",
  "avn": "ave",
  "avnue": "ave",
  "ave": "ave",
  "bayou": "byu",
  "bayoo": "byu",
  "beach": "bch",
  "bend": "bnd",
  "bluff": "blf",
  "bluf": "blf",
  "bluffs": "blfs",
  "bottom": "btm",
  "bot": "btm",
  "bottm": "btm",
  "boulevard": "blvd",
  "blvd": "blvd",
  "boul": "blvd",
  "boulv": "blvd",
  "branch": "br",
  "brnch": "br",
  "bridge": "brg",
  "brdge": "brg",
  "brook": "brk",
  "brooks": "brks",
  "burg": "bg",
  "burgs": "bgs",
  "bypass": "byp",
  "bypa": "byp",
  "bypas": "byp",
  "byps": "byp",
  "camp": "cp",
  "cmp": "cp",
  "canyon": "cyn",
  "canyn": "cyn",
  "cnyn": "cyn",
  "cape": "cpe",
  "causeway": "cswy",
  "causwa": "cswy",
  "center": "ctr",
  "cent": "ctr",
  "centr": "ctr",
  "centre": "ctr",
  "cnter": "ctr",
  "cntr": "ctr",
  "centers": "ctrs",
  "circle": "cir",
  "circ": "cir",
  "circl": "cir",
  "crcl": "cir",
  "crcle": "cir",
  "circles": "cirs",
  "cliff": "clf",
  "cliffs": "clfs",
  "club": "clb",
  "common": "cmn",
  "commons": "cmns",
  "corner": "cor",
  "corners": "cors",
  "course": "crse",
  "court": "ct",
  "crt": "ct",
  "courts": "cts",
  "cove": "cv",
  "coves": "cvs",
  "creek": "crk",
  "crescent": "cres",
  "crsent": "cres",
  "crsnt": "cres",
  "crest": "crst",
  "crossing": "xing",
  "crssng": "xing",
  "crssing": "xing",
  "crossroad": "xrd",
  "crossroads": "xrds",
  "curve": "curv",
  "dale": "dl",
  "dam": "dm",
  "divide": "dv",
  "div": "dv",
  "dvd": "dv",
  "drive": "dr",
  "driv": "dr",
  "drv": "dr",
  "drives": "drs",
  "estate": "est",
  "estates": "ests",
  "expressway": "expy",
  "exp": "expy",
  "expr": "expy",
  "express": "expy",
  "expw": "expy",
  "extension": "ext",
  "extn": "ext",
  "extnsn": "ext",
  "extensions": "exts",
  "fall": "fall",
  "falls": "fls",
  "ferry": "fry",
  "frry": "fry",
  "field": "fld",
  "fields": "flds",
  "flat": "flt",
  "flats": "flts",
  "ford": "frd",
  "fords": "frds",
  "forest": "frst",
  "forests": "frst",
  "forge": "frg",
  "forg": "frg",
  "forges": "frgs",
  "fork": "frk",
  "forks": "frks",
  "fort": "ft",
  "frt": "ft",
  "freeway": "fwy",
  "freewy": "fwy",
  "frway": "fwy",
  "frwy": "fwy",
  "garden": "gdn",
  "gardn": "gdn",
  "grden": "gdn",
  "grdn": "gdn",
  "gardens": "gdns",
  "grdns": "gdns",
  "gateway": "gtwy",
  "gatewy": "gtwy",
  "gatway": "gtwy",
  "gtway": "gtwy",
  "glen": "gln",
  "glens": "glns",
  "green": "grn",
  "greens": "grns",
  "grove": "grv",
  "grov": "grv",
  "groves": "grvs",
  "harbor": "hbr",
  "harb": "hbr",
  "harbr": "hbr",
  "hrbor": "hbr",
  "harbors": "hbrs",
  "haven": "hvn",
  "heights": "hts",
  "height": "hts",
  "hgts": "hts",
  "ht": "hts",
  "highway": "hwy",
  "highwy": "hwy",
  "hiway": "hwy",
  "hiwy": "hwy",
  "hway": "hwy",
  "hill": "hl",
  "hills": "hls",
  "hollow": "holw",
  "hllw": "holw",
  "hollows": "holw",
  "holws": "holw",
  "inlet": "inlt",
  "island": "is",
  "islnd": "is",
  "islands": "iss",
  "islnds": "iss",
  "isle": "isle",
  "isles": "isle",
  "junction": "jct",
  "jction": "jct",
  "jctn": "jct",
  "junctn": "jct",
  "juncton": "jct",
  "junctions": "jcts",
  "jctns": "jcts",
  "key": "ky",
  "keys": "kys",
  "knoll": "knl",
  "knol": "knl",
  "knolls": "knls",
  "knols": "knls",
  "lake": "lk",
  "lakes": "lks",
  "land": "land",
  "landing": "lndg",
  "lndng": "lndg",
  "lane": "ln",
  "lanes": "ln",
  "light": "lgt",
  "lights": "lgts",
  "loaf": "lf",
  "lock": "lck",
  "locks": "lcks",
  "lodge": "ldg",
  "ldge": "ldg",
  "lodg": "ldg",
  "loop": "loop",
  "loops": "loop",
  "mall": "mall",
  "manor": "mnr",
  "manr": "mnr",
  "manors": "mnrs",
  "manrs": "mnrs",
  "meadow": "mdw",
  "meadows": "mdws",
  "medows": "mdws",
  "mews": "mews",
  "mill": "ml",
  "mills": "mls",
  "mission": "msn",
  "missn": "msn",
  "mssn": "msn",
  "motorway": "mtwy",
  "mount": "mt",
  "mnt": "mt",
  "mountain": "mtn",
  "mntain": "mtn",
  "mntn": "mtn",
  "mountin": "mtn",
  "mtin": "mtn",
  "mountains": "mtns",
  "mntns": "mtns",
  "neck": "nck",
  "orchard": "orch",
  "orchrd": "orch",
  "oval": "oval",
  "overpass": "opas",
  "park": "park",
  "parks": "park",
  "prk": "park",
  "parkway": "pkwy",
  "parkwy": "pkwy",
  "pkway": "pkwy",
  "pky": "pkwy",
  "parkways": "pkwy",
  "pkwys": "pkwy",
  "pass": "pass",
  "passage": "psge",
  "path": "path",
  "paths": "path",
  "pike": "pike",
  "pikes": "pike",
  "pine": "pne",
  "pines": "pnes",
  "place": "pl",
  "plc": "pl",
  "plain": "pln",
  "plains": "plns",
  "plaza": "plz",
  "plza": "plz",
  "point": "pt",
  "points": "pts",
  "port": "prt",
  "ports": "prts",
  "prairie": "pr",
  "prarie": "pr",
  "prr": "pr",
  "radial": "radl",
  "rad": "radl",
  "ramp": "ramp",
  "ranch": "rnch",
  "ranches": "rnch",
  "rnchs": "rnch",
  "rapid": "rpd",
  "rapids": "rpds",
  "rest": "rst",
  "ridge": "rdg",
  "rdge": "rdg",
  "ridges": "rdgs",
  "river": "riv",
  "rivr": "riv",
  "rvr": "riv",
  "road": "rd",
  "roads": "rds",
  "route": "rte",
  "row": "row",
  "rue": "rue",
  "run": "run",
  "shoal": "shl",
  "shoals": "shls",
  "shore": "shr",
  "shoar": "shr",
  "shores": "shrs",
  "shoars": "shrs",
  "skyway": "skwy",
  "spring": "spg",
  "spng": "spg",
  "sprng": "spg",
  "springs": "spgs",
  "spngs": "spgs",
  "sprngs": "spgs",
  "spur": "spur",
  "spurs": "spur",
  "square": "sq",
  "sqr": "sq",
  "sqre": "sq",
  "squ": "sq",
  "squares": "sqs",
  "sqrs": "sqs",
  "station": "sta",
  "statn": "sta",
  "stn": "sta",
  "stravenue": "stra",
  "strav": "stra",
  "straven": "stra",
  "strvn": "stra",
  "strvnue": "stra",
  "stream": "strm",
  "streme": "strm",
  "street": "st",
  "strt": "st",
  "str": "st",
  "st": "st",
  "streets": "sts",
  "summit": "smt",
  "sumit": "smt",
  "sumitt": "smt",
  "terrace": "ter",
  "terr": "ter",
  "throughway": "trwy",
  "trace": "trce",
  "traces": "trce",
  "track": "trak",
  "tracks": "trak",
  "trk": "trak",
  "trks": "trak",
  "trafficway": "trfy",
  "trail": "trl",
  "trails": "trl",
  "trls": "trl",
  "trailer": "trlr",
  "trlrs": "trlr",
  "tunnel": "tunl",
  "tunel": "tunl",
  "tunls": "tunl",
  "tunnels": "tunl",
  "tunnl": "tunl",
  "turnpike": "tpke",
  "trnpk": "tpke",
  "turnpk": "tpke",
  "underpass": "upas",
  "union": "un",
  "unions": "uns",
  "valley": "vly",
  "vally": "vly",
  "vlly": "vly",
  "valleys": "vlys",
  "viaduct": "via",
  "vdct": "via",
  "viadct": "via",
  "view": "vw",
  "views": "vws",
  "village": "vlg",
  "vill": "vlg",
  "villag": "vlg",
  "villg": "vlg",
  "villiage": "vlg",
  "villages": "vlgs",
  "ville": "vl",
  "vista": "vis",
  "vist": "vis",
  "vst": "vis",
  "vsta": "vis",
  "walk": "walk",
  "walks": "walk",
  "wall": "wall",
  "way": "way",
  "wy": "way",
  "ways": "ways",
  "well": "wl",
  "wells": "wls"
};
var CA_STREET_TYPES = {
  // English
  "avenue": "ave",
  "av": "ave",
  "boulevard": "blvd",
  "blvd": "blvd",
  "boul": "blvd",
  "circle": "cir",
  "circ": "cir",
  "court": "crt",
  "ct": "crt",
  "crescent": "cres",
  "cres": "cres",
  "drive": "dr",
  "dr": "dr",
  "expressway": "expy",
  "freeway": "fwy",
  "gardens": "gdns",
  "gate": "gate",
  "grove": "grove",
  "heights": "hts",
  "highway": "hwy",
  "hill": "hill",
  "lane": "lane",
  "park": "pk",
  "parkway": "pky",
  "place": "pl",
  "plaza": "plaza",
  "point": "pt",
  "road": "rd",
  "route": "rte",
  "square": "sq",
  "street": "st",
  "terrace": "terr",
  "trail": "trail",
  "way": "way",
  // French
  "autoroute": "aut",
  "carrefour": "carref",
  "chemin": "ch",
  "cercle": "cir",
  "c\xF4te": "c\xF4te",
  "cour": "cour",
  "croissant": "crois",
  "impasse": "imp",
  "mont\xE9e": "mt\xE9e",
  "passage": "pass",
  "promenade": "prom",
  "rang": "rang",
  "rue": "rue",
  "ruelle": "rle",
  "sentier": "sent",
  "terrasse": "terr",
  "voie": "voie"
};
var US_STATES = {
  "alabama": "AL",
  "alaska": "AK",
  "arizona": "AZ",
  "arkansas": "AR",
  "california": "CA",
  "colorado": "CO",
  "connecticut": "CT",
  "delaware": "DE",
  "florida": "FL",
  "georgia": "GA",
  "hawaii": "HI",
  "idaho": "ID",
  "illinois": "IL",
  "indiana": "IN",
  "iowa": "IA",
  "kansas": "KS",
  "kentucky": "KY",
  "louisiana": "LA",
  "maine": "ME",
  "maryland": "MD",
  "massachusetts": "MA",
  "michigan": "MI",
  "minnesota": "MN",
  "mississippi": "MS",
  "missouri": "MO",
  "montana": "MT",
  "nebraska": "NE",
  "nevada": "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  "ohio": "OH",
  "oklahoma": "OK",
  "oregon": "OR",
  "pennsylvania": "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  "tennessee": "TN",
  "texas": "TX",
  "utah": "UT",
  "vermont": "VT",
  "virginia": "VA",
  "washington": "WA",
  "west virginia": "WV",
  "wisconsin": "WI",
  "wyoming": "WY",
  "district of columbia": "DC",
  "puerto rico": "PR",
  "virgin islands": "VI",
  "american samoa": "AS",
  "guam": "GU",
  "northern mariana islands": "MP"
};
var CA_PROVINCES = {
  "alberta": "AB",
  "british columbia": "BC",
  "manitoba": "MB",
  "new brunswick": "NB",
  "newfoundland and labrador": "NL",
  "northwest territories": "NT",
  "nova scotia": "NS",
  "nunavut": "NU",
  "ontario": "ON",
  "prince edward island": "PE",
  "quebec": "QC",
  "saskatchewan": "SK",
  "yukon": "YT",
  // French names
  "colombie-britannique": "BC",
  "\xEEle-du-prince-\xE9douard": "PE",
  "nouvelle-\xE9cosse": "NS",
  "nouveau-brunswick": "NB",
  "terre-neuve-et-labrador": "NL",
  "territoires du nord-ouest": "NT",
  "qu\xE9bec": "QC"
};
var SECONDARY_UNIT_TYPES = {
  "apartment": "apt",
  "apt": "apt",
  "apartme": "apt",
  "basement": "bsmt",
  "bsmt": "bsmt",
  "building": "bldg",
  "bldg": "bldg",
  "bld": "bldg",
  "department": "dept",
  "dept": "dept",
  "floor": "fl",
  "fl": "fl",
  "flr": "fl",
  "front": "frnt",
  "frnt": "frnt",
  "hanger": "hngr",
  "hngr": "hngr",
  "key": "key",
  "lobby": "lbby",
  "lbby": "lbby",
  "lot": "lot",
  "lower": "lowr",
  "lowr": "lowr",
  "office": "ofc",
  "ofc": "ofc",
  "penthouse": "ph",
  "ph": "ph",
  "pier": "pier",
  "rear": "rear",
  "room": "rm",
  "rm": "rm",
  "side": "side",
  "slip": "slip",
  "space": "spc",
  "spc": "spc",
  "stop": "stop",
  "suite": "ste",
  "ste": "ste",
  "su": "ste",
  "trailer": "trlr",
  "trlr": "trlr",
  "unit": "unit",
  "upper": "uppr",
  "uppr": "uppr"
};
var ZIP_CODE_PATTERN = /^(\d{5})(?:[-\s]?(\d{4}))?$/;
var CANADIAN_POSTAL_CODE_PATTERN = /^([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)$/;
var FACILITY_PATTERNS = [
  /\b(hospital|medical center|clinic|mall|shopping center|plaza|tower|building|center|centre)\b/i,
  /\b(school|university|college|library|church|temple|mosque|synagogue)\b/i,
  /\b(airport|station|terminal|depot|port|harbor|harbour)\b/i,
  /\b(park|recreation|rec center|community center|civic center)\b/i
];

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
function parseLocation(address, options = {}) {
  if (!address || typeof address !== "string") {
    return null;
  }
  const {
    country = "auto",
    normalize = true,
    validatePostalCode = true,
    language = "auto",
    extractFacilities = true,
    parseParenthetical: enableParenthetical = true
  } = options;
  const original = address.trim();
  const result = {};
  const parts = original.split(",").map((p) => p.trim()).filter(Boolean);
  let streetPart = "";
  let cityPart = "";
  let stateZipPart = "";
  if (parts.length >= 3) {
    streetPart = parts[0];
    cityPart = parts[1];
    stateZipPart = parts.slice(2).join(" ");
  } else if (parts.length >= 2) {
    streetPart = parts[0];
    stateZipPart = parts[1];
  } else if (parts.length === 1) {
    streetPart = parts[0];
  }
  let workingText = original.toLowerCase().replace(/[.,;]/g, " ").replace(/\s+/g, " ").trim();
  if (enableParenthetical) {
    const parenMatch = workingText.match(/\(([^)]+)\)/);
    if (parenMatch) {
      result.secondary = parenMatch[1].trim();
      workingText = workingText.replace(parenMatch[0], " ").replace(/\s+/g, " ").trim();
    }
  }
  if (extractFacilities) {
    const facilityPatterns = [
      /\b(hospital|medical center|clinic|mall|shopping center|plaza|tower|building|center|centre)\b/i,
      /\b(school|university|college|library|church|temple|mosque|synagogue)\b/i
    ];
    for (const pattern of facilityPatterns) {
      const match = workingText.match(pattern);
      if (match) {
        const fullMatch = workingText.match(new RegExp(`\\b[\\w\\s]*${match[0]}[\\w\\s]*\\b`, "i"));
        if (fullMatch) {
          result.facility = fullMatch[0].trim();
          workingText = workingText.replace(fullMatch[0], " ").replace(/\s+/g, " ").trim();
          break;
        }
      }
    }
  }
  let sourceForZip = stateZipPart || original;
  const zipMatch = sourceForZip.match(/\b(\d{5})(?:[-\s]?(\d{4}))?\b/);
  const postalMatch = sourceForZip.match(/\b([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)\b/);
  if (zipMatch) {
    result.zip = zipMatch[1];
    if (zipMatch[2]) result.zipext = zipMatch[2];
    result.country = "US";
    if (stateZipPart) {
      stateZipPart = stateZipPart.replace(new RegExp(zipMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ").replace(/\s+/g, " ").trim();
    } else {
      streetPart = streetPart.replace(new RegExp(zipMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ").replace(/\s+/g, " ").trim();
    }
  } else if (postalMatch) {
    result.zip = `${postalMatch[1]} ${postalMatch[2]}`.toUpperCase();
    result.country = "CA";
    if (stateZipPart) {
      stateZipPart = stateZipPart.replace(new RegExp(postalMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ").replace(/\s+/g, " ").trim();
    } else {
      streetPart = streetPart.replace(new RegExp(postalMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), " ").replace(/\s+/g, " ").trim();
    }
  }
  const usStates = Object.values(US_STATES).join("|");
  const caProvinces = Object.values(CA_PROVINCES).join("|");
  let sourceForState = stateZipPart || streetPart;
  const stateMatch = sourceForState.match(new RegExp(`\\b(${usStates}|${caProvinces})\\b`, "i"));
  if (stateMatch) {
    result.state = stateMatch[1].toUpperCase();
    if (!result.country) {
      result.country = Object.values(US_STATES).includes(result.state) ? "US" : "CA";
    }
    if (stateZipPart) {
      stateZipPart = stateZipPart.replace(new RegExp(`\\b${stateMatch[1]}\\b`, "i"), " ").replace(/\s+/g, " ").trim();
    } else {
      streetPart = streetPart.replace(new RegExp(`\\b${stateMatch[1]}\\b`, "i"), " ").replace(/\s+/g, " ").trim();
    }
  }
  if (parts.length === 2 && stateZipPart && stateZipPart.trim()) {
    cityPart = stateZipPart.trim();
  }
  if (streetPart) {
    const numMatch = streetPart.match(/^(\d+(?:\s*[-\/]\s*\d+\/\d+|\s+\d+\/\d+)?)/);
    if (numMatch) {
      result.number = numMatch[1].trim();
      streetPart = streetPart.replace(numMatch[0], " ").trim();
    }
    const unitMatch = streetPart.match(/\b(apt|apartment|unit|ste|suite|#)\s*(\d+\w*)/i);
    if (unitMatch) {
      const unitType = SECONDARY_UNIT_TYPES[unitMatch[1].toLowerCase()] || unitMatch[1].toLowerCase();
      result.sec_unit_type = unitType;
      result.sec_unit_num = unitMatch[2];
      result.unit = `${unitType} ${unitMatch[2]}`;
      streetPart = streetPart.replace(unitMatch[0], " ").trim();
    }
    const dirWords = Object.keys(DIRECTIONAL_MAP).join("|");
    const prefixMatch = streetPart.match(new RegExp(`^(${dirWords})\\s+`, "i"));
    if (prefixMatch) {
      result.prefix = DIRECTIONAL_MAP[prefixMatch[1].toLowerCase()];
      streetPart = streetPart.replace(prefixMatch[0], " ").trim();
    }
    const streetTypes = result.country === "CA" ? { ...US_STREET_TYPES, ...CA_STREET_TYPES } : US_STREET_TYPES;
    const streetWords = streetPart.split(/\s+/);
    let typeIndex = -1;
    for (let i = streetWords.length - 1; i >= 0; i--) {
      const word = streetWords[i].toLowerCase();
      if (streetTypes[word]) {
        if (word === "pine" || word === "oak" || word === "maple" || word === "cedar") {
          if (i === streetWords.length - 1 || i === streetWords.length - 2 && DIRECTIONAL_MAP[streetWords[i + 1].toLowerCase()]) {
            result.type = streetTypes[word];
            typeIndex = i;
            break;
          }
        } else {
          result.type = streetTypes[word];
          typeIndex = i;
          break;
        }
      }
    }
    if (typeIndex >= 0) {
      let suffixIndex = -1;
      if (typeIndex + 1 < streetWords.length) {
        const suffixCandidate = streetWords[typeIndex + 1].toLowerCase();
        if (DIRECTIONAL_MAP[suffixCandidate]) {
          result.suffix = DIRECTIONAL_MAP[suffixCandidate];
          suffixIndex = typeIndex + 1;
        }
      }
      if (typeIndex > 0) {
        result.street = streetWords.slice(0, typeIndex).join(" ");
      }
      const remainingStart = suffixIndex >= 0 ? suffixIndex + 1 : typeIndex + 1;
      if (remainingStart < streetWords.length && !cityPart) {
        cityPart = streetWords.slice(remainingStart).join(" ");
      }
    } else {
      result.street = streetPart;
    }
  }
  if (cityPart) {
    result.city = cityPart;
  }
  if (!result.country && result.state) {
    result.country = Object.values(US_STATES).includes(result.state) ? "US" : "CA";
  }
  if (validatePostalCode && result.zip && result.country) {
    const isValid = result.country === "US" ? /^\d{5}(?:-\d{4})?$/.test(result.zip) : /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(result.zip);
    if (!isValid) {
      delete result.zip;
      delete result.zipext;
    }
  }
  if (result.street) {
    result.street = result.street.split(" ").map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");
  }
  if (result.city) {
    result.city = result.city.split(" ").map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");
  }
  const hasComponents = result.number || result.street || result.city || result.state || result.zip;
  return hasComponents ? result : null;
}
function parseIntersection(address, options = {}) {
  if (!address || typeof address !== "string") {
    return null;
  }
  const text = normalizeText(address);
  const result = {};
  const intersectionMarkers = /\b(?:and|&|at|@|\/|\\|intersection of|corner of)\b/i;
  const match = text.match(intersectionMarkers);
  if (!match) {
    return null;
  }
  const parts = text.split(intersectionMarkers);
  if (parts.length !== 2) {
    return null;
  }
  const street1Text = parts[0].trim();
  const street2Text = parts[1].trim();
  const parseCountry = options.country !== "auto" ? options.country : "US";
  let s1Text = street1Text;
  const s1PrefixResult = parseDirectional(s1Text);
  if (s1PrefixResult.direction) {
    result.prefix1 = s1PrefixResult.direction;
    s1Text = s1PrefixResult.remaining;
  }
  const s1TypeResult = parseStreetType(s1Text, parseCountry);
  if (s1TypeResult.type) {
    result.type1 = s1TypeResult.type;
    s1Text = s1TypeResult.remaining;
  }
  const s1SuffixResult = parseDirectional(s1Text);
  if (s1SuffixResult.direction) {
    result.suffix1 = s1SuffixResult.direction;
    s1Text = s1SuffixResult.remaining;
  }
  if (s1Text.trim()) {
    result.street1 = s1Text.trim();
  }
  let s2Text = street2Text;
  const postalResult = parsePostalCode(s2Text);
  if (postalResult.zip) {
    result.zip = postalResult.zip;
    s2Text = postalResult.remaining;
  }
  const stateResult = parseStateProvince(s2Text);
  if (stateResult.state) {
    result.state = stateResult.state;
    s2Text = stateResult.remaining;
    if (stateResult.detectedCountry) {
      result.country = stateResult.detectedCountry;
    }
  }
  const s2PrefixResult = parseDirectional(s2Text);
  if (s2PrefixResult.direction) {
    result.prefix2 = s2PrefixResult.direction;
    s2Text = s2PrefixResult.remaining;
  }
  const s2TypeResult = parseStreetType(s2Text, parseCountry);
  if (s2TypeResult.type) {
    result.type2 = s2TypeResult.type;
    s2Text = s2TypeResult.remaining;
  }
  const s2SuffixResult = parseDirectional(s2Text);
  if (s2SuffixResult.direction) {
    result.suffix2 = s2SuffixResult.direction;
    s2Text = s2SuffixResult.remaining;
  }
  const s2Parts = s2Text.split(/\s+/).filter(Boolean);
  if (s2Parts.length > 0) {
    if (s2Parts.length === 1) {
      result.street2 = s2Parts[0];
    } else {
      if (!result.state && !result.zip) {
        result.street2 = s2Parts.slice(0, -1).join(" ");
        result.city = s2Parts.slice(-1)[0];
      } else {
        result.street2 = s2Parts.join(" ");
      }
    }
  }
  return result.street1 && result.street2 ? result : null;
}
function parseInformalAddress(address, options = {}) {
  const informalOptions = {
    ...options,
    validatePostalCode: false,
    // Don't validate postal codes strictly
    parseParenthetical: true,
    // Always parse parenthetical info
    extractFacilities: true
    // Always extract facilities
  };
  return parseLocation(address, informalOptions);
}
function parseAddress(address, options = {}) {
  return parseLocation(address, options);
}

// src/index.ts
var parser = {
  parseLocation,
  parseIntersection,
  parseInformalAddress,
  parseAddress
};
var index_default = parser;
export {
  CANADIAN_POSTAL_CODE_PATTERN,
  CA_PROVINCES,
  CA_STREET_TYPES,
  DIRECTIONAL_MAP,
  FACILITY_PATTERNS,
  SECONDARY_UNIT_TYPES,
  US_STATES,
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
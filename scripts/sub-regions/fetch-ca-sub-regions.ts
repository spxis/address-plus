// scripts/sub-regions/fetch-ca-sub-regions.ts
import type { SubRegion } from "../../src/types";
import fetch from "node-fetch";

// Province/territory code mapping for Canadian regions
const PROVINCE_CODE_MAP: Record<string, string> = {
  "10": "NL", // Newfoundland and Labrador
  "11": "PE", // Prince Edward Island
  "12": "NS", // Nova Scotia
  "13": "NB", // New Brunswick
  "24": "QC", // Quebec
  "35": "ON", // Ontario
  "46": "MB", // Manitoba
  "47": "SK", // Saskatchewan
  "48": "AB", // Alberta
  "59": "BC", // British Columbia
  "60": "YT", // Yukon
  "61": "NT", // Northwest Territories
  "62": "NU"  // Nunavut
};

// Normalize place name to lowercase and trimmed
const normalizeKey = (value: string): string => value.trim().toLowerCase();

// Detect Canadian sub-region type based on census subdivision type
const detectCASubRegionType = (typeName: string): SubRegion["type"] => {
  const lowerType = typeName.toLowerCase();
  
  // Quebec arrondissements
  if (/arrondissement|borough/i.test(lowerType)) return "arrondissement";
  
  // Louisiana-style parishes (rare in Canada but exists)
  if (/parish/i.test(lowerType)) return "parish";
  
  // Wards (common in some municipalities)
  if (/ward/i.test(lowerType)) return "ward";
  
  // Districts (various types)
  if (/district|municipal/i.test(lowerType)) return "district";
  
  // Default fallback
  return "district";
};

// Generate Canadian-specific aliases including bilingual variants
const generateCAliases = (name: string, originalName: string, type: SubRegion["type"]): string[] => {
  const aliases: string[] = [];
  
  // Extract bilingual variants
  const { english, french } = extractBilinguaNames(originalName);
  
  // Add both English and French if different from the normalized name
  if (english && english !== name) {
    aliases.push(normalizeKey(english));
  }
  if (french && french !== name) {
    aliases.push(normalizeKey(french));
  }
  
  // No-space variants (e.g., "côte-des-neiges" -> "cotedesneiges")
  if (name.includes(" ") || name.includes("-")) {
    aliases.push(name.replace(/[\s\-]+/g, ""));
  }
  
  // Remove accents for easier matching
  const withoutAccents = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (withoutAccents !== name) {
    aliases.push(withoutAccents);
  }
  
  // Common French/English abbreviations
  const abbreviations = new Map([
    ["saint", "st"],
    ["sainte", "ste"],
    ["st-", "saint-"],
    ["ste-", "sainte-"],
    ["montreal", "mtl"],
    ["québec", "quebec"],
    ["quebec", "qc"],
    ["toronto", "to"],
    ["vancouver", "van"],
    ["nord", "north"],
    ["north", "nord"],
    ["sud", "south"],
    ["south", "sud"],
    ["est", "east"],
    ["east", "est"],
    ["ouest", "west"],
    ["west", "ouest"]
  ]);
  
  abbreviations.forEach((abbrev, full) => {
    if (name.includes(full)) {
      aliases.push(name.replace(new RegExp(`\\b${full}\\b`, "gi"), abbrev));
    }
    if (name.includes(abbrev)) {
      aliases.push(name.replace(new RegExp(`\\b${abbrev}\\b`, "gi"), full));
    }
  });
  
  // Type-specific variations for Montreal arrondissements
  if (type === "arrondissement") {
    // "le plateau" <-> "plateau-mont-royal"
    if (name.includes("plateau")) {
      if (name === "le plateau") {
        aliases.push("plateau-mont-royal", "plateau mont royal");
      } else if (name === "plateau-mont-royal") {
        aliases.push("le plateau", "plateau");
      }
    }
    
    // Common arrondissement name patterns
    const withoutArticle = name.replace(/^(le|la|les|l')\s+/gi, "");
    if (withoutArticle !== name) {
      aliases.push(withoutArticle);
    }
  }
  
  // Remove duplicates and the original name
  return [...new Set(aliases)].filter(alias => alias !== name && alias.length > 0);
};

// Extract bilingual names and return the appropriate version
const extractBilinguaNames = (name: string): { english: string; french: string } => {
  // Handle bilingual format: "English Name / Nom français"
  if (name.includes(" / ")) {
    const [english, french] = name.split(" / ").map(n => n.trim());
    return { english, french };
  }
  
  // Handle parenthetical format: "Main Name (Other Name)"
  const parenthesisMatch = name.match(/^(.+?)\s*\((.+?)\)$/);
  if (parenthesisMatch) {
    const [, main, alt] = parenthesisMatch;
    // Determine which is English vs French based on common patterns
    if (/\b(de|du|des|la|le|les|saint|sainte)\b/i.test(alt)) {
      return { english: main.trim(), french: alt.trim() };
    } else {
      return { english: alt.trim(), french: main.trim() };
    }
  }
  
  // Single name - detect language and provide both
  if (/\b(de|du|des|la|le|les|saint|sainte)\b/i.test(name)) {
    return { english: name, french: name };
  }
  
  return { english: name, french: name };
};

// Determine parent city for major metropolitan areas
const determineParentCity = (name: string, province: string): string => {
  const lowerName = name.toLowerCase();
  
  // Montreal arrondissements and boroughs
  if (province === "QC" && (/montreal|montréal/i.test(lowerName) || 
      /\b(ville-marie|plateau|westmount|outremont|verdun|lachine)\b/i.test(lowerName))) {
    return "montreal";
  }
  
  // Toronto districts and former municipalities
  if (province === "ON" && (/toronto/i.test(lowerName) || 
      /\b(north york|scarborough|etobicoke|east york|york)\b/i.test(lowerName))) {
    return "toronto";
  }
  
  // Vancouver districts
  if (province === "BC" && (/vancouver/i.test(lowerName) || 
      /\b(burnaby|richmond|surrey|north vancouver|west vancouver)\b/i.test(lowerName))) {
    return "vancouver";
  }
  
  return ""; // No specific parent city identified
};

export async function fetchCASubRegions(): Promise<SubRegion[]> {
  const results: SubRegion[] = [];
  
  console.log("Fetching Canadian sub-regions from Statistics Canada...");
  
  try {
    // Statistics Canada 2021 Census - Standard Geographical Classification
    // Using the most recent census subdivision data
    const url = "https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/download-telecharger/comprehensive/comp-csv-tab-comprehensive-eng.cfm?Lang=E";
    
    // Alternative direct CSV URL for census subdivisions
    const csvUrl = "https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/files-fichiers/2021/lpr_000b21a_e.zip";
    
    // For now, let's use a more accessible approach with known CSV endpoints
    const sgcUrl = "https://www150.statcan.gc.ca/n1/en/tbl/csv/98-401-X2021006_English_CSV_data.csv";
    
    console.log("  Fetching Canadian census subdivision data...");
    
    const response = await fetch(sgcUrl);
    
    if (!response.ok) {
      console.warn(`    Failed to fetch Canadian data: ${response.status} ${response.statusText}`);
      console.log("    Falling back to hardcoded major sub-regions...");
      return getHardcodedCanadianSubRegions();
    }
    
    const csvText = await response.text();
    
    // Parse CSV manually since we might not have csv-parse available yet
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    
    console.log(`    Processing ${lines.length - 1} census subdivision records...`);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.replace(/"/g, ''));
      
      // Create a record object
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      
      const name = record["Geographic name"] || record["GEO_NAME"] || record["Name"];
      const provCode = record["Province/territory code"] || record["PR"];
      const typeName = record["Census subdivision type"] || record["CSD_TYPE"];
      
      if (!name || !provCode) continue;
      
      const province = PROVINCE_CODE_MAP[provCode] || provCode;
      if (!province) continue;
      
      const { english, french } = extractBilinguaNames(name);
      const type = detectCASubRegionType(typeName || "");
      const parentCity = determineParentCity(name, province);
      
      // Add English version
      const englishNormalized = normalizeKey(english);
      const englishAliases = generateCAliases(englishNormalized, name, type);
      results.push({
        name: englishNormalized,
        parentCity: parentCity,
        state: province,
        country: "CA",
        type: type,
        ...(englishAliases.length > 0 && { aliases: englishAliases })
      });
      
      // Add French version if different
      if (french !== english && province === "QC") {
        const frenchNormalized = normalizeKey(french);
        const frenchAliases = generateCAliases(frenchNormalized, name, type);
        results.push({
          name: frenchNormalized,
          parentCity: parentCity,
          state: province,
          country: "CA",
          type: type,
          ...(frenchAliases.length > 0 && { aliases: frenchAliases })
        });
      }
    }
    
    console.log(`Fetched ${results.length} Canadian sub-regions`);
    
  } catch (error) {
    console.error("Error fetching Canadian census data:", error instanceof Error ? error.message : String(error));
    console.log("    Falling back to hardcoded major sub-regions...");
    return getHardcodedCanadianSubRegions();
  }
  
  return results;
}

// Fallback function with major Canadian sub-regions
function getHardcodedCanadianSubRegions(): SubRegion[] {
  console.log("  Using hardcoded Canadian sub-regions...");
  
  const hardcodedData = [
    // Montreal arrondissements
    { name: "ville-marie", parentCity: "montreal", state: "QC", country: "CA", type: "arrondissement" },
    { name: "plateau-mont-royal", parentCity: "montreal", state: "QC", country: "CA", type: "arrondissement" },
    { name: "le plateau", parentCity: "montreal", state: "QC", country: "CA", type: "arrondissement" },
    { name: "rosemont-la petite-patrie", parentCity: "montreal", state: "QC", country: "CA", type: "arrondissement" },
    { name: "côte-des-neiges-notre-dame-de-grâce", parentCity: "montreal", state: "QC", country: "CA", type: "arrondissement" },
    { name: "westmount", parentCity: "montreal", state: "QC", country: "CA", type: "district" },
    { name: "outremont", parentCity: "montreal", state: "QC", country: "CA", type: "district" },
    { name: "verdun", parentCity: "montreal", state: "QC", country: "CA", type: "arrondissement" },
    { name: "lachine", parentCity: "montreal", state: "QC", country: "CA", type: "arrondissement" },
    
    // Toronto districts
    { name: "downtown", parentCity: "toronto", state: "ON", country: "CA", type: "district" },
    { name: "north york", parentCity: "toronto", state: "ON", country: "CA", type: "district" },
    { name: "scarborough", parentCity: "toronto", state: "ON", country: "CA", type: "district" },
    { name: "etobicoke", parentCity: "toronto", state: "ON", country: "CA", type: "district" },
    { name: "east york", parentCity: "toronto", state: "ON", country: "CA", type: "district" },
    { name: "york", parentCity: "toronto", state: "ON", country: "CA", type: "district" },
    
    // Vancouver areas
    { name: "downtown", parentCity: "vancouver", state: "BC", country: "CA", type: "district" },
    { name: "west end", parentCity: "vancouver", state: "BC", country: "CA", type: "district" },
    { name: "kitsilano", parentCity: "vancouver", state: "BC", country: "CA", type: "district" },
    { name: "burnaby", parentCity: "vancouver", state: "BC", country: "CA", type: "district" },
    { name: "richmond", parentCity: "vancouver", state: "BC", country: "CA", type: "district" },
    
    // Other major Canadian sub-regions
    { name: "charlottetown", parentCity: "", state: "PE", country: "CA", type: "district" },
    { name: "halifax", parentCity: "", state: "NS", country: "CA", type: "district" },
    { name: "moncton", parentCity: "", state: "NB", country: "CA", type: "district" },
    { name: "winnipeg", parentCity: "", state: "MB", country: "CA", type: "district" },
    { name: "regina", parentCity: "", state: "SK", country: "CA", type: "district" },
    { name: "saskatoon", parentCity: "", state: "SK", country: "CA", type: "district" },
    { name: "calgary", parentCity: "", state: "AB", country: "CA", type: "district" },
    { name: "edmonton", parentCity: "", state: "AB", country: "CA", type: "district" }
  ] as const;

  // Add aliases to each hardcoded entry
  return hardcodedData.map(item => {
    const aliases = generateCAliases(item.name, item.name, item.type);
    return {
      ...item,
      ...(aliases.length > 0 && { aliases })
    };
  });
}
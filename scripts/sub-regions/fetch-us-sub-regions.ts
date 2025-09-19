// scripts/sub-regions/fetch-us-sub-regions.ts
import type { SubRegion } from "../../src/types";
import fetch from "node-fetch";

// FIPS to state code mapping for accurate state assignment
const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", 
  "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", 
  "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD", 
  "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE", 
  "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", 
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD", 
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV", 
  "55": "WI", "56": "WY"
};

// Rate limiting helper
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Normalize place name to lowercase and trimmed
const normalizeKey = (value: string): string => value.trim().toLowerCase();

// Detect sub-region type based on name patterns
// Generate common aliases for sub-region names to improve matching resilience
const generateAliases = (name: string, type: SubRegion["type"]): string[] => {
  const aliases: string[] = [];
  
  // No-space variant (e.g., "staten island" -> "statenisland")
  if (name.includes(" ")) {
    aliases.push(name.replace(/\s+/g, ""));
  }
  
  // Common abbreviations and variations
  const abbreviations = new Map([
    ["saint", "st"],
    ["st.", "st"],
    ["mount", "mt"],
    ["mt.", "mt"],
    ["north", "n"],
    ["south", "s"], 
    ["east", "e"],
    ["west", "w"],
    ["fort", "ft"],
    ["ft.", "ft"],
    ["new", "n"],
    ["old", "o"]
  ]);
  
  abbreviations.forEach((abbrev, full) => {
    if (name.includes(full)) {
      aliases.push(name.replace(new RegExp(`\\b${full}\\b`, "gi"), abbrev));
    }
    if (name.includes(abbrev)) {
      aliases.push(name.replace(new RegExp(`\\b${abbrev}\\b`, "gi"), full));
    }
  });
  
  // Type-specific variations
  if (type === "borough") {
    // Remove " borough" suffix if present
    const withoutBorough = name.replace(/\s+borough$/i, "");
    if (withoutBorough !== name) {
      aliases.push(withoutBorough);
    }
  }
  
  // DC quadrant abbreviations
  if (type === "quadrant") {
    const quadrantMap = new Map([
      ["northwest", "nw"],
      ["northeast", "ne"], 
      ["southwest", "sw"],
      ["southeast", "se"]
    ]);
    
    quadrantMap.forEach((abbrev, full) => {
      if (name === full) aliases.push(abbrev);
      if (name === abbrev) aliases.push(full);
    });
  }
  
  // Remove duplicates and the original name
  return [...new Set(aliases)].filter(alias => alias !== name && alias.length > 0);
};

const detectSubRegionType = (name: string): SubRegion["type"] => {
  const lowerName = name.toLowerCase();
  
  if (/\b(borough|boro)\b/i.test(lowerName)) return "borough";
  if (/\b(parish|par\.?)\b/i.test(lowerName)) return "parish";
  if (/\b(ward)\b/i.test(lowerName)) return "ward";
  if (/\b(district|dist\.?)\b/i.test(lowerName)) return "district";
  if (/\b(quadrant|nw|ne|sw|se)\b/i.test(lowerName)) return "quadrant";
  
  // Default fallback
  return "district";
};

// Determine if a place should be considered a parent city for sub-regions
const determineParentCity = (name: string, stateCode: string): string => {
  const cleanName = name.replace(/\s+(borough|parish|district|ward|quadrant|city|town|village)$/i, "").trim();
  
  // Special cases for major metropolitan areas
  const majorCities: Record<string, string[]> = {
    "NY": ["new york", "brooklyn", "queens", "bronx", "manhattan", "staten island"],
    "DC": ["washington"],
    "LA": ["new orleans"],
    "QC": ["montreal"],
    "ON": ["toronto"]
  };
  
  const stateCities = majorCities[stateCode];
  if (stateCities?.some(city => cleanName.toLowerCase().includes(city))) {
    return stateCities[0]; // Return the primary city name
  }
  
  return ""; // No specific parent city identified
};

export async function fetchUSSubRegions(): Promise<SubRegion[]> {
  const results: SubRegion[] = [];
  const stateFipsCodes = Object.keys(FIPS_TO_STATE);
  
  console.log(`Fetching US sub-regions from ${stateFipsCodes.length} states/territories...`);
  
  let processed = 0;
  
  for (const stateFIPS of stateFipsCodes) {
    const stateCode = FIPS_TO_STATE[stateFIPS];
    
    try {
      // US Census Bureau Places API - includes incorporated places and census designated places
      const url = `https://api.census.gov/data/2022/acs/acs5?get=NAME&for=place:*&in=state:${stateFIPS}`;
      
      console.log(`  Fetching places for ${stateCode} (FIPS: ${stateFIPS})...`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`    Failed to fetch data for ${stateCode}: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json() as any[][];
      
      // Skip header row and process place data
      const places = data.slice(1);
      
      for (const row of places) {
        const [placeName, stateFipsReturned, placeCode] = row;
        
        if (!placeName || placeName.trim() === "") continue;
        
        const type = detectSubRegionType(placeName);
        const normalizedName = normalizeKey(placeName);
        const parentCity = determineParentCity(placeName, stateCode);
        
        // Only include places that are clearly sub-regions or administrative divisions
        if (type !== "district" || /\b(borough|parish|ward|quadrant|district|division|subdivision)\b/i.test(placeName)) {
          const aliases = generateAliases(normalizedName, type);
          results.push({
            name: normalizedName,
            parentCity: parentCity,
            state: stateCode,
            country: "US",
            type: type,
            ...(aliases.length > 0 && { aliases })
          });
        }
      }
      
      processed++;
      console.log(`    Processed ${places.length} places for ${stateCode} (${processed}/${stateFipsCodes.length})`);
      
      // Rate limiting to be respectful to the Census API
      if (processed % 10 === 0) {
        console.log("    Rate limiting pause...");
        await delay(1000); // 1 second pause every 10 requests
      } else {
        await delay(100); // Short pause between requests
      }
      
    } catch (error) {
      console.error(`    Error fetching data for ${stateCode}:`, error instanceof Error ? error.message : String(error));
      continue; // Continue with next state
    }
  }
  
  console.log(`Fetched ${results.length} US sub-regions from ${processed} states`);
  return results;
}

// Additional function to fetch county subdivisions (more comprehensive)
export async function fetchUSCountySubdivisions(): Promise<SubRegion[]> {
  const results: SubRegion[] = [];
  const stateFipsCodes = Object.keys(FIPS_TO_STATE);
  
  console.log("Fetching US county subdivisions...");
  
  for (const stateFIPS of stateFipsCodes) {
    const stateCode = FIPS_TO_STATE[stateFIPS];
    
    try {
      // Fetch county subdivisions which include townships, boroughs, etc.
      const url = `https://api.census.gov/data/2022/acs/acs5?get=NAME&for=county%20subdivision:*&in=state:${stateFIPS}`;
      
      const response = await fetch(url);
      if (!response.ok) continue;
      
      const data = await response.json() as any[][];
      const subdivisions = data.slice(1);
      
      for (const row of subdivisions) {
        const [subdivisionName] = row;
        
        if (!subdivisionName || subdivisionName.trim() === "") continue;
        
        const type = detectSubRegionType(subdivisionName);
        const normalizedName = normalizeKey(subdivisionName);
        
        // Only include clear administrative subdivisions
        if (/\b(township|twp|borough|parish|district|ward)\b/i.test(subdivisionName)) {
          const aliases = generateAliases(normalizedName, type);
          results.push({
            name: normalizedName,
            parentCity: "",
            state: stateCode,
            country: "US",
            type: type,
            ...(aliases.length > 0 && { aliases })
          });
        }
      }
      
      await delay(150); // Rate limiting
      
    } catch (error) {
      console.error(`Error fetching county subdivisions for ${stateCode}:`, error instanceof Error ? error.message : String(error));
      continue;
    }
  }
  
  console.log(`Fetched ${results.length} US county subdivisions`);
  return results;
}
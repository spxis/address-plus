// String capitalization utilities for address parsing

import { FRENCH_PREPOSITIONS } from '../constants/french-prepositions';
import { STREET_NAME_ACRONYMS } from '../constants/street-name-acronyms';

// Super fast first letter capitalization - minimal footprint
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Capitalize the first letter of each word in a string
 function capitalizeWords(text: string): string {
  // Capitalize by words and also handle hyphenated compounds (Saint-Laurent, René-Lévesque)
  return text.split(' ').map(word => {
    if (!word.includes('-')) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    // For hyphenated words, capitalize each segment
    return word
      .split('-')
      .map(seg => seg ? seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase() : seg)
      .join('-');
  }).join(' ');
}

// Properly capitalize common street names with French and acronym support
 function capitalizeStreetName(text: string): string {
  // Start with proper capitalization of all words
  let result = capitalizeWords(text.toLowerCase());

  // Handle French prepositions - replace after initial capitalization
  for (const [pattern, replacement] of FRENCH_PREPOSITIONS) {
    const capitalizedPattern = capitalizeWords(pattern.trim()) + (pattern.endsWith(' ') ? ' ' : '');
    if (result.includes(capitalizedPattern)) {
      result = result.replace(capitalizedPattern, replacement);
    }
    // Also check if it starts with the pattern
    if (result.toLowerCase().startsWith(pattern)) {
      result = replacement + result.slice(pattern.length);
    }
  }

  // Handle acronyms - replace after capitalization
  const words = result.split(' ');
  for (let i = 0; i < words.length; i++) {
    const cleanWord = words[i].replace(/[^\w&]/g, '').toLowerCase();
    if (STREET_NAME_ACRONYMS.has(cleanWord)) {
      words[i] = words[i].replace(new RegExp(cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), STREET_NAME_ACRONYMS.get(cleanWord)!);
    }
  }
  result = words.join(' ');
  
  return result;
}

export { capitalize, capitalizeWords, capitalizeStreetName };
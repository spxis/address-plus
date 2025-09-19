/**
 * Batch address parsing functions for processing multiple addresses efficiently
 */

import type { 
  BatchParseOptions, 
  BatchParseError, 
  BatchParseResult, 
  ParsedAddress, 
  ParsedIntersection,
  ParseOptions 
} from "./types";
import { 
  parseAddress, 
  parseInformalAddress, 
  parseIntersection, 
  parseLocation 
} from "./parser";

/**
 * Core batch processing function that handles the common logic
 */
function processBatch<T>(
  addresses: string[], 
  parseFunction: (address: string, options?: ParseOptions) => T | null,
  options: BatchParseOptions = {}
): BatchParseResult<T> {
  const startTime = Date.now();
  const results: (T | null)[] = [];
  const errors: BatchParseError[] = [];
  
  const {
    stopOnError = false,
    parallel = false,
    chunkSize = 100,
    includeStats = true,
    ...parseOptions
  } = options;

  // For now, implement synchronous processing
  // TODO: Add parallel processing support for large batches
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    
    try {
      const result = parseFunction(address, parseOptions);
      results.push(result);
      
      // Track parsing failures (when parser returns null)
      if (result === null) {
        errors.push({
          index: i,
          error: "Address parsing returned null - invalid or unparseable format",
          input: address
        });
        
        // Stop processing if stopOnError is enabled and we have an error
        if (stopOnError) {
          break;
        }
      }
    } catch (error) {
      // Track actual exceptions
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({
        index: i,
        error: `Parsing exception: ${errorMessage}`,
        input: address
      });
      
      results.push(null);
      
      // Stop processing if stopOnError is enabled
      if (stopOnError) {
        break;
      }
    }
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  const successful = results.filter(r => r !== null).length;
  const failed = results.length - successful;
  
  const stats = {
    total: addresses.length,
    successful,
    failed,
    duration,
    averagePerAddress: addresses.length > 0 ? duration / addresses.length : 0,
    addressesPerSecond: duration > 0 ? (addresses.length / duration) * 1000 : 0
  };

  return {
    results,
    errors,
    stats
  };
}

/**
 * Parse multiple addresses using the main parseLocation function
 * 
 * @param addresses Array of address strings to parse
 * @param options Batch parsing options
 * @returns Array of parsed address results (null for failed parses)
 * 
 * @example
 * ```typescript
 * const addresses = [
 *   "123 Main St, New York NY 10001",
 *   "456 Oak Ave, Los Angeles CA 90210",
 *   "789 Pine Rd, Chicago IL 60601"
 * ];
 * 
 * const results = parseLocations(addresses);
 * console.log(`Processed ${results.length} addresses`);
 * ```
 */
export function parseLocations(
  addresses: string[], 
  options?: ParseOptions
): (ParsedAddress | null)[] {
  const batchOptions: BatchParseOptions = { 
    ...options, 
    includeStats: false 
  };
  const result = processBatch(addresses, parseLocation, batchOptions);
  return result.results as (ParsedAddress | null)[];
}

/**
 * Parse multiple addresses using the parseAddress function with detailed results
 * 
 * @param addresses Array of address strings to parse
 * @param options Batch parsing options
 * @returns Array of parsed address results (null for failed parses)
 */
export function parseAddresses(
  addresses: string[], 
  options?: ParseOptions
): (ParsedAddress | null)[] {
  const batchOptions: BatchParseOptions = { 
    ...options, 
    includeStats: false 
  };
  const result = processBatch(addresses, parseAddress, batchOptions);
  return result.results as (ParsedAddress | null)[];
}

/**
 * Parse multiple addresses using the parseInformalAddress function
 * 
 * @param addresses Array of address strings to parse
 * @param options Batch parsing options
 * @returns Array of parsed address results (null for failed parses)
 */
export function parseInformalAddresses(
  addresses: string[], 
  options?: ParseOptions
): (ParsedAddress | null)[] {
  const batchOptions: BatchParseOptions = { 
    ...options, 
    includeStats: false 
  };
  const result = processBatch(addresses, parseInformalAddress, batchOptions);
  return result.results as (ParsedAddress | null)[];
}

/**
 * Parse multiple intersection addresses
 * 
 * @param addresses Array of intersection strings to parse
 * @param options Batch parsing options
 * @returns Array of parsed intersection results (null for failed parses)
 */
export function parseIntersections(
  addresses: string[], 
  options?: ParseOptions
): (ParsedIntersection | null)[] {
  const batchOptions: BatchParseOptions = { 
    ...options, 
    includeStats: false 
  };
  const result = processBatch(addresses, parseIntersection, batchOptions);
  return result.results as (ParsedIntersection | null)[];
}

/**
 * Parse multiple addresses with full batch processing features including error tracking and statistics
 * 
 * @param addresses Array of address strings to parse
 * @param options Extended batch parsing options
 * @returns Complete batch processing result with errors and statistics
 * 
 * @example
 * ```typescript
 * const addresses = [
 *   "123 Main St, New York NY 10001",
 *   "invalid address",
 *   "456 Oak Ave, Los Angeles CA 90210"
 * ];
 * 
 * const result = parseLocationsBatch(addresses, { 
 *   stopOnError: false,
 *   includeStats: true 
 * });
 * 
 * console.log(`Processed ${result.stats.total} addresses`);
 * console.log(`Success rate: ${result.stats.successful}/${result.stats.total}`);
 * console.log(`Errors: ${result.errors.length}`);
 * console.log(`Average time per address: ${result.stats.averagePerAddress}ms`);
 * ```
 */
export function parseLocationsBatch(
  addresses: string[], 
  options?: BatchParseOptions
): BatchParseResult<ParsedAddress> {
  return processBatch(addresses, parseLocation, options) as BatchParseResult<ParsedAddress>;
}

/**
 * Parse multiple addresses using parseAddress with full batch processing features
 * 
 * @param addresses Array of address strings to parse
 * @param options Extended batch parsing options
 * @returns Complete batch processing result with errors and statistics
 */
export function parseAddressesBatch(
  addresses: string[], 
  options?: BatchParseOptions
): BatchParseResult<ParsedAddress> {
  return processBatch(addresses, parseAddress, options) as BatchParseResult<ParsedAddress>;
}

/**
 * Parse multiple addresses using parseInformalAddress with full batch processing features
 * 
 * @param addresses Array of address strings to parse
 * @param options Extended batch parsing options
 * @returns Complete batch processing result with errors and statistics
 */
export function parseInformalAddressesBatch(
  addresses: string[], 
  options?: BatchParseOptions
): BatchParseResult<ParsedAddress> {
  return processBatch(addresses, parseInformalAddress, options) as BatchParseResult<ParsedAddress>;
}

/**
 * Parse multiple intersections with full batch processing features
 * 
 * @param addresses Array of intersection strings to parse
 * @param options Extended batch parsing options
 * @returns Complete batch processing result with errors and statistics
 */
export function parseIntersectionsBatch(
  addresses: string[], 
  options?: BatchParseOptions
): BatchParseResult<ParsedIntersection> {
  return processBatch(addresses, parseIntersection, options) as BatchParseResult<ParsedIntersection>;
}
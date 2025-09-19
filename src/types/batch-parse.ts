/**
 * Batch processing options and result types
 */

import type { ParseOptions } from "./parse-options";
import type { ParsedAddress } from "./parsed-address";
import type { ParsedIntersection } from "./parsed-intersection";

/**
 * Extended options for batch processing operations
 */
interface BatchParseOptions extends ParseOptions {
  /** Whether to stop processing on first error (default: false) */
  stopOnError?: boolean;
  /** Process addresses in parallel where possible (default: false) */
  parallel?: boolean;
  /** Size of chunks for parallel processing (default: 100) */
  chunkSize?: number;
  /** Include performance statistics in result (default: true) */
  includeStats?: boolean;
}

/**
 * Error information for failed address parsing
 */
interface BatchParseError {
  /** Index of the failed address in the input array */
  index: number;
  /** Error message describing what went wrong */
  error: string;
  /** Original input that failed to parse */
  input: string;
}

/**
 * Performance statistics for batch operations
 */
interface BatchParseStats {
  /** Total number of addresses processed */
  total: number;
  /** Number of successfully parsed addresses */
  successful: number;
  /** Number of failed parsing attempts */
  failed: number;
  /** Total processing time in milliseconds */
  duration: number;
  /** Average processing time per address in milliseconds */
  averagePerAddress: number;
  /** Addresses processed per second */
  addressesPerSecond: number;
}

/**
 * Complete result of a batch parsing operation
 */
interface BatchParseResult<T = ParsedAddress | ParsedIntersection> {
  /** Array of parsed results (null for failed parses) */
  results: (T | null)[];
  /** Array of errors that occurred during parsing */
  errors: BatchParseError[];
  /** Performance and processing statistics */
  stats: BatchParseStats;
}

export type { 
  BatchParseOptions, 
  BatchParseError, 
  BatchParseStats, 
  BatchParseResult 
};
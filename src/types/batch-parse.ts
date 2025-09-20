// Batch processing options and result types

import type { ParseOptions } from "./parse-options";
import type { ParsedAddress } from "./parsed-address";
import type { ParsedIntersection } from "./parsed-intersection";

// Extended options for batch processing operations
interface BatchParseOptions extends ParseOptions {
  stopOnError?: boolean; // Whether to stop processing on first error (default: false)
  parallel?: boolean; // Process addresses in parallel where possible (default: false)
  chunkSize?: number; // Size of chunks for parallel processing (default: 100)
  includeStats?: boolean; // Include performance statistics in result (default: true)
}

// Error information for failed address parsing
interface BatchParseError {
  index: number; // Index of the failed address in the input array
  error: string; // Error message describing what went wrong
  input: string; // Original input that failed to parse
}

// Performance statistics for batch operations
interface BatchParseStats {
  total: number; // Total number of addresses processed
  successful: number; // Number of successfully parsed addresses
  failed: number; // Number of failed parsing attempts
  duration: number; // Total processing time in milliseconds
  averagePerAddress: number; // Average processing time per address in milliseconds
  addressesPerSecond: number; // Addresses processed per second
}

// Complete result of a batch parsing operation
interface BatchParseResult<T = ParsedAddress | ParsedIntersection> {
  results: (T | null)[]; // Array of parsed results (null for failed parses)
  errors: BatchParseError[]; // Array of errors that occurred during parsing
  stats: BatchParseStats; // Performance and processing statistics
}

export type { 
  BatchParseOptions, 
  BatchParseError, 
  BatchParseStats, 
  BatchParseResult 
};
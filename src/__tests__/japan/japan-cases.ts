// Shapes of the Japanese JSON test cases, and the one check most of them share: the result holds every
// expected field, and a field expected as null is absent.

import { expect } from "vitest";

import type { ParsedAddress } from "../../types";

// A parse case: an address, the options to parse it with, and the fields expected in the result.
interface JapaneseParseCase {
  expected: Record<string, unknown> | null;
  input: string;
  name: string;
  options?: Record<string, unknown>;
}

// A case whose input and expected value are plain values: a string in, a string, code or boolean out.
interface JapaneseValueCase<Input = string, Expected = string> {
  expected: Expected;
  input: Input;
  name: string;
  options?: Record<string, unknown>;
  prefecture?: string;
}

// The result holds every expected field; a field expected as null must be absent.
function expectFields(result: ParsedAddress | null, expected: Record<string, unknown> | null): void {
  if (expected === null) {
    expect(result).toBeNull();

    return;
  }
  expect(result).not.toBeNull();
  const fields = result as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(expected)) {
    if (value === null) expect(fields[key], key).toBeUndefined();
    else expect(fields[key], key).toEqual(value);
  }
}

export { expectFields };
export type { JapaneseParseCase, JapaneseValueCase };

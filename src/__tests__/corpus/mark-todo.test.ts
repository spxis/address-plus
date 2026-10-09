// Rewrites the todo flags of every corpus case from what the parser does now. It runs only when asked
// (CORPUS_MARK=1), after a fix, so the flags and their notes follow the parser rather than being edited
// by hand. A case that passes loses its flag; a case that fails gets one, with a note of what came out.
// Run prettier on test-data/corpus afterwards.

import { writeFileSync } from "fs";
import { join } from "path";

import { describe, expect, it } from "vitest";

import type { CorpusCase, FieldMismatch, LoadedCorpusFile } from "./corpus-support";
import { coreFieldsOf, describeMismatches, judgeCase, loadCorpus, parseCase } from "./corpus-support";

const CORPUS_ROOT: string = join(__dirname, "../../../test-data/corpus");
const COUNTRIES: string[] = (process.env.CORPUS_COUNTRIES ?? "us,canada,japan,au,gb").split(",");

function markFile(country: string, file: LoadedCorpusFile): number {
  let todoCount: number = 0;
  for (const cases of Object.values(file.data.tests)) {
    for (const testCase of cases as CorpusCase[]) {
      const mismatches: FieldMismatch[] = judgeCase(testCase, parseCase(testCase, country), coreFieldsOf(country));
      delete testCase.todo;
      delete testCase.todoNote;
      if (mismatches.length > 0) {
        testCase.todo = true;
        testCase.todoNote = describeMismatches(mismatches);
        todoCount += 1;
      }
    }
  }
  writeFileSync(join(CORPUS_ROOT, country, file.fileName), `${JSON.stringify(file.data, null, 2)}\n`);

  return todoCount;
}

describe("corpus todo flags", () => {
  it.skipIf(process.env.CORPUS_MARK !== "1")("are rewritten from the parser's current output", () => {
    let filesWritten: number = 0;
    for (const country of COUNTRIES) {
      for (const file of loadCorpus(country)) {
        markFile(country, file);
        filesWritten += 1;
      }
    }

    expect(filesWritten).toBeGreaterThan(0);
  });
});

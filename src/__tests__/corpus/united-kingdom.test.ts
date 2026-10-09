// The British corpus: original cases written from Royal Mail's addressing rules for every shape (postcodes in all six
// formats, GIR 0AA, BFPO, the Crown Dependencies, flats and buildings, thoroughfares, localities and counties) and
// original addresses in the shapes of libpostal's British fixtures, one file per shape group under test-data/corpus/gb,
// each read with the British module and the hint GB.

import { registerCorpusSuite } from "./corpus-support";

registerCorpusSuite("gb", "British address corpus");

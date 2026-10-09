// The Japanese corpus: Geolonia's test addresses and normaliser shapes, and original cases for the shapes they miss
// (numerals and dashes, postal codes, buildings, rural towns, Kyoto, Hokkaido, designated cities, Tokyo's wards,
// romaji and unknown places), one file per shape group under test-data/corpus/japan.

import { registerCorpusSuite } from "./corpus-support";

registerCorpusSuite("japan", "Japanese address corpus");

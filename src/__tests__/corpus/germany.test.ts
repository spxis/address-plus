// The German corpus: original cases written from Deutsche Post's addressing guidance and DIN 5008's layout for every shape
// (the suffixes a street's name ends with, names that begin with a preposition, house numbers with letters and ranges, the
// lines above the street, the postcode line with its Ortsteil, Postfach and Packstation, a postcode from every Land) and
// original inputs in the shapes of libpostal's three German fixtures, one file per shape group under
// test-data/corpus/de, each read with the German module and the hint DE.

import { registerCorpusSuite } from "./corpus-support";

registerCorpusSuite("de", "German address corpus");

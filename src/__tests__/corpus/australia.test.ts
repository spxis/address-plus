// The Australian corpus: original cases written from Australia Post's guidelines and AS4590 for every shape (street
// addresses and street types, units and levels, postal deliveries, lots, every state and the edges of its postcodes),
// one file per shape group under test-data/corpus/au, each read with the Australian module and the hint AU.

import { registerCorpusSuite } from "./corpus-support";

registerCorpusSuite("au", "Australian address corpus");

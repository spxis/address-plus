// The French corpus: original cases written from La Poste's addressing guidance for every shape (the types of voie and
// their abbreviations, numbers and their extensions, apartments, floors, staircases and residences, lieux-dits and
// boxes, the postcode line with its CEDEX and arrondissement, the overseas departments and collectivities, Monaco and
// Corsica) and original inputs in the shapes of libpostal's French fixtures, one file per shape group under
// test-data/corpus/fr, each read with the French module and the hint FR.

import { registerCorpusSuite } from "./corpus-support";

registerCorpusSuite("fr", "French address corpus");

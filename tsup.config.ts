import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "jp/index": "src/jp/index.ts",
    "au/index": "src/au/index.ts",
    "gb/index": "src/gb/index.ts",
    "de/index": "src/de/index.ts",
    "fr/index": "src/fr/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  splitting: true,
  sourcemap: true,
  minify: false,
  target: "es2022",
  outDir: "dist",
  // Kanji numerals are read with hikidashi; bundled in, so the package keeps one runtime dependency.
  noExternal: ["@johnmorrisdotca/hikidashi"],
});

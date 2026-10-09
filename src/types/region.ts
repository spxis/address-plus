/**
 * A US state or Canadian province: its code, its country and its name, as `normalizeRegion` matches them.
 *
 * @example
 * ```ts
 * CA_REGIONS[0]
 * // → {"abbr":"AB","country":"CA","name":"alberta"}
 * ```
 */
type Region = {
  abbr: string;
  country: "CA" | "US";
  name: string;
};

export type { Region };

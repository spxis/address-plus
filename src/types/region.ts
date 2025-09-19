// Represents a geographic region (state or province) with standardized fields
type Region = {
  abbr: string;
  country: "CA" | "US";
  name: string;
};

export type { Region };
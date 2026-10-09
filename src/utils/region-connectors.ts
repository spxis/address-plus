import { CA_PROVINCES } from "../constants/ca-provinces";
import { US_STATES } from "../constants/us-states";

// Region names that contain an intersection connector, such as "Newfoundland and Labrador".
// parseLocation swaps them for their abbreviation before testing for an intersection, so a full
// address in such a region is not read as two streets meeting, and an intersection in one still parses.

const CONNECTOR = /\s+(?:and|&)\s+/i;

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const REGIONS: Record<string, string> = { ...US_STATES, ...CA_PROVINCES };

const NAMES_WITH_CONNECTORS = Object.keys(REGIONS).filter((name) => CONNECTOR.test(name));

const REGION_WITH_CONNECTOR =
  NAMES_WITH_CONNECTORS.length > 0
    ? new RegExp(
        `\\b(?:${NAMES_WITH_CONNECTORS.map((name) =>
          name
            .split(CONNECTOR)
            .map((part) => part.split(/\s+/).map(escapeRegExp).join("\\s+"))
            .join("\\s+(?:and|&)\\s+"),
        ).join("|")})\\b`,
        "gi",
      )
    : null;

const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s+&\s+/, " and ")
    .replace(/\s+/g, " ");

// Replaces each region name containing "and" or "&" with its abbreviation.
// @example abbreviateRegionConnectors('1 Main St, Gander, Newfoundland and Labrador A1V 1W8') → '1 Main St, Gander, NL A1V 1W8'
function abbreviateRegionConnectors(text: string): string {
  if (!REGION_WITH_CONNECTOR) return text;
  return text.replace(REGION_WITH_CONNECTOR, (name) => REGIONS[normalizeName(name)] ?? name);
}

export { abbreviateRegionConnectors };

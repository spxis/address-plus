// The parse-address package ships no types. Only the compatibility tests use it, to compare results with ours.
declare module "parse-address" {
  type ParseAddressResult = Record<string, string | undefined> | null;

  interface ParseAddressModule {
    parseAddress(input: string): ParseAddressResult;
    parseInformalAddress(input: string): ParseAddressResult;
    parseIntersection(input: string): ParseAddressResult;
    parseLocation(input: string): ParseAddressResult;
  }

  const parseAddressModule: ParseAddressModule & { default?: ParseAddressModule };
  export default parseAddressModule;
}

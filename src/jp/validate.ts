// What can be checked about a Japanese address from the tables alone: the postal code's shape, which
// prefecture it delivers to, and whether the municipality is a real one in that prefecture.

import type { ParsedAddress } from "../types/parsed-address";
import type { ValidationError, ValidationOptions } from "../types/validation";
import { findMunicipalityByCode, findPrefecture, getPrefectureFromJapanesePostalCode } from "../constants/jp";

interface JapaneseValidation {
  errors: ValidationError[];
  warnings: ValidationError[];
}

const POSTAL_SHAPE = /^\d{3}-\d{4}$/;

// Errors and warnings for a parsed Japanese address. A finding that is a warning becomes an error with
// strictPostalValidation, as the US and Canadian checks do.
function validateJapaneseAddress(address: ParsedAddress, options: ValidationOptions = {}): JapaneseValidation {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const strict = options.strictPostalValidation === true;
  const report = (finding: Omit<ValidationError, "severity">): void => {
    if (strict) errors.push({ ...finding, severity: "error" });
    else warnings.push({ ...finding, severity: "warning" });
  };

  if (address.postalCode) {
    if (!POSTAL_SHAPE.test(address.postalCode)) {
      report({ field: "zip", code: "INVALID_POSTAL_FORMAT", message: "Postal code is not NNN-NNNN" });
    } else if (address.prefectureCode) {
      const delivered = getPrefectureFromJapanesePostalCode(address.postalCode);
      if (delivered && delivered !== address.prefectureCode) {
        const to = findPrefecture(delivered)?.name ?? delivered;
        const named = findPrefecture(address.prefectureCode)?.name ?? address.prefectureCode;
        report({
          field: "zip",
          code: "POSTAL_REGION_MISMATCH",
          message: `Postal code ${address.postalCode} belongs to ${to}, not ${named}`,
        });
      }
    }
  }

  if (address.municipality && !address.municipalityCode) {
    warnings.push({
      field: "city",
      code: "UNRECOGNIZED_MUNICIPALITY",
      message: `${address.municipality} is not a municipality in the table`,
      severity: "warning",
    });
  } else if (address.municipalityCode && address.prefectureCode) {
    const municipality = findMunicipalityByCode(address.municipalityCode);
    if (municipality && municipality.prefecture !== address.prefectureCode) {
      const actual = findPrefecture(municipality.prefecture)?.name ?? municipality.prefecture;
      warnings.push({
        field: "city",
        code: "MUNICIPALITY_PREFECTURE_MISMATCH",
        message: `${municipality.name} is in ${actual}, not ${address.prefecture}`,
        severity: "warning",
      });
    }
  }

  return { errors, warnings };
}

export { validateJapaneseAddress };
export type { JapaneseValidation };

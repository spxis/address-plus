/**
 * Tests for address parsing functionality
 * Including comprehensive test cases from parse-address compatibility
 */

import { describe, expect, test } from "vitest";

import { parseAddress, parseInformalAddress, parseIntersection, parseLocation } from "../parser";
import type { ParsedAddress, ParsedIntersection } from "../types";

describe('Address Plus Parser', () => {
  describe('parseLocation', () => {
    test('should parse simple US address', () => {
      const result = parseLocation('123 Main St, New York, NY 10001');
      expect(result).toEqual({
        number: '123',
        street: 'Main',
        type: 'st',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      });
    });

    test('should parse address with directional prefix', () => {
      const result = parseLocation('456 N Oak Ave, Los Angeles, CA 90210');
      expect(result).toEqual({
        number: '456',
        prefix: 'N',
        street: 'Oak',
        type: 'ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
        country: 'US',
      });
    });

    test('should parse Canadian address', () => {
      const result = parseLocation('123 Main Street, Toronto, ON M5V 3A8');
      expect(result).toEqual({
        number: '123',
        street: 'Main',
        type: 'st',
        city: 'Toronto',
        state: 'ON',
        zip: 'M5V 3A8',
        country: 'CA',
      });
    });

    test('should parse address with apartment unit', () => {
      const result = parseLocation('789 Pine St Apt 4B, Seattle, WA 98101');
      expect(result).toMatchObject({
        number: '789',
        street: 'Pine',
        type: 'st',
        unit: 'apt 4B',
        sec_unit_type: 'apt',
        sec_unit_num: '4B',
        city: 'Seattle',
        state: 'WA',
        zip: '98101',
        country: 'US',
      });
    });

    test('should parse address with ZIP+4', () => {
      const result = parseLocation('100 Congress St, Boston, MA 02101-1234');
      expect(result).toEqual({
        number: '100',
        street: 'Congress',
        type: 'st',
        city: 'Boston',
        state: 'MA',
        zip: '02101',
        zipext: '1234',
        country: 'US',
      });
    });

    test('should handle fractional street numbers', () => {
      const result = parseLocation('123 1/2 Main St, Springfield, IL 62701');
      expect(result).toMatchObject({
        number: '123 1/2',
        street: 'Main',
        type: 'st',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      });
    });

    test('should parse facility names', () => {
      const result = parseLocation('123 Main St, Springfield Hospital, Springfield, IL 62701');
      expect(result).toMatchObject({
        number: '123',
        street: 'Main',
        type: 'st',
        facility: 'Springfield Hospital',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      });
    });

    test('should parse parenthetical information', () => {
      const result = parseLocation('123 Main St (rear entrance), Springfield, IL 62701');
      expect(result).toMatchObject({
        number: '123',
        street: 'Main',
        type: 'st',
        secondary: 'rear entrance',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      });
    });

    test('should return null for invalid input', () => {
      expect(parseLocation('')).toBeNull();
      expect(parseLocation(null as any)).toBeNull();
      expect(parseLocation(undefined as any)).toBeNull();
    });

    test('should handle bilingual Canadian addresses', () => {
      const result = parseLocation('123 Rue Main, Montréal, QC H1A 1A1');
      expect(result).toMatchObject({
        number: '123',
        street: 'Main',
        type: 'rue',
        city: 'Montréal',
        state: 'QC',
        zip: 'H1A 1A1',
        country: 'CA',
      });
    });
  });

  describe('parseIntersection', () => {
    test('should parse simple intersection', () => {
      const result = parseIntersection('Main St and Oak Ave, Springfield, IL');
      expect(result).toEqual({
        street1: 'Main',
        type1: 'st',
        street2: 'Oak',
        type2: 'ave',
        city: 'Springfield',
        state: 'IL',
        country: 'US',
      });
    });

    test('should parse intersection with directionals', () => {
      const result = parseIntersection('N Main St & E Oak Ave');
      expect(result).toEqual({
        prefix1: 'N',
        street1: 'Main',
        type1: 'st',
        prefix2: 'E',
        street2: 'Oak',
        type2: 'ave',
      });
    });

    test('should parse intersection with @ symbol', () => {
      const result = parseIntersection('Broadway @ 42nd St, New York, NY');
      expect(result).toMatchObject({
        street1: 'Broadway',
        street2: '42nd',
        type2: 'st',
        city: 'New York',
        state: 'NY',
      });
    });

    test('should return null for non-intersection address', () => {
      const result = parseIntersection('123 Main St, Springfield, IL');
      expect(result).toBeNull();
    });
  });

  describe('parseInformalAddress', () => {
    test('should be more lenient than parseLocation', () => {
      const result = parseInformalAddress('somewhere on main street near the hospital');
      expect(result).toBeTruthy();
      expect(result?.street).toContain('main');
    });
  });

  describe('parseAddress (compatibility alias)', () => {
    test('should work identically to parseLocation', () => {
      const address = '123 Main St, New York, NY 10001';
      const result1 = parseLocation(address);
      const result2 = parseAddress(address);
      expect(result1).toEqual(result2);
    });
  });

  describe('API Compatibility with parse-address', () => {
    test('should provide same basic structure as parse-address', () => {
      const result = parseLocation('1005 N Gravenstein Highway Sebastopol CA 95472');
      
      // Check that we have the expected fields that parse-address provides
      expect(result).toMatchObject({
        number: '1005',
        prefix: 'N',
        street: 'Gravenstein',
        type: 'hwy',
        city: 'Sebastopol',
        state: 'CA',
        zip: '95472',
      });
    });

    test('should handle complex addresses similar to parse-address', () => {
      const testCases = [
        '123 Main Street',
        '456 Oak Ave Apt 2B',
        'N Main St & E Oak Ave',
        '789 Pine Street, Seattle, WA 98101',
        '100 Congress Street, Boston, MA 02101-1234',
      ];

      testCases.forEach(address => {
        const result = parseLocation(address);
        expect(result).toBeTruthy();
      });
    });
  });

  describe('Country Detection', () => {
    test('should detect US from ZIP code', () => {
      const result = parseLocation('123 Main St, 12345');
      expect(result?.country).toBe('US');
    });

    test('should detect Canada from postal code', () => {
      const result = parseLocation('123 Main St, H1A 1A1');
      expect(result?.country).toBe('CA');
    });

    test('should detect US from state', () => {
      const result = parseLocation('123 Main St, California');
      expect(result?.country).toBe('US');
    });

    test('should detect Canada from province', () => {
      const result = parseLocation('123 Main St, Ontario');
      expect(result?.country).toBe('CA');
    });
  });
});
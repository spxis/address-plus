"use strict";
/**
 * address-plus - A modern, TypeScript-first address parser and normalizer
 * API-compatible with parse-address for seamless upgrades
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAddress = exports.parseInformalAddress = exports.parseIntersection = exports.parseLocation = void 0;
const parser_1 = require("./parser");
Object.defineProperty(exports, "parseLocation", { enumerable: true, get: function () { return parser_1.parseLocation; } });
Object.defineProperty(exports, "parseIntersection", { enumerable: true, get: function () { return parser_1.parseIntersection; } });
Object.defineProperty(exports, "parseInformalAddress", { enumerable: true, get: function () { return parser_1.parseInformalAddress; } });
Object.defineProperty(exports, "parseAddress", { enumerable: true, get: function () { return parser_1.parseAddress; } });
// Export all types
__exportStar(require("./types"), exports);
// Export data and utilities for advanced usage
__exportStar(require("./data"), exports);
__exportStar(require("./utils"), exports);
/**
 * Default export for API compatibility with parse-address
 * Usage: const parser = require('address-plus');
 *        parser.parseLocation('123 Main St, New York, NY 10001')
 */
const parser = {
    parseLocation: parser_1.parseLocation,
    parseIntersection: parser_1.parseIntersection,
    parseInformalAddress: parser_1.parseInformalAddress,
    parseAddress: parser_1.parseAddress,
};
exports.default = parser;
/**
 * For CommonJS compatibility with parse-address
 * This allows: const parser = require('address-plus');
 */
module.exports = parser;
module.exports.default = parser;
module.exports.parseLocation = parser_1.parseLocation;
module.exports.parseIntersection = parser_1.parseIntersection;
module.exports.parseInformalAddress = parser_1.parseInformalAddress;
module.exports.parseAddress = parser_1.parseAddress;

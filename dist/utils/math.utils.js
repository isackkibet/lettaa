"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.safeDivide = safeDivide;
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function safeDivide(numerator, denominator, fallback = 0) {
    return denominator === 0 ? fallback : numerator / denominator;
}
//# sourceMappingURL=math.utils.js.map
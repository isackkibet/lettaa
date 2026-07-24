"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolate = interpolate;
/**
 * Interpolates `{key}` placeholders in a template string with values.
 * Used to keep FeedbackService free of string concatenation logic.
 */
function interpolate(template, values) {
    return template.replace(/{(\w+)}/g, (match, key) => key in values ? String(values[key]) : match);
}
//# sourceMappingURL=template.utils.js.map
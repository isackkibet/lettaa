/**
 * Interpolates `{key}` placeholders in a template string with values.
 * Used to keep FeedbackService free of string concatenation logic.
 */
export declare function interpolate(template: string, values: Record<string, string | number>): string;

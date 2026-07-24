/**
 * Interpolates `{key}` placeholders in a template string with values.
 * Used to keep FeedbackService free of string concatenation logic.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/{(\w+)}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

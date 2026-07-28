/**
 * Replaces {{param}} placeholders in a translation string with the provided
 * values. Missing params are left as-is. Shared by the client (useT) and
 * server (getTranslations) translators so interpolation behaves identically.
 */
export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

export type Translate = (
  key: string,
  params?: Record<string, string | number>,
) => string

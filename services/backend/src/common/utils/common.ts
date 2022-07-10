export function safeJsonParse(
  jsonString: string,
): string | Record<string, unknown> {
  try {
    return JSON.parse(jsonString)
  } catch (_) {
    return jsonString
  }
}

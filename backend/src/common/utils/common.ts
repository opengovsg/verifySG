import { Request } from 'express'

export function safeJsonParse(
  jsonString: string,
): string | Record<string, unknown> {
  try {
    return JSON.parse(jsonString)
  } catch (_) {
    return jsonString
  }
}

export const getRequestIp: (req: Request) => string = (req: Request) => {
  /**
   * @see: https://support.cloudflare.com/hc/en-us/articles/200170786
   * @see: https://stackoverflow.com/a/52026771
   */
  return req.get('cf-connecting-ip') ?? req.ip
}

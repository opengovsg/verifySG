import { Injectable } from '@nestjs/common'
import axios from 'axios'

import { ConfigSchema } from '../../core/config.schema'
import { ConfigService, Logger } from '../../core/providers'

export interface GoGovSGCreateUrlRes {
  longUrl: string
  shortUrl: string
  state: string
  clicks: number
  createdAt: string
  updatedAt: string
}

@Injectable()
export class GoGovSGService {
  private readonly config: ConfigSchema['gogovsg']

  constructor(private configService: ConfigService, private logger: Logger) {
    this.config = this.configService.get('gogovsg')
  }

  createShortLink = async (
    longUrl: string,
    shortUrl: string,
  ): Promise<string> => {
    const { apiKey, apiUrl } = this.config
    longUrl = formatUrl(longUrl) // if longUrl does not start with https, add it
    try {
      const { data } = await axios.post<GoGovSGCreateUrlRes>(
        apiUrl,
        {
          longUrl,
          shortUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )
      return data.shortUrl
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error(JSON.stringify(e))
      }
      throw e
    }
  }
}

const formatUrl = (url: string): string => {
  if (url.startsWith('https://')) return url
  return `https://${url}`
}

// const validateUrl = (url: string): boolean => {
// export const URL_OPTS: validator.IsURLOptions = {
//   protocols: ['https'],
//   require_tld: true,
//   require_protocol: true,
//   require_host: true,
//   require_valid_protocol: true,
//   allow_underscores: false,
//   allow_trailing_dot: false,
//   allow_protocol_relative_urls: false,
//   disallow_auth: false,
// }
// TODO(maybe): ensure longUrl is a valid url
// can use validator.isURL with URL_OPTS above
// }

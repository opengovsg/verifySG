import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import morgan from 'morgan'

import { Logger } from 'core/providers'

import { safeJsonParse } from '../utils/common'

const morganJsonFormat = {
  cf_connecting_ip: ':req[cf-connecting-ip]',
  cf_ip_country: ':req[cf-ipcountry]',
  contentLength: ':res[content-length]',
  httpVersion: ':http-version',
  response_time: ':response-time',
  method: ':method',
  remoteAddress: ':remote-addr',
  status: ':status',
  url: ':url',
  userAgent: ':user-agent',
  x_forwarded_for: ':req[x-forwarded-for]',
}

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private middleware: RequestHandler

  constructor(private logger: Logger) {
    this.middleware = morgan(JSON.stringify(morganJsonFormat), {
      skip: (req: Request, _res: Response) => {
        return req.url === '/' || req.url === 'health'
      },
      stream: {
        write: (message: string) => {
          this.logger.log(safeJsonParse(message))
        },
      },
    })
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.middleware(req, res, next)
  }
}

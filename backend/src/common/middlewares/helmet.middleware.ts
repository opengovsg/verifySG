import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import helmet from 'helmet'

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  private middleware: RequestHandler

  constructor() {
    this.middleware = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          blockAllMixedContent: [],
          connectSrc: ["'self'"],
          // for google fonts
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          frameAncestors: ["'none'"],
          frameSrc: ['https://form.gov.sg'],
          imgSrc: ["'self'", 'data:', 'https://file.go.gov.sg'],
          objectSrc: ["'none'"],
          // for google fonts
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          scriptSrcAttr: ["'none'"],
          scriptSrc: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
    })
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.middleware(req, res, next)
  }
}

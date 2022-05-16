import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction, RequestHandler } from 'express'
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
          connectSrc: [
            "'self'",
            // for sending sentry event
            // '*.sentry.io',
          ],
          // for google fonts
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", 'data:', 'https://file.go.gov.sg'],
          objectSrc: ["'none'"],
          // for google fonts
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          scriptSrcAttr: ["'none'"],
          scriptSrc: [
            "'self'",
            // sentry cdn (remove if not needed)
            // 'https://js.sentry-cdn.com',
            // 'https://browser.sentry-cdn.com',
          ],
          upgradeInsecureRequests: [],
        },
      },
    })
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.middleware(req, res, next)
  }
}

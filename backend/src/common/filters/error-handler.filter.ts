import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'

import { Logger } from 'core/providers'

import { DEFAULT_ERROR_MESSAGE } from '~shared/utils'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    this.logger.error(exception as Record<string, unknown>)

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const message = exception.message

      response.status(status).json({
        message,
      })
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: DEFAULT_ERROR_MESSAGE,
      })
    }
  }
}

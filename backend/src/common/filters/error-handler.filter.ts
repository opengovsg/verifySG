import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const message = exception.message

      response.status(status).json({
        message,
      })
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "It's not you. It's us. Something went wrong.",
      })
    }
  }
}

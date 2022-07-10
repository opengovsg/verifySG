import { Injectable, LoggerService } from '@nestjs/common'
import winston from 'winston'

import { ConfigService } from './config.service'

@Injectable()
export class Logger implements LoggerService {
  private logger: winston.Logger

  constructor(private config: ConfigService) {
    this.logger = winston.createLogger({
      level: 'info',
      levels: winston.config.npm.levels,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        // cannot use prettyPrint for cloudwatch since each line treated as one log entry
        config.isDevEnv
          ? winston.format.prettyPrint({ colorize: true })
          : winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
    })
  }

  /**
   * Write a 'log' level log.
   */
  log(
    message: string | Record<string, unknown>,
    ...optionalParams: unknown[]
  ): void {
    if (typeof message === 'string') {
      this.logger.info(message, ...optionalParams)
    } else {
      this.logger.info(message)
    }
  }

  /**
   * Write an 'error' level log.
   */
  error(
    message: string | Record<string, unknown>,
    ...optionalParams: unknown[]
  ): void {
    if (typeof message === 'string') {
      this.logger.error(message, ...optionalParams)
    } else {
      this.logger.error(message)
    }
  }

  /**
   * Write a 'warn' level log.
   */
  warn(
    message: string | Record<string, unknown>,
    ...optionalParams: unknown[]
  ): void {
    if (typeof message === 'string') {
      this.logger.warn(message, ...optionalParams)
    } else {
      this.logger.warn(message)
    }
  }
}

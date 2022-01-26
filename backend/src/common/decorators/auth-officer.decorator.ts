import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const OfficerId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request
    if (request.session.officerId) {
      return request.session.officerId
    } else {
      console.log('OfficerId not found')
    }
  },
)

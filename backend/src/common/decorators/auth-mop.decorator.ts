import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const MopId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request
    if (request.session.mopId) {
      return request.session.mopId
    } else {
      console.log('MopId not found')
    }
  },
)

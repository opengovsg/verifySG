import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const OfficerId = createParamDecorator(
  (_data: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request
    return request.session.officerId
  },
)

export const OfficerAgency = createParamDecorator(
  (_data: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request
    return request.session.officerAgency
  },
)

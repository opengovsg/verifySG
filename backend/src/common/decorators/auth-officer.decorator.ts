import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export interface OfficerInfoInterface {
  officerId: number
  officerAgency: string
  officerEmail: string
}

export const OfficerInfo = createParamDecorator(
  (_data: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request
    return {
      officerId: request.session.officerId,
      officerAgency: request.session.officerAgency,
      officerEmail: request.session.officerEmail,
    }
  },
)

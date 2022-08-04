import { PartialType, OmitType } from '@nestjs/mapped-types'
import { CreateAgencyReqDto } from './create-agency.dto'

// OmitType creates UpdateAgencyDto with all properties of CreateCatDto except shortName
// PartialType sets all properties on UpdateAgencyDto to optional
// See example https://docs.nestjs.com/openapi/mapped-types#composition
export class UpdateAgencyReqDto extends PartialType(
  OmitType(CreateAgencyReqDto, ['id']),
) {}

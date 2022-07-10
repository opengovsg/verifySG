import { PartialType, OmitType } from '@nestjs/mapped-types'
import { CreateAgencyDto } from './create-agency.dto'

// OmitType creates UpdateAgencyDto with all properties of CreateCatDto except shortName
// PartialType sets all properties on UpdateAgencyDto to optional
// See example https://docs.nestjs.com/openapi/mapped-types#composition
export class UpdateAgencyDto extends PartialType(
  OmitType(CreateAgencyDto, ['id']),
) {}

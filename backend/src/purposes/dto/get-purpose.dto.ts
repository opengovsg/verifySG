import { SGNotifyTemplateParams } from '../../database/entities'

export interface PurposeDto extends PurposeResponseDto {
  sgNotifyTemplateParams: SGNotifyTemplateParams
}

export type AllPurposesDto = PurposeDto[]

// TODO: refactor purpose DTOs into shared types (2/2)
export interface PurposeResponseDto {
  purposeId: string
  menuDescription: string
}

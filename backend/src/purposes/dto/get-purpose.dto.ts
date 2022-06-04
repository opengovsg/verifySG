import { SGNotifyTemplateParams } from '../../database/entities'

export interface PurposeDto {
  purposeId: string
  menuDescription: string
  sgNotifyTemplateParams: SGNotifyTemplateParams
}

export interface AllPurposesDto {
  purposes: PurposeDto[]
}

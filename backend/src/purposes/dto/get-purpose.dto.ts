import { SGNotifyPurposeParams } from '../../database/entities'

export interface PurposeDto {
  purposeId: string
  menuDescription: string
  sgNotifyPurposeParams: SGNotifyPurposeParams
}

export interface AllPurposesDto {
  purposes: PurposeDto[]
}

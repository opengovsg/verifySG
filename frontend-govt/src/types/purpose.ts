import { SGNotifyMessageTemplateId } from '../components/MessagePreview/helpers'

// TODO: refactor into shared folders SGNotifyTemplateParams 1/2
export interface SGNotifyTemplateParams {
  templateId: SGNotifyMessageTemplateId
  templatePurposeParams: Record<string, string> // exclude non-purpose params like agency and officer info
}

// TODO: refactor purpose DTOs into shared types (1/2)
export type AllPurposesDto = PurposeDto[]

export interface PurposeDto extends PurposeResponseDto {
  sgNotifyTemplateParams: SGNotifyTemplateParams
}

export interface PurposeResponseDto {
  purposeId: string
  menuDescription: string
}

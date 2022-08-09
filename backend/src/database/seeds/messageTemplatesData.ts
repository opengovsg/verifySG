import { Agency } from '../entities'

import { MessageTemplateDto } from '~shared/types/api'
import { SGNotifyMessageTemplateId } from '~shared/utils/sgnotify'

class MessageTemplatesData extends MessageTemplateDto {
  agencyId: Agency['id']
}

export const messageTemplatesData: MessageTemplatesData[] = [
  {
    agencyId: 'SPF',
    key: 'spf-feedback',
    menu: 'Feedback (before call)',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          "The purpose of this call is to follow up on your recent feedback to the Police.<br><br>This call will be made in the next 10 minutes. You may verify the caller's identity by asking for their <u>name</u> and <u>designation</u> to ensure that it matches the information provided in this message.",
      },
    },
  },
  {
    agencyId: 'SPF',
    key: 'spf-generic-during-call',
    menu: 'Police report and feedback (during call)',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
      longMessageParams: {
        call_details:
          'The purpose of this call is to follow up on your recent police report/feedback to the Police.',
      },
    },
  },
  {
    agencyId: 'SPF',
    key: 'spf-police-report',
    menu: 'Police report (before call)',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          "The purpose of this call is to follow up on your recent police report to the Police.<br><br>This call will be made in the next 10 minutes. You may verify the caller's identity by asking for their <u>name</u> and <u>designation</u> to ensure that it matches the information provided in this message.",
      },
    },
  },
]

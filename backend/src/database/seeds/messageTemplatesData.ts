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
  {
    agencyId: 'OGP',
    key: 'ogp-feedback',
    menu: 'Feedback (before call)',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          "The purpose of this call is to follow up on your recent feedback on OGP's services",
      },
    },
  },
  {
    agencyId: 'OGP',
    key: 'ogp-praise',
    menu: 'Praise',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          "This call is to let you know you've been an all-around great person!",
      },
    },
  },
  {
    agencyId: 'IRAS',
    key: 'iras-individual-tax',
    menu: 'Individual Tax',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call is regarding your tax matters and will be made in the next 10 minutes. You may verify the caller’s identity using the <u>name</u> and <u>designation</u> provided in this message.',
      },
    },
  },
  {
    agencyId: 'IRAS',
    key: 'iras-jgi',
    menu: 'Jobs Growth Incentive (JGI)',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call is regarding your Jobs Growth Incentive (JGI) matters and will be made in the next 10 minutes. You may verify the caller’s identity using the <u>name</u> and <u>designation</u> provided in this message.',
      },
    },
  },
]

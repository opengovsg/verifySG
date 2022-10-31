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
          'The purpose of this call is to follow up on your recent feedback to the Police.<br><br>This call will be made in the next 10 minutes. You may verify the caller’s identity by asking for their <u>name</u> and <u>designation</u> to ensure that it matches the information provided in this message.',
      },
    },
    smsMessageTemplateParams: null,
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
    smsMessageTemplateParams: null,
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
          'The purpose of this call is to follow up on your recent police report to the Police.<br><br>This call will be made in the next 10 minutes. You may verify the caller’s identity by asking for their <u>name</u> and <u>designation</u> to ensure that it matches the information provided in this message.',
      },
    },
    smsMessageTemplateParams: null,
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
          'The purpose of this call is to follow up on your recent feedback on OGP’s services.',
      },
    },
    smsMessageTemplateParams: null,
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
          'This call is to let you know you’ve been an all-around great person!',
      },
    },
    smsMessageTemplateParams: null,
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
    smsMessageTemplateParams: null,
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
          'This call is regarding Jobs Growth Incentive (JGI) matters and will be made in the next 10 minutes. You may verify the caller’s identity using the <u>name</u> and <u>designation</u> provided in this message.',
      },
    },
    smsMessageTemplateParams: null,
  },
  {
    agencyId: 'MOH',
    key: 'moh-hrp',
    menu: 'Home Recovery Programme',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call is regarding your request to appeal into the Home Recovery Programme and will be made in the next 20 minutes.',
      },
    },
    smsMessageTemplateParams: null,
  },
  {
    agencyId: 'ECDA',
    key: 'ecda-generic',
    menu: 'Generic',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call will be made in the next 10 minutes. You may verify the caller’s identity by asking for their <u>name</u> and <u>designation</u>, ensuring that it matches the information provided in this message.',
      },
    },
    smsMessageTemplateParams: null,
  },
  {
    agencyId: 'MSF',
    key: 'msf-generic',
    menu: 'Generic',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call will be made in the next 10 minutes. You may verify the caller’s identity by asking for their <u>name</u> and <u>designation</u>, ensuring that it matches the information provided in this message.',
      },
    },
    smsMessageTemplateParams: null,
  },
  {
    agencyId: 'MOH',
    key: 'moh-hrp',
    menu: 'Home Recovery Programme',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call is regarding your request to appeal into the Home Recovery Programme and will be made in the next 20 minutes.',
      },
    },
  },
  {
    agencyId: 'MOH',
    key: 'moh-covid-positive-missed-call',
    menu: 'COVID-19 Positive Missed Call',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'MOH is trying to contact you as you have been tested positive for COVID-19. Our earlier attempts to call you failed.  As it is crucial to gather some information from you, we will be calling you again within the next one hour. Thank you.',
      },
    },
  },
]

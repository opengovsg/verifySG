import { Agency } from '../entities'

import { MessageTemplateDto, MessageTemplateType } from '~shared/types/api'
import { SGNotifyMessageTemplateId } from '~shared/utils/sgnotify'

class MessageTemplatesData extends MessageTemplateDto {
  agencyId: Agency['id']
}

export const messageTemplatesData: MessageTemplatesData[] = [
  {
    agencyId: 'SPF',
    key: 'spf-feedback',
    menu: 'Feedback (before call)',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'The purpose of this call is to follow up on your recent feedback to the Police.<br><br>This call will be made in the next 10 minutes. You may verify the caller’s identity by asking for their <u>name</u> and <u>designation</u> to ensure that it matches the information provided in this message.',
      },
    },
  },
  {
    agencyId: 'SPF',
    key: 'spf-generic-during-call',
    menu: 'Police report and feedback (during call)',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
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
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'The purpose of this call is to follow up on your recent police report to the Police.<br><br>This call will be made in the next 10 minutes. You may verify the caller’s identity by asking for their <u>name</u> and <u>designation</u> to ensure that it matches the information provided in this message.',
      },
    },
  },
  {
    agencyId: 'OGP',
    key: 'ogp-feedback',
    menu: 'Feedback (before call)',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'The purpose of this call is to follow up on your recent feedback on OGP’s services.',
      },
    },
  },
  {
    agencyId: 'OGP',
    key: 'ogp-praise',
    menu: 'Praise',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call is to let you know you’ve been an all-around great person!',
      },
    },
  },
  {
    agencyId: 'IRAS',
    key: 'iras-individual-tax',
    menu: 'Individual Tax',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
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
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call is regarding Jobs Growth Incentive (JGI) matters and will be made in the next 10 minutes. You may verify the caller’s identity using the <u>name</u> and <u>designation</u> provided in this message.',
      },
    },
  },
  {
    agencyId: 'MOH',
    key: 'moh-hrp',
    menu: 'Home Recovery Programme',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call is regarding your request to appeal into the Home Recovery Programme and will be made in the next 20 minutes.',
      },
    },
  },
  {
    agencyId: 'ECDA',
    key: 'ecda-generic',
    menu: 'Generic',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call will be made in the next 10 minutes. You may verify the caller’s identity by asking for their <u>name</u> and <u>designation</u>, ensuring that it matches the information provided in this message.',
      },
    },
  },
  {
    agencyId: 'MSF',
    key: 'msf-generic',
    menu: 'Generic',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'This call will be made in the next 10 minutes. You may verify the caller’s identity by asking for their <u>name</u> and <u>designation</u>, ensuring that it matches the information provided in this message.',
      },
    },
  },
  {
    agencyId: 'MOH',
    key: 'moh-hrp',
    menu: 'Home Recovery Programme',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
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
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          'MOH is trying to contact you as you have been tested positive for COVID-19. Our earlier attempts to call you failed.  As it is crucial to gather some information from you, we will be calling you again within the next one hour. Thank you.',
      },
    },
  },
  {
    agencyId: 'MAS',
    key: 'mas-case-review',
    menu: 'Assistance for Case Review',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details:
          "The purpose of this call is to seek your assistance on a matter that you may be acquainted with.<br><br>This call will be made in the next 10 minutes and you may verify the caller's identity using the name provided in this message.",
      },
    },
  },
  {
    agencyId: 'OGP',
    key: 'ogp-sms-test',
    menu: 'SMS Test',
    type: MessageTemplateType.SMS,
    params: {
      type: MessageTemplateType.SMS,
      requiredParams: [
        'officerName',
        'officerPosition',
        'agencyName',
        'uniqueUrl',
      ],
      message:
        'Dear Sir/Madam,\n\nThis is a test message from {{officerName}}, {{officerPosition}} at {{agencyName}}.\n\nYou can verify this message by visiting {{uniqueUrl}}.',
    },
  },
  {
    agencyId: 'MOH',
    key: 'moh-hvt',
    menu: 'MOH HVT',
    type: MessageTemplateType.SMS,
    params: {
      type: MessageTemplateType.SMS,
      requiredParams: ['agencyName', 'uniqueUrl'],
      message:
        'Dear Sir/Madam,\n\nThis is the MOH Home Vaccination Team. This is to inform you that a {{agencyName}} call agent will be contacting you in the next 30 minutes regarding Home Vaccination matters.\n\nYou can verify this message by visiting {{uniqueUrl}}.',
    },
  },
  {
    agencyId: 'MOH',
    key: 'moh-vaccination-team',
    menu: 'MOH Vaccination Team',
    type: MessageTemplateType.SMS,
    params: {
      type: MessageTemplateType.SMS,
      requiredParams: ['agencyName', 'uniqueUrl'],
      message:
        'Dear Sir/Madam,\n\nThis is the MOH Vaccination Team. This is to inform you that a {{agencyName}} call agent will be contacting you in the next 30 minutes regarding vaccination matters from your call query.\n\nYou can verify this message by visiting {{uniqueUrl}}.',
    },
  },
]

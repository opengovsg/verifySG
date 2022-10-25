import { mockValidSGNotifyParams } from '../../../__tests__/notifications.service.spec'
import { convertParamsToNotificationRequestPayload } from '../message-template'

describe('message-template.ts helper functions', () => {
  test('convertParamsToNotificationRequestPayload correctness', async () => {
    const notificationRequestPayload =
      convertParamsToNotificationRequestPayload(mockValidSGNotifyParams)
    expect(notificationRequestPayload).toMatchObject({
      notification_req: {
        category: 'MESSAGES',
        channel_mode: 'SPM',
        delivery: 'IMMEDIATE',
        priority: 'HIGH',
        sender_logo_small: mockValidSGNotifyParams.agencyLogoUrl,
        sender_name: mockValidSGNotifyParams.agencyShortName,
        template_layout: [
          {
            template_id: mockValidSGNotifyParams.templateId,
            template_input: {
              agency: mockValidSGNotifyParams.sgNotifyLongMessageParams.agency,
              masked_nric:
                mockValidSGNotifyParams.sgNotifyLongMessageParams.masked_nric,
              officer_name:
                mockValidSGNotifyParams.sgNotifyLongMessageParams.officer_name,
              position:
                mockValidSGNotifyParams.sgNotifyLongMessageParams.position,
              call_details:
                mockValidSGNotifyParams.sgNotifyLongMessageParams.call_details,
              callback_details:
                mockValidSGNotifyParams.sgNotifyLongMessageParams
                  .callback_details,
            },
          },
        ],
        title: mockValidSGNotifyParams.title,
        uin: mockValidSGNotifyParams.nric,
      },
    })
  })
})

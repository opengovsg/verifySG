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
              agency: mockValidSGNotifyParams.params.agency,
              masked_nric: mockValidSGNotifyParams.params.masked_nric,
              officer_name: mockValidSGNotifyParams.params.officer_name,
              position: mockValidSGNotifyParams.params.position,
              call_details: mockValidSGNotifyParams.params.call_details,
              callback_details: mockValidSGNotifyParams.params.callback_details,
            },
          },
        ],
        title: mockValidSGNotifyParams.title,
        uin: mockValidSGNotifyParams.nric,
      },
    })
  })
})

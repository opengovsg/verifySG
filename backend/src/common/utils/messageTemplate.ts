import {
  NotificationStatus,
  SGNotifyNotificationStatus,
} from '../../database/entities'
import { SGNotifyParams } from '../../notifications/sgnotify/sgnotify.service'

export const sgNotifyParamsStatusToNotificationStatusMapper = (
  params: SGNotifyParams,
): NotificationStatus => {
  if (params.status === SGNotifyNotificationStatus.NOT_SENT)
    return NotificationStatus.NOT_SENT
  else return NotificationStatus.SENT
}

// TODO: create class/functions/template that will automatically populate params based on MessageTemplateId
// import { MessageTemplateId } from '../../database/entities'
//
// export class MessageTemplate {
//   constructor(
//     private readonly id: MessageTemplateId,
//     private readonly params: string[],
//   ) {}
// }
//
// export interface MessageTemplate {
//   id: MessageTemplateId
//   shortMessage: string
//   longMessage: string
//   messageParams: string[]
//   supportsHTML: boolean
// }

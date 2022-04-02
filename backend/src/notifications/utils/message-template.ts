// TODO: not sure how
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

import {
  NotificationStatus,
  SGNotifyNotificationStatus,
  SGNotifyParams,
} from '../../database/entities'

export const SGNotifyParamsStatusToNotificationStatusMapper = (
  params: SGNotifyParams,
): NotificationStatus => {
  const SGNotifyParamsStatus = params.status
  if (SGNotifyParamsStatus === SGNotifyNotificationStatus.NOT_SENT)
    return NotificationStatus.NOT_SENT
  else return NotificationStatus.SENT
}

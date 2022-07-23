import { ApiService } from '@/services/ApiService'
import {
  SendNotificationReqDto,
  SendNotificationResDto,
} from '~shared/types/api'

const sendNotification = async (
  notificationDetails: SendNotificationReqDto,
): Promise<SendNotificationResDto> => {
  return ApiService.post('/notifications', notificationDetails).then(
    (res) => res.data,
  )
}

export const NotificationService = {
  sendNotification,
}

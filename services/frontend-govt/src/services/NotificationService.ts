import { SendNotificationDto, SendNotificationResponseDto } from '../types'

import { ApiService } from './ApiService'

const sendNotification = async (
  notificationDetails: SendNotificationDto,
): Promise<SendNotificationResponseDto> => {
  return ApiService.post('/notifications', notificationDetails).then(
    (res) => res.data,
  )
}

export const NotificationService = {
  sendNotification,
}

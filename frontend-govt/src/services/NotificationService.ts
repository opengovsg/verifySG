import { NotificationDto, sendNotificationDto } from '../types'

import { ApiService } from './ApiService'

const sendNotification = async (
  notificationDetails: sendNotificationDto,
): Promise<NotificationDto> => {
  return ApiService.post('/notifications', notificationDetails).then(
    (res) => res.data,
  )
}

export const NotificationService = {
  sendNotification,
}

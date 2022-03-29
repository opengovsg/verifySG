import { CreateNotificationDto, NotificationDto } from '../types'

import { ApiService } from './ApiService'

const createNotification = async (
  notificationDetails: CreateNotificationDto,
): Promise<NotificationDto> => {
  return ApiService.post('/notifications', notificationDetails).then(
    (res) => res.data,
  )
}

export const NotificationService = {
  createNotification,
}

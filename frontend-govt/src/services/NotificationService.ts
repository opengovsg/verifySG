import { ApiService } from './ApiService'
import { CreateNotificationDto, NotificationDto } from '../types/notification'

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

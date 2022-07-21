import { SendNotificationResponseDto } from '../types'

import { ApiService } from './ApiService'

import { SendNotificationDto } from '~shared/types'

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

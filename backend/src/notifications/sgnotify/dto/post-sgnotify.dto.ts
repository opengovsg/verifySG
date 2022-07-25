import { IsArray, IsString, IsUrl, MaxLength } from 'class-validator'
import { JWTPayload } from 'jose'

export class SGNotifyNotificationRequestPayload implements JWTPayload {
  notification_req: SGNotifyNotificationRequest;

  [propName: string]: unknown
}

export class SGNotifyNotificationRequest {
  @IsString()
  category: 'MESSAGES'

  @IsString()
  channel_mode: 'SPM' | 'SMS' | 'SPMORSMS'

  @IsString()
  delivery: 'IMMEDIATE' | 'SCHEDULE'

  @IsString()
  priority: 'HIGH' | 'NORMAL' // API says to use 'HIGH' only

  @IsString()
  @IsUrl()
  sender_logo_small: string

  @IsString()
  @MaxLength(25)
  sender_name: string

  @IsString()
  @MaxLength(50)
  title: string

  // TODO: use @IsNric() after https://github.com/opengovsg/CheckWho/pull/399 is merged in
  @IsString()
  uin: string

  @IsArray()
  template_layout: SGNotifyNotificationTemplateLayout[]
}

export class SGNotifyNotificationTemplateLayout {
  @IsString()
  template_id: string

  @IsString()
  template_input: Record<string, string>
}

export class PostSGNotifyAuthzDto {
  @IsString()
  token: string
}

export class PostSGNotifyJweDto {
  @IsString()
  jwe: string
}

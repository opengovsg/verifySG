import { IsArray, IsString, IsUrl, MaxLength } from 'class-validator'
import { JWTPayload } from 'jose'

export class SGNotifyNotificationRequestPayload implements JWTPayload {
  notification_req: SGNotifyNotificationRequest;

  [propName: string]: unknown
}

export class SGNotifyNotificationRequest {
  @IsString()
  // TODO: convert into enum and use IsEnum()
  category: 'MESSAGES'

  @IsString()
  // TODO: convert into enum and use IsEnum()
  channel_mode: 'SPM' | 'SMS' | 'SPMORSMS'

  @IsString()
  // TODO: convert into enum and use IsEnum()
  delivery: 'IMMEDIATE' | 'SCHEDULE'

  @IsString()
  // TODO: convert into enum and use IsEnum()
  priority: 'HIGH' | 'NORMAL' // API doc says to use 'HIGH' only

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
  // strictly this refers to SGNotifyMessageTemplateId in shared/src/utils/sgnotify.ts
  @IsString()
  template_id: string

  @IsString()
  template_input: Record<string, string>
}

export class PostSGNotifyAuthzResDto {
  @IsString()
  token: string
}

export class PostSGNotifyJweResDto {
  @IsString()
  jwe: string
}

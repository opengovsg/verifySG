/*
 * constants that end with `MESSAGE` are displayed to user on the frontend
 * */

// notification-related constants
export const NOTIFICATION_REQUEST_ERROR_MESSAGE =
  'Unable to send notification due a problem with notification request. Please contact us if you encounter this error.'

export const NOTIFICATION_RESPONSE_ERROR_MESSAGE =
  'Your notification has been sent but we encountered an error. Please contact us if you encounter this error.'

export const INVALID_MESSAGE_TEMPLATE = 'Provided message template invalid'

export const OFFICER_NOT_FOUND = 'Officer not found'

export const OFFICER_MISSING_FIELDS = 'Officer must have name and position'

// SGNotify-related constants
// to get public keys for signature and encryption
export const PUBLIC_KEY_ENDPOINT = '/.well-known/ntf-authz-keys'

// send post request to trigger notification
export const NOTIFICATION_ENDPOINT = '/v1/notification/requests'

export const AUTHZ_ENDPOINT = '/v1/oauth2/token'

export const SGNOTIFY_UNAVAILABLE_MESSAGE =
  'Unable to send notification due to an error with Singpass. Please try again later.'

export const NO_SINGPASS_MOBILE_APP_FOUND_MESSAGE =
  'Unable to send notification as NRIC specified does not have an associated Singpass Mobile app.'

// SMS-related constants
export const TWILIO_ENDPOINT_ERROR_MESSAGE =
  'Unable to send notification due to an error with Twilio. Please contact us if you encounter this error.'

export const GOGOVSG_ENDPOINT_ERROR_MESSAGE =
  'Unable to send notification due to an error with Go.gov.sg. Please contact us if you encounter this error.'

// logger messages upon encountering errors
export const PUBLIC_KEY_ENDPOINT_UNAVAILABLE =
  'Error when getting public key from SGNotify discovery endpoint.'

export const PUBLIC_KEY_NOT_FOUND =
  'Either signature or encryption key not found in SGNotify discovery endpoint'

export const PUBLIC_KEY_IMPORT_ERROR =
  'Error when importing public key from SGNotify discovery endpoint'

// notification error messages to display to users
export const NOTIFICATION_REQUEST_ERROR_MESSAGE =
  'Unable to send notification due a problem with notification request. Please contact us if you encounter this error.'

export const NOTIFICATION_RESPONSE_ERROR_MESSAGE =
  'Your notification has been sent but we encountered an error. Please contact us if you encounter this error.'

// SGNotify SGNotify SGNotify SGNotify SGNotify SGNotify SGNotify SGNotify API routes
// to get public keys for signature and encryption
export const PUBLIC_KEY_ENDPOINT = '/.well-known/ntf-authz-keys'

// send post request to trigger notification
export const NOTIFICATION_ENDPOINT = 'v1/notification/requests'

export const AUTHZ_ENDPOINT = '/v1/oauth2/token'

// SGNotify-specific error messages to display on frontend
export const SGNOTIFY_UNAVAILABLE_MESSAGE =
  'Unable to send notification due to an error with Singpass. Please try again later.'

export const NO_SINGPASS_MOBILE_APP_FOUND_MESSAGE =
  'Unable to send notification as NRIC specified does not have an associated Singpass Mobile app.'

// API routes
// to get public keys for signature and encryption
export const PUBLIC_KEY_ENDPOINT = '/.well-known/ntf-authz-keys'

// send post request to trigger notification
export const NOTIFICATION_ENDPOINT = 'v1/notification/requests'

export const AUTHZ_ENDPOINT = '/v1/oauth2/token'

// these are all messages displayed on frontend
export const SGNOTIFY_UNAVAILABLE_MESSAGE =
  'Unable to send notification due to an error with Singpass. Please try again later.'

export const NO_SINGPASS_MOBILE_APP_FOUND_MESSAGE =
  'Unable to send notification as NRIC specified does not have an associated Singpass Mobile app.'

export const NOTIFICATION_REQUEST_ERROR_MESSAGE =
  'Error with notification request. Please contact us if you encounter this error.' // displayed on frontend

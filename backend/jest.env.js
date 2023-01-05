const { postgres } = require('./jest-testcontainers-config.js')

process.env = {
  ...process.env,
  DB_HOST: global.__TESTCONTAINERS_POSTGRES_IP__,
  DB_PORT: global.__TESTCONTAINERS_POSTGRES_PORT_5432__,
  DB_USERNAME: postgres.env.POSTGRES_USER,
  DB_PASSWORD: postgres.env.POSTGRES_PASSWORD,
  DB_NAME: postgres.env.POSTGRES_DB,
  // these filler env variables are needed to run tests in CI
  // else will throw error that mandatory env variables are not available
  POSTMAN_API_KEY: 'TEST',
  ADMIN_KEY_HASH: 'TEST',
  SGNOTIFY_CLIENT_ID: 'TEST',
  SGNOTIFY_CLIENT_SECRET: 'TEST',
  SGNOTIFY_E_SERVICE_ID: 'TEST',
  // randomly generated private key for testing purposes; don't worry
  SGNOTIFY_EC_PRIVATE_KEY:
    'MHcCAQEEIByS0v0+NDkLDlf7jNrjqcBtolBU6IE27nZjhF2H5K7yoAoGCCqGSM49AwEHoUQDQgAEM2jN2uQC5dHBUxcIwqRVmdxCYK43ifnA2WJuYI28XLFSNDsLr+HovKAwq494awwzdEKpiNKMKmcVccT41CfQ0w==',
  SGNOTIFY_URL: 'https://mock-singpass-api-url.gov.sg',
  GO_API_KEY: 'TEST',
  DEFAULT_TWILIO_ACCOUNT_SID: 'TEST',
  DEFAULT_TWILIO_API_KEY_SID: 'TEST',
  DEFAULT_TWILIO_API_KEY_SECRET: 'TEST',
  DEFAULT_TWILIO_SENDER_ID: 'TEST',
  OGP_TWILIO_ACCOUNT_SID: 'TEST',
  OGP_TWILIO_API_KEY_SID: 'TEST',
  OGP_TWILIO_API_KEY_SECRET: 'TEST',
  OGP_TWILIO_SENDER_ID: 'TEST',
}

const { postgres } = require('./jest-testcontainers-config.js')

process.env = {
  ...process.env,
  DB_HOST: global.__TESTCONTAINERS_POSTGRES_IP__,
  DB_PORT: global.__TESTCONTAINERS_POSTGRES_PORT_5432__,
  DB_USERNAME: postgres.env.POSTGRES_USER,
  DB_PASSWORD: postgres.env.POSTGRES_PASSWORD,
  DB_NAME: postgres.env.POSTGRES_DB,
}

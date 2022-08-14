module.exports = {
  postgres: {
    image: 'postgres',
    tag: '10.5',
    ports: [5432],
    env: {
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'postgres',
      POSTGRES_DB: 'checkwho_test',
    },
    wait: {
      type: 'text',
      text: 'server started',
    },
  },
}

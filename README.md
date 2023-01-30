# CheckWho

## Getting started with your dev environment

### Initialization

- Make a copy of `/backend/.env.example` and name it `/backend/.env`

- Install and audit node dependencies (run from root)

    ```zsh
    npm i
    ```

- PostgreSQL in current setup is running within Docker container; no need to start up PostgreSQL manually. To start up PostgreSQL in docker, run `npm run docker-dev.`

- Run migrations on the development database, then seed data (run from root). Please make sure that your Docker container is running before running these commands.

    ```zsh
    npm run on-backend -- migration:run

    npm run on-backend -- seed
    ```

- Generate an admin key and hash pair. Save the admin key and replace the default `ADMIN_KEY_HASH` value with the generated hash value in `backend/.env` file. (If you're an OGP developer, you can also get the admin key and hash pair from our 1Password vault.)

    ```
    npm run on-backend -- generate-admin-key
- Start up dev env (run from root). You can choose from the following two commands:

    ```zsh
    npm run dev:full # start Docker container and dev env together
    npm run dev # start dev env (user should start Docker container separately)
    ```

### Set up End-to-End Tests Locally (Optional)

End-to-end tests have already been set up automatically on staging and prod. Only set up end-to-end tests if you want to run them locally. To do so:

1. Make a copy of `/e2e/.env.example` and name it `/e2e/.env`.
2. Obtain a copy of `credentials.json` and `gmail_token.json` from the 1Password vault and place them in the `/e2e` folder. Alternatively, you can generate your own credentials and token by following the instructions [here](https://github.com/levz0r/gmail-tester#usage).
3. Check out the different run configurations available for Playwright [here](https://playwright.dev/docs/test-cli). In `package.json` we have `e2e-test` and `e2e-test:debug` but there are far more variants available.

### Connect to database

You can find the environmental variables for the jumphosts in the `.env (development)` file in the 1Password Vault.

The private keys for connecting to the production and staging jumphosts are:

- `checkwho-staging-rds-key-pair` for staging
- `checkwho-prod-rds-key-pair` for production

To connect to the database, turn on the OGP VPN and connect using the credentials and private keys outlined above. If you are running database migration, you can use the `tunneldb:staging` and `tunneldb:prod` commands in the `backend/package.json` to tunnel to the database.

## Migrations

### Auto-generate migrations

```zsh
# need to add path to migrations folder
npm run on-backend migration:gen src/database/migrations/migration-name-in-kebab-case
```

### Run migrations

```zsh
npm run on-backend migration:run
```

### Revert last migration

```zsh
npm run on-backend migration:revert
```

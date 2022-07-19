# CheckWho

## Getting started with your dev environment

### Initialization

- Make a copy of `/backend/.env.example` and name it `/backend/.env`


- Install and audit node dependencies (run from root)
    ```zsh
    npm i
    ```
- PostgreSQL in current setup is running within Docker container; no need to start up PostgreSQL manually.

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
    npm run dev:full # to start the Docker container and the dev env
    npm run dev # to start dev env only (Docker container started separately)
    ```

## Migrations

### Auto-generate migrations

```zsh
npm run on-backend migration:gen migration-name-in-kebab-case
```

### Run migrations

```zsh
npm run on-backend migration:run
```

### Revert last migration
```zsh
npm run on-backend migration:revert
```

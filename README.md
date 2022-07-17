# CheckWho

## Getting started with your dev environment

### Initialization

- Make a copy of `/backend/.env.example` and name it `/backend/.env`


- Install and audit node dependencies (run from root)
    ```
    npm i
    ```
- Run migrations on the development database, then seed data (run from root)
    ```
    npm run on-backend -- migration:run
  
    npm run on-backend -- seed
    ```

- Start up dev env (run from root)
    ```
    npm run dev
    ```
- PostgreSQL in current setup is running within Docker container; no need to start up PostgreSQL manually.

- Generate an admin key and hash pair. Save the admin key and replace the default `ADMIN_KEY_HASH` value with the generated hash value in `backend/.env` file. (If you're an OGP developer, you can also get the admin key and hash pair from our 1Password vault.)
    ```
    npm run on-backend -- generate-admin-key
    ```

## Migrations

### Auto-generate migrations

```
npm run on-backend migration:gen migration-name-in-kebab-case
```

### Run migrations

```
npm run on-backend migration:run
```

### Revert last migration
```
npm run on-backend migration:revert
```

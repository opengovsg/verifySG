# CheckWho

## Getting started with your dev environment

### Initialization

- Make a copy of `/backend/sample.env` and name it `/backend/.env`


- Install and audit node dependencies (run from root)
    ```
    npm run postinstall
    ```

- Start up dev env (run from root)
    ```
    npm run dev
    ```
- PostgreSQL in current setup is running within Docker container; no need to start up PostgreSQL manually.

## Migrations

### Auto-generate migrations
```
npm run on-backend -- migration:gen -- -n <migration-name>
```
### Run migrations

```
npm run on-backend -- migration:run
```

# VerifySG

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

### Database migrations

- Run database migrations:
    ```
    npm run on-backend -- migration:run
    ```

## Migrations

### Auto-generate migrations
```
npm run on-backend -- migration:gen -- -n <migration-name>
```
### Run migrations

```
npm run on-backend -- migration:run
```

# CheckWho

## Getting started with your dev environment

### PostgresSQL

Ensure that you have access to a PostgreSQL instance running in your development environment. You have two options if you
do not have PostgreSQL already set up:

1. Install using Homebrew: `brew install postgresql@13`
2. Run PostgreSQL using Docker

After setting up PostgreSQL, run the following to start up the database.

```sh
# Create development database
$ createdb checkwho_dev
```

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

## Migrations

### Auto-generate migrations
```
npm run on-backend -- migration:gen -- -n <migration-name>
```
### Run migrations

```
npm run on-backend -- migration:run
```

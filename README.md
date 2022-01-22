# VerifySG

## Getting started with your dev environment

### Initialization

- Make a copy of `/backend/sample.env` and name it `/backend/.env`


- Install and audit node dependencies

  ```
  npm install

  npm run audit-dep
  ```

### Set up Docker

- Install docker runtime for your OS [here](https://docs.docker.com/engine/install/)
- Run
    ```
    docker-compose -f docker-compose.dev.yml up
    ``` 
- You should have the following services running:
    - frontend react app on port `3000`
    - backend nestjs app on port `8080`
    - postgres database app on port `5432`
    - pgadmin service on port `5050`

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

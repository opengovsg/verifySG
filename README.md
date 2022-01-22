# VerifySG

## Getting started with your dev environment

### Set up Docker

1. Install docker runtime for your OS [here](https://docs.docker.com/engine/install/)
2. Run
    ```
    docker-compose -f docker-compose.dev.yml up
    ``` 
3. You should have the following services running:
    - frontend react app on port `3000`
    - backend nestjs app on port `8080`
    - postgres database app on port `5432`
    - pgadmin service on port `5050`

#### Database migrations

4. Run database migrations:
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

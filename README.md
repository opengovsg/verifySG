# VerifySG

## Getting started with your dev environment
1. Install docker runtime for your OS [here](https://docs.docker.com/engine/install/)
2. Run 
    ```
    $ docker-compose -f docker-compose.dev.yml up
    ``` 
3. You should have the following services running:
    - frontend react app on port ```3000```
    - backend nestjs app on port ```8080```
    - postgres database app on port ```5432```
    - pgadmin service on port ```5050```

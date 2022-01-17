# VerifySG

## Getting started
Ensure that you have access to a PostgreSQL instance running in your development environment. You have two options if you
do not have PostgreSQL already set up:

1. Install using Homebrew: `brew install postgresql@13`
2. Run PostgreSQL using Docker

After setting up PostgreSQL, run the following to start up the development environment.
```sh
# Create development database
$ createdb verifysg_dev

# Copy .env files and replace values within it
$ cp backend/sample.env backend/.env

# Install dependencies
$ npm install

# Start development client and server 
$ npm run dev
```

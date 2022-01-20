FROM node:16.11.1-alpine3.14

WORKDIR /usr/src

COPY package.json .
COPY package-lock.json .

RUN npm install
COPY . .

RUN npm run build
FROM node:16.11.1-alpine3.14

WORKDIR /usr/src

COPY package.json .
COPY package-lock.json .
COPY . .
RUN rm -rf node_modules

RUN npm install
RUN ls node_modules

RUN npm run build
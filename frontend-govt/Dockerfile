FROM node:16.16-alpine3.16

WORKDIR /usr/src

COPY package.json .
COPY package-lock.json .
COPY . .
RUN rm -rf node_modules

RUN npm install

RUN npm run build

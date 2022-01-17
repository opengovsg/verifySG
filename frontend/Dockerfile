FROM node:16.11.1-alpine3.14

WORKDIR /src

COPY package.json /src
COPY package-lock.json /src

RUN npm install
COPY . /src

RUN npm run build
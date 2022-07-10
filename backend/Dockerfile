FROM node:16.16-alpine3.16 AS builder
# required for node-gyp
RUN apk update && apk upgrade && apk add --no-cache --virtual builds-deps build-base \
  g++ make python3 python3-dev py3-pip tini

WORKDIR /usr/src
COPY package*.json ./
RUN npm install glob rimraf
COPY . .
RUN npm run build

FROM node:16.16-alpine3.16 as dev
WORKDIR /usr/src
COPY --from=builder /usr/src /usr/src
RUN npm install --only=dev
CMD ["npm", "run", "dev"]

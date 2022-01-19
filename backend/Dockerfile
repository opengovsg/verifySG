FROM node:12.19.0-alpine3.9 AS builder
WORKDIR /usr/src
COPY package*.json ./
RUN npm install glob rimraf
COPY . .
RUN npm run build

FROM node:12.19.0-alpine3.9 as dev
WORKDIR /usr/src
COPY --from=builder /usr/src /usr/src
RUN npm install --only=dev
CMD ["npm", "run", "dev"]
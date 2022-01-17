FROM node:12.19.0-alpine3.9 AS builder
WORKDIR /src
COPY package*.json ./
RUN npm install glob rimraf
COPY . .
RUN npm run build

FROM node:12.19.0-alpine3.9 as dev
WORKDIR /src
COPY --from=builder /src /src
RUN npm install --only=dev
CMD ["npm", "run", "dev"]
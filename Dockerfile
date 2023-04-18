FROM node:18-alpine as build

WORKDIR /opt/checkwho
COPY . ./
RUN npm ci
RUN npm run build
RUN npm prune --production

FROM node:18-alpine as main

WORKDIR /opt/checkwho

COPY --from=build /opt/checkwho/backend/tsconfig.json ./backend/
COPY --from=build /opt/checkwho/backend/package.json ./backend/
COPY --from=build /opt/checkwho/backend/node_modules ./backend/node_modules
COPY --from=build /opt/checkwho/backend/build ./backend/build
COPY --from=build /opt/checkwho/frontend-govt/build ./frontend-govt/build
COPY --from=build /opt/checkwho/shared/node_modules ./shared/node_modules
COPY --from=build /opt/checkwho/shared/build ./shared/build
COPY --from=build /opt/checkwho/node_modules ./node_modules
COPY --from=build /opt/checkwho/package.json ./

EXPOSE 8080
USER node
CMD ["npm", "start"]

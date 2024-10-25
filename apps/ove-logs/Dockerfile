FROM node:iron-slim AS build
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false
ENV LOGGING_CLIENT_OUTPUT=/usr/src/app/node_modules/@prisma/logging-client
ENV LOGGING_DATABASE_URL=file:///usr/src/app/logs.db

COPY ../../nx.json ./
COPY ../../package.json ./
COPY ../../package-lock.json ./
RUN npm ci --include=dev

COPY ../../tools/db ./tools/db
COPY ../../cli ./cli
COPY ../../apps/ove-logs/.env.docker ./tools/db/.env

RUN npm run db sync -- --component=logging
RUN npm run db push -- --component=logging

COPY ../../apps/ove-logs ./apps/ove-logs

RUN npx nx run ove-logs:build

FROM node:iron-slim AS runtime
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"
EXPOSE 8080

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV LOGGING_CLIENT_OUTPUT=/usr/src/app/node_modules/@prisma/logging-client
ENV LOGGING_DATABASE_URL=/usr/src/app/logs.db

COPY --from=build /usr/src/app/dist/apps/ove-logs ./
COPY --from=build /usr/src/app/node_modules/@prisma/logging-client/libquery* /usr/src
COPY --from=build /usr/src/app/logs.db ./

CMD ["node", "server.js"]
FROM node:iron-slim AS build
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false
ENV LOGGING_CLIENT_OUTPUT=/usr/src/app/node_modules/@prisma/logging-client
ENV LOGGING_DATABASE_URL=file:///usr/src/app/logs.db

COPY ../../nx.json ./
COPY ../../dist/apps/ove-logs/package.json ./
COPY ../../dist/apps/ove-logs/package-lock.json ./
RUN npm ci
RUN npm install zod@3.24.1 nx@20.3.2 @nx/esbuild@20.3.2 prisma@6.0.1  \
    @prisma/client@6.0.1 esbuild@0.24.2

COPY ../../tools/db ./tools/db
COPY ../../cli ./cli
COPY ../../package.json ./
COPY ../../tsconfig.base.json ./

RUN npm run db sync -- --component=logging
RUN npm run db push -- --component=logging

COPY ../../apps/ove-logs ./apps/ove-logs

RUN npx nx run ove-logs:build:production

FROM node:iron-slim AS runtime
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"
EXPOSE 8080

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV LOGGING_CLIENT_OUTPUT=/usr/src/app/node_modules/@prisma/logging-client
ENV LOGGING_DATABASE_URL=file:///usr/src/app/logs.db

COPY --from=build /usr/src/app/dist/apps/ove-logs/main.cjs ./main.cjs
COPY --from=build /usr/src/app/node_modules/@prisma/logging-client/libquery* /usr/src
COPY --from=build /usr/src/app/logs.db ./logs.db

CMD ["node", "main.cjs"]
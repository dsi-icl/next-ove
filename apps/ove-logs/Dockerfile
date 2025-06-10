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
RUN pnpm ci
RUN pnpm install zod@3.22.3 nx@20.3.2 @nx/esbuild@20.3.2 prisma@6.8.2  \
    @prisma/client@6.8.2 esbuild@0.24.2 tsconfig-paths@4.2.0 typescript@5.7.2 --legacy-peer-deps

COPY ../../tools/db ./tools/db
COPY ../../cli ./cli
COPY ../../package.json ./
COPY ../../tsconfig.base.json ./

RUN pnpm db sync -- --component=logging
RUN pnpm db push -- --component=logging

COPY ../../apps/ove-logs ./apps/ove-logs

COPY ../../libs/ove-server-utils ./libs/ove-server-utils
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types

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
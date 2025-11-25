FROM node:iron-alpine AS build
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

RUN apk add --no-cache --virtual .build-deps openssl

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false
ENV LOGGING_CLIENT_OUTPUT=/usr/src/app/node_modules/.prisma/logging-client

RUN npm install -g pnpm

COPY ../../nx.json ./
COPY ../../dist/apps/ove-logs/package.json ./
COPY ../../dist/apps/ove-logs/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
RUN pnpm add -D zod@3.22.3 nx@20.3.2 @nx/esbuild@20.3.2 prisma@6.19.0  \
    @prisma/client@6.19.0 esbuild@0.24.2 tsconfig-paths@4.2.0 typescript@5.9.0-dev.20250618

COPY ../../tools/db ./tools/db
COPY ../../cli ./cli
COPY ../../package.json ./
COPY ../../tsconfig.base.json ./

RUN pnpm db sync --component=logging

COPY ../../apps/ove-logs ./apps/ove-logs

COPY ../../libs/ove-server-utils ./libs/ove-server-utils
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types
COPY ../../libs/ove-auth ./libs/ove-auth

RUN pnpx nx run ove-logs:build:production

RUN apk del .build-deps

FROM node:iron-alpine AS runtime
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"
EXPOSE 8080

RUN apk add openssl

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV CONFIG_PATH=/usr/src/app/config/config.json
ENV PRISMA_QUERY_ENGINE_BINARY=/usr/src/app/lib

COPY --from=build /usr/src/app/dist/apps/ove-logs/main.cjs ./main.cjs
COPY --from=build /usr/src/app/node_modules/.prisma/logging-client/libquery* ../

CMD ["node", "main.cjs"]
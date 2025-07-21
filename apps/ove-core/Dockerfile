FROM node:iron-alpine AS build-renderer
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false

RUN npm install -g pnpm

COPY ../../tsconfig.base.json ./
COPY ../../tsconfig.json ./
COPY ../../nx.json ./
COPY ../../babel.config.json ./

COPY ../../dist/apps/ove-renderer/package.json ./
COPY ../../dist/apps/ove-renderer/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

RUN pnpm add -D nx@20.3.2 @nx/esbuild@20.3.2 esbuild@0.24.2 typescript@5.9.0-dev.20250618 @nx/vite@20.3.2 vite@6.1.0 tsconfig-paths@4.2.0 vite-tsconfig-paths@5.1.3 vite-plugin-singlefile@2.1.0
RUN pnpm add date-fns@4.1.0

COPY ../../apps/ove-renderer ./apps/ove-renderer

# reliant on following libraries
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types
COPY ../../libs/ove-auth ./libs/ove-auth
COPY ../../package.json ./

RUN pnpx nx run ove-renderer:build:production

FROM node:iron-alpine AS build-server
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

RUN apk add --no-cache --virtual .build-deps make gcc g++ python3 openssl py3-setuptools

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false
ENV CLIENT_OUTPUT=/usr/src/app/node_modules/.prisma/client

RUN npm install -g pnpm

COPY ../../tsconfig.base.json ./
COPY ../../tsconfig.json ./
COPY ../../nx.json ./
COPY ../../tools/db ./tools/db
COPY ../../babel.config.json ./

COPY ../../dist/apps/ove-core/package.json ./
COPY ../../dist/apps/ove-core/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

RUN pnpm add -D zod@3.22.3 nx@20.3.2 @nx/esbuild@20.3.2 prisma@6.9.0 @prisma/client@6.9.0 esbuild@0.24.2 typescript@5.9.0-dev.20250618
RUN pnpm add zod-openapi@4.1.0 date-fns@4.1.0

COPY ../../apps/ove-core ./apps/ove-core
COPY ../../apps/ove-renderer ./apps/ove-renderer

# reliant on following libraries
COPY ../../cli ./cli
COPY ../../libs/ove-server-utils ./libs/ove-server-utils
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types
COPY ../../libs/ove-auth ./libs/ove-auth
COPY ../../package.json ./

RUN pnpx nx run ove-core:build:production

RUN apk del .build-deps

FROM node:iron-alpine AS build-ui
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

RUN apk add --no-cache --virtual .build-deps make gcc g++ python3 openssl py3-setuptools

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false

RUN npm install -g pnpm

COPY ../../tsconfig.base.json ./
COPY ../../tsconfig.json ./
COPY ../../nx.json ./
COPY ../../dist/apps/ove-core-ui/package.json ./
COPY ../../dist/apps/ove-core-ui/pnpm-lock.yaml ./
COPY ../../tools/db ./tools/db
COPY ../../babel.config.json ./

RUN pnpm install --frozen-lockfile
RUN pnpm add -D nx@20.3.2 @nx/vite@20.3.2 prisma@6.9.0 @prisma/client@6.9.0 vite@6.1.0 @vitejs/plugin-react@4.3.4 autoprefixer@10.4.20 @nx/react@20.3.2 sass@1.82.0 postcss@8.4.49 tsconfig-paths@4.2.0 typescript@5.9.0-dev.20250618 vite-tsconfig-paths@5.1.3
RUN pnpm add react-big-calendar@1.16.3

COPY ../../apps/ove-core-ui ./apps/ove-core-ui
COPY ../../package.json ./

# reliant on following libraries
COPY ../../cli ./cli
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types
COPY ../../libs/ove-auth ./libs/ove-auth
COPY ../../libs/ui-base-components ./libs/ui-base-components

RUN pnpx nx run ove-core-ui:build:production

RUN apk del .build-deps

FROM node:iron-alpine AS runtime
LABEL org.opencontainers.image.authors="Brython Caley-Davies<ove@imperial.ac.uk>"

RUN apk add --no-cache --virtual make gcc g++ python3 openssl py3-setuptools

EXPOSE 8080
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PRISMA_QUERY_ENGINE_BINARY=/usr/src/libquery_engine-linux-musl-openssl-3.0.x.so.node

RUN npm install -g pnpm

RUN pnpm add bcrypt

COPY ../../apps/ove-core-ui/env.sh ./
RUN chmod +x ./env.sh

COPY --from=build-server /usr/src/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node ../
COPY --from=build-server /usr/src/app/dist/apps/ove-core/ ./

COPY --from=build-ui /usr/src/app/node_modules/@socket.io/admin-ui/ui/dist ./socket-admin-ui
COPY --from=build-ui /usr/src/app/dist/apps/ove-core-ui/ ./ui

COPY --from=build-renderer /usr/src/app/dist/apps/ove-renderer/index.html /usr/src/app/dist/apps/ove-core/public/renderer.html

CMD ["/bin/sh", "-c", "./env.sh;node main.cjs"]
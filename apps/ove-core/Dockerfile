FROM node:iron-alpine AS build-server
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

RUN apk add --no-cache --virtual .build-deps make gcc g++ python3 openssl py3-setuptools

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false

COPY ../../tsconfig.base.json ./
COPY ../../tsconfig.json ./
COPY ../../nx.json ./
COPY ../../dist/apps/ove-core/package.json ./
COPY ../../dist/apps/ove-core/package-lock.json ./
COPY ../../tools/db ./tools/db
COPY ../../babel.config.json ./

RUN npm ci --legacy-peer-deps
RUN npm install zod@3.24.1 nx@20.3.2 @nx/esbuild@20.3.2 prisma@6.0.1 @prisma/client@6.0.1 esbuild@0.24.2 typescript@5.7.2 --legacy-peer-deps
RUN npm install zod-openapi@4.1.0 date-fns@4.1.0 --legacy-peer-deps

COPY ../../apps/ove-core ./apps/ove-core

# reliant on following libraries
COPY ../../cli ./cli
COPY ../../libs/ove-server-utils ./libs/ove-server-utils
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types
COPY ../../package.json ./

RUN npm exec nx run ove-core:build

RUN apk del .build-deps

FROM node:iron-alpine AS build-ui
LABEL org.opencontainers.image.authors="Brython Caley-Davies <ove@imperial.ac.uk>"

RUN apk add --no-cache --virtual .build-deps make gcc g++ python3 openssl py3-setuptools

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NX_DAEMON=false

COPY ../../tsconfig.base.json ./
COPY ../../tsconfig.json ./
COPY ../../nx.json ./
COPY ../../dist/apps/ove-core-ui/package.json ./
COPY ../../dist/apps/ove-core-ui/package-lock.json ./
COPY ../../tools/db ./tools/db
COPY ../../babel.config.json ./

RUN npm ci --legacy-peer-deps
RUN npm install nx@20.3.2 @nx/vite@20.3.2 prisma@6.0.1 @prisma/client@6.0.1  \
    vite@6.1.0 @vitejs/plugin-react@4.3.4 autoprefixer@10.4.20  \
    @nx/react@20.3.2 sass@1.82.0 postcss@8.4.49 tsconfig-paths@4.2.0  \
    typescript@5.7.2 vite-tsconfig-paths@5.1.3 --legacy-peer-deps
RUN npm install react-big-calendar@1.16.3 --legacy-peer-deps

COPY ../../apps/ove-core-ui ./apps/ove-core-ui
COPY ../../package.json ./

# reliant on following libraries
COPY ../../cli ./cli
COPY ../../libs/ove-logging ./libs/ove-logging
COPY ../../libs/ove-utils ./libs/ove-utils
COPY ../../libs/ove-types ./libs/ove-types
COPY ../../libs/ui-base-components ./libs/ui-base-components
COPY ../../libs/ui-components ./libs/ui-components
COPY ../../libs/ui-reorderable-list ./libs/ui-reorderable-list

RUN npm exec nx run ove-core-ui:build

RUN apk del .build-deps

FROM node:iron-alpine AS runtime
LABEL org.opencontainers.image.authors="Brython Caley-Davies<ove@imperial.ac.uk>"

RUN apk add --no-cache --virtual make gcc g++ python3 openssl py3-setuptools

EXPOSE 8080
WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN npm install bcrypt

COPY ../../apps/ove-core-ui/env.sh ./
RUN chmod +x ./env.sh

COPY --from=build-server /usr/src/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node ../
COPY --from=build-server /usr/src/app/dist/apps/ove-core/ ./

COPY --from=build-ui /usr/src/app/node_modules/@socket.io/admin-ui/ui/dist ./socket-admin-ui
COPY --from=build-ui /usr/src/app/dist/apps/ove-core-ui/ ./ui

CMD ["/bin/sh", "-c", "./env.sh;node main.cjs"]